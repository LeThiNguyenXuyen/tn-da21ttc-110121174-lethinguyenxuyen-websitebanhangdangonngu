# 🔧 Hướng dẫn sửa lỗi đơn hàng "đang xử lý" sau thanh toán thành công

## 🚨 Vấn đề đã được sửa

Trước đây, đơn hàng có thể bị stuck ở trạng thái "pending" sau khi thanh toán thành công vì:
- Chỉ dựa vào frontend redirect để cập nhật trạng thái
- Không có webhook để tự động xử lý khi payment gateway thông báo thành công
- User đóng trình duyệt hoặc không hoàn thành redirect

## ✅ Giải pháp đã implement

### 1. **Webhook Endpoints**
- `POST /api/order/webhook/payos` - Nhận thông báo từ PayOS
- `POST /api/order/webhook/stripe` - Nhận thông báo từ Stripe

### 2. **Cải thiện Verify Logic**
- Kiểm tra đơn hàng đã được xử lý chưa
- Xử lý trường hợp user hủy thanh toán
- Tránh duplicate processing

### 3. **Admin Tools**
- `POST /api/admin/orders/:orderId/manual-verify` - Xác nhận thủ công
- `GET /api/admin/orders/problematic` - Lấy danh sách đơn hàng có vấn đề
- `POST /api/admin/orders/check-pending` - Kiểm tra và hủy đơn hàng pending quá lâu

### 4. **Background Job**
- Tự động kiểm tra và hủy đơn hàng pending quá 30 phút mỗi 15 phút

## 🔧 Cách setup Webhook

### PayOS Webhook
1. Đăng nhập PayOS Dashboard
2. Vào Settings > Webhook
3. Thêm URL: `https://yourdomain.com/api/order/webhook/payos`
4. Chọn events: Payment Success, Payment Failed

### Stripe Webhook
1. Đăng nhập Stripe Dashboard
2. Vào Developers > Webhooks
3. Thêm endpoint: `https://yourdomain.com/api/order/webhook/stripe`
4. Chọn events: `checkout.session.completed`, `payment_intent.payment_failed`
5. Copy webhook secret và thêm vào `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## 🛠️ Cách sử dụng Admin Tools

### Kiểm tra đơn hàng có vấn đề
```bash
GET /api/admin/orders/problematic
```

### Xác nhận thủ công đơn hàng
```bash
POST /api/admin/orders/:orderId/manual-verify
{
  "forceUpdate": true  // Bắt buộc cập nhật dù đã xử lý
}
```

### Hủy đơn hàng pending quá lâu
```bash
POST /api/admin/orders/check-pending
```

## 📊 Monitoring

### Log Messages
- `✅ Order status updated` - Đơn hàng được cập nhật thành công
- `🔔 PayOS/Stripe Webhook received` - Nhận webhook từ payment gateway
- `🔧 Manual verify order` - Admin xác nhận thủ công
- `🔄 Running background check` - Background job chạy

### Order Status Flow
1. `pending` - Đơn hàng mới tạo
2. `Processing` - Thanh toán thành công (webhook hoặc frontend verify)
3. `shipped` - Đã gửi hàng
4. `delivered` - Đã giao hàng
5. `cancelled` - Đã hủy (timeout hoặc thủ công)

## 🚀 Test Webhook Local

### Sử dụng ngrok
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 4000

# Sử dụng URL ngrok cho webhook
https://abc123.ngrok.io/api/order/webhook/payos
```

### Test PayOS Webhook
```bash
curl -X POST http://localhost:4000/api/order/webhook/payos \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "orderCode": 1234567890,
      "code": "00",
      "desc": "success"
    },
    "signature": "valid_signature"
  }'
```

## 🔍 Troubleshooting

### Đơn hàng vẫn pending sau thanh toán
1. Kiểm tra webhook có được gọi không (check logs)
2. Verify webhook signature đúng chưa
3. Sử dụng manual verify: `POST /api/admin/orders/:orderId/manual-verify`

### Webhook không hoạt động
1. Kiểm tra URL webhook đúng chưa
2. Kiểm tra server có accessible từ internet không
3. Kiểm tra webhook secret trong .env

### Background job không chạy
1. Kiểm tra server có restart sau khi thêm code không
2. Check logs có thấy "Running background check" không
3. Interval hiện tại: 15 phút

## 📝 Notes

- Webhook endpoints không cần authentication
- Background job chạy mỗi 15 phút
- Đơn hàng pending quá 30 phút sẽ bị hủy tự động
- Admin có thể force update bất kỳ đơn hàng nào

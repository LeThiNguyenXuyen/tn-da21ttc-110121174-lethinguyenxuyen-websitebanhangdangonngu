# Chức năng Quản lý Đơn hàng - Admin Panel

## Tổng quan
Chức năng quản lý đơn hàng cho phép admin xem, lọc, tìm kiếm và cập nhật trạng thái của tất cả đơn hàng trong hệ thống.

## Các tính năng chính

### 1. Hiển thị danh sách đơn hàng
- Xem tất cả đơn hàng với thông tin chi tiết
- Hiển thị mã đơn hàng, thông tin khách hàng, ngày đặt, tổng tiền, trạng thái
- Phân trang và sắp xếp theo ngày mới nhất

### 2. Thống kê đơn hàng
- Tổng số đơn hàng
- Số đơn hàng theo từng trạng thái (chờ xử lý, đã thanh toán, đang xử lý, đã gửi hàng, đã giao hàng, đã hủy)
- Hiển thị dưới dạng card thống kê

### 3. Bộ lọc và tìm kiếm
- Lọc đơn hàng theo trạng thái
- Tìm kiếm theo mã đơn hàng, tên khách hàng, email
- Kết hợp nhiều điều kiện lọc

### 4. Cập nhật trạng thái đơn hàng
- Modal chi tiết đơn hàng
- Cập nhật trạng thái: Pending → Paid → Processing → Shipped → Delivered
- Có thể hủy đơn hàng (Cancelled)
- Hiển thị thông tin chi tiết khách hàng và địa chỉ giao hàng

### 5. Giao diện responsive
- Tương thích với desktop, tablet, mobile
- Thiết kế hiện đại với Tailwind CSS
- Hiệu ứng hover và transition mượt mà

## Cấu trúc file

### Frontend (Admin Panel)
```
src/pages/
├── OrderManagement.jsx     # Component chính quản lý đơn hàng
├── OrderManagement.css     # Styling cho component
└── Dashboard.jsx          # Cập nhật để hiển thị thống kê đơn hàng

src/components/
└── Sidebar.jsx            # Cập nhật menu để thêm link quản lý đơn hàng

src/
└── App.jsx               # Cập nhật routing
```

### Backend API
```
routes/
├── adminRoutes.js         # Routes cho admin
└── orderRoutes.js         # Routes cho đơn hàng

controllers/
└── orderController.js     # Logic xử lý đơn hàng
   ├── getAllOrders()      # Lấy tất cả đơn hàng
   └── updateOrderStatus() # Cập nhật trạng thái đơn hàng

models/
└── Order.js              # Model đơn hàng
```

## API Endpoints

### GET /api/admin/orders
Lấy tất cả đơn hàng (cần authentication)
```javascript
Headers: {
  'Authorization': 'Bearer <token>'
}

Response: {
  success: true,
  orders: [
    {
      _id: "order_id",
      userId: "user_id", 
      items: [...],
      amount: 500000,
      status: "pending",
      payment: "Stripe",
      date: "2024-01-01T00:00:00.000Z",
      address: {
        firstName: "Nguyễn",
        lastName: "Văn A",
        email: "user@example.com",
        phone: "0123456789",
        street: "123 Đường ABC",
        city: "Hà Nội"
      }
    }
  ]
}
```

### POST /api/admin/orders/:orderId/status
Cập nhật trạng thái đơn hàng
```javascript
Headers: {
  'Authorization': 'Bearer <token>'
}

Body: {
  status: "processing" // pending, paid, processing, shipped, delivered, cancelled
}

Response: {
  success: true,
  message: "Cập nhật trạng thái đơn hàng thành công"
}
```

## Trạng thái đơn hàng

1. **Pending** (Chờ xử lý) - Đơn hàng mới được tạo
2. **Paid** (Đã thanh toán) - Khách hàng đã thanh toán thành công
3. **Processing** (Đang xử lý) - Admin đang chuẩn bị hàng
4. **Shipped** (Đã gửi hàng) - Đơn hàng đã được gửi đi
5. **Delivered** (Đã giao hàng) - Khách hàng đã nhận được hàng
6. **Cancelled** (Đã hủy) - Đơn hàng bị hủy

## Cách sử dụng

### 1. Truy cập trang quản lý đơn hàng
- Đăng nhập vào admin panel
- Click vào "Quản lý đơn hàng" trong sidebar
- Hoặc click vào card thống kê đơn hàng trong Dashboard

### 2. Xem và lọc đơn hàng
- Sử dụng dropdown để lọc theo trạng thái
- Nhập từ khóa vào ô tìm kiếm
- Click "Làm mới" để cập nhật dữ liệu

### 3. Cập nhật trạng thái đơn hàng
- Click nút "✏️ Sửa" ở đơn hàng cần cập nhật
- Xem thông tin chi tiết trong modal
- Click vào nút trạng thái mới để cập nhật
- Xác nhận thay đổi

## Lưu ý kỹ thuật

### Authentication
- Tất cả API calls đều cần token authentication
- Token được lưu trong localStorage với key 'token'
- Nếu không có token hoặc token hết hạn, cần đăng nhập lại

### Error Handling
- Hiển thị thông báo lỗi khi API call thất bại
- Fallback UI khi không có dữ liệu
- Loading state trong quá trình fetch dữ liệu

### Performance
- Lazy loading cho danh sách đơn hàng lớn
- Debounce cho tìm kiếm real-time
- Caching dữ liệu để giảm API calls

## Tương lai phát triển

1. **Xuất báo cáo** - Export đơn hàng ra Excel/PDF
2. **Thông báo real-time** - WebSocket cho cập nhật đơn hàng mới
3. **Bulk actions** - Cập nhật nhiều đơn hàng cùng lúc
4. **Advanced filters** - Lọc theo ngày, khoảng giá, sản phẩm
5. **Order tracking** - Tích hợp với dịch vụ vận chuyển
6. **Customer communication** - Gửi email/SMS thông báo trạng thái

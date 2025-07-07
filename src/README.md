# 🌸 WEBSITE NƯỚC HOA - E-COMMERCE HOÀN CHỈNH

## 🚀 **CÁCH CHẠY WEBSITE**

### 1. **Backend Server**
```bash
cd Backend
npm install
npm start
```
Server sẽ chạy tại: `http://localhost:4000`

### 2. **Frontend (Khách hàng)**
```bash
cd vite-project
npm install
npm run dev
```
Website sẽ chạy tại: `http://localhost:5173`

### 3. **Admin Panel**
```bash
cd Admin/vite-project
npm install
npm run dev
```
Admin panel sẽ chạy tại: `http://localhost:5174`

## 🧪 **TEST TẤT CẢ CHỨC NĂNG**

```bash
cd Backend
node test-all-features.js
```

## 🔐 **THÔNG TIN ĐĂNG NHẬP**

### Admin:
- **Username:** admin123
- **Password:** 12345678

### Database:
- **MongoDB:** mongodb+srv://lethinguyenxuyen2003:12292003@cluster0.wckag.mongodb.net

## 📋 **CHỨC NĂNG CHÍNH**

### 🛍️ **Khách hàng:**
- ✅ Đăng ký/Đăng nhập
- ✅ Xem sản phẩm (nam/nữ)
- ✅ Tìm kiếm không dấu
- ✅ Thêm vào giỏ hàng
- ✅ Wishlist yêu thích
- ✅ Thanh toán Stripe
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Khuyến mãi 10% (đơn 500k+)
- ✅ Đa ngôn ngữ (Việt/English)

### 👑 **Admin:**
- ✅ Dashboard thống kê
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý khuyến mãi
- ✅ Quản lý người dùng
- ✅ Thống kê doanh thu

## 🌐 **API ENDPOINTS**

### Authentication:
- `POST /api/user/register` - Đăng ký
- `POST /api/user/login` - Đăng nhập

### Products:
- `GET /api/product/list` - Danh sách sản phẩm
- `GET /api/product/search` - Tìm kiếm
- `GET /api/product/:id` - Chi tiết sản phẩm

### Cart & Orders:
- `POST /api/cart/add` - Thêm giỏ hàng
- `POST /api/order/place` - Đặt hàng
- `GET /api/order/userorders` - Đơn hàng user

### Reviews & Wishlist:
- `POST /api/review/add` - Thêm đánh giá
- `POST /api/wishlist/add` - Thêm wishlist

### Admin:
- `GET /api/admin/orders` - Quản lý đơn hàng
- `GET /api/admin/dashboard/stats` - Thống kê

## 🎨 **TÍNH NĂNG ĐẶC BIỆT**

### 🔍 **Tìm kiếm thông minh:**
- Hỗ trợ tiếng Việt không dấu
- Tìm theo tên, thương hiệu, mô tả
- Sắp xếp theo độ liên quan

### 💳 **Thanh toán:**
- Tích hợp Stripe
- Hỗ trợ VND
- Tự động hoàn tiền khi hủy

### 🎯 **Khuyến mãi:**
- Giảm 10% cho đơn hàng từ 500k
- Hiển thị giá gạch ngang
- Quản lý khuyến mãi linh hoạt

### 🌐 **Đa ngôn ngữ:**
- Tiếng Việt / English
- Tự động dịch sản phẩm mới
- API translation

## 📱 **RESPONSIVE DESIGN**

- ✅ Mobile-friendly
- ✅ Tablet responsive
- ✅ Desktop optimized
- ✅ Touch-friendly interface

## 🔒 **BẢO MẬT**

- ✅ JWT Authentication
- ✅ Firebase Auth support
- ✅ Password hashing (bcrypt)
- ✅ Admin role protection
- ✅ CORS configuration
- ✅ Security headers

## 📧 **LIÊN HỆ**

- **Email:** lethinguyenxuyen2003@gmail.com
- **Facebook:** https://www.facebook.com/nguyen.xuyen.369765
- **Instagram:** https://www.instagram.com/

## 📁 **CẤU TRÚC PROJECT**

```
Nuochoa/
├── Backend/                 # Server API
│   ├── controllers/         # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── server.js           # Main server
├── vite-project/           # Frontend (Khách hàng)
│   ├── src/
│   ├── pages/
│   └── components/
├── Admin/vite-project/     # Admin Panel
│   ├── src/
│   ├── pages/
│   └── components/
└── README.md
```

## 🎉 **HOÀN THÀNH**

Website nước hoa đã có đầy đủ tính năng của một e-commerce chuyên nghiệp:

- 🛒 **Mua sắm trực tuyến hoàn chỉnh**
- 💳 **Thanh toán an toàn với Stripe**
- 📦 **Quản lý đơn hàng chi tiết**
- ⭐ **Hệ thống đánh giá sản phẩm**
- ❤️ **Wishlist cá nhân hóa**
- 🎯 **Khuyến mãi linh hoạt**
- 👑 **Admin panel mạnh mẽ**
- 🌐 **Hỗ trợ đa ngôn ngữ**
- 📧 **Hệ thống liên hệ**
- 🔍 **Tìm kiếm thông minh**

**🌸 Chúc bạn kinh doanh thành công! 🌸**

import React, { useEffect } from 'react';
import './ConfirmOrder.css';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ConfirmOrder = () => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const shippingInfo = location.state || JSON.parse(localStorage.getItem('shippingInfo'));


  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

useEffect(() => {
  if (!shippingInfo) {
    const saved = localStorage.getItem('shippingInfo');
    if (saved) return; // đã có rồi

    alert('Thiếu thông tin vận chuyển');
    navigate('/checkout');
    return;
  }

  // Lưu shippingInfo để sử dụng lại sau login
  localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

  if (!currentUser) {
    localStorage.setItem('redirectAfterLogin', location.pathname);
    navigate('/login');
  }
}, [currentUser, navigate, shippingInfo, location.pathname]);



  const handleConfirm = async () => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:4000/api/orders', {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        note: shippingInfo.note,
        items: cart,
        total,
        email: currentUser.email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Đặt hàng thành công ✅');
      navigate('/');
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      alert('Có lỗi xảy ra khi đặt hàng ❌');
    }
  };

 const handleStripePayment = async () => {
  try {
    console.log("🚀 Starting payment process...");

    // Validation dữ liệu trước khi gửi
    if (!shippingInfo.name || !shippingInfo.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    console.log("📋 Shipping info:", shippingInfo);
    console.log("🛒 Cart:", cart);
    console.log("👤 Current user:", currentUser?.email);

    const token = await currentUser.getIdToken();
    console.log("🔑 Token obtained:", !!token);
    console.log("🔑 Token preview:", token?.substring(0, 50) + "...");

    // Tính phí vận chuyển (20,000 VND)
    const shippingFee = 20000;
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalAmount = subtotal + shippingFee;

    // Chuẩn bị dữ liệu đơn hàng theo format của backend
    const orderData = {
        userId: currentUser?.uid,
      address: {
        name: shippingInfo.name,
        email: currentUser.email,
        address: shippingInfo.address,
        phone: shippingInfo.phone || "",
        zipcode: shippingInfo.zipcode || "",
        country: shippingInfo.country || "Việt Nam",
        note: shippingInfo.note || ""
      },
      items: cart.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      amount: totalAmount
    };

    console.log("📤 Sending order data:", JSON.stringify(orderData, null, 2));
    console.log("💰 Subtotal:", subtotal, "VND");
    console.log("🚚 Shipping:", shippingFee, "VND");
    console.log("💳 Total:", totalAmount, "VND");

    const response = await axios.post('http://localhost:4000/api/order/place', orderData, {
      headers: {
        token: token,
        'Content-Type': 'application/json'
      },
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", response.data);

    if (response.data.success && response.data.url) {
      console.log("✅ Payment session created successfully!");
      console.log("🔗 Stripe URL:", response.data.url);
      window.location.href = response.data.url;
    } else {
      console.error("❌ API returned error:", response.data);
      alert("Lỗi: " + (response.data.message || "Không thể tạo phiên thanh toán"));
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    console.error("❌ Error response:", error.response);
    console.error("❌ Error data:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);

    const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
    alert("Thanh toán thất bại: " + errorMessage);
  }
};


  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h3>Phương thức vận chuyển</h3>
        <div className="form-group">
          <input type="text" placeholder="Họ tên" value={shippingInfo.name} readOnly />
        </div>
        <input type="email" placeholder="Email" value={currentUser?.email} readOnly />
        <input type="text" placeholder="Địa chỉ" value={shippingInfo.address} readOnly />
        <input type="text" placeholder="Số điện thoại" value={shippingInfo.phone} readOnly />
        <input type="text" placeholder="Ghi chú" value={shippingInfo.note} readOnly />
      </div>

      <div className="checkout-right">
        <h3>Thành tiền</h3>
        <div className="summary-line">
          <span>Tổng sản phẩm</span>
          <span>{total.toLocaleString()} VND</span>
        </div>
        <div className="summary-line">
          <span>Phí giao hàng</span>
          <span>20.000 VND</span>
        </div>
        <div className="summary-line total">
          <strong>Tổng tiền</strong>
          <strong>{(total + 20000).toLocaleString()} VND</strong>
        </div>

        <input type="text" placeholder="Nhập mã giảm giá" disabled />
        <button className="apply-btn" disabled>Áp dụng</button>

        <div className="summary-line">
          <strong>Tổng tiền sau khi giảm giá</strong>
          <strong>{(total + 20000).toLocaleString()} VND</strong>
        </div>

        <h4>Phương thức thanh toán</h4>
        <div className="payment-options">
          <label><input type="radio" name="pay" /> Stripe</label>
          <label><input type="radio" name="pay" defaultChecked /> Thanh toán khi nhận hàng</label>
        </div>

        <button onClick={handleStripePayment} className="stripe-btn">
  Thanh toán qua Stripe
</button>
      </div>
    </div>
  );
};

export default ConfirmOrder;

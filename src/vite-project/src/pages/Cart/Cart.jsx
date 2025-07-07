import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Cart.css';
import { useCart } from '../../context/CartContext';
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import PromotionBadge from '../../components/PromotionBadge/PromotionBadge';
import axios from 'axios';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [productStocks, setProductStocks] = useState({});
useEffect(() => {
  window.scrollTo(0, 0); // ✅ Cuộn về đầu trang
}, []);
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  // Tính tổng tiền
  const total = cart.reduce((acc, item) => {
    const unitPrice = Number(item.price);
    const quantity = Number(item.quantity) || 0;
    return acc + unitPrice * quantity;
  }, 0);


  const deliveryFee = 20000;
  const finalTotal = total + deliveryFee;

  const handleClearCart = () => {
    const message = i18n.language === 'vi'
      ? 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?'
      : 'Are you sure you want to clear the entire cart?';
    if (window.confirm(message)) {
      clearCart();
    }
  };

  const handleRemoveItem = (item) => {
    const message = i18n.language === 'vi'
      ? `Bạn có chắc chắn muốn xóa "${item.name}" (${item.size}) khỏi giỏ hàng?`
      : `Are you sure you want to remove "${item.name}" (${item.size}) from cart?`;
    if (window.confirm(message)) {
      removeFromCart(item);
    }
  };

  // Fetch thông tin tồn kho cho các sản phẩm trong giỏ hàng
  useEffect(() => {
    const fetchProductStocks = async () => {
      if (cart.length === 0) return;

      const stockData = {};

      for (const item of cart) {
        try {
          const response = await axios.get(`http://localhost:4000/api/product/${item.itemId}`);
          if (response.data.success) {
            stockData[item.itemId] = response.data.data.quantity || 0;
          }
        } catch (error) {
          console.error(`Error fetching stock for product ${item.itemId}:`, error);
          stockData[item.itemId] = 0;
        }
      }

      setProductStocks(stockData);
    };

    fetchProductStocks();
  }, [cart]);

  const handleUpdateQuantity = (item, newQuantity) => {
    const stockQuantity = productStocks[item.itemId] || 0;

    // Kiểm tra không vượt quá tồn kho
    if (newQuantity > stockQuantity) {
      const message = i18n.language === 'vi'
        ? `Số lượng không thể vượt quá ${stockQuantity} sản phẩm có sẵn`
        : `Quantity cannot exceed ${stockQuantity} available products`;
      alert(message);
      return;
    }

    if (newQuantity === 0) {
      // Khi số lượng về 0, hỏi xác nhận
      const message = i18n.language === 'vi'
        ? `Bạn có chắc chắn muốn xóa "${item.name}" (${item.size}) khỏi giỏ hàng?`
        : `Are you sure you want to remove "${item.name}" (${item.size}) from cart?`;
      if (window.confirm(message)) {
        updateQuantity(item, newQuantity);
      }
    } else {
      // Cập nhật bình thường
      updateQuantity(item, newQuantity);
    }
  };
  const handleCheckout = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Nếu chưa đăng nhập, yêu cầu đăng nhập
      alert(i18n.language === 'vi' ? 'Vui lòng đăng nhập để tiếp tục thanh toán' : 'Please log in to proceed with checkout');
      navigate('/login'); // Chuyển hướng đến trang đăng nhập
      return;
    }

    // Nếu đã đăng nhập, tiếp tục thanh toán
    navigate('/checkout');
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-header">
        <div className="cart-title-section">
          <h2 className="cart-title">{t('cart')}</h2>
          {token && userName && (
            <p className="user-info">👤 {userName}</p>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-actions">
            <span className="cart-count">
              {cart.length} {i18n.language === 'vi' ? 'sản phẩm' : 'items'}
            </span>
            <button onClick={handleClearCart} className="clear-cart-btn">
              🗑️ {i18n.language === 'vi' ? 'Xóa tất cả' : 'Clear all'}
            </button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h3>{t('cartEmpty')}</h3>
          <p>
            {t('noItemsInCart')}
          </p>
          {token && userName && (
            <p className="user-info">
              {t('cartOf')} <strong>{userName}</strong>
            </p>
          )}
          <button onClick={() => navigate('/')} className="continue-shopping">
            {i18n.language === 'vi' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <table className="cart-table">
            <thead>
              <tr>
                <th>{i18n.language === 'vi' ? 'Ảnh' : 'Image'}</th>
                <th>{i18n.language === 'vi' ? 'Tên' : 'Name'}</th>
                <th>Size</th>
                <th>{t('price')}</th>
                <th>{t('quantity')}</th>
                <th>{i18n.language === 'vi' ? 'Tạm tính' : 'Subtotal'}</th>
                <th>{t('delete')}</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.itemId + '-' + item.size}>
                  <td className="cart-image-cell">
                    <div className="image-container">
                      <img src={`http://localhost:4000/uploads/${item.image}`} alt={item.name} className="cart-img" />
                      {item.hasPromotion && item.promotion && (
                        <PromotionBadge
                          promotion={item.promotion}
                          className="cart-badge"
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-name">

                     
                      {i18n.language === 'vi'
     ? item.name
      : t(item.name)
   }
                      {item.hasPromotion && (
                        <div className="promotion-info">
                          <span className="promotion-tag">🎉 {item.promotion?.title}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{item.size}</td>
                  <td className="price-cell">
                    {item.hasPromotion ? (
                      <>
                        <span className="original-price" style={{ textDecoration: 'line-through', color: 'gray' }}>
                          {Number(item.originalPrice).toLocaleString()} đ
                        </span>
                        <br />
                        <span className="discounted-price" style={{ color: '#f55a2c', fontWeight: 'bold' }}>
                          {Number(item.price).toLocaleString()} đ
                        </span>
                      </>
                    ) : (
                      <span className="normal-price">{Number(item.price).toLocaleString()} đ</span>
                    )}
                  </td>


                  <td className="quantity-controls">
                    <div className="quantity-wrapper">
                      <div className="quantity-buttons">
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          disabled={item.quantity >= (productStocks[item.itemId] || 0)}
                        >
                          +
                        </button>
                      </div>
                      <div className="stock-info">
                        {productStocks[item.itemId] !== undefined && (
                          <span className="stock-text">
                            {t('cart.stockLeft', { count: productStocks[item.itemId] })}
                          </span>

                        )}
                      </div>
                    </div>
                  </td>
                  <td className="subtotal-cell">
                    <span className="normal-subtotal">
                      {(Number(item.discountedPrice ?? item.price) * item.quantity).toLocaleString()} đ
                    </span>
                  </td>

                  <td><button className="delete-btn" onClick={() => handleRemoveItem(item)}><FaTrashAlt /></button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary-box">
            <h3>{i18n.language === 'vi' ? 'Tóm tắt đơn hàng' : 'Order Summary'}</h3>



            <div className="summary-item">
              <span>{i18n.language === 'vi' ? 'Tạm tính:' : 'Subtotal:'}</span>
              <span>{total.toLocaleString()} đ</span>
            </div>
            <div className="summary-item">
              <span>{i18n.language === 'vi' ? 'Phí giao hàng:' : 'Delivery Fee:'}</span>
              <span>{deliveryFee.toLocaleString()} đ</span>
            </div>
            <div className="summary-item total">
              <span>{t('total')}:</span>
              <span>{finalTotal.toLocaleString()} đ</span>
            </div>



            <button onClick={handleCheckout} className="checkout-btn">
              {t('checkout')}
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

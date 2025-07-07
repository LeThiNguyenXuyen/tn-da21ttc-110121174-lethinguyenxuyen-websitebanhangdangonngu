import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OrderDetail.css';
import { useTranslation } from 'react-i18next';
const OrderDetail = () => {
  const { t, i18n } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('orderDetail.loginRequired'));
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/order/detail/${orderId}`, {
        headers: { token }
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error(response.data.message || 'Không thể tải chi tiết đơn hàng');
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Có lỗi xảy ra khi tải chi tiết đơn hàng');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:4000/api/order/cancel/${orderId}`, {}, {
        headers: { token }
      });

      if (response.data.success) {
        // Hiển thị thông báo với thông tin hoàn tiền nếu có
        if (response.data.refund) {
          toast.success(t('orderDetail.cancelSuccessWithRefund', { time: response.data.refund.estimatedTime }));
        } else {
          toast.success(t('orderDetail.cancelSuccess'));
        }

        // Cập nhật order với thông tin hoàn tiền
        setOrder({
          ...order,
          status: 'cancelled',
          refund: response.data.refund,
          cancelledAt: new Date()
        });
        setShowCancelModal(false);
      } else {
        toast.error(response.data.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/api/review/add', {
        productId: selectedProduct._id,
        orderId: orderId,
        rating: review.rating,
        comment: review.comment
      }, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(t('orderDetail.reviewSuccess'));
        setShowReviewModal(false);
        setReview({ rating: 5, comment: '' });
        // Cập nhật trạng thái đã đánh giá cho sản phẩm
        fetchOrderDetail();
      } else {
        toast.success(t('orderDetail.reviewSuccess'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('orderDetail.reviewError'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // sử dụng locale từ i18n
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const getStatusColor = (status, payment) => {
    const isCOD = payment?.toUpperCase() === 'COD';
    switch (status.toLowerCase()) {
      case 'processing':
        return isCOD ? '#007bff' : '#17a2b8'; // 💡 xanh đậm cho "Đơn hàng đã đặt"
      case 'pending':
        return '#ffc107';
      case 'paid':
        return '#28a745';
      case 'shipped':
        return '#6f42c1';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };


  const getStatusText = (status, payment) => {
    const isCOD = payment?.toUpperCase() === 'COD';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return isCOD ? 'Đơn hàng đã đặt' : 'Đã thanh toán & Đang xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const canCancelOrder = () => {
    // Chỉ có thể hủy đơn hàng khi chưa gửi hàng (pending, processing)
    // Không thể hủy khi đã gửi hàng (shipped), đã giao (delivered) hoặc đã hủy (cancelled)
    return order && ['pending', 'processing'].includes(order.status.toLowerCase());
  };

  const canReviewProduct = () => {
    // Chỉ cho phép đánh giá khi đã giao hàng thành công
    return order && order.status.toLowerCase() === 'delivered';
  };

  const getTrackingSteps = () => {
    const isCOD = order?.payment?.toUpperCase() === 'COD';

    const steps = [
      { key: 'pending', label: 'Chờ xử lý', icon: '📝' },
      {
        key: 'processing',
        label: isCOD ? 'Đơn hàng đã đặt' : 'Đã thanh toán & Đang xử lý',
        icon: isCOD ? '📦' : '💳⚙️'
      },
      { key: 'shipped', label: 'Đang giao hàng', icon: '🚚' },
      { key: 'delivered', label: 'Đã giao hàng', icon: '✅' }
    ];

    const currentStatus = order?.status.toLowerCase();
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };


  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>{t('orderDetail.loading')}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-error">
        <h3>{t('orderDetail.notFound')}</h3>
        <button onClick={() => navigate('/my-orders')}>{t('orderDetail.backToList')}</button>
      </div>
    );
  }

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <button onClick={() => navigate('/my-orders')} className="back-btn">
          ← Quay lại
        </button>
        <h2>{t('orderDetail.title', { id: order._id.slice(-8) })}</h2>
        <div className="order-actions">
          {canCancelOrder() ? (
            <button
              onClick={() => setShowCancelModal(true)}
              className="cancel-btn"
            >
              {t('orderDetail.cancelOrder')}
            </button>
          ) : (
            order.status.toLowerCase() === 'shipped' && (
              <div className="cancel-note">
                <small>{t('orderDetail.cannotCancel')}</small>
              </div>
            )
          )}
        </div>
      </div>

      {/* Order Status & Tracking */}
      <div className="order-tracking">
        {getTrackingSteps().map((step) => (
          <div
            key={step.key}
            className={`tracking-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-label">
              {t(`orderDetail.tracking.${step.key}`)}
            </div>
          </div>
        ))}
      </div>

      {/* Order Info */}
      <div className="order-info-section">
        <div className="order-basic-info">
          <h3>{t('orderDetail.infoTitle')}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>{t('orderDetail.orderId')}:</label>
              <span>#{order._id}</span>
            </div>
            <div className="info-item">
              <label>{t('orderDetail.orderDate')}:</label>
              <span>{formatDate(order.date)}</span>
            </div>
            <div className="info-item">
              <label>{t('orderDetail.status')}:</label>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status, order.payment) }}
              >
                {getStatusText(order.status, order.payment)}
              </span>


            </div>
            <div className="info-item">
              <label>{t('orderDetail.paymentMethod')}:</label>
              <span>{order.payment || 'Stripe'}</span>
            </div>
          </div>
        </div>

        <div className="shipping-info">
          <h3>{t('orderDetail.shippingTitle')}</h3>
          <div className="address-card">
            <p><strong>{order.address.firstName} {order.address.lastName}</strong></p>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.state}</p>
            <p>{order.address.country} - {order.address.zipcode}</p>
            <p>SĐT: {order.address.phone}</p>
            <p>Email: {order.address.email}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items-section">
        <h3>{t('orderDetail.itemsTitle')}</h3>
        <div className="items-list">
          {order.items.map((item, index) => {
            let imageUrl = '/placeholder-image.svg';
            if (item.image) {
              if (item.image.startsWith('http')) {
                imageUrl = item.image;
              } else {
                let imagePath = item.image;
                if (imagePath.startsWith('uploads/')) {
                  imagePath = imagePath.substring(8);
                }
                if (imagePath.startsWith('/')) {
                  imagePath = imagePath.substring(1);
                }
                imageUrl = `http://localhost:4000/uploads/${imagePath}`;
              }
            }

            return (
    <div className="order-item-detail" key={index}>
      <img src={imageUrl} alt={item.name} className="item-image" />
      <div className="item-info">
        <h4>{item.name}</h4>
        <p>Quantity: {item.quantity}</p>
        <p className="item-price">{formatPrice(item.price)}</p>
        <p className="item-total">Subtotal: {formatPrice(item.price * item.quantity)}</p>
      </div>

      {canReviewProduct() && (
        <div className="review-note">
          <button
            className="btn-primary"
            onClick={() => {
              setSelectedProduct(item);
              setShowReviewModal(true);
            }}
          >
            {t('orderDetail.reviewBtn') || 'Đánh giá'}
          </button>
        </div>
      )}
    </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>{t('orderDetail.summaryTitle')}</h3>
        <div className="summary-details">
          <div className="summary-row">
            <span>{t('orderDetail.subtotal')}:</span>
            <span>{formatPrice(order.amount - 20000)}</span>
          </div>
          <div className="summary-row">
            <span>{t('orderDetail.shippingFee')}:</span>
            <span>{formatPrice(20000)}</span>
          </div>
          <div className="summary-row total">
            <span>{t('orderDetail.total')}:</span>
            <span>{formatPrice(order.amount)}</span>
          </div>
        </div>
      </div>

    
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('orderDetail.cancelConfirmTitle')}</h3>
            <p>{t('orderDetail.cancelConfirmText')}</p>
            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary">
                {t('orderDetail.no')}
              </button>
              <button onClick={handleCancelOrder} className="btn-danger">
                {t('orderDetail.yesCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal review-modal">
            <h3>{t('orderDetail.reviewModalTitle', { name: selectedProduct.name })}</h3>
            <div className="review-form">
              <div className="rating-section">
                <label>{t('orderDetail.reviewLabel')}:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= review.rating ? 'active' : ''}`}
                      onClick={() => setReview({ ...review, rating: star })}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <div className="comment-section">
                <label>Nhận xét:</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder={t('orderDetail.reviewPlaceholder')}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReview({ rating: 5, comment: '' });
                }}
                className="btn-secondary"
              >
                {t('orderDetail.cancel')}
              </button>
              <button onClick={handleSubmitReview} className="btn-primary">
                {t('orderDetail.submitReview')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;

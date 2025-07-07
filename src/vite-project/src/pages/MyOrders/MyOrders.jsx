import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyOrders.css';
import {
  FaListUl, FaShoppingCart, FaHourglassHalf, FaTruck,
  FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Chuyển locale cho format date/price
  const currentLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const currency = i18n.language === 'vi' ? 'VND' : 'USD';

  const statusOptions = [
    { value: 'all', label: t('orders.filter.all'), icon: <FaListUl /> },
    { value: 'paid', label: t('orders.filter.paid') },
    { value: 'processing', label: t('orders.filter.processing'), icon: <FaHourglassHalf /> },
    { value: 'shipped', label: t('orders.filter.shipped'), icon: <FaTruck /> },
    { value: 'delivered', label: t('orders.filter.delivered'), icon: <FaCheckCircle /> },
    { value: 'cancelled', label: t('orders.filter.cancelled'), icon: <FaTimesCircle /> },
  ];

  const [paymentFilter, setPaymentFilter] = useState('all');
  const paymentOptions = [
    { value: 'all', label: t('orders.filter.all'), icon: <FaListUl /> },
    { value: 'COD', label: t('payment.cod'), icon: <FaShoppingCart /> },
    { value: 'Stripe', label: t('payment.stripe'), icon: <FaCheckCircle /> },
    { value: 'PayOS', label: t('payment.payos'), icon: <FaTruck /> },
  ];

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [i18n.language]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('loginRequired'));
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/order/userorders', {
        headers: { token }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message || t('error'));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Có thể để currentLocale là 'vi-VN' luôn
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    // Luôn hiển thị VNĐ, không quan tâm ngôn ngữ giao diện
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };


  // Màu status không cần chuyển đổi
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'paid': return '#28a745';
      case 'shipped': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Dịch trạng thái theo locale
  const getStatusText = (status) => {
    // Tự động lowercase, tránh truyền nhầm key
    let key = `orders.filter.${status?.toLowerCase()}`;
    return t(key);
  };

  // Lọc theo trạng thái
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === statusFilter);

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <h2>{t('orders.title')}</h2>
        <p>{t('orders.subtitle')}</p>
      </div>

      <div className="order-status-filter">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={statusFilter === option.value ? 'active' : ''}
          >
            <span className="filter-icon">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>{t('orders.noOrders')}</h3>
          <p>{t('orders.noOrdersHelp')}</p>
          <button onClick={() => navigate('/')} className="shop-now-btn">
            {t('orders.shopNow')}
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              onClick={() => navigate(`/order/${order._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="order-header">
                <div className="order-info">
                  <h3>#{order._id.slice(-8)}</h3>
                  <p className="order-date">{formatDate(order.date)}</p>
                </div>
                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <div className="order-total-compact">
                    {formatPrice(order.amount)}
                  </div>
                </div>
              </div>

              <div className="order-items-compact">
                <div className="items-grid">
                  {order.items.slice(0, 3).map((item, index) => {
                 let imageUrl = '/placeholder-image.svg';
if (item.image) {
  // Nếu image đã là link đầy đủ
  if (item.image.startsWith('http')) {
    imageUrl = item.image;
  } else if (item.image.startsWith('uploads')) {
    // Nếu trả về kiểu 'uploads/tenfile.png'
    imageUrl = `http://localhost:4000/${item.image}`;
  } else {
    // Trả về chỉ tên file hoặc các trường hợp khác
    imageUrl = `http://localhost:4000/uploads/${item.image}`;
  }
}


                    return (
                      <div key={index} className="item-compact">
                        <img
                          src={imageUrl}
                          alt={item.name || 'Product'}
                          className="item-image-small"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.svg';
                          }}
                        />
                        <div className="item-info-compact">
                          <span className="item-name-short">{t(item.name)}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                  {order.items.length > 3 && (
                    <div className="more-items-indicator">
                      {t('orders.moreItems', { count: order.items.length - 3 })}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-footer-compact">
                <div className="order-address-compact">

                  <div>
                {[
                      order.address.street,
                      order.address.ward,
                      order.address.district,
                      order.address.city,
                      order.address.state,
                      "VN"
                    ].filter(Boolean).join(', ')}
                  </div>
                  <div>SĐT: {order.address.phone || 'Chưa có SĐT'}</div>
                  <div>Email: {order.address.email || 'Chưa có email'}</div>
                </div>

                <div className="order-payment">
                  💳 {t(`payment.${(order.payment || 'stripe').toLowerCase()}`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

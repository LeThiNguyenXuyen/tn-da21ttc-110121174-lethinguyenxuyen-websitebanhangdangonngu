import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Vui lòng đăng nhập để truy cập trang này');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/admin/orders', {
        headers: {
          'token': token
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        console.log('✅ Fetched orders successfully:', response.data.orders.length);
      } else {
        console.error('❌ Failed to fetch orders:', response.data.message);
        alert('Lỗi: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      if (error.response?.status === 401) {
        alert('Token không hợp lệ. Vui lòng đăng nhập lại.');
      } else {
        alert('Có lỗi xảy ra khi tải danh sách đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const response = await axios.post(
        `http://localhost:4000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'token': localStorage.getItem('token')
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        setShowModal(false);
        alert('Cập nhật trạng thái đơn hàng thành công!');
      } else {
        alert('Lỗi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'paid': return '#28a745';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#6f42c1';
      case 'delivered': return '#20c997';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'paid': return 'Đã thanh toán';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã gửi hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Get order statistics
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
      paid: orders.filter(o => o.status.toLowerCase() === 'paid').length,
      processing: orders.filter(o => o.status.toLowerCase() === 'processing').length,
      shipped: orders.filter(o => o.status.toLowerCase() === 'shipped').length,
      delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
      cancelled: orders.filter(o => o.status.toLowerCase() === 'cancelled').length,
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="order-management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 Làm mới
        </button>
      </div>

      {/* Order Statistics */}
      <div className="order-stats">
        <div className="stat-card total">
          <h3>{stats.total}</h3>
          <p>Tổng đơn hàng</p>
        </div>
        <div className="stat-card pending">
          <h3>{stats.pending}</h3>
          <p>Chờ xử lý</p>
        </div>
        <div className="stat-card paid">
          <h3>{stats.paid}</h3>
          <p>Đã thanh toán</p>
        </div>
        <div className="stat-card processing">
          <h3>{stats.processing}</h3>
          <p>Đang xử lý</p>
        </div>
        <div className="stat-card shipped">
          <h3>{stats.shipped}</h3>
          <p>Đã gửi hàng</p>
        </div>
        <div className="stat-card delivered">
          <h3>{stats.delivered}</h3>
          <p>Đã giao hàng</p>
        </div>
        <div className="stat-card cancelled">
          <h3>{stats.cancelled}</h3>
          <p>Đã hủy</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Lọc theo trạng thái:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã gửi hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="search-group">
          <label>Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng, tên khách hàng, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">
                      {order.address.firstName} {order.address.lastName}
                    </div>
                    <div className="customer-email">{order.address.email}</div>
                  </div>
                </td>
                <td>{formatDate(order.date)}</td>
                <td className="order-amount">{formatPrice(order.amount)}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="btn-edit"
                    >
                      ✏️ Sửa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-orders">
            <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cập nhật đơn hàng #{selectedOrder._id.slice(-8)}</h3>
            
            <div className="order-details">
              <div className="detail-row">
                <strong>Khách hàng:</strong> 
                {selectedOrder.address.firstName} {selectedOrder.address.lastName}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedOrder.address.email}
              </div>
              <div className="detail-row">
                <strong>Số điện thoại:</strong> {selectedOrder.address.phone}
              </div>
              <div className="detail-row">
                <strong>Địa chỉ:</strong> {selectedOrder.address.street}, {selectedOrder.address.city}
              </div>
              <div className="detail-row">
                <strong>Tổng tiền:</strong> {formatPrice(selectedOrder.amount)}
              </div>
              <div className="detail-row">
                <strong>Ngày đặt:</strong> {formatDate(selectedOrder.date)}
              </div>
            </div>

  <div className="status-update">
  <label>Cập nhật trạng thái:</label>
  <div className="status-buttons">
  {[
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ]
    .filter(status => {
      const current = selectedOrder.status.toLowerCase();

      if (current === 'delivered' || current === 'cancelled') return false;

      if (current === 'paid') {
        return ['processing', 'shipped', 'delivered', 'cancelled'].includes(status);
      }

      if (current === 'processing') {
        return ['shipped', 'delivered', 'cancelled'].includes(status);
      }

      if (current === 'shipped') {
        return ['delivered'].includes(status);
      }

      if (current === 'pending') {
        return ['paid', 'processing', 'cancelled'].includes(status);
      }

      return true;
    })
    .map(status => (
      <button
        key={status}
        onClick={() => updateOrderStatus(selectedOrder._id, status)}
        disabled={updating || selectedOrder.status.toLowerCase() === status}
        className={`status-btn ${selectedOrder.status.toLowerCase() === status ? 'active' : ''}`}
        style={{ backgroundColor: getStatusColor(status) }}
      >
        {getStatusText(status)}
      </button>
    ))}
</div>

  </div>
</div>




            <div className="modal-actions">
              <button 
                onClick={() => setShowModal(false)}
                className="btn-cancel"
                disabled={updating}
              >
                Đóng
              </button>
            </div>
          </div>
   
      )}
    </div>
  );
};

export default OrderManagement;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching orders with token:', token ? 'Token exists' : 'No token');

      const response = await axios.get('http://localhost:4000/api/admin/orders', {
        headers: {
          token,
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📦 Orders response:', response.data);

      if (response.data.success) {
        setOrders(response.data.orders);
        console.log('✅ Orders loaded successfully:', response.data.orders.length);
      } else {
        console.error('❌ Failed to load orders:', response.data.message);
        toast.error(response.data.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:4000/api/admin/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: {
          token,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        fetchOrders(); // Refresh danh sách
        setShowModal(false);
      } else {
        toast.error(response.data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff'; // Màu xanh cho đã thanh toán & đang xử lý
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đã thanh toán & Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status.toLowerCase() === filter;
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
      processing: orders.filter(o => o.status.toLowerCase() === 'processing').length,
      shipped: orders.filter(o => o.status.toLowerCase() === 'shipped').length,
      delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
      cancelled: orders.filter(o => o.status.toLowerCase() === 'cancelled').length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h2>Quản lý đơn hàng</h2>
        <div className="header-actions">
          <button onClick={fetchOrders} className="refresh-btn">
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-card processing">
          <div className="stat-number">{stats.processing}</div>
          <div className="stat-label">Đang xử lý</div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-number">{stats.shipped}</div>
          <div className="stat-label">Đang giao</div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-number">{stats.delivered}</div>
          <div className="stat-label">Đã giao</div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-number">{stats.cancelled}</div>
          <div className="stat-label">Đã hủy</div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="filter-group">
          <label>Lọc theo trạng thái:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="search-group">
          <label>Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <label>Khách hàng:</label>
                <span>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedOrder.address.email}</span>
              </div>
              <div className="detail-row">
                <label>Số điện thoại:</label>
                <span>{selectedOrder.address.phone}</span>
              </div>
              <div className="detail-row">
                <label>Địa chỉ:</label>
                <span>
                  {selectedOrder.address.street}, {selectedOrder.address.city}, 
                  {selectedOrder.address.state}, {selectedOrder.address.country}
                </span>
              </div>
              <div className="detail-row">
                <label>Tổng tiền:</label>
                <span className="amount">{formatPrice(selectedOrder.amount)}</span>
              </div>
            </div>

            <div className="status-update">
              <label>Cập nhật trạng thái:</label>
              <div className="status-buttons">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder._id, status)}
                    className={`status-btn ${selectedOrder.status.toLowerCase() === status ? 'active' : ''}`}
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

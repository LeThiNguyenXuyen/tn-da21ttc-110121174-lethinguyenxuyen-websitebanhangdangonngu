import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching users with token:', token ? 'Token exists' : 'No token');

      const response = await fetch(
        `http://localhost:4000/api/admin/users?page=${currentPage}&limit=10&search=${searchTerm}`,
        {
          headers: {
            'token': token,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('👥 Users response:', data);

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        console.log('✅ Users loaded successfully:', data.users.length);
      } else {
        console.error('❌ Failed to load users:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:4000/api/admin/users/${userId}`,
        {
          headers: {
            'token': token,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.user);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <h2>👥 Quản lý người dùng</h2>
        <button 
          className="refresh-btn"
          onClick={fetchUsers}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Search */}
      <div className="users-search">
        <div className="search-group">
          <label>🔍 Tìm kiếm người dùng</label>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Tổng đơn hàng</th>
              <th>Tổng chi tiêu</th>
              <th>Đơn hàng cuối</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-name">{user.name}</div>
                  </div>
                </td>
                <td className="user-email">{user.email}</td>
                <td className="user-orders">
                  <span className="orders-count">{user.stats.totalOrders}</span>
                </td>
                <td className="user-spent">
                  {formatPrice(user.stats.totalSpent)}
                </td>
                <td className="last-order">
                  {user.stats.lastOrderDate 
                    ? formatDate(user.stats.lastOrderDate)
                    : 'Chưa có đơn hàng'
                  }
                </td>
                <td className="join-date">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => fetchUserDetail(user._id)}
                      className="btn-view"
                    >
                      👁️ Xem
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-users">
            <p>Không tìm thấy người dùng nào phù hợp với tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Trước
          </button>
          
          <div className="pagination-info">
            Trang {currentPage} / {totalPages}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau →
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal user-detail-modal">
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="user-detail-info">
                <div className="user-detail-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-detail-basic">
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="user-stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Tổng đơn hàng</span>
                  <span className="stat-value">{selectedUser.stats.totalOrders}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tổng chi tiêu</span>
                  <span className="stat-value">{formatPrice(selectedUser.stats.totalSpent)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Giá trị TB/đơn</span>
                  <span className="stat-value">
                    {selectedUser.stats.averageOrderValue 
                      ? formatPrice(selectedUser.stats.averageOrderValue)
                      : '0 đ'
                    }
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Đơn hàng đầu tiên</span>
                  <span className="stat-value">
                    {selectedUser.stats.firstOrderDate 
                      ? formatDate(selectedUser.stats.firstOrderDate)
                      : 'Chưa có'
                    }
                  </span>
                </div>
              </div>

              {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 && (
                <div className="recent-orders">
                  <h4>Đơn hàng gần đây</h4>
                  <div className="orders-list">
                    {selectedUser.recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="order-item">
                        <span className="order-id">#{order._id.slice(-8)}</span>
                        <span className="order-date">{formatDate(order.date)}</span>
                        <span className="order-amount">{formatPrice(order.amount)}</span>
                        <span className={`order-status status-${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

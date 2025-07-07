import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(
          `http://localhost:4000/api/admin/users?page=${currentPage}&limit=10&search=${searchTerm}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'token': token // Fallback header
            }
          }
        );

        const data = await response.json();
        console.log('Users API Response:', data); // Debug log

        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
        } else {
          throw new Error('API returned success: false');
        }
      } catch (apiError) {
        console.log('API failed, using demo data:', apiError);

        // Demo data khi API không hoạt động
        const demoUsers = [
          {
            _id: 'user_001',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com',
            createdAt: new Date('2024-01-15'),
            stats: {
              totalOrders: 5,
              totalSpent: 12500000,
              lastOrderDate: new Date('2024-01-20'),
              averageOrderValue: 2500000
            }
          },
          {
            _id: 'user_002',
            name: 'Trần Thị B',
            email: 'tranthib@gmail.com',
            createdAt: new Date('2024-01-10'),
            stats: {
              totalOrders: 3,
              totalSpent: 7800000,
              lastOrderDate: new Date('2024-01-18'),
              averageOrderValue: 2600000
            }
          },
          {
            _id: 'user_003',
            name: 'Lê Văn C',
            email: 'levanc@gmail.com',
            createdAt: new Date('2024-01-05'),
            stats: {
              totalOrders: 8,
              totalSpent: 15600000,
              lastOrderDate: new Date('2024-01-22'),
              averageOrderValue: 1950000
            }
          },
          {
            _id: 'user_004',
            name: 'Phạm Thị D',
            email: 'phamthid@gmail.com',
            createdAt: new Date('2023-12-20'),
            stats: {
              totalOrders: 2,
              totalSpent: 4200000,
              lastOrderDate: new Date('2024-01-12'),
              averageOrderValue: 2100000
            }
          },
          {
            _id: 'user_005',
            name: 'Hoàng Văn E',
            email: 'hoangvane@gmail.com',
            createdAt: new Date('2023-12-15'),
            stats: {
              totalOrders: 12,
              totalSpent: 28400000,
              lastOrderDate: new Date('2024-01-25'),
              averageOrderValue: 2366667
            }
          }
        ];

        // Filter theo search term nếu có
        const filteredUsers = searchTerm
          ? demoUsers.filter(user =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : demoUsers;

        setUsers(filteredUsers);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(
          'http://localhost:4000/api/admin/dashboard/stats',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'token': token // Fallback header
            }
          }
        );

        const data = await response.json();
        if (data.success) {
          setStats({
            totalUsers: data.stats.users.total,
            newUsersToday: data.stats.users.today,
            activeUsers: data.stats.users.total // Tạm thời
          });
        } else {
          throw new Error('Stats API failed');
        }
      } catch (apiError) {
        console.log('Stats API failed, using demo data:', apiError);

        // Demo stats
        setStats({
          totalUsers: 150,
          newUsersToday: 5,
          activeUsers: 142
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);

      // Fallback demo stats
      setStats({
        totalUsers: 150,
        newUsersToday: 5,
        activeUsers: 142
      });
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:4000/api/admin/users/${userId}`,
        {
          headers: {
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
    if (!price || price === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 10000000) return { level: 'VIP', color: '#ffd700' };
    if (totalSpent >= 5000000) return { level: 'Thân thiết', color: '#ff6b6b' };
    if (totalSpent >= 1000000) return { level: 'Bạc', color: '#74c0fc' };
    return { level: 'Mới', color: '#51cf66' };
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
      <div className="user-management-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-management-header">
        <div className="header-content">
          <h1>👥 Quản lý người dùng</h1>
          <p>Quản lý thông tin và hoạt động của người dùng</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={() => {
            fetchUsers();
            fetchUserStats();
          }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="user-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-change">Tất cả tài khoản</span>
          </div>
        </div>
        <div className="stat-card new">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>Người dùng mới hôm nay</h3>
            <p className="stat-value">{stats.newUsersToday}</p>
            <span className="stat-change positive">Đăng ký mới</span>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Người dùng hoạt động</h3>
            <p className="stat-value">{stats.activeUsers}</p>
            <span className="stat-change">Tài khoản kích hoạt</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
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
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-badges">
                        <div className="user-status active">Hoạt động</div>
                        <div
                          className="customer-level"
                          style={{
                            backgroundColor: getCustomerLevel(user.stats.totalSpent).color + '20',
                            color: getCustomerLevel(user.stats.totalSpent).color,
                            border: `1px solid ${getCustomerLevel(user.stats.totalSpent).color}40`
                          }}
                        >
                          {getCustomerLevel(user.stats.totalSpent).level}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="user-email">{user.email}</td>
                <td>
                  <span className="orders-badge">{user.stats.totalOrders}</span>
                </td>
                <td className="user-spent">
                  {formatPrice(user.stats.totalSpent)}
                </td>
                <td className="last-order">
                  {user.stats.lastOrderDate 
                    ? formatDate(user.stats.lastOrderDate)
                    : <span className="no-orders">Chưa có đơn hàng</span>
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
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-users">
            <div className="no-users-icon">👤</div>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              <div className="user-detail-header">
                <div className="user-detail-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-detail-info">
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.email}</p>
                  <span className="user-badge active">Hoạt động</span>
                </div>
              </div>

              <div className="user-stats-detail">
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
                  <span className="stat-label">Ngày tham gia</span>
                  <span className="stat-value">
                    {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                  </span>
                </div>
              </div>

              {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 && (
                <div className="recent-orders-section">
                  <h4>Đơn hàng gần đây</h4>
                  <div className="orders-list">
                    {selectedUser.recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-id">#{order._id.slice(-8)}</div>
                        <div className="order-date">{formatDate(order.date)}</div>
                        <div className="order-amount">{formatPrice(order.amount)}</div>
                        <div className={`order-status status-${order.status}`}>
                          {order.status}
                        </div>
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

export default UserManagement;

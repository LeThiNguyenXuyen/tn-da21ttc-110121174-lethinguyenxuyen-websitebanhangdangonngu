import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PromotionManagement.css';

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/promotions/admin/all');
      if (response.data.success) {
        setPromotions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/promotions/admin/toggle-status/${id}`);
      if (response.data.success) {
        // Cập nhật state local
        setPromotions(prev => prev.map(promotion => 
          promotion._id === id 
            ? { ...promotion, status: promotion.status === 'active' ? 'inactive' : 'active' }
            : promotion
        ));
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Có lỗi khi thay đổi trạng thái khuyến mãi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:4000/api/promotions/admin/delete/${id}`);
      if (response.data.success) {
        setPromotions(prev => prev.filter(promotion => promotion._id !== id));
        alert('Xóa khuyến mãi thành công');
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      alert('Có lỗi khi xóa khuyến mãi');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPromotionTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return 'Giảm %';
      case 'fixed':
        return 'Giảm cố định';
      case 'buy-x-get-y':
        return 'Mua X tặng Y';
      case 'order-discount':
        return 'Giảm đơn hàng';
      default:
        return 'Khác';
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
      </span>
    );
  };

  const isPromotionActive = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return promotion.status === 'active' && start <= now && end >= now;
  };

  if (loading) {
    return (
      <div className="promotion-management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách khuyến mãi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="promotion-management">
        <div className="error">
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchPromotions} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="promotion-management">
      <div className="page-header">
        <h1>Quản Lý Khuyến Mãi</h1>
        <Link to="/add-promotion" className="add-btn">
          + Thêm Khuyến Mãi Mới
        </Link>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>{promotions.length}</h3>
          <p>Tổng khuyến mãi</p>
        </div>
        <div className="stat-card">
          <h3>{promotions.filter(p => p.status === 'active').length}</h3>
          <p>Đang hoạt động</p>
        </div>
        <div className="stat-card">
          <h3>{promotions.filter(p => isPromotionActive(p)).length}</h3>
          <p>Đang diễn ra</p>
        </div>
        <div className="stat-card">
          <h3>{promotions.filter(p => p.status === 'inactive').length}</h3>
          <p>Tạm dừng</p>
        </div>
      </div>

      <div className="promotions-table-container">
        <table className="promotions-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hoạt động</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion._id}>
                <td>
                  <div className="promotion-title">
                    <strong>{promotion.title}</strong>
                    <small>{promotion.description}</small>
                  </div>
                </td>
                <td>
                  <span className="type-badge">
                    {getPromotionTypeText(promotion.type)}
                  </span>
                </td>
                <td>
                  <strong>
                    {promotion.type === 'percentage' 
                      ? `${promotion.value}%` 
                      : `${promotion.value.toLocaleString()}đ`
                    }
                  </strong>
                </td>
                <td>
                  <div className="date-range">
                    <div>{formatDate(promotion.startDate)}</div>
                    <div>{formatDate(promotion.endDate)}</div>
                  </div>
                </td>
                <td>
                  {getStatusBadge(promotion.status)}
                </td>
                <td>
                  <span className={`activity-indicator ${isPromotionActive(promotion) ? 'active' : 'inactive'}`}>
                    {isPromotionActive(promotion) ? '🟢 Đang diễn ra' : '🔴 Không hoạt động'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/edit-promotion/${promotion._id}`} 
                      className="edit-btn"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(promotion._id)}
                      className={`toggle-btn ${promotion.status}`}
                      title={promotion.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                    >
                      {promotion.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => handleDelete(promotion._id)}
                      className="delete-btn"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promotions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h3>Chưa có khuyến mãi nào</h3>
            <p>Hãy tạo khuyến mãi đầu tiên để thu hút khách hàng!</p>
            <Link to="/add-promotion" className="add-btn">
              Tạo khuyến mãi mới
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionManagement;

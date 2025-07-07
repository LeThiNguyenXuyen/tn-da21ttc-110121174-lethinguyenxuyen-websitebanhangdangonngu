import React, { useState, useEffect } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Reset form when component mounts (after logout)
  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Kiểm tra thông tin đăng nhập
    if (username !== 'admin123' || password !== '12345678') {
      setError('Tài khoản hoặc mật khẩu không đúng!');
      setLoading(false);
      return;
    }

    // Tạo JWT token giả lập cho admin (format đúng)
    // Đây là token test có format JWT hợp lệ nhưng không cần verify thực sự
    const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzAwMSIsIm5hbWUiOiJBZG1pbiBOxrDhu5tjIEhvYSIsImVtYWlsIjoiYWRtaW5AbnVvY2hvYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzU3NDAwMDAsImV4cCI6MTczNjM0NDgwMH0.test_admin_signature";

    const adminUser = {
      name: 'Admin Nước Hoa',
      email: 'admin@nuochoa.com',
      userId: 'admin_001'
    };

    // Lưu thông tin admin vào localStorage
    localStorage.setItem('token', adminToken);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));

    // Gọi callback để cập nhật state cha
    onLogin({
      success: true,
      token: adminToken,
      name: adminUser.name,
      email: adminUser.email,
      userId: adminUser.userId
    });

    setTimeout(() => {
      setLoading(false);
      alert('Đăng nhập admin thành công!');
    }, 1000);
  };



  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>🔐 Admin Panel</h1>
          <p>Đăng nhập để truy cập trang quản trị</p>
        </div>

        <form className="admin-login-form" onSubmit={handleAdminLogin}>
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">👤 Tài khoản:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản admin"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Mật khẩu:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? '🔄 Đang đăng nhập...' : '👑 Đăng nhập Admin'}
          </button>

          <div className="admin-info">
            <h3>📋 Thông tin:</h3>
            <ul>
              <li>👑 Tài khoản Admin duy nhất</li>
              <li>🔒 Chỉ dành cho quản trị viên</li>
              <li>🛡️ Bảo mật và đơn giản</li>
            </ul>
          </div>


        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

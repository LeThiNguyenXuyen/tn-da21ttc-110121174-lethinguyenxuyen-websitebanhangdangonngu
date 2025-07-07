import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching dashboard stats with token:', token ? 'Token exists' : 'No token');

      const response = await fetch('http://localhost:4000/api/admin/dashboard/stats', {
        headers: {
          'token': token,
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📊 Dashboard response:', data);

      if (data.success) {
        setStats(data.stats);
        console.log('✅ Dashboard stats loaded successfully');
      } else {
        console.error('❌ Failed to load dashboard stats:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Colors for charts
  const colors = {
    primary: '#6f42c1',
    secondary: '#f55a2c',
    success: '#28a745',
    info: '#17a2b8',
    warning: '#ffc107',
    danger: '#dc3545',
    gradient: ['#6f42c1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe']
  };

  const adminFeatures = [
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và cập nhật trạng thái đơn hàng',
      icon: '📦',
      path: '/admin/orders',
      color: '#f55a2c'
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: '🛍️',
      path: '/admin/products',
      color: '#28a745'
    },
    {
      title: 'Quản lý kho hàng',
      description: 'Theo dõi tồn kho và cảnh báo hết hàng',
      icon: '📦',
      path: '/admin/inventory',
      color: '#e74c3c'
    },
    {
      title: 'Quản lý khuyến mãi',
      description: 'Tạo và quản lý chương trình khuyến mãi',
      icon: '🎉',
      path: '/admin/promotions',
      color: '#17a2b8'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Xem thông tin và quản lý tài khoản',
      icon: '👥',
      path: '/admin/users',
      color: '#6f42c1'
    },
    {
      title: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo doanh thu và thống kê',
      icon: '📊',
      path: '/admin/reports',
      color: '#fd7e14'
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình và cài đặt website',
      icon: '⚙️',
      path: '/admin/settings',
      color: '#6c757d'
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard-error">
        <p>Không thể tải dữ liệu dashboard</p>
        <button onClick={fetchDashboardStats} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎛️ Bảng điều khiển Admin</h1>
        <p>Chào mừng bạn đến với hệ thống quản lý Nước Hoa</p>
        <button onClick={fetchDashboardStats} className="refresh-btn">
          🔄 Làm mới
        </button>
      </div>

      {/* Main Dashboard Stats Cards */}
      <div className="dashboard-stats-grid">
        {/* Tổng Doanh Thu */}
        <div className="modern-stat-card revenue-card">
          <div className="card-icon">
            <div className="icon-wrapper revenue-icon">
              <span>💰</span>
            </div>
          </div>
          <div className="card-content">
            <h3>TỔNG DOANH THU</h3>
            <div className="stat-value">{formatPrice(stats.revenue.total)}</div>
            <div className="stat-subtitle">TB: {formatPrice(stats.revenue.average)}/đơn</div>
          </div>
          <div className="card-gradient revenue-gradient"></div>
        </div>

        {/* Tổng Đơn Hàng */}
        <div className="modern-stat-card orders-card">
          <div className="card-icon">
            <div className="icon-wrapper orders-icon">
              <span>🛒</span>
            </div>
          </div>
          <div className="card-content">
            <h3>TỔNG ĐỚN HÀNG</h3>
            <div className="stat-value">{stats.orders.total}</div>
            <div className="stat-subtitle">
              {stats.orders.today > 0 ? `${stats.orders.today} đơn hôm nay` : 'Không có đơn chờ'}
            </div>
          </div>
          <div className="card-gradient orders-gradient"></div>
        </div>

        {/* Sản Phẩm */}
        <div className="modern-stat-card products-card">
          <div className="card-icon">
            <div className="icon-wrapper products-icon">
              <span>📦</span>
            </div>
          </div>
          <div className="card-content">
            <h3>SẢN PHẨM</h3>
            <div className="stat-value">{stats.products.total}</div>
            <div className="stat-subtitle">
              {stats.charts?.brandStats?.length || 1} thương hiệu
            </div>
          </div>
          <div className="card-gradient products-gradient"></div>
        </div>

        {/* Doanh Thu Hôm Nay */}
        <div className="modern-stat-card today-revenue-card">
          <div className="card-icon">
            <div className="icon-wrapper today-icon">
              <span>📈</span>
            </div>
          </div>
          <div className="card-content">
            <h3>DOANH THU HÔM NAY</h3>
            <div className="stat-value">{formatPrice(stats.revenue.today)}</div>
            <div className="stat-subtitle">
              {stats.revenue.today > 0 ? 'Có doanh thu' : 'Chưa có đơn hôm nay'}
            </div>
          </div>
          <div className="card-gradient today-gradient"></div>
        </div>

        {/* Người Dùng */}
        <div className="modern-stat-card users-card">
          <div className="card-icon">
            <div className="icon-wrapper users-icon">
              <span>👥</span>
            </div>
          </div>
          <div className="card-content">
            <h3>NGƯỜI DÙNG</h3>
            <div className="stat-value">{stats.users.total}</div>
            <div className="stat-subtitle">
              {stats.users.today > 0 ? `${stats.users.today} người dùng mới` : 'Không có người dùng mới'}
            </div>
          </div>
          <div className="card-gradient users-gradient"></div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="order-status-overview">
        <h2>📊 Tổng quan đơn hàng</h2>
        <div className="status-cards">
          <div className="status-card pending">
            <div className="status-number">{stats.orders.pending}</div>
            <div className="status-label">Chờ xử lý</div>
          </div>
          <div className="status-card processing">
            <div className="status-number">{stats.orders.processing}</div>
            <div className="status-label">Đang xử lý</div>
          </div>
          <div className="status-card shipped">
            <div className="status-number">{stats.orders.shipped}</div>
            <div className="status-label">Đang giao</div>
          </div>
          <div className="status-card delivered">
            <div className="status-number">{stats.orders.delivered}</div>
            <div className="status-label">Đã giao</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue & Orders Trend Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>📈 Xu hướng doanh thu & đơn hàng</h3>
            <div className="chart-legend">
              <span className="legend-item revenue">● Doanh thu</span>
              <span className="legend-item orders">● Đơn hàng</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={stats.charts.dailyRevenue.map(item => ({
                ...item,
                date: formatDate(item._id),
                revenue: item.revenue,
                orders: item.orders
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f55a2c" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="#ff8c42" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28a745" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#28a745" stopOpacity={0.3}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis
                yAxisId="left"
                stroke="#f55a2c"
                fontSize={12}
                tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#28a745"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  padding: '16px'
                }}
                formatter={(value, name) => {
                  if (name === 'revenue') {
                    return [formatPrice(value), 'Doanh thu'];
                  }
                  return [value, 'Đơn hàng'];
                }}
                labelFormatter={(label) => `Ngày ${label}`}
                labelStyle={{ color: '#333', fontWeight: 600 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="url(#revenueGradient)"
                stroke="#f55a2c"
                strokeWidth={4}
                filter="url(#glow)"
                dot={{ fill: '#f55a2c', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#f55a2c', strokeWidth: 2, fill: 'white' }}
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="url(#ordersGradient)"
                radius={[6, 6, 0, 0]}
                opacity={0.9}
                maxBarSize={40}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🏆 Top sản phẩm bán chạy</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.charts.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#666"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'totalSold' ? `${value} sản phẩm` : formatPrice(value),
                  name === 'totalSold' ? 'Đã bán' : 'Doanh thu'
                ]}
              />
              <Bar dataKey="totalSold" radius={[6, 6, 0, 0]}>
                {stats.charts.topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.gradient[index % colors.gradient.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🏷️ Phân bố thương hiệu</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.charts.brandStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.charts.brandStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.gradient[index % colors.gradient.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics Charts */}
      <div className="analytics-section">
        <h2>📊 Phân tích chi tiết</h2>

        <div className="analytics-grid">
          {/* User Growth Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>👥 Tăng trưởng người dùng</h3>
              <div className="growth-indicator positive">
                <span>↗️ +80.0%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[
                { month: 'T1', users: 2 },
                { month: 'T2', users: 3 },
                { month: 'T3', users: 4 },
                { month: 'T4', users: 5 },
                { month: 'T5', users: 6 },
                { month: 'T6', users: 8 }
              ]}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value, 'Người dùng']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#userGradient)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📦 Trạng thái đơn hàng</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Đã giao', value: stats.orders.delivered, color: '#10b981' },
                    { name: 'Đang giao', value: stats.orders.shipped, color: '#3b82f6' },
                    { name: 'Đang xử lý', value: stats.orders.processing, color: '#f59e0b' },
                    { name: 'Chờ xử lý', value: stats.orders.pending, color: '#ef4444' }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Đã giao', value: stats.orders.delivered, color: '#10b981' },
                    { name: 'Đang giao', value: stats.orders.shipped, color: '#3b82f6' },
                    { name: 'Đang xử lý', value: stats.orders.processing, color: '#f59e0b' },
                    { name: 'Chờ xử lý', value: stats.orders.pending, color: '#ef4444' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Comparison */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>💰 So sánh doanh thu tháng</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { month: 'T1', thisYear: 800000, lastYear: 600000 },
                { month: 'T2', thisYear: 1200000, lastYear: 900000 },
                { month: 'T3', thisYear: 1500000, lastYear: 1100000 },
                { month: 'T4', thisYear: 1800000, lastYear: 1300000 },
                { month: 'T5', thisYear: 2100000, lastYear: 1600000 },
                { month: 'T6', thisYear: 1728000, lastYear: 1400000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    formatPrice(value),
                    name === 'thisYear' ? 'Năm nay' : 'Năm trước'
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="thisYear"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Năm nay"
                />
                <Bar
                  dataKey="lastYear"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  name="Năm trước"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>⚡ Hiệu suất bán hàng</h3>
            </div>
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-circle" style={{ '--progress': '75%', '--color': '#10b981' }}>
                  <span className="metric-value">75%</span>
                </div>
                <div className="metric-label">Tỷ lệ chuyển đổi</div>
              </div>
              <div className="metric-item">
                <div className="metric-circle" style={{ '--progress': '85%', '--color': '#3b82f6' }}>
                  <span className="metric-value">85%</span>
                </div>
                <div className="metric-label">Khách hàng hài lòng</div>
              </div>
              <div className="metric-item">
                <div className="metric-circle" style={{ '--progress': '92%', '--color': '#f59e0b' }}>
                  <span className="metric-value">92%</span>
                </div>
                <div className="metric-label">Giao hàng đúng hẹn</div>
              </div>
              <div className="metric-item">
                <div className="metric-circle" style={{ '--progress': '68%', '--color': '#ef4444' }}>
                  <span className="metric-value">68%</span>
                </div>
                <div className="metric-label">Khách hàng quay lại</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-features">
        <h2>Chức năng quản lý</h2>
        <div className="features-grid">
          {adminFeatures.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
              onClick={() => navigate(feature.path)}
              style={{ borderLeftColor: feature.color }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <div className="feature-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <button 
            className="quick-btn orders"
            onClick={() => navigate('/admin/orders')}
          >
            <span>📦</span>
            Xem đơn hàng mới
          </button>
          <button
            className="quick-btn products"
            onClick={() => navigate('/admin/products/add')}
          >
            <span>➕</span>
            Thêm sản phẩm
          </button>
          <button
            className="quick-btn inventory"
            onClick={() => navigate('/admin/inventory')}
          >
            <span>📦</span>
            Kiểm tra kho
          </button>
          <button
            className="quick-btn promotions"
            onClick={() => navigate('/admin/promotions/add')}
          >
            <span>🎉</span>
            Tạo khuyến mãi
          </button>
          <button 
            className="quick-btn reports"
            onClick={() => navigate('/admin/reports')}
          >
            <span>📊</span>
            Xem báo cáo
          </button>
        </div>
      </div>

      <div className="recent-activities">
        <h2>Hoạt động gần đây</h2>
        <div className="activities-list">
          <div className="activity-item">
            <div className="activity-icon">🛒</div>
            <div className="activity-content">
              <p><strong>Đơn hàng mới #12345</strong></p>
              <span>Khách hàng: Nguyễn Văn A - 2 phút trước</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">⭐</div>
            <div className="activity-content">
              <p><strong>Đánh giá mới 5 sao</strong></p>
              <span>Sản phẩm: Nước hoa ABC - 15 phút trước</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p><strong>Khách hàng mới đăng ký</strong></p>
              <span>Email: customer@example.com - 1 giờ trước</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📦</div>
            <div className="activity-content">
              <p><strong>Đơn hàng #12340 đã giao</strong></p>
              <span>Khách hàng: Trần Thị B - 2 giờ trước</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

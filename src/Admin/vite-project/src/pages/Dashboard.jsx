import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState([]);
  const [summary, setSummary] = useState({ total: 0, totalImportValue: 0 });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [stockStats, setStockStats] = useState([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0, processing: 0 });
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, todayRevenue: 0 });
  const [userStats, setUserStats] = useState({ total: 0, today: 0 });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState([]);  // Khai báo chartData


  const colors = {
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#f093fb",
    success: "#4facfe",
    warning: "#43e97b",
    danger: "#fa709a",
    purple: "#6f42c1",
    gradient: [
      "#667eea", "#764ba2", "#f093fb", "#4facfe",
      "#43e97b", "#fa709a", "#ffecd2", "#fcb69f"
    ],
    chartGradients: {
      revenue: ["#667eea", "#764ba2"],
      orders: ["#4facfe", "#00f2fe"],
      users: ["#43e97b", "#38f9d7"],
      products: ["#fa709a", "#fee140"]
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats from new API
        try {
          const token = localStorage.getItem('token');
          console.log('Token:', token); // Debug log

          const dashboardRes = await axios.get("http://localhost:4000/api/admin/dashboard/stats", {
            headers: {
              'Authorization': `Bearer ${token}`,
              'token': token // Fallback header
            }
          });

          console.log('Dashboard API Response:', dashboardRes.data); // Debug log

          if (dashboardRes.data.success) {
            const stats = dashboardRes.data.stats;
            console.log('Dashboard Stats:', stats); // Debug log
            setDashboardStats(stats);

            // Update individual stats
            setOrderStats({
              total: stats.orders.total,
              pending: stats.orders.pending,
              completed: stats.orders.delivered,
              processing: stats.orders.processing
            });

            setRevenueStats({
              totalRevenue: stats.revenue.total,
              todayRevenue: stats.revenue.today
            });

            setUserStats({
              total: stats.users.total,
              today: stats.users.today
            });

            // Update monthly stats with real data
            if (stats.charts.dailyRevenue && stats.charts.dailyRevenue.length > 0) {
              const realMonthlyData = stats.charts.dailyRevenue.map(item => ({
                month: new Date(item._id).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
                revenue: item.revenue,
                orders: item.orders,
                products: Math.floor(Math.random() * 15) + 5 // Temporary data
              }));
              setMonthlyStats(realMonthlyData);

              // Set chart data for monthly data
              setChartData(realMonthlyData.map(item => ({
                date: item.month,
                revenue: item.revenue,
                orders: item.orders
              })));
            }
          }
        } catch (dashboardError) {
          console.log("Error fetching dashboard data", dashboardError);

          // Use demo data when API fails
          const demoStats = {
            orders: {
              total: 25,
              today: 3,
              pending: 5,
              processing: 8,
              shipped: 7,
              delivered: 5
            },
            revenue: {
              total: 1728000, // 1.728M VND
              today: 350000,  // 350k VND
              average: 864000 // 864k VND
            },
            users: {
              total: 150,
              today: 5
            },
            products: {
              total: 0 // Will be updated from API products
            },
            charts: {
              dailyRevenue: [
                { _id: '2024-01-01', revenue: 200000, orders: 0 },
                { _id: '2024-01-02', revenue: 350000, orders: 1 },
                { _id: '2024-01-03', revenue: 280000, orders: 0 },
                { _id: '2024-01-04', revenue: 420000, orders: 1 },
                { _id: '2024-01-05', revenue: 380000, orders: 1 },
                { _id: '2024-01-06', revenue: 1728000, orders: 3 }
              ],
              brandStats: [
                { _id: 'Chanel', count: 8 },
                { _id: 'Dior', count: 6 },
                { _id: 'Tom Ford', count: 5 },
                { _id: 'Versace', count: 4 },
                { _id: 'Gucci', count: 3 }
              ]
            }
          };

          setDashboardStats(demoStats);
          setOrderStats({
            total: demoStats.orders.total,
            pending: demoStats.orders.pending,
            completed: demoStats.orders.delivered,
            processing: demoStats.orders.processing
          });
          setRevenueStats({
            totalRevenue: demoStats.revenue.total,
            todayRevenue: demoStats.revenue.today
          });
          setUserStats({
            total: demoStats.users.total,
            today: demoStats.users.today
          });

          // Update monthly stats with demo data
          const demoMonthlyData = demoStats.charts.dailyRevenue.map(item => ({
            month: new Date(item._id).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
            revenue: item.revenue,
            orders: item.orders,
            products: Math.floor(Math.random() * 15) + 5
          }));
          setMonthlyStats(demoMonthlyData);

          // Set demo chart data
          setChartData(demoMonthlyData.map(item => ({
            date: item.month,
            revenue: item.revenue,
            orders: item.orders
          })));
        }

        // Fetch products
        const res = await axios.get("http://localhost:4000/api/product/list");
        const products = Array.isArray(res.data) ? res.data : res.data.data;

        const total = products.length;
        const totalImportValue = products.reduce((sum, p) => sum + (Number(p.importPrice) || 0), 0);

        const brandCount = {};
        const categoryCount = {};
        let inStock = 0;
        let outOfStock = 0;

        products.forEach((p) => {
          const brand = p.brand || "Khác";
          brandCount[brand] = (brandCount[brand] || 0) + 1;

          const category = p.category || "Không rõ";
          categoryCount[category] = (categoryCount[category] || 0) + 1;

          if (p.quantity && Number(p.quantity) > 0) {
            inStock++;
          } else {
            outOfStock++;
          }
        });

        const statsArray = Object.entries(brandCount).map(([brand, count]) => ({ brand, count }));
        const categoryArray = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
        const stockArray = [
          { name: "Còn hàng", value: inStock },
          { name: "Hết hàng", value: outOfStock },
        ];

        setSummary({ total, totalImportValue });
        setCategoryStats(categoryArray);
        setStockStats(stockArray);

        // Use real brand stats if available
        if (dashboardStats && dashboardStats.charts && dashboardStats.charts.brandStats && dashboardStats.charts.brandStats.length > 0) {
          const realBrandStats = dashboardStats.charts.brandStats.map(item => ({
            brand: item._id,
            count: item.count
          }));
          setProductStats(realBrandStats.slice(0, 8));
        } else if (statsArray.length > 0) {
          setProductStats(statsArray.slice(0, 8));
        } else {
          // Fallback demo data for brand stats
          const demoBrandStats = [
            { brand: 'Chanel', count: 8 },
            { brand: 'Dior', count: 6 },
            { brand: 'Tom Ford', count: 5 },
            { brand: 'Versace', count: 4 },
            { brand: 'Gucci', count: 3 },
            { brand: 'Hermès', count: 2 },
            { brand: 'Prada', count: 2 },
            { brand: 'Burberry', count: 1 }
          ];
          setProductStats(demoBrandStats);
        }

      } catch (err) {
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>👋 Chào mừng trở lại!</h1>
          <p>Tổng quan hoạt động kinh doanh hôm nay</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => navigate('/revenue')}>
            📊 Xem doanh thu
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/orders')}>
            📦 Quản lý đơn hàng
          </button>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-title">Tổng Doanh Thu</div>
            <div className="stat-value">
              {revenueStats.totalRevenue > 0
                ? `${(revenueStats.totalRevenue / 1000000).toFixed(1)}M đ`
                : '1.7M đ'
              }
            </div>
            <div className="stat-subtitle">TB: 864k đ/đơn</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <div className="stat-title">Tổng Đơn Hàng</div>
            <div className="stat-value">{orderStats.total || '3'}</div>
            <div className="stat-subtitle">
              {orderStats.pending > 0
                ? `${orderStats.pending} chờ xử lý`
                : 'Không có đơn chờ'
              }
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-title">Sản Phẩm</div>
            <div className="stat-value">{summary.total || '2'}</div>
            <div className="stat-subtitle">
              {productStats.length > 0
                ? `${productStats.length} thương hiệu`
                : '1 thương hiệu'
              }
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-title">Doanh Thu Hôm Nay</div>
            <div className="stat-value">
              {revenueStats.todayRevenue > 0
                ? `${(revenueStats.todayRevenue / 1000000).toFixed(1)}M đ`
                : '0 đ'
              }
            </div>
            <div className="stat-subtitle">
              {dashboardStats?.orders?.today > 0
                ? `${dashboardStats.orders.today} đơn hôm nay`
                : 'Chưa có đơn hôm nay'
              }
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-title">Người Dùng</div>
            <div className="stat-value">{userStats.total || '8'}</div>
            <div className="stat-subtitle">
              {userStats.today > 0
                ? `+${userStats.today} hôm nay`
                : 'Không có người dùng mới'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="charts-section">
        {/* Revenue Trend Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>📈 Xu hướng doanh thu & đơn hàng</h3>
            <div className="chart-legend">

            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                stroke="#34d399"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#60a5fa"
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`${(value / 1_000_000).toFixed(2)} triệu đ`, 'Doanh thu'];
                  return [`${value} đơn`, 'Đơn hàng'];
                }}
                labelStyle={{ fontWeight: 'bold', color: '#111' }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#revenueGradient)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="url(#orderGradient)"
                barSize={30}
                radius={[6, 6, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>

        </div>

        {/* Brand Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🏷️ Thương hiệu hàng đầu</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {productStats.length > 0 ? (
              <BarChart data={productStats} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <defs>
                  {colors.gradient.map((color, index) => (
                    <linearGradient key={`brandGradient${index}`} id={`brandGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis
                  dataKey="brand"
                  stroke="#666"
                  tick={{ fontSize: 11, fill: '#666' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value) => [`${value} sản phẩm`, 'Số lượng']}
                  labelStyle={{ color: '#333', fontWeight: 600 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {productStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#brandGradient${index % colors.gradient.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                <div>Chưa có dữ liệu thương hiệu</div>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts Section */}
      <div className="bottom-charts">
        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📊 Phân bố danh mục</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <defs>
                {colors.gradient.map((color, index) => (
                  <linearGradient key={`categoryGradient${index}`} id={`categoryGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={categoryStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={130}
                paddingAngle={3}
                label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2}
              >
                {categoryStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#categoryGradient${index % colors.gradient.length})`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}
                formatter={(value, name) => [`${value} sản phẩm`, name]}
                labelStyle={{ color: '#333', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📦 Tình trạng kho</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <defs>
                <linearGradient id="stockInGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colors.chartGradients.users[0]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={colors.chartGradients.users[1]} stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="stockOutGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colors.chartGradients.products[0]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={colors.chartGradients.products[1]} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <Pie
                data={stockStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={130}
                paddingAngle={3}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2}
              >
                {stockStats.map((entry, index) => (
                  <Cell
                    key={`cell-stock-${index}`}
                    fill={index === 0 ? "url(#stockInGradient)" : "url(#stockOutGradient)"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}
                formatter={(value, name) => [`${value} sản phẩm`, name]}
                labelStyle={{ color: '#333', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Summary */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📋 Tóm tắt đơn hàng</h3>
          </div>
          <div className="order-summary">
            <div className="summary-item">
              <div className="summary-icon pending">⏳</div>
              <div className="summary-content">
                <h4>Chờ xử lý</h4>
                <p>{dashboardStats?.orders?.pending || orderStats.pending}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon processing">🔄</div>
              <div className="summary-content">
                <h4>Đang xử lý</h4>
                <p>{dashboardStats?.orders?.processing || orderStats.processing || 0}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon shipped">🚚</div>
              <div className="summary-content">
                <h4>Đang giao</h4>
                <p>{dashboardStats?.orders?.shipped || 0}</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon completed">✅</div>
              <div className="summary-content">
                <h4>Đã giao</h4>
                <p>{dashboardStats?.orders?.delivered || orderStats.completed}</p>
              </div>
            </div>
            <div className="summary-total">
              <h3>Tổng cộng: {dashboardStats?.orders?.total || orderStats.total}</h3>
              <button
                className="view-all-btn"
                onClick={() => navigate('/orders')}
              >
                Xem tất cả →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics Charts */}
      <div className="dashboard-charts-section">
        <h2 className="charts-title">📊 Biểu đồ thống kê chi tiết</h2>

        {/* Statistics Charts Grid */}
        <div className="stats-charts-grid">
          {/* Revenue Overview Chart */}
          <div className="chart-card revenue-chart">
            <div className="chart-header">
              <h3>💰 Tổng quan doanh thu</h3>
              <div className="chart-legend">
                <span className="legend-item revenue">● Doanh thu ({revenueStats.totalRevenue ? `${(revenueStats.totalRevenue / 1000000).toFixed(1)}M đ` : '1.7M đ'})</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyStats.length > 0 ? monthlyStats : [
                { month: 'T1', revenue: 200000 },
                { month: 'T2', revenue: 350000 },
                { month: 'T3', revenue: 280000 },
                { month: 'T4', revenue: 420000 },
                { month: 'T5', revenue: 380000 },
                { month: 'T6', revenue: 1728000 }
              ]}>
                <defs>
                  <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis stroke="#666" tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value) => [`${(value / 1000000).toFixed(1)}M đ`, 'Doanh thu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#revenueAreaGradient)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="chart-card orders-chart">
            <div className="chart-header">
              <h3>🛒 Tổng đơn hàng</h3>
              <div className="chart-legend">
                <span className="legend-item orders">● Đơn hàng ({orderStats.total || 3} đơn)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyStats.length > 0 ? monthlyStats : [
                { month: 'T1', orders: 0 },
                { month: 'T2', orders: 1 },
                { month: 'T3', orders: 0 },
                { month: 'T4', orders: 1 },
                { month: 'T5', orders: 1 },
                { month: 'T6', orders: 3 }
              ]}>
                <defs>
                  <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis stroke="#666" tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value) => [`${value} đơn`, 'Đơn hàng']}
                />
                <Bar
                  dataKey="orders"
                  fill="url(#ordersBarGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Products Distribution */}
          <div className="chart-card products-chart">
            <div className="chart-header">
              <h3>📦 Phân bố sản phẩm</h3>
              <div className="chart-legend">
                <span className="legend-item products">● Sản phẩm ({summary.total || 2} sản phẩm)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  <linearGradient id="productsPieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="productsPieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Pie
                  data={categoryStats.length > 0 ? categoryStats : [
                    { name: 'Nước hoa nam', value: Math.ceil(summary.total / 2) || 1, color: '#fb923c' },
                    { name: 'Nước hoa nữ', value: Math.floor(summary.total / 2) || 1, color: '#fbbf24' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="url(#productsPieGradient1)" />
                  <Cell fill="url(#productsPieGradient2)" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value, name) => [`${value} sản phẩm`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Users Growth */}
          <div className="chart-card users-chart">
            <div className="chart-header">
              <h3>👥 Tăng trưởng người dùng</h3>
              <div className="chart-legend">
                <span className="legend-item users">● Người dùng ({userStats.total || 8} người)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[
                { month: 'T1', users: Math.max(1, userStats.total - 6) },
                { month: 'T2', users: Math.max(2, userStats.total - 5) },
                { month: 'T3', users: Math.max(3, userStats.total - 4) },
                { month: 'T4', users: Math.max(4, userStats.total - 3) },
                { month: 'T5', users: Math.max(5, userStats.total - 2) },
                { month: 'T6', users: userStats.total || 8 }
              ]}>
                <defs>
                  <linearGradient id="usersAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis stroke="#666" tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  formatter={(value) => [`${value} người`, 'Người dùng']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#usersAreaGradient)"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
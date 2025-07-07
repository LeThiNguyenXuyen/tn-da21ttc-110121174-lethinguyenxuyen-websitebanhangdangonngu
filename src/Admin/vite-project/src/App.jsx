import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AddProductPage from "./pages/AddProductPage";
import EditProduct from "./pages/EditProduct.jsx";
import PromotionManagement from "./pages/PromotionManagement.jsx";
import AddEditPromotion from "./pages/AddEditPromotion.jsx";
import OrderManagement from "./pages/OrderManagement.jsx";
import RevenueManagement from "./pages/RevenueManagement.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import CommentManagementPage from "./pages/CommentManagementPage/CommentManagementPage.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const handleOpenAddProduct = () => setShowModal(true);
  const handleCloseAddProduct = () => setShowModal(false);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('adminUser');

    // Only auto-login if both token and user exist
    if (token && user) {
      try {
        setIsAuthenticated(true);
        setAdminUser(JSON.parse(user));
      } catch (error) {
        // If there's an error parsing user data, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    // Extract user info from login response
    const userInfo = {
      name: userData.name,
      email: userData.email,
      userId: userData.userId
    };
    setAdminUser(userInfo);
  };

  const handleLogout = () => {
    // Clear localStorage completely
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');

    // Reset all states
    setIsAuthenticated(false);
    setAdminUser(null);

    // Force page reload to ensure clean state
    window.location.reload();
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        onOpenAddProduct={handleOpenAddProduct}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/admin/edit/:id" element={<EditProduct />} />
          <Route path="/promotions" element={<PromotionManagement />} />
          <Route path="/add-promotion" element={<AddEditPromotion />} />
          <Route path="/edit-promotion/:id" element={<AddEditPromotion />} />
          <Route path="/revenue" element={<RevenueManagement />} />
          <Route path="/comments" element={<CommentManagementPage />} />
          <Route path="/comments/:productId" component={CommentManagementPage} />
        <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

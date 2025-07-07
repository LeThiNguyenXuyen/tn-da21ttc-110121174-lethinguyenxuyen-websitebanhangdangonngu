// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ adminUser, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: "fas fa-home", path: "/dashboard" },
    { label: "Quản lý đơn hàng", icon: "fas fa-shopping-cart", path: "/orders" },

    { label: "Quản lý sản phẩm", icon: "fas fa-box", path: "/products" },
    { label: "Thêm sản phẩm", icon: "fas fa-plus-circle", path: "/add-product" },

    { label: "Quản lý khuyến mãi", icon: "fas fa-tags", path: "/promotions" },
    { label: "Thêm khuyến mãi", icon: "fas fa-percent", path: "/add-promotion" },
    { label: "Quản lý người dùng", icon: "fas fa-users", path: "/users" },
     { label: "Quản lý bình luận", icon: "fas fa-comment-dots", path: "/comments" },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-title">ADMIN PANEL</div>

      {adminUser && (
        <div className="admin-info">
          <div className="admin-avatar">👤</div>
          <div className="admin-details">
            <div className="admin-name">{adminUser.name}</div>
            <div className="admin-email">{adminUser.email}</div>
          </div>
        </div>
      )}

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
            <Link to={item.path}>
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

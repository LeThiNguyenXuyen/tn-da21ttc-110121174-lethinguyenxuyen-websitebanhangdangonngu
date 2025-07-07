import { useContext, useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import { assets } from "../../assets/assets";
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toastUtils';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Navbar = () => {
  const [menu, setMenu] = useState("Trangchu");
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { token, setToken, cartItems, isGoogleUser, setIsGoogleUser } = useContext(StoreContext);
  const { logout: authLogout } = useAuth();
  console.log("TOKEN:", token);

const logout = async () => {
  try {
    if (isGoogleUser) {
      // Đăng xuất Firebase cho Google user
      await authLogout();
      // StoreContext sẽ tự động xử lý token thông qua onAuthStateChanged
    } else {
      // Đăng xuất thủ công cho email/password user
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isGoogleUser");
      setToken("");
      setIsGoogleUser(false);

      // Trigger custom event để CartContext biết user đã đăng xuất
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { type: 'logout' }
      }));
    }

    showToast.success(`✅ ${t('success')}`);
    navigate("/");
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback: vẫn xóa token local
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isGoogleUser");
    setToken("");
    setIsGoogleUser(false);

    // Trigger custom event để CartContext biết user đã đăng xuất
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { type: 'logout' }
    }));
    showToast.error(`⚠️ ${t('error')}`);
    navigate("/");
  }
};

useEffect(() => {
  console.log("Navbar re-rendered, token:", token);
}, [token]);




  // ✅ Lấy từ StoreContext
  

  // ✅ Tính tổng số sản phẩm trong giỏ
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className='navbar'>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <img src={assets.logo} alt="Logo" className="logo" />
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className='navbar-menu'>
          <Link
            to="/"
            className={`nav-link ${menu === "Trangchu" ? "active" : ""}`}
            onClick={() => setMenu("Trangchu")}
          >
            <span className="nav-icon">🏠</span>
            <span>{t("home")}</span>
          </Link>

          <div className="nav-dropdown">
            <div className="nav-link dropdown-trigger">
              <span className="nav-icon">🧴</span>
              <span>{t("products")}</span>
              <span className="dropdown-arrow">▾</span>
            </div>
            <div className="dropdown-menu">
              <Link to="/perfume/Nam" className="dropdown-item">
                <span className="dropdown-icon-text">🚹</span>
                <span>{t("menPerfume")}</span>
              </Link>
              <Link to="/perfume/Nữ" className="dropdown-item">
                <span className="dropdown-icon-text">🚺</span>
                <span>{t("womenPerfume")}</span>
              </Link>
            </div>
          </div>

          <Link
            to="/promotions"
            className={`nav-link promotion-link ${menu === "khuyenmai" ? "active" : ""}`}
            onClick={() => setMenu("khuyenmai")}
          >
            <span className="nav-icon">🔥</span>
            <span>{t("promotions")}</span>
            <span className="promo-badge">HOT</span>
          </Link>

          <Link
            to="/contact"
            className={`nav-link ${menu === "lienhe" ? "active" : ""}`}
            onClick={() => setMenu("lienhe")}
          >
            <span className="nav-icon">📞</span>
            <span>{t("nav.contact")}</span>
          </Link>

       
        </div>

        {/* Right Section */}
        <div className='navbar-actions'>
          {/* Search */}
          <div className="search-section">
            <button
              className="action-btn search-btn"
              onClick={() => setShowSearch(!showSearch)}
              title={t("search")}
            >
              <img src={assets.search} alt="search" className="action-icon" />
            </button>
            {showSearch && (
              <div className="search-dropdown">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder={t("search") + "..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSearch(false);
                        setSearchQuery('');
                      }
                    }}
                    autoFocus
                    className="search-input"
                  />
                  <button className="search-submit-btn">
                    <img src={assets.search} alt="search" className="search-icon-small" />
                  </button>
                </div>
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="action-btn cart-btn" title={t("cart")}>
            <img src={assets.giohang} alt={t("cart")} className="action-icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Section */}
          {!token ? (
            <button
              onClick={() => navigate("/login")}
              className="login-btn"
            >
              <span className="login-emoji">👤</span>
              <span>{t("signIn")}</span>
            </button>
          ) : (
            <div className='user-menu'>
              <button className="user-avatar">
                <span className="user-text">👤</span>
              </button>
              <div className="user-dropdown">
                <div className="user-info">
                  <img src={assets.profile_icon} alt="profile" className="user-avatar-small" />
                  <span>{i18n.language === 'vi' ? 'Xin chào!' : 'Hello!'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="dropdown-action"
                >
                  <img src={assets.bag_icon} alt="orders" className="dropdown-icon" />
                  <span>{t("orders.title")}</span>
                </button>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="dropdown-action"
                >
                  <span className="heart-icon">❤️</span>
               <span>{t("wishlist")}</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={logout}
                  className="dropdown-action logout-action"
                >
                  <img src={assets.logout_icon} alt="logout" className="dropdown-icon" />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

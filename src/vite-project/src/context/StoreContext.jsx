import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [Product_list, setProduct_list] = useState([]); // Khởi tạo với empty array thay vì null
  const [promotions, setPromotions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isGoogleUser, setIsGoogleUser] = useState(localStorage.getItem("isGoogleUser") === "true"); // Track if user logged in via Google
  const [isRefreshing, setIsRefreshing] = useState(false);
  const url = "http://localhost:4000";

  // Fetch products with promotion data
  const fetchProducts = async (forceRefresh = false) => {
    try {
      // Thêm timestamp để tránh cache
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      const response = await axios.get(`${url}/api/product/list${timestamp}`);

      // API trả về {success: true, data: [...]}
      if (response.data && response.data.success && response.data.data) {
        const products = response.data.data;
        setProduct_list(products);
        console.log("✅ Products refreshed:", products.length);
      } else {
        setProduct_list([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy sản phẩm:", err);
      setProduct_list([]);
    }
  };

  // Fetch active promotions
  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${url}/api/promotions/active`);
      if (response.data.success) {
        setPromotions(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy khuyến mãi:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, []);

  // Auto refresh products every 30 seconds to sync with admin changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts(true); // Force refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Đồng bộ Firebase auth state với token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Nếu có user từ Firebase (Google login), lấy token mới
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
          setIsGoogleUser(true);
          localStorage.setItem("token", idToken);
          localStorage.setItem("isGoogleUser", "true");
        } catch (error) {
          console.error("Error getting ID token:", error);
        }
      } else {
        // Nếu không có user Firebase, chỉ xóa nếu là Google user
        const wasGoogleUser = localStorage.getItem("isGoogleUser") === "true";
        if (wasGoogleUser) {
          setToken("");
          setIsGoogleUser(false);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("isGoogleUser");

          // Trigger custom event để CartContext biết user đã đăng xuất
          window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { type: 'logout' }
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Đồng bộ token với localStorage khi token thay đổi từ bên ngoài
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const updateCartItem = (id, delta) => {
    setCartItems(prev =>
      prev
        .map(item => item._id === id
          ? { ...item, quantity: item.quantity + delta }
          : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  // Manual refresh function for immediate updates
  const refreshProducts = async () => {
    console.log("🔄 Manual refresh triggered");
    setIsRefreshing(true);
    try {
      await fetchProducts(true);
      await fetchPromotions();
      console.log("✅ Products refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing products:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const contextValue = {
    Product_list,
    promotions,
    fetchProducts,
    fetchPromotions,
    refreshProducts,
    isRefreshing,
    cartItems,
    updateCartItem,
    removeFromCart,
    url,
    token,
    setToken,
    isGoogleUser,
    setIsGoogleUser
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

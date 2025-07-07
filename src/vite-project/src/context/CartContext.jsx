import { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
const CartContext = createContext();
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("userId"));
  const cartRef = useRef(cart); // Ref để lưu cart hiện tại

  const url = "http://localhost:4000";

  // Cập nhật cartRef mỗi khi cart thay đổi
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Helper function để kiểm tra trạng thái đăng nhập
  const isUserLoggedIn = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isValid = !!(token && userId);
    console.log("🔍 Auth check:", { token: !!token, userId: !!userId, isValid });
    return isValid;
  };

  // Lấy giỏ hàng từ server
  const fetchCart = async () => {
    if (!isUserLoggedIn()) {
      console.log("❌ User not logged in, cannot fetch cart");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      setIsLoading(true);
      console.log("📥 Fetching cart from server for user:", userId);

      const response = await axios.post(`${url}/api/cart/get`, {}, {
        headers: { token }
      });

      if (response.data.success) {
        console.log("✅ Cart fetched successfully:", response.data.cartData);
        setCart(response.data.cartData || []);
      } else {
        console.error("❌ Failed to fetch cart:", response.data.message);
        // Nếu lỗi auth, có thể token hết hạn
        if (response.data.message.includes("Token") || response.data.message.includes("đăng nhập")) {
          console.log("🔄 Token might be expired, clearing auth data");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          setCurrentUserId(null);
          setCart([]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Đồng bộ giỏ hàng lên server
  const syncCartToServer = async (cartData) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      console.log("❌ No token or userId, cannot sync cart");
      return;
    }

    try {
      console.log("📤 Syncing cart to server:", cartData);
      await axios.post(`${url}/api/cart/sync`, {
        cartData
      }, {
        headers: { token }
      });
      console.log("✅ Cart synced successfully");
    } catch (error) {
      console.error("❌ Error syncing cart:", error);
    }
  };

const addToCart = async (product, size = '', quantity) => {
     const newQuantity = Number(quantity) || 1;
 const safeSize    = size || '';       // ← đảm bảo không null
    const currentToken  = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    //
    // 3. LẤY SẴN THÔNG TIN KHUYẾN MÃI TỪ product (đã tính ở trang chi tiết)
    //
    const hasPromotion     = product.hasPromotion    || false;
    const originalPrice    = product.originalPrice   || product.price;
    const discountedPrice  = product.discountedPrice || product.price;

    if (currentToken && currentUserId) {
      // 🟢 Đã đăng nhập → gửi lên server
      try {
        await axios.post(
          `${url}/api/cart/add`,
          {
            itemId: product._id,
            size: safeSize,  
            quantity: newQuantity,

            // 4. GỬI ĐÚNG THÔNG TIN KHUYẾN MÃI LÊN SERVER
            productData: {
              name:               product.name,
              image:              product.image,
              originalPrice:      originalPrice,        // giá gốc
              price:              discountedPrice,      // giá đã giảm
              hasPromotion:       hasPromotion,         // cờ khuyến mãi
              promotion:          product.promotion || null,
              discountPercentage: product.discountPercentage || 0
            }
          },
          { headers: { token: currentToken } }
        );

        console.log("✅ Added to cart on server");
        // 5. Fetch lại cart từ server để cập nhật lên UI
        await fetchCart();
      } catch (error) {
        console.error("❌ Error adding to cart on server:", error);
      }

    } else {
      // 🔴 Chưa đăng nhập → lưu local và show toast
      setCart(prev => {
        // 6. Check trùng
        const existing = prev.find(p => p.itemId === product._id && p.size === size);
        if (existing) {
          toast.warning("Sản phẩm đã có trong giỏ hàng");
          return prev;
        }

        // 7. TẠO newItem với giá đã giảm
        const newItem = {
          itemId:           product._id,
          name:             product.name,
          image:            product.image,
          size,
          quantity:         newQuantity,
          price:            discountedPrice,   // ← GIÁ ĐÃ GIẢM
          originalPrice,                          // giữ lại giá gốc
          hasPromotion,                          // cờ KM
          promotion:        product.promotion || null,
          discountedPrice,                        // để UI cần thêm
          discountPercentage: product.discountPercentage || 0
        };

        console.log("[CartContext] Thêm local cart:", newItem);
        toast.success("Sản phẩm đã được thêm vào giỏ hàng");
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (item) => {
    setCart(prev => prev.filter(p => !(p.itemId === item.itemId && p.size === item.size)))

    // Đồng bộ với server
    const currentToken = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    if (currentToken && currentUserId) {
      try {
        await axios.post(`${url}/api/cart/remove`, {
          itemId: item.itemId,
          size: item.size
        }, {
          headers: { token: currentToken }
        });
        console.log("✅ Removed from cart on server");
      } catch (error) {
        console.error("❌ Error removing from cart on server:", error);
      }
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item);
      return;
    }

    setCart(prev =>
      prev.map(p =>
        p.itemId === item.itemId && p.size === item.size

          ? {
            ...p,
            quantity: newQuantity,
            // Giữ nguyên thông tin khuyến mãi
            hasPromotion: p.hasPromotion,
            promotion: p.promotion,
            originalPrice: p.originalPrice,
            discountedPrice: p.discountedPrice
          }
          : p
      )
    );

    // Đồng bộ với server
    const currentToken = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    if (currentToken && currentUserId) {
      try {
        await axios.post(`${url}/api/cart/update`, {
          itemId: item.itemId,
          size: item.size,
          quantity: newQuantity
        }, {
          headers: { token: currentToken }
        });
        console.log("✅ Updated cart on server");
      } catch (error) {
        console.error("❌ Error updating cart on server:", error);
      }
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    setCart([]);

    const currentToken = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    if (currentToken && currentUserId) {
      try {
        await axios.post(`${url}/api/cart/clear`, {}, {
          headers: { token: currentToken }
        });
        console.log("✅ Cleared cart on server");
      } catch (error) {
        console.error("❌ Error clearing cart on server:", error);
      }
    }
  };

  // Load giỏ hàng khi component mount
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    console.log("🔍 Checking auth state:", {
      hasToken: !!currentToken,
      hasUserId: !!currentUserId,
      token: currentToken ? currentToken.substring(0, 20) + "..." : "null",
      userId: currentUserId || "null"
    });

    if (currentToken && currentUserId) {
      console.log("🔄 Loading cart for user:", currentUserId);
      setCurrentUserId(currentUserId);
      fetchCart();
    } else {
      console.log("👤 No user logged in, cart will be local only");
      // Thử lại sau 1 giây để đảm bảo localStorage đã được set
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        const retryUserId = localStorage.getItem("userId");
        if (retryToken && retryUserId) {
          console.log("🔄 Retry: Loading cart for user:", retryUserId);
          setCurrentUserId(retryUserId);
          fetchCart();
        }
      }, 1000);
    }
  }, []);

  // Lắng nghe thay đổi auth state
  useEffect(() => {
    const handleAuthChange = async (event) => {
      const { type, userId } = event.detail || {};

      console.log("🔄 Auth state changed:", type, userId);

      if (type === 'login' || type === 'register') {
        // User đăng nhập
        setCurrentUserId(userId);

        // Lấy cart hiện tại từ ref để sync
        const currentCart = cartRef.current;

        // Nếu có giỏ hàng local, đồng bộ lên server trước
        if (currentCart.length > 0) {
          console.log("📤 Syncing local cart to server...");
          await syncCartToServer(currentCart);
        }

        // Sau đó fetch giỏ hàng từ server
        console.log("📥 Fetching cart from server...");
        await fetchCart();

      } else if (type === 'logout') {
        // User đăng xuất
        console.log("🚪 User logged out, clearing local cart");
        setCurrentUserId(null);
        setCart([]);
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []); // Bỏ dependency [cart] để tránh vòng lặp

  // Force refresh auth state - để gọi từ bên ngoài khi cần
  const forceRefreshAuth = () => {
    console.log("🔄 Force refreshing auth state...");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      console.log("✅ Auth data found, fetching cart...");
      setCurrentUserId(userId);
      fetchCart();
    } else {
      console.log("❌ No auth data found");
      setCurrentUserId(null);
      setCart([]);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart,
      syncCartToServer,
      forceRefreshAuth,
      isLoading,
      isUserLoggedIn
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

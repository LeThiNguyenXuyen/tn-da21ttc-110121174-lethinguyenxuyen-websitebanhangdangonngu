import cartModel from "../models/Cart.js";  // Import mô hình Cart
import userModel from "../models/UserModel.js";  // Import mô hình User

// controllers/cartController.js
const extractUserId = (req) => {
  return req.user?.uid || req.user?.id;
};
 const addToCart = async (req, res) => {
  try {
    console.log("🛒 [addToCart] req.body =", JSON.stringify(req.body, null, 2));
    const { itemId, size, quantity, productData } = req.body;
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({
        userId,
        cartData: [{
          itemId,
          name: productData.name,
          image: productData.image,
          originalPrice: productData.originalPrice || productData.price,
          price: productData.price,
          hasPromotion: productData.hasPromotion || false,
          promotion: productData.promotion || null,
          discountPercentage: productData.promotion?.discountPercentage || 0,
          size,
          quantity
        }]
      });
    } else {
      const cartData = cart.cartData || [];
      const idx = cartData.findIndex(i => i.itemId === itemId && i.size === size);
      if (idx !== -1) {
        return res.json({ success: false, message: "Sản phẩm đã có trong giỏ hàng" });
      }
      cartData.push({
        itemId,
        name: productData.name,
        image: productData.image,
        originalPrice: productData.originalPrice || productData.price,
        price: productData.price,
        hasPromotion: productData.hasPromotion || false,
        promotion: productData.promotion || null,
        discountPercentage: productData.promotion?.discountPercentage || 0,
        size,
        quantity
      });
      cart.cartData = cartData;
    }

    console.log("🛒 [addToCart] cartData before save:", cart.cartData);
    await cart.save();
    res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi thêm vào giỏ hàng" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    cart.cartData = cart.cartData.filter(i => !(i.itemId === itemId && i.size === size));
    await cart.save();
    res.json({ success: true, message: "Đã xóa khỏi giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa khỏi giỏ hàng" });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    const idx = cart.cartData.findIndex(i => i.itemId === itemId && i.size === size);
    if (idx === -1) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    if (quantity <= 0) {
      cart.cartData.splice(idx, 1);
    } else {
      cart.cartData[idx].quantity = quantity;
    }
    await cart.save();
    res.json({ success: true, message: "Đã cập nhật giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật giỏ hàng" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    const cart = await cartModel.findOne({ userId });
    return res.json({
      success: true,
      cartData: cart?.cartData || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng" });
  }
};

const syncCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    const { cartData } = req.body;
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, cartData: cartData || [] });
    } else {
      cart.cartData = cartData || [];
    }
    await cart.save();
    res.json({ success: true, message: "Đã đồng bộ giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi đồng bộ giỏ hàng" });
  }
};

 const clearCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Không xác định được người dùng" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    cart.cartData = [];
    await cart.save();
    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa giỏ hàng" });
  }
};

export {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  syncCart,
  clearCart
};

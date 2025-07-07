// controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import productModel from '../models/productModels.js';


// Thêm sản phẩm vào wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;
    
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }
    
    console.log("❤️ Adding to wishlist:", { userId, productId });
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" });
    }
    
    // Kiểm tra đã có trong wishlist chưa
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.json({ success: false, message: "Sản phẩm đã có trong danh sách yêu thích" });
    }
    
    // Thêm vào wishlist
    const wishlistItem = new Wishlist({
      userId,
      productId,
      addedAt: new Date()
    });
    
    await wishlistItem.save();
    
    console.log("✅ Added to wishlist successfully");
    
    res.json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích"
    });
    
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error);
    res.json({
      success: false,
      message: "Lỗi khi thêm vào wishlist: " + error.message
    });
  }
};

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;
    
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }
    
    console.log("💔 Removing from wishlist:", { userId, productId });
    
    // Xóa khỏi wishlist
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    
    if (!result) {
      return res.json({ success: false, message: "Sản phẩm không có trong danh sách yêu thích" });
    }
    
    console.log("✅ Removed from wishlist successfully");
    
    res.json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích"
    });
    
  } catch (error) {
    console.error("❌ Error removing from wishlist:", error);
    res.json({
      success: false,
      message: "Lỗi khi xóa khỏi wishlist: " + error.message
    });
  }
};

// Lấy danh sách wishlist của user
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?.userId || req.user?.id;
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }

    console.log("📋 Getting wishlist for user:", userId);

    // 1) Lấy wishlist và populate productId gồm name, image, price, sizes, quantity
    const wishlistItems = await Wishlist.find({ userId })
      .sort({ addedAt: -1 })
      .populate({
        path: 'productId',
        model: productModel,
        select: 'name image price sizes quantity'    // ← thêm quantity
      });

    // 2) Map ra format trả về
    const wishlistWithProducts = wishlistItems
      .map(item => {
        const prod = item.productId;
        if (!prod) return null;
        return {
          _id: item._id,
          productId: prod._id,
          addedAt: item.addedAt,
          product: {
            name: prod.name,
            image: prod.image,
            price: prod.price,
            sizes: prod.sizes,
            stockQuantity: prod.quantity             // ← đưa quantity vào
          }
        };
      })
      .filter(x => x !== null);

    console.log(`✅ Found ${wishlistWithProducts.length} items in wishlist`);
    return res.json({ success: true, wishlist: wishlistWithProducts });
  } catch (error) {
    console.error("❌ Error getting wishlist:", error);
    return res.json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu thích: " + error.message
    });
  }
};

// Kiểm tra sản phẩm có trong wishlist không
const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;
    
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }
    
    const existingItem = await Wishlist.findOne({ userId, productId });
    
    res.json({
      success: true,
      inWishlist: !!existingItem
    });
    
  } catch (error) {
    console.error("❌ Error checking wishlist status:", error);
    res.json({
      success: false,
      message: "Lỗi khi kiểm tra wishlist: " + error.message
    });
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist, checkWishlistStatus };

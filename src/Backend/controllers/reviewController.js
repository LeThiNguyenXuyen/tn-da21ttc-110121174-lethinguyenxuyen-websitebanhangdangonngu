// controllers/reviewController.js
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// Function để thêm đánh giá
const addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;
    
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }
    
    console.log("⭐ Adding review:", { productId, orderId, rating, userId });
    
    // Kiểm tra xem đơn hàng có tồn tại và thuộc về user không
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    
    // Kiểm tra xem đơn hàng đã được giao chưa
    if (order.status.toLowerCase() !== 'delivered') {
      return res.json({
        success: false,
        message: "Chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng"
      });
    }
    
    // Kiểm tra xem sản phẩm có trong đơn hàng không
    const productInOrder = order.items.find(item => item._id === productId);
    if (!productInOrder) {
      return res.json({ 
        success: false, 
        message: "Sản phẩm không có trong đơn hàng này" 
      });
    }
    
    // Kiểm tra xem đã đánh giá sản phẩm này chưa
    const existingReview = await Review.findOne({ 
      userId, 
      productId, 
      orderId 
    });
    
    if (existingReview) {
      return res.json({ 
        success: false, 
        message: "Bạn đã đánh giá sản phẩm này rồi" 
      });
    }
    
    // Tạo đánh giá mới
    const newReview = new Review({
      userId,
      productId,
      orderId,
      rating: Math.max(1, Math.min(5, rating)), // Đảm bảo rating từ 1-5
      comment: comment || '',
      date: new Date()
    });
    
    await newReview.save();
    
    console.log("✅ Review added successfully:", newReview._id);
    
    res.json({
      success: true,
      message: "Đánh giá đã được gửi thành công",
      review: newReview
    });
    
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.json({
      success: false,
      message: "Lỗi khi thêm đánh giá: " + error.message
    });
  }
};

// controllers/reviewController.js

const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId, visible } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Không tìm thấy bình luận" });
    }

    review.visible = visible; // true hoặc false
    await review.save();

    res.json({
      success: true,
      message: visible ? "Hiển thị bình luận thành công" : "Ẩn bình luận thành công",
      review
    });

  } catch (error) {
    console.error("❌ Error toggling visibility:", error);
    res.json({
      success: false,
      message: "Lỗi khi cập nhật hiển thị bình luận: " + error.message
    });
  }
};

// Function để chỉnh sửa đánh giá
const editReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.json({ success: false, message: "Đánh giá và bình luận không thể để trống" });
    }

    // Tìm và sửa bình luận
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.json({ success: false, message: "Không tìm thấy bình luận để chỉnh sửa" });
    }

    res.json({
      success: true,
      message: "Bình luận đã được cập nhật",
      review: updatedReview
    });

  } catch (error) {
    console.error("❌ Error editing review:", error);
    res.json({
      success: false,
      message: "Lỗi khi chỉnh sửa bình luận: " + error.message
    });
  }
};
// Function để báo cáo đánh giá
const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Không tìm thấy bình luận để báo cáo" });
    }

    review.reported = true;
    await review.save();

    res.json({
      success: true,
      message: "Bình luận đã được báo cáo"
    });
  } catch (error) {
    console.error("❌ Error reporting review:", error);
    res.json({
      success: false,
      message: "Lỗi khi báo cáo bình luận: " + error.message
    });
  }
};

// Function để lấy đánh giá của sản phẩm
const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.find({ productId, visible: true }).sort({ date: -1 });


    // Tính toán rating trung bình
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy đánh giá sản phẩm' });
  }
};

// Function để lấy đánh giá của user
const getUserReviews = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;
    
    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }
    
    console.log("📋 Getting reviews for user:", userId);
    
    const reviews = await Review.find({ userId }).sort({ date: -1 });
    
    console.log(`✅ Found ${reviews.length} reviews for user`);
    
    res.json({
      success: true,
      reviews: reviews
    });
    
  } catch (error) {
    console.error("❌ Error getting user reviews:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy đánh giá của user: " + error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Tìm và xóa bình luận
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.json({ success: false, message: "Không tìm thấy bình luận để xóa" });
    }

    res.json({
      success: true,
      message: "Bình luận đã được xóa",
      review: deletedReview
    });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.json({
      success: false,
      message: "Lỗi khi xóa bình luận: " + error.message
    });
  }
};

const replyToReview = async (req, res) => {
  try {
    const { reviewId, reply } = req.body;

    if (!reply || !reviewId) {
      return res.json({ success: false, message: "Nội dung trả lời không được để trống" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Không tìm thấy bình luận để trả lời" });
    }

    review.adminReply = reply;
    await review.save();

    res.json({
      success: true,
      message: "Đã trả lời bình luận thành công",
      review
    });
  } catch (error) {
    console.error("❌ Error replying to review:", error);
    res.json({
      success: false,
      message: "Lỗi khi trả lời bình luận: " + error.message
    });
  }
};


// Function để admin lấy tất cả bình luận
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });

    res.json({
      success: true,
      message: "Lấy tất cả bình luận thành công",
      reviews
    });
  } catch (error) {
    console.error("❌ Error fetching all reviews:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy tất cả bình luận: " + error.message
    });
  }
};


export { addReview, getProductReviews, getUserReviews, editReview, reportReview, deleteReview,getAllReviews,toggleReviewVisibility,replyToReview };



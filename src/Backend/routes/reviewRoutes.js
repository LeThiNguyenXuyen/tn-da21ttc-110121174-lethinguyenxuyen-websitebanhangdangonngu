// routes/reviewRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import { addReview, getProductReviews, getUserReviews,editReview,reportReview,deleteReview,getAllReviews,toggleReviewVisibility,replyToReview } from '../controllers/reviewController.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

// Routes cho review
router.post('/add', auth, addReview);
router.get('/product/:productId', getProductReviews); // Không cần auth vì ai cũng có thể xem review
router.get('/user', auth, getUserReviews);
router.put('/edit', auth, editReview);  // PUT method cho chỉnh sửa bình luận
router.post('/report', auth, reportReview);  // POST method cho báo cáo bình luận
router.delete('/:reviewId', auth, deleteReview); 
router.get('/admin/reviews', getAllReviews);
router.put('/toggle-visibility', toggleReviewVisibility);
router.put('/admin/reply', replyToReview);
export default router;

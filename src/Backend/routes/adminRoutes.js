// routes/adminRoutes.js
import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import {
  getAllOrders,
  updateOrderStatus,
  getRevenueStats,
  manualVerifyOrder,
  checkPendingOrders,
  getProblematicOrders
} from '../controllers/orderController.js';
import { getDashboardStats, getAllUsers, getUserDetail,getAllReviews,handleReportedReviews} from '../controllers/adminController.js';

const router = express.Router();

// Admin routes - sử dụng middleware admin đơn giản
router.get('/orders', authAdmin, getAllOrders);
router.post('/orders/:orderId/status', authAdmin, updateOrderStatus);
router.post('/orders/:orderId/manual-verify', authAdmin, manualVerifyOrder);
router.get('/revenue/stats', authAdmin, getRevenueStats);

// Order management utilities
router.post('/orders/check-pending', authAdmin, checkPendingOrders);
router.get('/orders/problematic', authAdmin, getProblematicOrders);

// Dashboard stats
router.get('/dashboard/stats', authAdmin, getDashboardStats);

// User management
router.get('/users', authAdmin, getAllUsers);
router.get('/users/:userId', authAdmin, getUserDetail);
router.get('/reviews', authAdmin, getAllReviews); // Lấy tất cả bình luận
router.post('/reviews/report', authAdmin, handleReportedReviews); // Xử lý báo cáo bình luận
export default router;

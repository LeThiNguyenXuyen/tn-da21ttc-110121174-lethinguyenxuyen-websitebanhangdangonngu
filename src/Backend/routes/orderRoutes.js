// routes/orderRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';  // Middleware thông minh
// import authJWT from '../middleware/authJWT.js';  // Chỉ JWT (nếu cần)
// import authFirebase from '../middleware/authFirebase.js';  // Chỉ Firebase (nếu cần)
import {
  PlaceOder,
  verifyOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  payWithPayOS,
  payosWebhook,
  stripeWebhook,
  manualVerifyOrder,
  placeOrderCOD,
  reduceStockAPI
} from '../controllers/orderController.js';

const router = express.Router();

// Sử dụng middleware thông minh (tự động phát hiện loại token)
router.post('/place', auth, PlaceOder);
router.post('/verify', verifyOrder);


// Webhook endpoints - KHÔNG cần auth vì được gọi từ payment gateway
router.post('/webhook/payos', payosWebhook);
router.post('/webhook/stripe', express.raw({type: 'application/json'}), stripeWebhook);

// Manual verify cho admin hoặc fallback
router.post('/manual-verify/:orderId', auth, manualVerifyOrder);

router.get('/userorders', auth, getUserOrders);
router.get('/detail/:orderId', auth, getOrderDetail);
router.post('/cancel/:orderId', auth, cancelOrder);
router.post('/payos', payWithPayOS); // PayOS payment
// Hoặc có thể sử dụng middleware cụ thể nếu biết chắc loại token:
// router.post('/place', authJWT, PlaceOder);  // Chỉ cho JWT
// router.post('/place-firebase', authFirebase, PlaceOder);  // Chỉ cho Firebase
router.post('/placeCOD', auth, placeOrderCOD);
router.post('/reduceStock',auth, reduceStockAPI);  // Giảm tồn kho


export default router;

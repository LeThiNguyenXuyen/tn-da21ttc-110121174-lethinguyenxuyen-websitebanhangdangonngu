import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import {
  getInventoryStats,
  getInventoryList,
  updateStock,
  getStockHistory,
  getLowStockAlerts,
  bulkUpdateStock
} from '../controllers/inventoryController.js';

const router = express.Router();

// Tất cả routes đều cần xác thực admin
router.use(authAdmin);

// GET /api/inventory/stats - Lấy thống kê tồn kho
router.get('/stats', getInventoryStats);

// GET /api/inventory/list - Lấy danh sách sản phẩm với thông tin tồn kho
router.get('/list', getInventoryList);

// PUT /api/inventory/stock/:productId - Cập nhật số lượng tồn kho
router.put('/stock/:productId', updateStock);

// GET /api/inventory/history/:productId - Lấy lịch sử xuất nhập kho
router.get('/history/:productId', getStockHistory);

// GET /api/inventory/alerts - Lấy cảnh báo tồn kho thấp
router.get('/alerts', getLowStockAlerts);

// POST /api/inventory/bulk-update - Cập nhật hàng loạt
router.post('/bulk-update', bulkUpdateStock);

export default router;

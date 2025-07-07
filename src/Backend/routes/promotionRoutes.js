import express from 'express';
import {
  getActivePromotions,
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getPromotionsForProduct,
  calculatePromotionPrice
} from '../controllers/promotionController.js';

const promotionRouter = express.Router();

// ===== ROUTES CHO USER =====
// Lấy danh sách khuyến mãi đang hoạt động
promotionRouter.get("/active", getActivePromotions);

// Lấy chi tiết khuyến mãi
promotionRouter.get("/:id", getPromotionById);

// Lấy khuyến mãi áp dụng cho sản phẩm cụ thể
promotionRouter.get("/product/:productId", getPromotionsForProduct);

// Tính giá sau khuyến mãi
promotionRouter.post("/calculate-price", calculatePromotionPrice);

// ===== ROUTES CHO ADMIN =====
// Lấy tất cả khuyến mãi (bao gồm inactive)
promotionRouter.get("/admin/all", getAllPromotions);

// Tạo khuyến mãi mới
promotionRouter.post("/admin/create", createPromotion);

// Cập nhật khuyến mãi
promotionRouter.put("/admin/update/:id", updatePromotion);

// Xóa khuyến mãi
promotionRouter.delete("/admin/delete/:id", deletePromotion);

// Toggle trạng thái khuyến mãi
promotionRouter.patch("/admin/toggle-status/:id", togglePromotionStatus);

export default promotionRouter;

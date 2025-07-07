import promotionModel from "../models/promotionModel.js";
import productModel from "../models/productModels.js";

// Lấy danh sách khuyến mãi (cho user)
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await promotionModel.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('condition.applicableProductIds', 'name image price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error("❌ Get Active Promotions Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy khuyến mãi" });
  }
};

// Lấy tất cả khuyến mãi (cho admin)
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionModel.find({})
      .populate('condition.applicableProductIds', 'name image price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error("❌ Get All Promotions Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách khuyến mãi" });
  }
};

// Lấy chi tiết khuyến mãi
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await promotionModel.findById(id)
      .populate('condition.applicableProductIds', 'name image price');

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Khuyến mãi không tồn tại" });
    }

    res.json({ success: true, data: promotion });
  } catch (error) {
    console.error("❌ Get Promotion By ID Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy chi tiết khuyến mãi" });
  }
};

// Tạo khuyến mãi mới (admin)
export const createPromotion = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      value,
      condition,
      startDate,
      endDate,
      status
    } = req.body;

    // Validate dữ liệu
    if (!title || !description || !type || !value || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc" 
      });
    }

    // Validate ngày
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" 
      });
    }

    // Validate giá trị khuyến mãi
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: "Giá trị phần trăm phải từ 0 đến 100" 
      });
    }

    const promotion = new promotionModel({
      title,
      description,
      type,
      value,
      condition: condition || {},
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'active'
    });

    await promotion.save();
    res.status(201).json({ 
      success: true, 
      message: "Tạo khuyến mãi thành công",
      data: promotion
    });
  } catch (error) {
    console.error("❌ Create Promotion Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi tạo khuyến mãi",
      error: error.message 
    });
  }
};

// Cập nhật khuyến mãi (admin)
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ngày nếu có
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({ 
          success: false, 
          message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" 
        });
      }
    }

    // Validate giá trị phần trăm nếu có
    if (updateData.type === 'percentage' && updateData.value && 
        (updateData.value < 0 || updateData.value > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: "Giá trị phần trăm phải từ 0 đến 100" 
      });
    }

    const promotion = await promotionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('condition.applicableProductIds', 'name image price');

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Khuyến mãi không tồn tại" });
    }

    res.json({ 
      success: true, 
      message: "Cập nhật khuyến mãi thành công",
      data: promotion
    });
  } catch (error) {
    console.error("❌ Update Promotion Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi cập nhật khuyến mãi",
      error: error.message 
    });
  }
};

// Xóa khuyến mãi (admin)
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await promotionModel.findByIdAndDelete(id);
    
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Khuyến mãi không tồn tại" });
    }

    res.json({ success: true, message: "Xóa khuyến mãi thành công" });
  } catch (error) {
    console.error("❌ Delete Promotion Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi xóa khuyến mãi",
      error: error.message 
    });
  }
};

// Toggle trạng thái khuyến mãi (admin)
export const togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await promotionModel.findById(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Khuyến mãi không tồn tại" });
    }

    promotion.status = promotion.status === 'active' ? 'inactive' : 'active';
    await promotion.save();

    res.json({ 
      success: true, 
      message: `${promotion.status === 'active' ? 'Kích hoạt' : 'Tắt'} khuyến mãi thành công`,
      data: promotion
    });
  } catch (error) {
    console.error("❌ Toggle Promotion Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi thay đổi trạng thái khuyến mãi",
      error: error.message 
    });
  }
};

// Lấy khuyến mãi áp dụng cho sản phẩm cụ thể
export const getPromotionsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { orderAmount = 0 } = req.query;

    const promotions = await promotionModel.findApplicablePromotions(
      productId, 
      parseFloat(orderAmount)
    );

    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error("❌ Get Promotions For Product Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy khuyến mãi cho sản phẩm",
      error: error.message 
    });
  }
};

// Tính giá sau khuyến mãi cho sản phẩm
export const calculatePromotionPrice = async (req, res) => {
  try {
    const { productId, promotionId, quantity = 1 } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const promotion = await promotionModel.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Khuyến mãi không tồn tại" });
    }

    const originalPrice = product.price;
    const discountedPrice = promotion.calculateDiscountedPrice(originalPrice, quantity);
    const discountAmount = originalPrice - discountedPrice;
    const discountPercentage = ((discountAmount / originalPrice) * 100).toFixed(2);

    res.json({ 
      success: true, 
      data: {
        originalPrice,
        discountedPrice,
        discountAmount,
        discountPercentage,
        promotion: {
          id: promotion._id,
          title: promotion.title,
          type: promotion.type,
          value: promotion.value
        }
      }
    });
  } catch (error) {
    console.error("❌ Calculate Promotion Price Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi tính giá khuyến mãi",
      error: error.message 
    });
  }
};

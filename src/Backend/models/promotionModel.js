import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["percentage", "fixed", "buy-x-get-y", "order-discount"],
    default: "percentage"
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    requiredProductIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    applicableProductIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    maxUsage: {
      type: Number,
      default: null // null = unlimited
    },
    currentUsage: {
      type: Number,
      default: 0
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

// Index để tối ưu query
promotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ "condition.applicableProductIds": 1 });

// Virtual để check promotion có đang hoạt động không
promotionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.condition.maxUsage === null || this.condition.currentUsage < this.condition.maxUsage);
});

// Method để tính giá sau khuyến mãi
promotionSchema.methods.calculateDiscountedPrice = function(originalPrice, quantity = 1) {
  if (!this.isActive) return originalPrice;
  
  switch (this.type) {
    case 'percentage':
      return originalPrice * (1 - this.value / 100);
    case 'fixed':
      return Math.max(0, originalPrice - this.value);
    case 'buy-x-get-y':
      // Logic cho mua X tặng Y (cần implement riêng)
      return originalPrice;
    case 'order-discount':
      return originalPrice; // Áp dụng ở level đơn hàng
    default:
      return originalPrice;
  }
};

// Static method để tìm promotions áp dụng cho sản phẩm
promotionSchema.statics.findApplicablePromotions = function(productId, orderAmount = 0, forDisplay = false) {
  const now = new Date();

  // Tạo query cơ bản
  const baseQuery = {
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { 'condition.applicableProductIds': { $size: 0 } }, // Áp dụng cho tất cả
      { 'condition.applicableProductIds': productId }
    ]
  };

  // Logic xử lý minOrderAmount:
  // 1. Nếu forDisplay = true: Hiển thị tất cả khuyến mãi để khách hàng biết có ưu đãi
  // 2. Nếu forDisplay = false: Áp dụng điều kiện minOrderAmount bình thường
  if (!forDisplay) {
    // Chỉ áp dụng điều kiện minOrderAmount khi tính toán thực tế (checkout, cart)
    baseQuery['condition.minOrderAmount'] = { $lte: orderAmount };
  }
  // Khi forDisplay = true, hiển thị tất cả khuyến mãi để khách hàng biết có ưu đãi

  return this.find(baseQuery).sort({ value: -1 }); // Ưu tiên khuyến mãi có giá trị cao nhất
};

const promotionModel = mongoose.model("Promotion", promotionSchema);
export default promotionModel;

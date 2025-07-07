// Utility functions for promotion calculations

/**
 * Check if a promotion is currently active
 * @param {Object} promotion - Promotion object
 * @returns {boolean} - True if promotion is active
 */
export const isPromotionActive = (promotion) => {
  if (!promotion || promotion.status !== 'active') return false;
  
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  
  return startDate <= now && endDate >= now;
};

/**
 * Calculate discounted price based on promotion
 * @param {number} originalPrice - Original price of the product
 * @param {Object} promotion - Promotion object
 * @param {number} quantity - Quantity of items (default: 1)
 * @returns {number} - Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, promotion, quantity = 1) => {
  if (!promotion || !isPromotionActive(promotion)) {
    return originalPrice;
  }
  
  switch (promotion.type) {
    case 'percentage':
      return originalPrice * (1 - promotion.value / 100);
    
    case 'fixed':
      return Math.max(0, originalPrice - promotion.value);
    
    case 'buy-x-get-y':
      // For buy X get Y, we need more complex logic
      // This is a simplified version
      return originalPrice;
    
    case 'order-discount':
      // Order discount is applied at order level, not product level
      return originalPrice;
    
    default:
      return originalPrice;
  }
};

/**
 * Calculate discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Price after discount
 * @returns {number} - Discount amount
 */
export const calculateDiscountAmount = (originalPrice, discountedPrice) => {
  return Math.max(0, originalPrice - discountedPrice);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Price after discount
 * @returns {number} - Discount percentage (0-100)
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Get promotion display text
 * @param {Object} promotion - Promotion object
 * @returns {string} - Display text for promotion
 */
export const getPromotionDisplayText = (promotion) => {
  if (!promotion) return '';
  
  switch (promotion.type) {
    case 'percentage':
      return `-${promotion.value}%`;
    
    case 'fixed':
      return `-${promotion.value.toLocaleString()}đ`;
    
    case 'buy-x-get-y':
      return 'Mua 1 tặng 1';
    
    case 'order-discount':
      return `Giảm ${promotion.value.toLocaleString()}đ`;
    
    default:
      return 'SALE';
  }
};

/**
 * Get promotion type label
 * @param {string} type - Promotion type
 * @returns {string} - Human readable type label
 */
export const getPromotionTypeLabel = (type) => {
  switch (type) {
    case 'percentage':
      return 'Giảm theo phần trăm';
    
    case 'fixed':
      return 'Giảm số tiền cố định';
    
    case 'buy-x-get-y':
      return 'Mua X tặng Y';
    
    case 'order-discount':
      return 'Giảm giá đơn hàng';
    
    default:
      return 'Khuyến mãi đặc biệt';
  }
};

/**
 * Check if promotion is expiring soon (within 3 days)
 * @param {Object} promotion - Promotion object
 * @returns {boolean} - True if expiring soon
 */
export const isPromotionExpiringSoon = (promotion) => {
  if (!promotion || !promotion.endDate) return false;
  
  const now = new Date();
  const endDate = new Date(promotion.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 3 && diffDays > 0;
};

/**
 * Format promotion period for display
 * @param {Object} promotion - Promotion object
 * @returns {string} - Formatted period string
 */
export const formatPromotionPeriod = (promotion) => {
  if (!promotion || !promotion.startDate || !promotion.endDate) return '';
  
  const startDate = new Date(promotion.startDate).toLocaleDateString('vi-VN');
  const endDate = new Date(promotion.endDate).toLocaleDateString('vi-VN');
  
  return `${startDate} - ${endDate}`;
};

/**
 * Check if product is eligible for promotion
 * @param {string} productId - Product ID
 * @param {Object} promotion - Promotion object
 * @returns {boolean} - True if product is eligible
 */
export const isProductEligibleForPromotion = (productId, promotion) => {
  if (!promotion || !isPromotionActive(promotion)) return false;
  
  // If no specific products are set, promotion applies to all products
  if (!promotion.condition?.applicableProductIds || promotion.condition.applicableProductIds.length === 0) {
    return true;
  }
  
  // Check if product is in the applicable list
  return promotion.condition.applicableProductIds.some(id => 
    typeof id === 'string' ? id === productId : id._id === productId
  );
};

/**
 * Calculate order level discount
 * @param {Array} cartItems - Array of cart items
 * @param {Object} promotion - Order level promotion
 * @returns {number} - Total discount amount for order
 */
export const calculateOrderDiscount = (cartItems, promotion) => {
  if (!promotion || promotion.type !== 'order-discount' || !isPromotionActive(promotion)) {
    return 0;
  }
  
  const orderTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Check minimum order amount
  if (promotion.condition?.minOrderAmount && orderTotal < promotion.condition.minOrderAmount) {
    return 0;
  }
  
  return Math.min(promotion.value, orderTotal);
};

/**
 * Get best promotion for a product from multiple promotions
 * @param {Array} promotions - Array of promotions
 * @param {string} productId - Product ID
 * @param {number} productPrice - Product price
 * @returns {Object|null} - Best promotion or null
 */
export const getBestPromotionForProduct = (promotions, productId, productPrice) => {
  if (!promotions || promotions.length === 0) return null;
  
  const eligiblePromotions = promotions.filter(promotion => 
    isProductEligibleForPromotion(productId, promotion)
  );
  
  if (eligiblePromotions.length === 0) return null;
  
  // Find promotion with highest discount amount
  let bestPromotion = null;
  let maxDiscount = 0;
  
  eligiblePromotions.forEach(promotion => {
    const discountedPrice = calculateDiscountedPrice(productPrice, promotion);
    const discountAmount = productPrice - discountedPrice;
    
    if (discountAmount > maxDiscount) {
      maxDiscount = discountAmount;
      bestPromotion = promotion;
    }
  });
  
  return bestPromotion;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

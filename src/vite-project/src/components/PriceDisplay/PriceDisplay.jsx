import React from 'react';
import './PriceDisplay.css';

const PriceDisplay = ({
  originalPrice,
  discountedPrice,
  hasPromotion,
  promotion,
  size = 'medium',
  showSavings = true,
  className = '',
  // Thêm prop để hiển thị giá gốc khi không có khuyến mãi
  showOriginalPrice = true
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Kiểm tra xem có nên hiển thị giá gạch ngang không
  const shouldShowStrikethrough = () => {
    if (hasPromotion) return true;
    // Hiển thị giá gạch ngang nếu có originalPrice và nó khác với discountedPrice
    return showOriginalPrice && originalPrice && discountedPrice && originalPrice > discountedPrice;
  };

  // Kiểm tra xem khuyến mãi có điều kiện không
  const hasPromotionCondition = () => {
    return hasPromotion && promotion && promotion.condition && promotion.condition.minOrderAmount > 0;
  };

  const getSavingsAmount = () => {
    if (hasPromotion) {
      return originalPrice - discountedPrice;
    }
    // Tính tiết kiệm từ originalPrice nếu không có khuyến mãi
    if (originalPrice && discountedPrice && originalPrice > discountedPrice) {
      return originalPrice - discountedPrice;
    }
    return 0;
  };

  const getSavingsPercentage = () => {
    if (hasPromotion) {
      return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
    // Tính phần trăm tiết kiệm từ originalPrice nếu không có khuyến mãi
    if (originalPrice && discountedPrice && originalPrice > discountedPrice) {
      return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
    return 0;
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'price-display-small';
      case 'large':
        return 'price-display-large';
      case 'extra-large':
        return 'price-display-extra-large';
      default:
        return 'price-display-medium';
    }
  };

  return (
    <div className={`price-display ${getSizeClass()} ${className}`}>
      <div className="price-container">
        {shouldShowStrikethrough() ? (
          <>
            {/* Giá sau giảm hoặc giá hiện tại */}
            <span className="discounted-price">
              {hasPromotionCondition() ? formatPrice(originalPrice) : formatPrice(discountedPrice)}
            </span>

            {/* Giá gốc bị gạch - chỉ hiển thị khi không có điều kiện khuyến mãi */}
            {!hasPromotionCondition() && (
              <span className="original-price">
                {formatPrice(originalPrice)}
              </span>
            )}

            {/* Hiển thị số tiền tiết kiệm - chỉ khi không có điều kiện */}
            {showSavings && getSavingsAmount() > 0 && !hasPromotionCondition() && (
              <div className="savings-info">
                <span className="savings-amount">
                  Tiết kiệm: {formatPrice(getSavingsAmount())}
                </span>
                <span className="savings-percentage">
                  ({getSavingsPercentage()}%)
                </span>
              </div>
            )}

            {/* Thông tin khuyến mãi */}
            {hasPromotion && promotion && (
              <div className="promotion-info">
                <span className="promotion-label">
                  🎉 {promotion.title}
                  {hasPromotionCondition() && (
                    <small className="promotion-condition">
                      <br />Mua từ {formatPrice(promotion.condition.minOrderAmount)} được giảm {promotion.value}%
                    </small>
                  )}
                </span>
              </div>
            )}
          </>
        ) : (
          /* Giá bình thường */
          <span className="normal-price">
            {formatPrice(discountedPrice || originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;

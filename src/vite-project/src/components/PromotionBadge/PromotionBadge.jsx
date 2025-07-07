import React from 'react';
import './PromotionBadge.css';

const PromotionBadge = ({ promotion, className = '' }) => {
  if (!promotion) return null;

  const getDiscountText = () => {
    switch (promotion.type) {
      case 'percentage':
        return `-${promotion.discountPercentage || promotion.value}%`;
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

  const getBadgeClass = () => {
    switch (promotion.type) {
      case 'percentage':
        return 'promotion-badge-percentage';
      case 'fixed':
        return 'promotion-badge-fixed';
      case 'buy-x-get-y':
        return 'promotion-badge-special';
      case 'order-discount':
        return 'promotion-badge-order';
      default:
        return 'promotion-badge-default';
    }
  };

  return (
    <div className={`promotion-badge ${getBadgeClass()} ${className}`}>
      <span className="promotion-text">{getDiscountText()}</span>
      {promotion.title && (
        <div className="promotion-tooltip">
          <div className="promotion-tooltip-content">
            <h4>{promotion.title}</h4>
            {promotion.description && <p>{promotion.description}</p>}
            {promotion.endDate && (
              <small>
                Hết hạn: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
              </small>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionBadge;

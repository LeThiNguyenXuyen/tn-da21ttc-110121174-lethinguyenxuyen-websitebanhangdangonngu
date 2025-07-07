import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import PromotionBadge from '../PromotionBadge/PromotionBadge';
import './FeaturedPromotions.css';

const FeaturedPromotions = () => {
  const { promotions } = useContext(StoreContext);
  const [featuredPromotions, setFeaturedPromotions] = useState([]);

  useEffect(() => {
    // Lấy 3 khuyến mãi nổi bật nhất (có giá trị cao nhất)
    if (promotions && promotions.length > 0) {
      const sorted = [...promotions]
        .filter(promotion => {
          const now = new Date();
          const endDate = new Date(promotion.endDate);
          return promotion.status === 'active' && endDate > now;
        })
        .sort((a, b) => {
          // Ưu tiên khuyến mãi có giá trị cao hơn
          if (a.type === 'percentage' && b.type === 'percentage') {
            return b.value - a.value;
          }
          if (a.type === 'fixed' && b.type === 'fixed') {
            return b.value - a.value;
          }
          // Ưu tiên percentage trước
          if (a.type === 'percentage') return -1;
          if (b.type === 'percentage') return 1;
          return b.value - a.value;
        })
        .slice(0, 3);
      
      setFeaturedPromotions(sorted);
    }
  }, [promotions]);

  if (!featuredPromotions || featuredPromotions.length === 0) {
    return null;
  }

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Đã hết hạn';
    if (diffDays === 1) return 'Còn 1 ngày';
    if (diffDays <= 7) return `Còn ${diffDays} ngày`;
    return `Còn ${diffDays} ngày`;
  };

  const getPromotionValue = (promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed':
        return `${promotion.value.toLocaleString()}đ`;
      case 'buy-x-get-y':
        return 'Mua 1 tặng 1';
      case 'order-discount':
        return `${promotion.value.toLocaleString()}đ`;
      default:
        return 'Ưu đãi';
    }
  };

  return (
    <div className="featured-promotions">
      <div className="featured-promotions-header">
        <h2>🎉 Khuyến Mãi Nổi Bật</h2>
        <p>Đừng bỏ lỡ những ưu đãi hấp dẫn nhất!</p>
        <Link to="/promotions" className="view-all-btn">
          Xem tất cả →
        </Link>
      </div>

      <div className="promotions-carousel">
        {featuredPromotions.map((promotion, index) => (
          <div key={promotion._id} className={`promotion-card ${index === 0 ? 'featured' : ''}`}>
            <div className="promotion-card-header">
              <PromotionBadge 
                promotion={{
                  ...promotion,
                  discountPercentage: promotion.type === 'percentage' ? promotion.value : null
                }} 
                className="large"
              />
              <div className="promotion-value">
                <span className="value-text">Giảm</span>
                <span className="value-number">{getPromotionValue(promotion)}</span>
              </div>
            </div>

            <div className="promotion-card-body">
              <h3 className="promotion-title">{promotion.title}</h3>
              <p className="promotion-description">{promotion.description}</p>
              
              <div className="promotion-meta">
                <div className="time-remaining">
                  <span className="clock-icon">⏰</span>
                  <span>{formatTimeRemaining(promotion.endDate)}</span>
                </div>
                
                {promotion.condition?.minOrderAmount > 0 && (
                  <div className="min-order">
                    <span className="cart-icon">🛒</span>
                    <span>Đơn tối thiểu: {promotion.condition.minOrderAmount.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              {promotion.condition?.applicableProductIds?.length > 0 && (
                <div className="applicable-products-preview">
                  <span className="products-label">Áp dụng cho:</span>
                  <div className="products-images">
                    {promotion.condition.applicableProductIds.slice(0, 3).map((product) => (
                      <img 
                        key={product._id}
                        src={`http://localhost:4000/uploads/${product.image}`} 
                        alt={product.name}
                        className="product-thumb"
                      />
                    ))}
                    {promotion.condition.applicableProductIds.length > 3 && (
                      <span className="more-products">+{promotion.condition.applicableProductIds.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="promotion-card-footer">
              <Link to="/promotions" className="use-now-btn">
                Sử dụng ngay
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="promotion-stats">
        <div className="stat-item">
          <span className="stat-number">{promotions.length}</span>
          <span className="stat-label">Khuyến mãi</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {promotions.filter(p => {
              const now = new Date();
              const end = new Date(p.endDate);
              const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
              return diffDays <= 7 && diffDays > 0;
            }).length}
          </span>
          <span className="stat-label">Sắp hết hạn</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {Math.max(...promotions.filter(p => p.type === 'percentage').map(p => p.value), 0)}%
          </span>
          <span className="stat-label">Giảm tối đa</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPromotions;

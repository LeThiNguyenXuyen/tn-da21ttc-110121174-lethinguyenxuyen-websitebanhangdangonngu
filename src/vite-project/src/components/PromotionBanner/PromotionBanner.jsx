import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import PromotionCountdown from '../PromotionCountdown/PromotionCountdown';
import './PromotionBanner.css';

const PromotionBanner = () => {
  const { promotions } = useContext(StoreContext);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Lấy khuyến mãi nổi bật nhất đang diễn ra
    if (promotions && promotions.length > 0) {
      const activePromotions = promotions.filter(promotion => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        return promotion.status === 'active' && startDate <= now && endDate > now;
      });

      if (activePromotions.length > 0) {
        // Ưu tiên khuyến mãi có giá trị cao nhất hoặc sắp hết hạn
        const sortedPromotions = activePromotions.sort((a, b) => {
          const aEndTime = new Date(a.endDate).getTime();
          const bEndTime = new Date(b.endDate).getTime();
          const now = new Date().getTime();
          
          // Ưu tiên khuyến mãi sắp hết hạn (trong vòng 24h)
          const aIsUrgent = (aEndTime - now) < 24 * 60 * 60 * 1000;
          const bIsUrgent = (bEndTime - now) < 24 * 60 * 60 * 1000;
          
          if (aIsUrgent && !bIsUrgent) return -1;
          if (!aIsUrgent && bIsUrgent) return 1;
          
          // Nếu cùng mức độ khẩn cấp, ưu tiên theo giá trị
          if (a.type === 'percentage' && b.type === 'percentage') {
            return b.value - a.value;
          }
          if (a.type === 'fixed' && b.type === 'fixed') {
            return b.value - a.value;
          }
          
          return 0;
        });

        setCurrentPromotion(sortedPromotions[0]);
        
        // Nếu có nhiều khuyến mãi, tự động chuyển đổi
        if (sortedPromotions.length > 1) {
          const interval = setInterval(() => {
            setCurrentIndex(prev => {
              const nextIndex = (prev + 1) % sortedPromotions.length;
              setCurrentPromotion(sortedPromotions[nextIndex]);
              return nextIndex;
            });
          }, 5000); // Chuyển đổi mỗi 5 giây

          return () => clearInterval(interval);
        }
      }
    }
  }, [promotions]);

  const handleClose = () => {
    setIsVisible(false);
    // Lưu vào localStorage để không hiển thị lại trong session này
    localStorage.setItem('promotionBannerClosed', 'true');
  };

  const handlePromotionExpire = () => {
    // Khi khuyến mãi hết hạn, ẩn banner
    setIsVisible(false);
  };

  // Kiểm tra xem user đã đóng banner chưa
  useEffect(() => {
    const isClosed = localStorage.getItem('promotionBannerClosed');
    if (isClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || !currentPromotion) {
    return null;
  }

  const getPromotionText = () => {
    switch (currentPromotion.type) {
      case 'percentage':
        return `🎉 GIẢM ${currentPromotion.value}% - ${currentPromotion.title}`;
      case 'fixed':
        return `🎉 GIẢM ${currentPromotion.value.toLocaleString()}Đ - ${currentPromotion.title}`;
      case 'buy-x-get-y':
        return `🎁 MUA 1 TẶNG 1 - ${currentPromotion.title}`;
      case 'order-discount':
        return `💰 GIẢM ${currentPromotion.value.toLocaleString()}Đ CHO ĐƠN HÀNG - ${currentPromotion.title}`;
      default:
        return `🎉 ${currentPromotion.title}`;
    }
  };

  const isUrgent = () => {
    const now = new Date();
    const endDate = new Date(currentPromotion.endDate);
    const diffHours = (endDate - now) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div className={`promotion-banner ${isUrgent() ? 'urgent' : ''}`}>
      <div className="banner-content">
        <div className="promotion-text">
          <span className="promotion-main-text">{getPromotionText()}</span>
          {currentPromotion.condition?.minOrderAmount > 0 && (
            <span className="promotion-condition">
              (Đơn tối thiểu {currentPromotion.condition.minOrderAmount.toLocaleString()}đ)
            </span>
          )}
        </div>

        <div className="banner-actions">
          <PromotionCountdown 
            endDate={currentPromotion.endDate}
            onExpire={handlePromotionExpire}
            size="small"
            showLabels={false}
          />
          
          <Link to="/promotions" className="shop-now-btn">
            Mua ngay
          </Link>
        </div>

        <button className="close-btn" onClick={handleClose} title="Đóng">
          ✕
        </button>
      </div>

      {/* Indicator dots nếu có nhiều khuyến mãi */}
      {promotions.filter(p => {
        const now = new Date();
        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);
        return p.status === 'active' && startDate <= now && endDate > now;
      }).length > 1 && (
        <div className="banner-indicators">
          {promotions.filter(p => {
            const now = new Date();
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            return p.status === 'active' && startDate <= now && endDate > now;
          }).map((_, index) => (
            <div 
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                setCurrentPromotion(promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  const endDate = new Date(p.endDate);
                  return p.status === 'active' && startDate <= now && endDate > now;
                })[index]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionBanner;

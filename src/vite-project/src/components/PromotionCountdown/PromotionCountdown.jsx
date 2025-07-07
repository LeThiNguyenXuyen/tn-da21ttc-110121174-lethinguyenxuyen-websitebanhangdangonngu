import React, { useState, useEffect } from 'react';
import './PromotionCountdown.css';

const PromotionCountdown = ({ endDate, onExpire, size = 'medium', showLabels = true }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Set up interval to update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'countdown-small';
      case 'large':
        return 'countdown-large';
      default:
        return 'countdown-medium';
    }
  };

  if (isExpired) {
    return (
      <div className={`promotion-countdown expired ${getSizeClass()}`}>
        <div className="expired-message">
          <span className="expired-icon">⏰</span>
          <span className="expired-text">Đã hết hạn</span>
        </div>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;
  const isCritical = timeLeft.days === 0 && timeLeft.hours < 6;

  return (
    <div className={`promotion-countdown ${getSizeClass()} ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
      {showLabels && (
        <div className="countdown-header">
          <span className="countdown-title">⏰ Thời gian còn lại</span>
        </div>
      )}
      
      <div className="countdown-display">
        {timeLeft.days > 0 && (
          <div className="time-unit">
            <span className="time-number">{formatNumber(timeLeft.days)}</span>
            {showLabels && <span className="time-label">Ngày</span>}
          </div>
        )}
        
        <div className="time-unit">
          <span className="time-number">{formatNumber(timeLeft.hours)}</span>
          {showLabels && <span className="time-label">Giờ</span>}
        </div>
        
        <div className="time-separator">:</div>
        
        <div className="time-unit">
          <span className="time-number">{formatNumber(timeLeft.minutes)}</span>
          {showLabels && <span className="time-label">Phút</span>}
        </div>
        
        <div className="time-separator">:</div>
        
        <div className="time-unit">
          <span className="time-number">{formatNumber(timeLeft.seconds)}</span>
          {showLabels && <span className="time-label">Giây</span>}
        </div>
      </div>
      
      {isUrgent && !isCritical && (
        <div className="urgency-message">
          🔥 Sắp hết hạn!
        </div>
      )}
      
      {isCritical && (
        <div className="urgency-message critical">
          ⚡ Chỉ còn vài giờ!
        </div>
      )}
    </div>
  );
};

export default PromotionCountdown;

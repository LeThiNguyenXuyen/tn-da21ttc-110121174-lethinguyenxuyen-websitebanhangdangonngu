import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PromotionBadge from '../../components/PromotionBadge/PromotionBadge';
import './PromotionList.css';
import { useTranslation } from 'react-i18next';

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/promotions/active');
      if (response.data.success) {
        setPromotions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(t('promotionList.error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getPromotionTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return t('promotionList.type.percentage');
      case 'fixed':
        return t('promotionList.type.fixed');
      case 'buy-x-get-y':
        return t('promotionList.type.buy-x-get-y');
      case 'order-discount':
        return t('promotionList.type.order-discount');
      default:
        return t('promotionList.type.special');
    }
  };

  const getDiscountText = (promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return t('promotionList.discount.percentage', { value: promotion.value });
      case 'fixed':
        return t('promotionList.discount.fixed', { value: promotion.value.toLocaleString() });
      case 'buy-x-get-y':
        return t('promotionList.discount.buyxgety');
      case 'order-discount':
        return t('promotionList.discount.order', { value: promotion.value.toLocaleString() });
      default:
        return t('promotionList.discount.special');
    }
  };

  const isPromotionExpiringSoon = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  if (loading) {
    return (
      <div className="promotion-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('promotionList.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="promotion-list-container">
        <div className="error-message">
          <h3>{t('promotionList.errorTitle')}</h3>
          <p>{error}</p>
          <button onClick={fetchActivePromotions} className="retry-btn">
            {t('promotionList.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="promotion-list-container">
      <div className="promotion-list-header">
        <h1>{t('promotionList.header')}</h1>
        <p>{t('promotionList.subheader')}</p>
      </div>

      {promotions.length === 0 ? (
        <div className="no-promotions">
          <div className="no-promotions-icon">🎁</div>
          <h3>{t('promotionList.emptyTitle')}</h3>
          <p>{t('promotionList.emptyDesc')}</p>
          <Link to="/" className="back-to-home-btn">
            {t('promotionList.backToHome')}
          </Link>
        </div>
      ) : (
        <div className="promotions-grid">
          {promotions.map((promotion) => (
            <div key={promotion._id} className="promotion-card">
              {isPromotionExpiringSoon(promotion.endDate) && (
                <div className="expiring-soon-badge">
                  {t('promotionList.expiringSoon')}
                </div>
              )}

              <div className="promotion-card-header">
                <PromotionBadge
                  promotion={{
                    ...promotion,
                    discountPercentage: promotion.type === 'percentage' ? promotion.value : null
                  }}
                  className="list-item"
                />
                <h3 className="promotion-title">{promotion.title}</h3>
              </div>

              <div className="promotion-card-body">
                <p className="promotion-description">{promotion.description}</p>
                <div className="promotion-details">
                  <div className="promotion-detail-item">
                    <span className="detail-label">{t('promotionList.type.special')}:</span>
                    <span className="detail-value">{getPromotionTypeText(promotion.type)}</span>
                  </div>
                  <div className="promotion-detail-item">
                    <span className="detail-label">{t('promotionList.discount.special')}:</span>
                    <span className="detail-value discount-highlight">
                      {getDiscountText(promotion)}
                    </span>
                  </div>
                  {promotion.condition?.minOrderAmount > 0 && (
                    <div className="promotion-detail-item">
                      <span className="detail-label">{t('promotionList.minOrder')}</span>
                      <span className="detail-value">
                        {promotion.condition.minOrderAmount.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="promotion-period">
                  <div className="period-item">
                    <span className="period-label">{t('promotionList.from')}</span>
                    <span className="period-date">{formatDate(promotion.startDate)}</span>
                  </div>
                  <div className="period-item">
                    <span className="period-label">{t('promotionList.to')}</span>
                    <span className="period-date">{formatDate(promotion.endDate)}</span>
                  </div>
                </div>

                {promotion.condition?.applicableProductIds?.length > 0 && (
                  <div className="applicable-products">
                    <h4>{t('promotionList.applicable')}</h4>
                    <div className="product-list">
                      {promotion.condition.applicableProductIds.slice(0, 3).map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="product-link"
                        >
                          <img src={`http://localhost:4000/uploads/${product.image}`} alt={product.name} />
                         <span>{t(product.name)}</span>
                        </Link>
                      ))}
                      {promotion.condition.applicableProductIds.length > 3 && (
                        <span className="more-products">
                          {t('promotionList.more', {
                            count: promotion.condition.applicableProductIds.length - 3
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="promotion-card-footer">
                <Link to="/" className="shop-now-btn">
                  {t('promotionList.shopNow')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionList;

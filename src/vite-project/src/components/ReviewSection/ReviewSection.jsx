// src/components/ReviewSection/ReviewSection.jsx
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/review/product/${productId}`
      );
      if (data.success) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  const renderStars = (rating, size = 'normal') => {
    const full = Math.floor(rating), half = rating % 1 !== 0;
    return Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1;
      if (idx <= full) return <span key={idx} className={`star filled ${size}`}>⭐</span>;
      if (idx === full + 1 && half) return <span key={idx} className={`star half ${size}`}>⭐</span>;
      return <span key={idx} className={`star empty ${size}`}>☆</span>;
    });
  };

  const distribution = reviews.reduce(
    (acc, r) => (acc[r.rating]++, acc),
    { 5:0,4:0,3:0,2:0,1:0 }
  );

  if (loading) {
    return (
      <div className="review-section">
        <div className="review-loading">
          <div className="spinner"></div>
          <p>{t('review.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <h3>{t('review.title')}</h3>

      {totalReviews === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">💬</div>
          <h4>{t('review.none')}</h4>
          <p>{t('review.first')}</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="rating-summary">
            <div className="average-rating">
              <div className="rating-number">{averageRating}</div>
              <div className="rating-stars">{renderStars(averageRating, 'large')}</div>
              <div className="rating-text">
                {totalReviews} {t('review.count')}
              </div>
            </div>
            <div className="rating-distribution">
              {[5,4,3,2,1].map(star => {
                const count = distribution[star];
                const pct = totalReviews ? (count/totalReviews)*100 : 0;
                return (
                  <div key={star} className="rating-bar">
                    <span className="star-label">{star} ⭐</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width:`${pct}%`}}/>
                    </div>
                    <span className="count-label">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="reviews-list">
            <h4>{t('review.customers')}</h4>
            {(showAll ? reviews : reviews.slice(0,3)).map((r,i) => (
              <div key={i} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {r.userId.slice(0,2).toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name">
                        {r.userDisplayName || `${t('review.customer')} ${r.userId.slice(-4)}`}
                      </div>
                      <div className="review-date">{formatDate(r.date)}</div>
                    </div>
                  </div>
                  <div className="review-rating">{renderStars(r.rating, 'small')}</div>
                </div>
                {r.comment && (
                  <div className="review-comment">
                    <p>"{r.comment}"</p>
                    {r.adminReply && (
                      <div className="admin-reply">
                        <strong>{t('review.reply')}:</strong>
                        <p>{r.adminReply}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="review-footer">
                  <span className="verified-purchase">✅ {t('review.verified')}</span>
                </div>
              </div>
            ))}

            {reviews.length > 3 && (
              <div className="show-more-container">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="show-more-btn"
                >
                  {showAll
                    ? t('review.showLess')
                    : t('review.showMore', { count: reviews.length - 3 })
                  }
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSection;

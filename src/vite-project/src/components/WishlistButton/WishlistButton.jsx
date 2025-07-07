import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import './WishlistButton.css';

const WishlistButton = ({ productId, className = '' }) => {
  const { t } = useTranslation();
t('wishlist');                       // "Yêu thích"
t('wishlistPage.header.title');
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await axios.get(
        `http://localhost:4000/api/wishlist/check/${productId}`,
        { headers: { token } }
      );
      if (data.success) setInWishlist(data.inWishlist);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('wishlist.loginRequired'));
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        const { data } = await axios.delete(
          `http://localhost:4000/api/wishlist/remove/${productId}`,
          { headers: { token } }
        );
        if (data.success) {
          setInWishlist(false);
          toast.success(t('wishlist.removeSuccess'));
        } else {
          toast.error(data.message || t('wishlist.error'));
        }
      } else {
        const { data } = await axios.post(
          'http://localhost:4000/api/wishlist/add',
          { productId },
          { headers: { token } }
        );
        if (data.success) {
          setInWishlist(true);
          toast.success(t('wishlist.addSuccess'));
        } else {
          toast.error(data.message || t('wishlist.error'));
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error(t('wishlist.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`wishlist-button ${inWishlist ? 'in-wishlist' : ''} ${className}`}
      title={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
    >
      <span className="heart-icon">{inWishlist ? '❤️' : '🤍'}</span>
      <span className="button-text">
        {inWishlist ? t('wishlist.added') : t('wishlist.add')}
      </span>
    </button>
  );
};

export default WishlistButton;

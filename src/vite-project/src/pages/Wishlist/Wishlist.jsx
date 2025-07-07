import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';


const Wishlist = () => {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('wishlist.loginRequired'));
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/wishlist/user', {
        headers: { token }
      });

      if (response.data.success) {
        setWishlist(response.data.wishlist);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:4000/api/wishlist/remove/${productId}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Đã xóa khỏi yêu thích', {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true
        });
        setWishlist(wishlist.filter(item => item.productId !== productId));
      } else {
        toast.error(response.data.message || 'Không thể xóa sản phẩm', {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true
      });
    }
  };

  const handleAddToCart = async (product, size) => {
    console.log('▷ Wishlist → addToCart:', product, size);
    try {
      await addToCart(product, size, 1);
      toast.success(t('wishlist.addToCartSuccess'), {
        autoClose: 2000, hideProgressBar: false, closeOnClick: true
      });
    } catch (err) {
      console.error('❌ handleAddToCart error:', err);
      toast.error(t('wishlist.addToCartError') || 'Thêm vào giỏ thất bại', {
        autoClose: 2000
      });
    }
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className="wishlist">
      <div className="wishlist-header">
        <h2>{t('wishlistPage.header.title')}</h2>
        <p>{t('wishlistPage.header.subtitle')}</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💝</div>
          <h3>{t('wishlistPage.empty.title')}</h3>
          <p>{t('wishlistPage.empty.description')}</p>
          <button
            className="shop-now-btn"
            onClick={() => navigate('/')}
          >
            {t('wishlistPage.empty.shopNowBtn')}
          </button>
        </div>
      ) : (
        <>
          <div className="wishlist-stats">
            <span>{t('wishlistPage.stats', { count: wishlist.length })}</span>
          </div>

          <div className="wishlist-grid">
            {wishlist.map((item) => {
              console.log('🔥 WISHLIST ITEM:', item);
              const product = { ...item.product, _id: item.productId };
              console.log('🔥 PRODUCT.SIZES:', product.sizes);

              // Xử lý URL hình ảnh
              let imageUrl = '/placeholder-image.svg';
              if (product.image) {
                if (product.image.startsWith('http')) {
                  imageUrl = product.image;
                } else {
                  let imagePath = product.image;
                  if (imagePath.startsWith('uploads/')) {
                    imagePath = imagePath.substring(8);
                  }
                  if (imagePath.startsWith('/')) {
                    imagePath = imagePath.substring(1);
                  }
                  imageUrl = `http://localhost:4000/uploads/${imagePath}`;
                }
              }

              return (
                <div key={item._id} className="wishlist-item">
                  <div className="item-image-container">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="item-image"
                      onClick={() => navigate(`/product/${product._id}`)}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.svg';
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                      loading="lazy"
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="remove-btn"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      ❌
                    </button>
                  </div>

                  <div className="item-info">
                    <h3
                      className="item-name"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>

                    <div className="item-price">
                      {formatPrice(product.price)}
                    </div>

                    {/* Hiển thị số lượng tồn kho */}
                    <div className="item-stock">
                      {product.stockQuantity > 0
                        ? t('wishlistPage.item.inStock', { count: product.stockQuantity })
                        : t('wishlistPage.item.outOfStock')}
                    </div>

                    <div className="item-meta">
                      <span className="added-date">
                        {t('wishlistPage.item.addedDate', { date: formatDate(item.addedAt) })}
                      </span>
                    </div>

                    <div className="item-actions">
                      {/* Nếu hết hàng */}
                      {product.stockQuantity <= 0 ? (
                        <button
                          className="add-to-cart-btn disabled"
                          onClick={() => toast.error(t('wishlistPage.item.outOfStock'), { autoClose: 2000 })}
                        >
                          {t('wishlistPage.item.addToCartBtn')}
                        </button>
                      ) : (
                        <>
                          {/* Dropdown chọn size */}
                          <select
                            value={selectedSizes[item._id] || ''}
                            onChange={e =>
                              setSelectedSizes(prev => ({
                                ...prev,
                                [item._id]: e.target.value
                              }))
                            }
                          >
                            <option value="" disabled>{t('wishlistPage.item.selectSize')}</option>
                            {(product.sizes || []).map(sz => (
                              <option key={sz} value={sz}>{sz}</option>
                            ))}
                          </select>

                          {/* Nút thêm vào giỏ */}
                          <button
                            className="add-to-cart-btn"
                            disabled={!selectedSizes[item._id]}
                            onClick={() => {
                              handleAddToCart(product, selectedSizes[item._id]);
                              toast.success(t('wishlistPage.actions.addedAllToast', { count: 1 }), { autoClose: 2000 });
                            }}
                          >
                            {t('wishlistPage.item.addToCartBtn')}
                          </button>
                        </>
                      )}

                      {/* Nút xem chi tiết */}
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="view-detail-btn"
                      >
                        {t('wishlistPage.item.viewDetailBtn')}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>


        </>
      )}
    </div>
  );
};

export default Wishlist;

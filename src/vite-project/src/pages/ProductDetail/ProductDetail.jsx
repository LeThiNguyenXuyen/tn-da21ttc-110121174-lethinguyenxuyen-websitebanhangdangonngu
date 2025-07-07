import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import PromotionBadge from '../../components/PromotionBadge/PromotionBadge';
import PriceDisplay from '../../components/PriceDisplay/PriceDisplay';
import ReviewSection from '../../components/ReviewSection/ReviewSection';
import WishlistButton from '../../components/WishlistButton/WishlistButton';
import { useTranslation } from 'react-i18next';
import { useProductTranslation } from '../../utils/translationHelpers';


const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { translateProductName, translateCategory } = useProductTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { Product_list } = useContext(StoreContext);
  const { addToCart } = useCart();


  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isOutOfStock, setIsOutOfStock] = useState(false); // Trạng thái hết hàng
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);

    // 1. Lấy product chính
    let productData = null;
    try {
      const response = await axios.get(`http://localhost:4000/api/product/${id}`);
      productData = response.data.success
        ? response.data.data
        : Product_list.find(item => item._id === id);
      if (!productData) {
        console.warn('Product not found in API, fallback to context list');
      }
    } catch (err) {
      console.error('❌ Failed to fetch product:', err);
      productData = Product_list.find(item => item._id === id);
    }

    // Nếu không tìm được product, dừng sớm
    if (!productData) {
      setProduct(null);
      setLoading(false);
      return;
    }

    // 2. Kiểm tra tồn kho qua cart
    try {
      const cartResponse = await axios.get('http://localhost:4000/api/cart/get');
      const cartData = cartResponse.data?.data || [];
      const cartProduct = cartData.find(item => item._id === productData._id);
      if (cartProduct && cartProduct.quantity >= productData.quantity) {
        setIsOutOfStock(true);
      }
    } catch (cartErr) {
      console.warn('⚠️ Cart fetch failed, skipping stock check:', cartErr);
    }

    // 3. Lấy khuyến mãi
    try {
      const promoListResponse = await axios.get('http://localhost:4000/api/promotions/admin/all');
      const promotions = promoListResponse.data?.data || [];
      const applicablePromotion = promotions.find(promo =>
        promo.status === 'active' &&
        new Date(promo.startDate) <= new Date() &&
        new Date(promo.endDate) >= new Date() &&
        promo.condition?.applicableProductIds?.some(p => {
          const pid = typeof p === 'object' ? p._id : p;
          return pid === productData._id;
        })
      );
      if (applicablePromotion) {
        let discountedPrice = productData.price;
        if (applicablePromotion.type === 'percentage') {
          discountedPrice = productData.price - (productData.price * applicablePromotion.value / 100);
        } else if (applicablePromotion.type === 'fixed') {
          discountedPrice = Math.max(0, productData.price - applicablePromotion.value);
        }
        productData.hasPromotion = true;
        productData.promotion = applicablePromotion;
        productData.discountedPrice = Math.round(discountedPrice);
        productData.discountPercentage = Math.round(
          ((productData.price - discountedPrice) / productData.price) * 100
        );
      }
    } catch (promoErr) {
      console.warn('⚠️ Promotion fetch failed, skipping promotions:', promoErr);
    }

    // 4. Cập nhật state
    setProduct(productData);
    setSelectedSize(productData.sizes?.[0] || '');
    setIsOutOfStock(productData.quantity === 0);
    setLoading(false);
  };


  if (!product) return <div>{t('productNotFound')} {id}</div>;
  if (product.visible === false) {
    return (
      <div className="product-hidden-warning">
        <h2 style={{ color: 'gray', textAlign: 'center', marginTop: '50px' }}>
          {t('productUnavailable') || 'Sản phẩm hiện không khả dụng.'}
        </h2>
      </div>
    );
  }


  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-container">

        <div className="product-detail-left">
          <img
            src={`http://localhost:4000/uploads/${product.image}`}
            alt={translateProductName(product.name)}
            className="main-image"
          />
          <div className="thumbnail-list">
            <img
              src={`http://localhost:4000/uploads/${product.image}`}
              alt="thumb1"
              className="thumb active"
            />
          </div>
        </div>

        <div className="product-detail-center">
          <h2 className="product-title">{translateProductName(product.name)}</h2>
          {/* Mô tả sản phẩm */}
          <div className="product-description">
            <p>
              {product.description
                ? (
                  i18n.language === 'en'
                    ? t(product.description)
                    : product.description
                )
                : t('updating')}
            </p>
          </div>


          {product.hasPromotion && product.promotion && (
            <div className="promotion-section">
              <PromotionBadge
                promotion={product.promotion}
                className="large"
              />
              <div className="promotion-details">
                <h4>🎉 {product.promotion.title}</h4>
                <p>{product.promotion.description}</p>
                {product.promotion.endDate && (
                  <small>
                    Có hiệu lực đến: {new Date(product.promotion.endDate).toLocaleDateString('vi-VN')}
                  </small>
                )}
              </div>
            </div>
          )}

          {product.hasPromotion && product.discountedPrice ? (
            <div className="price-promo">
              {isOutOfStock && (
                <div className="out-of-stock-label">
                  <strong style={{ color: 'red' }}>{t('outOfStock') || 'Hết hàng'}</strong>
                </div>
              )}

              <span className="original-price">
                {Number(product.price).toLocaleString()} đ
              </span>
              <span className="discounted-price">
                {Number(product.discountedPrice).toLocaleString()} đ
              </span>
              <span className="discount-badge">
                -{product.discountPercentage || Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
              </span>

            </div>
          ) : (
            <div className="price-only">
              <span>{Number(product.price).toLocaleString()} đ</span>
            </div>
          )}




          <div className="size-selector">
            <p>{t('capacity')}</p>
            <div className="size-options">
              {product.sizes?.map((size, index) => (
                <button
                  key={index}
                  className={selectedSize === size ? 'active' : ''}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-selector">
            <p>{t('quantity')}:</p>
            <small style={{ color: '#888' }}>
              {t('stockLeft') || 'Còn lại'}: {product.quantity}
            </small>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
              disabled={quantity >= product.quantity}
            >
              +
            </button>

          </div>


          <div className="action-buttons">
            <button
              className="add-cart"
              disabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) {
                  toast.warning(t('outOfStock') || 'Sản phẩm đã hết hàng!');
                  return;
                }

                const productWithPromotion = {
                  ...product,
                  hasPromotion: product.hasPromotion || false,
                  promotion: product.promotion || null,
                  discountedPrice: product.discountedPrice || product.price,
                  productQuantity: product.quantity
                };

                addToCart(productWithPromotion, selectedSize, quantity);

                const message = product.hasPromotion
                  ? `🎉 ${t('addedToCart')} (${t('promotion')})`
                  : `🛒 ${t('addedToCart')}`;

                toast.success(message, {
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true
                });

                navigate('/cart');
              }}
            >
              {product.hasPromotion
                ? `🎉 ${t('addToCart')} (${t('hasPromotion')})`
                : t('addToCart')}
            </button>

            <WishlistButton productId={product._id} className="large">
              {t('wishlistButton')}
            </WishlistButton>
          </div>

          <div className="hotline">
            {t('hotlineConsult')} <span>0941 41 7777</span> {t('businessHours')}
          </div>
        </div>

        <div className="product-detail-right">
          <h3>{t('productInfo')}</h3>
          <ul>
            <li><strong>{t('brand')}:</strong> {product.brand || t('updating')}</li>
            <li><strong>{t('concentration')}:</strong> Eau De Parfum</li>
            <li><strong>{t('longevity')}:</strong> 4–6H</li>
            <li><strong>{t('sillage')}:</strong> {t('moderate')}</li>
            <li><strong>{t('gender')}:</strong> {translateCategory(product.category)}</li>
          </ul>
        </div>
      </div>

      <ReviewSection productId={product._id} />
    </div>
  );
};

export default ProductDetail;

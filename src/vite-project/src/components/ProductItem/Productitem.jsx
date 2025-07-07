import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Productitem.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import PromotionBadge from '../PromotionBadge/PromotionBadge';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import WishlistButton from '../WishlistButton/WishlistButton';
import { useProductTranslation } from '../../utils/translationHelpers';
import { toast } from "react-toastify";

const Productitem = ({
  _id,
  name,
  originalPrice,
  price,
  importPrice,
  description,
  image,
  sizes = [],
  brand,
  // Thêm props cho khuyến mãi
  promotion,
  discountedPrice,
  hasPromotion,
  quantity // Nhận giá trị quantity từ props
}) => {
  const { t, i18n } = useTranslation();
  const { translateProductName, translateProductDescription } = useProductTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');

  const discountPercentage =
    importPrice && price < importPrice
      ? Math.round(((importPrice - price) / importPrice) * 100)
      : 0;

  const handleAddToCart = (e) => {
    console.log('🛒 Add to cart clicked!', name);
    e.preventDefault(); // Ngăn không cho Link navigate
    e.stopPropagation();

    // Tạo object product với đầy đủ thông tin khuyến mãi
    const productWithPromotion = {
      _id,
      name,
      originalPrice,
      price,
      importPrice,
      description,
      image,
      sizes,
      brand,
      hasPromotion: hasPromotion || false,
      promotion: promotion || null,
      discountedPrice: discountedPrice || price
    };

    addToCart(productWithPromotion, selectedSize, 1);

    const message = hasPromotion
      ? `🎉 ${t('addedToCart')} (${i18n.language === 'vi' ? 'KM' : 'PROMO'})`
      : `🛒 ${t('addedToCart')}`;

    toast.success(message, {
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true
    });

    // Chuyển đến trang giỏ hàng sau khi thêm thành công
    setTimeout(() => {
      navigate('/cart');
    }, 500); // Delay nhỏ để user thấy toast notification
  };

  // Kiểm tra số lượng sản phẩm còn lại và hiển thị thông báo "Hết hàng" nếu hết
  const isOutOfStock = quantity <= 0;

  return (
   <div className={`product-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
  {/* Hiển thị badge khuyến mãi hoặc sale cũ */}
  {hasPromotion && promotion ? (
    <PromotionBadge promotion={promotion} />
  ) : (
    importPrice && price < importPrice && (
      <div className="discount-badge">SALE</div>
    )
  )}

  <div className="food-item-img-container">
    <Link to={`/product/${_id}`}>
      <img
        className='Product-item-image'
        src={`http://localhost:4000/uploads/${image}`}
        alt={name}
      />
    </Link>
  </div>

  {/* Hiển thị thông báo "Hết hàng" nếu không còn sản phẩm */}
  {isOutOfStock && <div className="out-of-stock-badge">{t('outOfStock')}</div>}

  <div className="product-item-info">
    <h4 className="product-item-brand">{brand}</h4>
    <h3 className="product-item-name">{translateProductName(name)}</h3>
    <p className='product-item-desc'>
      {translateProductDescription(description)}
    </p>

    {/* Dung tích (size) */}
    <div className="product-item-sizes">
      {sizes.map((size, i) => (
        <button
          key={i}
          className={`product-size-btn ${selectedSize === size ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedSize(size);
          }}
          disabled={isOutOfStock} // Nếu hết hàng, không cho chọn size
        >
          {size}
        </button>
      ))}
    </div>

    {/* Hiển thị giá và khuyến mãi */}
    <PriceDisplay
      originalPrice={originalPrice || price}
      discountedPrice={hasPromotion ? discountedPrice : price}
      hasPromotion={hasPromotion}
      promotion={promotion}
      size="small"
      showSavings={false}
      showOriginalPrice={false}
      className="product-card"
    />

    {/* Các nút hành động */}
    <div className="product-item-actions" style={{ position: 'relative', zIndex: 20 }}>
      {!isOutOfStock && ( // Không hiển thị nút giỏ hàng nếu hết hàng
        <button
          className="add-to-cart-btn compact"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart(e);
          }}
          title={t('addToCart')}
        >
          🛒
        </button>
      )}

      <WishlistButton
        productId={_id}
        className="small wishlist-btn-item"
        disabled={isOutOfStock} // Disable nếu hết hàng
      />
    </div>
  </div>
</div>

  );
};

export default Productitem;

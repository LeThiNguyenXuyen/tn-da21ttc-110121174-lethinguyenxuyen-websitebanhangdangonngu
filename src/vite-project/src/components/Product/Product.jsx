import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Product.css';
import { StoreContext } from '../../context/StoreContext';
import Productitem from '../ProductItem/Productitem';

const Product = () => {
  const { t, i18n } = useTranslation();
  const { Product_list } = useContext(StoreContext);

  const [genderFilter, setGenderFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');

  const filterByGender = (item) => {
    if (genderFilter === 'All') return true;
    // Map frontend filter to database category
    if (genderFilter === 'Nam') return item.category === 'Nước hoa nam';
    if (genderFilter === 'Nữ') return item.category === 'Nước hoa nữ';
    return item.category === genderFilter;
  };

  const filterByPrice = (item) => {
    if (priceFilter === 'All') return true;
    if (priceFilter === 'under2') return item.price < 2000000;
    if (priceFilter === '2to4') return item.price >= 2000000 && item.price <= 4000000;
    if (priceFilter === 'above4') return item.price > 4000000;
    return true;
  };

  const filterByBrand = (item) => {
    if (brandFilter === 'All') return true;
    return item.brand === brandFilter;
  };

  // Lấy danh sách thương hiệu duy nhất từ Product_list
  const brands = [...new Set(Product_list.map(item => item.brand))].filter(Boolean).sort();

  const filteredProducts = Product_list.filter(item =>
    filterByGender(item) && filterByPrice(item) && filterByBrand(item)
  );

  // Hàm reset tất cả bộ lọc
  const resetFilters = () => {
    setGenderFilter('All');
    setPriceFilter('All');
    setBrandFilter('All');
  };

  // Kiểm tra có bộ lọc nào đang active không
  const hasActiveFilters = genderFilter !== 'All' || priceFilter !== 'All' || brandFilter !== 'All';

  // Tách sản phẩm thành 2 nhóm: có khuyến mãi và không khuyến mãi
  const promotionalProducts = filteredProducts.filter(item => item.hasPromotion);
  const regularProducts = filteredProducts.filter(item => !item.hasPromotion);

  return (
    <div className="product" id="product">
      {/* Lọc theo giới tính, giá và thương hiệu */}
      <div className="filter-bar">
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="All">{t("menPerfume")} / {t("womenPerfume")}</option>
          <option value="Nam">{t("menPerfume")}</option>
          <option value="Nữ">{t("womenPerfume")}</option>
        </select>

        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="All">
            {t('allBrands')}
          </option>
          {brands.map((brand, index) => (
            <option key={index} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <button
          className={priceFilter === 'under2' ? 'active' : ''}
          onClick={() => setPriceFilter('under2')}
        >
          {i18n.language === 'vi' ? 'DƯỚI 2 TRIỆU' : 'UNDER 2M'}
        </button>
        <button
          className={priceFilter === '2to4' ? 'active' : ''}
          onClick={() => setPriceFilter('2to4')}
        >
          {i18n.language === 'vi' ? '2 - 4 TRIỆU' : '2 - 4M'}
        </button>
        <button
          className={priceFilter === 'above4' ? 'active' : ''}
          onClick={() => setPriceFilter('above4')}
        >
          {i18n.language === 'vi' ? 'TRÊN 4 TRIỆU' : 'ABOVE 4M'}
        </button>
        <button
          className={priceFilter === 'All' ? 'active' : ''}
          onClick={() => setPriceFilter('All')}
        >
          {i18n.language === 'vi' ? 'TẤT CẢ' : 'ALL'}
        </button>

        {hasActiveFilters && (
          <button
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            🔄 {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Hiển thị số lượng sản phẩm */}
      <div className="products-count">
        <p>
          {t('showingProducts', { count: filteredProducts.length })}
          {hasActiveFilters && (
            <span className="filter-info">
              {' '}{t('filtered')}
            </span>
          )}
        </p>
      </div>

      {/* Phần sản phẩm khuyến mãi */}
      {promotionalProducts.length > 0 && (
        <div className="product-section promotional-section">
          <div className="section-header simple">
            <h2 className="section-title gold-title">
              ✨ {i18n.language === 'vi' ? 'SẢN PHẨM KHUYẾN MÃI' : 'PROMOTIONAL PRODUCTS'} ✨
            </h2>
            <p className="section-subtitle">
              {i18n.language === 'vi' ? 'Giảm giá đặc biệt - Số lượng có hạn!' : 'Special discount - Limited quantity!'}
            </p>
          </div>
          <div className="product-list">
            {promotionalProducts.map((item, index) => (
              <Productitem key={`promo-${index}`} {...item} />
            ))}
          </div>
        </div>
      )}

      {/* Phần sản phẩm Nam */}
      {regularProducts.filter(item => item.category === 'Nước hoa nam').length > 0 && (
        <div className="product-section regular-section">
          <div className="section-header simple">
            <h2 className="section-title">{t("menPerfume")}</h2>
          </div>
          <div className="product-list">
            {regularProducts
              .filter(item => item.category === 'Nước hoa nam')
              .map((item, index) => (
                <Productitem key={`male-${index}`} {...item} />
              ))}
          </div>
        </div>
      )}

      {/* Phần sản phẩm Nữ */}
      {regularProducts.filter(item => item.category === 'Nước hoa nữ').length > 0 && (
        <div className="product-section regular-section">
          <div className="section-header simple">
            <h2 className="section-title">{t("womenPerfume")}</h2>
          </div>
          <div className="product-list">
            {regularProducts
              .filter(item => item.category === 'Nước hoa nữ')
              .map((item, index) => (
                <Productitem key={`female-${index}`} {...item} />
              ))}
          </div>
        </div>
      )}

      {/* Hiển thị thông báo nếu không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>
            {i18n.language === 'vi'
              ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.'
              : 'No products found matching current filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Product;

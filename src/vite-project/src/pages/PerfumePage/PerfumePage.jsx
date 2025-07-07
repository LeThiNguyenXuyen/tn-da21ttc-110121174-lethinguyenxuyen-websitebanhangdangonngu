// PerfumePage.jsx
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import Productitem from '../../components/ProductItem/Productitem';
import './PerfumePage.css';

const PerfumePage = () => {
  const { gender } = useParams(); // 'Nam' hoặc 'Nữ'
  const { Product_list } = useContext(StoreContext);

  // Map URL param to database category
  const getCategoryFromGender = (gender) => {
    if (gender === 'Nam') return 'Nước hoa nam';
    if (gender === 'Nữ') return 'Nước hoa nữ';
    return gender;
  };

  const targetCategory = getCategoryFromGender(gender);
  const filteredProducts = Product_list.filter(p => p.category === targetCategory);

  console.log('🔍 PerfumePage Debug:', {
    gender,
    targetCategory,
    totalProducts: Product_list.length,
    filteredCount: filteredProducts.length,
    categories: [...new Set(Product_list.map(p => p.category))]
  });

  return (
    <div className="perfume-page">
      <h2>Nước hoa {gender}</h2>
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item, i) => (
            <Productitem key={i} {...item} />
          ))
        ) : (
          <div className="no-products">
            <p>Không tìm thấy sản phẩm nào cho danh mục này.</p>
            <p>Danh mục đang tìm: {targetCategory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfumePage;

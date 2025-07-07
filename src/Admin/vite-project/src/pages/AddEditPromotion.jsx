import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddEditPromotion.css';

const AddEditPromotion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'percentage',
    value: '',
    condition: {
      applicableProductIds: [],
      maxUsage: null
    },
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
    if (isEdit) {
      fetchPromotionDetail();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/product/list');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromotionDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/promotions/${id}`);
      if (response.data.success) {
        const promotion = response.data.data;
        setFormData({
          title: promotion.title,
          description: promotion.description,
          type: promotion.type,
          value: promotion.value,
          condition: {
            applicableProductIds: promotion.condition?.applicableProductIds?.map(p => p._id) || [],
            maxUsage: promotion.condition?.maxUsage || null
          },
          startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
          endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
          status: promotion.status
        });
      }
    } catch (error) {
      console.error('Error fetching promotion detail:', error);
      alert('Không thể tải thông tin khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('condition.')) {
      const conditionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        condition: {
          ...prev.condition,
      
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      condition: {
        ...prev.condition,
        applicableProductIds: prev.condition.applicableProductIds.includes(productId)
          ? prev.condition.applicableProductIds.filter(id => id !== productId)
          : [...prev.condition.applicableProductIds, productId]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Giá trị khuyến mãi phải lớn hơn 0';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Giá trị phần trăm không được vượt quá 100%';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      let response;
      if (isEdit) {
        response = await axios.put(`http://localhost:4000/api/promotions/admin/update/${id}`, submitData);
      } else {
        response = await axios.post('http://localhost:4000/api/promotions/admin/create', submitData);
      }

      if (response.data.success) {
        alert(isEdit ? 'Cập nhật khuyến mãi thành công!' : 'Tạo khuyến mãi thành công!');
        navigate('/promotions');
      } else {
        alert(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting promotion:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const getPromotionTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return 'Giảm theo phần trăm (%)';
      case 'fixed':
        return 'Giảm số tiền cố định (VNĐ)';
      case 'buy-x-get-y':
        return 'Mua X tặng Y';
      case 'order-discount':
        return 'Giảm giá đơn hàng';
      default:
        return type;
    }
  };

  if (loading && isEdit) {
    return (
      <div className="add-edit-promotion">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin khuyến mãi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-edit-promotion">
      <div className="page-header">
        <h1>{isEdit ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}</h1>
        <button 
          type="button" 
          onClick={() => navigate('/promotions')}
          className="back-btn"
        >
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="promotion-form">
        <div className="form-grid">
          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label htmlFor="title">Tiêu đề khuyến mãi *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="VD: Giảm giá 20% cho tất cả sản phẩm"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'error' : ''}
                placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                rows="3"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Loại khuyến mãi *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Giảm theo phần trăm (%)</option>
                  <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                  <option value="buy-x-get-y">Mua X tặng Y</option>
                  <option value="order-discount">Giảm giá đơn hàng</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="value">
                  Giá trị * {formData.type === 'percentage' ? '(%)' : '(VNĐ)'}
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className={errors.value ? 'error' : ''}
                  placeholder={formData.type === 'percentage' ? '20' : '100000'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                />
                {errors.value && <span className="error-message">{errors.value}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={errors.startDate ? 'error' : ''}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          {/* Điều kiện áp dụng */}
          <div className="form-section">
            <h3>Điều kiện áp dụng</h3>
            
           

            <div className="form-group">
              <label htmlFor="maxUsage">Số lần sử dụng tối đa</label>
              <input
                type="number"
                id="maxUsage"
                name="condition.maxUsage"
                value={formData.condition.maxUsage || ''}
                onChange={handleInputChange}
                placeholder="Không giới hạn"
                min="1"
              />
              <small>Để trống nếu không giới hạn số lần sử dụng</small>
            </div>

            <div className="form-group">
              <label>Sản phẩm áp dụng</label>
              <div className="product-selection">
                <div className="select-all-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.condition.applicableProductIds.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            condition: {
                              ...prev.condition,
                              applicableProductIds: []
                            }
                          }));
                        }
                      }}
                    />
                    Áp dụng cho tất cả sản phẩm
                  </label>
                </div>
                
                {formData.condition.applicableProductIds.length > 0 && (
                  <div className="selected-products">
                    <h4>Sản phẩm được chọn ({formData.condition.applicableProductIds.length})</h4>
                    <div className="product-grid">
                      {products
                        .filter(product => formData.condition.applicableProductIds.includes(product._id))
                        .map(product => (
                          <div key={product._id} className="product-item selected">
                            <img 
                              src={`http://localhost:4000/uploads/${product.image}`} 
                              alt={product.name}
                            />
                            <div className="product-info">
                              <h5>{product.name}</h5>
                              <p>{product.price?.toLocaleString()}đ</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleProductSelection(product._id)}
                              className="remove-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                <div className="available-products">
                  <h4>Chọn sản phẩm áp dụng</h4>
                  <div className="product-grid">
                    {products
                      .filter(product => !formData.condition.applicableProductIds.includes(product._id))
                      .map(product => (
                        <div key={product._id} className="product-item">
                          <img 
                            src={`http://localhost:4000/uploads/${product.image}`} 
                            alt={product.name}
                          />
                          <div className="product-info">
                            <h5>{product.name}</h5>
                            <p>{product.price?.toLocaleString()}đ</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleProductSelection(product._id)}
                            className="add-btn"
                          >
                            +
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/promotions')}
            className="cancel-btn"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo khuyến mãi')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditPromotion;

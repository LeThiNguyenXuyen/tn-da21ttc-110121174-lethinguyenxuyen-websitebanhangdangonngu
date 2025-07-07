// src/pages/AddProductForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaImage, FaTimes, FaSave, FaArrowLeft, FaCheck } from "react-icons/fa";
import "./ModernAddProduct.css";

const AddProductForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    importPrice: "",
    category: "",
    brand: "",
    sizes: "",
    description: "",
    quantity: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!form.price || form.price <= 0) newErrors.price = "Giá bán phải lớn hơn 0";
    if (!form.importPrice || form.importPrice <= 0) newErrors.importPrice = "Giá nhập phải lớn hơn 0";
    if (!form.category.trim()) newErrors.category = "Danh mục là bắt buộc";
    if (!form.brand.trim()) newErrors.brand = "Thương hiệu là bắt buộc";
    if (!form.sizes.trim()) newErrors.sizes = "Sizes là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (!form.quantity || form.quantity < 0) newErrors.quantity = "Số lượng tồn kho phải >= 0";
    if (!form.image) newErrors.image = "Hình ảnh là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors({ ...errors, image: "" });
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm({ ...form, image: file });

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm({ ...form, image: null });
    setImagePreview(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await axios.post("http://localhost:4000/api/product/add", formData);
      alert("✅ Thêm sản phẩm thành công!");
      navigate("/products");
    } catch (error) {
      console.error("❌ Lỗi khi thêm sản phẩm:", error);
      alert("❌ Thêm sản phẩm thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-add-product">
      {/* Header */}
      <div className="add-product-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/products")}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <div className="header-content">
          <h1>➕ Thêm sản phẩm mới</h1>
          <p>Điền thông tin chi tiết để thêm sản phẩm vào cửa hàng</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="modern-product-form">
        <div className="form-grid">
          {/* Left Column - Product Info */}
          <div className="form-section">
            <h3>📝 Thông tin sản phẩm</h3>

            <div className="form-group">
              <label htmlFor="name">Tên sản phẩm *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm..."
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Thương hiệu *</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Ví dụ: Chanel, Dior..."
                  className={errors.brand ? "error" : ""}
                />
                {errors.brand && <span className="error-message">{errors.brand}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Danh mục *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Nước hoa nam">Nước hoa nam</option>
                  <option value="Nước hoa nữ">Nước hoa nữ</option>
                  <option value="Nước hoa unisex">Nước hoa unisex</option>
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sizes">Sizes *</label>
              <input
                type="text"
                id="sizes"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="Ví dụ: 30ml, 50ml, 100ml"
                className={errors.sizes ? "error" : ""}
              />
              {errors.sizes && <span className="error-message">{errors.sizes}</span>}
              <small className="form-hint">Phân cách các size bằng dấu phẩy</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả sản phẩm *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows="4"
                className={errors.description ? "error" : ""}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          {/* Right Column - Pricing & Image */}
          <div className="form-section">
            <h3>💰 Thông tin giá cả</h3>

            <div className="form-group">
              <label htmlFor="price">Giá bán *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                className={errors.price ? "error" : ""}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="importPrice">Giá nhập *</label>
              <input
                type="number"
                id="importPrice"
                name="importPrice"
                value={form.importPrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                className={errors.importPrice ? "error" : ""}
              />
              {errors.importPrice && <span className="error-message">{errors.importPrice}</span>}
            </div>

            <h3>📦 Thông tin kho hàng</h3>

            <div className="form-group">
              <label htmlFor="quantity">Số lượng tồn kho *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={errors.quantity ? "error" : ""}
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
              <small className="form-hint">Số lượng sản phẩm hiện có trong kho</small>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Hình ảnh sản phẩm *</label>
              <div
                className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${errors.image ? 'error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <FaImage className="upload-icon" />
                    <p>Kéo thả hình ảnh vào đây hoặc</p>
                    <label htmlFor="image-input" className="upload-btn">
                      <FaUpload /> Chọn file
                    </label>
                    <input
                      type="file"
                      id="image-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            <FaTimes /> Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <FaCheck /> Thêm sản phẩm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;

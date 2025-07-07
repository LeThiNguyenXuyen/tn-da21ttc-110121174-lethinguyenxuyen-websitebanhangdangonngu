import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUpload, FaImage, FaTimes, FaSave, FaArrowLeft, FaCheck, FaInfoCircle } from "react-icons/fa";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
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

  const [currentImage, setCurrentImage] = useState(""); // Ảnh hiện tại từ server
  const [imagePreview, setImagePreview] = useState(null); // Preview ảnh mới
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
   const fetchProduct = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`http://localhost:4000/api/product/${id}`);
    const productData = res.data.success ? res.data.data : res.data;

    // Kiểm tra giá trị quantity trong productData
    console.log("Product Data:", productData); // Kiểm tra giá trị quantity ở đây

    setProduct({
      name: productData.name || "",
      price: productData.price || "",
      importPrice: productData.importPrice || "",
      category: productData.category || "",
      brand: productData.brand || "",
      sizes: Array.isArray(productData.sizes)
        ? productData.sizes.join(", ")
        : productData.sizes || "",
      description: productData.description || "",
      quantity: productData.quantity || 0, // Cập nhật quantity chính xác
      image: null,
    });

    setCurrentImage(productData.image || "");
  } catch (err) {
    alert("Lỗi khi lấy thông tin sản phẩm");
    console.error("Fetch product error:", err);
  } finally {
    setLoading(false);
  }
};

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setProduct((prev) => ({ ...prev, image: file }));

        // Tạo preview cho ảnh mới
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        // Clear error nếu có
        if (errors.image) {
          setErrors({ ...errors, image: "" });
        }
      }
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));

      // Clear error khi user bắt đầu nhập
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const removeImage = () => {
    setProduct((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset input file
    const fileInput = document.getElementById("image-input");
    if (fileInput) fileInput.value = "";
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("🔄 Starting product update...");
    console.log("📝 Product data:", product);

    const formData = new FormData();
    for (const key in product) {
      if (key === "sizes") {
        const sizesArray = product.sizes.split(",").map((s) => s.trim());
        formData.append("sizes", sizesArray);
        console.log("📏 Sizes:", sizesArray);
      } else {
        formData.append(key, product[key]);
        console.log(`📋 ${key}:`, product[key]);
      }
    }

    console.log("🚀 Sending update request...");
    const response = await axios.put(
      `http://localhost:4000/api/product/update/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("✅ Update response:", response.data);
    alert("✅ Cập nhật sản phẩm thành công");
    navigate("/products"); // ✅ quay lại đúng trang quản lý sản phẩm
  } catch (err) {
    console.error("❌ Update error:", err);
    console.error("❌ Error response:", err.response?.data);
    alert("❌ Lỗi khi cập nhật sản phẩm: " + (err.response?.data?.message || err.message));
  }
};


  if (loading) {
    return (
      <div className="edit-product-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="page-header">
        <button
          type="button"
          className="back-btn-header"
          onClick={() => navigate("/products")}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h2><FaInfoCircle /> Cập nhật sản phẩm</h2>
      </div>

      <form onSubmit={handleSubmit} className="edit-product-form">
        <div className="form-grid">
          {/* Cột trái - Thông tin cơ bản */}
          <div className="form-column">
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá bán *</label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

            </div>

            <div className="form-group">
              <label>Giá nhập</label>
              <input
                type="number"
                name="importPrice"
                value={product.importPrice}
                onChange={handleChange}
                min="0"
                step="1000"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input
                  type="number"
                  name="quantity"
                  value={product.quantity || 0}
                  onChange={handleChange}
                  min="0"
                />
              </div>

            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Nước hoa nam">Nước hoa nam</option>
                  <option value="Nước hoa nữ">Nước hoa nữ</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="form-group">
                <label>Thương hiệu</label>
                <input
                  type="text"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Size (ngăn cách bằng dấu phẩy)</label>
              <input
                type="text"
                name="sizes"
                value={product.sizes}
                onChange={handleChange}
                placeholder="30ml, 50ml, 100ml"
              />
            </div>

            <div className="form-group">
              <label>Mô tả sản phẩm</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="4"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              ></textarea>
            </div>
          </div>

          {/* Cột phải - Hình ảnh */}
          <div className="form-column">
            <div className="form-group">
              <label>Hình ảnh sản phẩm</label>

              {/* Hiển thị ảnh hiện tại */}
              {currentImage && !imagePreview && (
                <div className="current-image-section">
                  <p className="current-image-label">Ảnh hiện tại:</p>
                  <div className="current-image-container">
                    <img
                      src={`http://localhost:4000/uploads/${currentImage}`}
                      alt="Ảnh hiện tại"
                      className="current-image"
                    />
                  </div>
                </div>
              )}

              {/* Upload ảnh mới */}
              <div className="image-upload-area">
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
                    <p className="preview-label">Ảnh mới sẽ thay thế</p>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <FaImage className="upload-icon" />
                    <p>Chọn ảnh mới để thay thế</p>
                    <label htmlFor="image-input" className="upload-btn">
                      <FaUpload /> Chọn file
                    </label>
                    <input
                      type="file"
                      id="image-input"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/products")}
          >
            <FaTimes /> Hủy
          </button>

          <button type="submit" className="save-btn">
            <FaSave /> Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

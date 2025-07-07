import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./ModernProducts.css";
import { StoreContext } from "../context/StoreContext.jsx";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaEye, FaSort } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './Products.css';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const { fetchProducts: updateGlobalProducts } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`);
  };
  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/product/list");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      alert("Lỗi khi lấy danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter và search products
  useEffect(() => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "brand":
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  // Get unique categories and brands
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];

  // Xoá sản phẩm
  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá sản phẩm "${productName}"?`)) return;
    try {
      await axios.delete(`http://localhost:4000/api/product/delete/${id}`);
      fetchProducts();
      updateGlobalProducts && updateGlobalProducts();
      alert("✅ Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi xoá sản phẩm:", error);
      alert("❌ Lỗi khi xoá sản phẩm");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }


  return (
    <div className="modern-products">
      {/* Header Section */}
      <div className="products-header">
        <div className="header-content">
          <h1>🛍️ Quản lý sản phẩm</h1>
          <p>Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>
        <button
          className="add-product-btn"
          onClick={() => navigate('/add-product')}
        >
          <FaPlus /> Thêm sản phẩm mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="products-controls">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="price">Sắp xếp theo giá</option>
            <option value="brand">Sắp xếp theo thương hiệu</option>
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FaFilter />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaSort />
          </button>
        </div>
      </div>

      {/* Products Stats */}
      <div className="products-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredProducts.length}</span>
          <span className="stat-label">Sản phẩm hiển thị</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">Tổng sản phẩm</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Danh mục</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{brands.length}</span>
          <span className="stat-label">Thương hiệu</span>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={`products-container ${viewMode}`}>
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            <button
              className="add-first-product-btn"
              onClick={() => navigate('/add-product')}
            >
              <FaPlus /> Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={`http://localhost:4000/uploads/${product.image}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="product-overlay">
                  <button
                    className="action-btn view"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(product._id)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(product._id, product.name)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="product-info">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-brand">{product.brand}</span>
                </div>

                <div className="product-category">
                  <span className="category-tag">{product.category}</span>
                </div>

                <div className="product-prices">
                  <span className="current-price">
                    {formatPrice(product.price)}
                  </span>
                  <span className="import-price">
                    Nhập: {formatPrice(product.importPrice || 0)}
                  </span>
                </div>

                <div className="product-sizes">
                  <span className="sizes-label">Sizes:</span>
                  <div className="sizes-list">
                    {(Array.isArray(product.sizes) ? product.sizes : product.sizes?.split(',')).map((size, index) => (
                      <span key={index} className="size-tag">{size.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className="product-description">
                  <p>{product.description}</p>
                </div>

                <div className="product-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(product._id)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product._id, product.name)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;

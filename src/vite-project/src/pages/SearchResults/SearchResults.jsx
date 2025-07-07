import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import Productitem from '../../components/ProductItem/Productitem';
import removeAccents from 'remove-accents';
import Fuse from 'fuse.js';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const originalQuery = searchParams.get('q') || '';
  const query = removeAccents(originalQuery.toLowerCase());
  const { Product_list } = useContext(StoreContext);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function để handle click vào example tags
  const handleExampleClick = (exampleQuery) => {
    navigate(`/search?q=${encodeURIComponent(exampleQuery)}`);
  };

  useEffect(() => {
    if (!originalQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Chuẩn hóa query để tìm kiếm
    const normalizedQuery = removeAccents(originalQuery.toLowerCase().trim());

    // Tạo nhiều variant của query để tìm kiếm linh hoạt hơn
    const queryVariants = [
      normalizedQuery,
      originalQuery.toLowerCase().trim(),
      // Thêm các từ riêng lẻ
      ...normalizedQuery.split(' ').filter(word => word.length > 1),
      ...originalQuery.toLowerCase().split(' ').filter(word => word.length > 1)
    ];

    // Sử dụng Fuse.js cho tìm kiếm fuzzy với nhiều fields
    const options = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'nameNoAccent', weight: 0.4 },
        { name: 'brand', weight: 0.3 },
        { name: 'brandNoAccent', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'descriptionNoAccent', weight: 0.2 },
        { name: 'category', weight: 0.1 },
        { name: 'categoryNoAccent', weight: 0.1 }
      ],
      threshold: 0.4, // Tăng threshold để có kết quả chính xác hơn
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
    };

    // Chuẩn bị dữ liệu với cả có dấu và không dấu
    const searchableProducts = Product_list.map(p => ({
      ...p,
      // Giữ nguyên dữ liệu gốc
      originalName: p.name,
      originalBrand: p.brand,
      originalDescription: p.description,
      originalCategory: p.category,
      // Thêm version không dấu
      name: p.name?.toLowerCase() || '',
      nameNoAccent: removeAccents(p.name?.toLowerCase() || ''),
      brand: p.brand?.toLowerCase() || '',
      brandNoAccent: removeAccents(p.brand?.toLowerCase() || ''),
      description: p.description?.toLowerCase() || '',
      descriptionNoAccent: removeAccents(p.description?.toLowerCase() || ''),
      category: p.category?.toLowerCase() || '',
      categoryNoAccent: removeAccents(p.category?.toLowerCase() || '')
    }));

    // Tìm kiếm với tất cả variants
    let allResults = [];

    queryVariants.forEach(queryVariant => {
      if (queryVariant && queryVariant.length > 0) {
        const fuse = new Fuse(searchableProducts, options);
        const fuseResults = fuse.search(queryVariant);
        allResults = [...allResults, ...fuseResults];
      }
    });

    // Loại bỏ duplicate và sắp xếp theo score
    const uniqueResults = allResults.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.item._id === current.item._id);
      if (existingIndex === -1) {
        acc.push(current);
      } else if (current.score < acc[existingIndex].score) {
        // Giữ kết quả có score tốt hơn (score thấp hơn = tốt hơn)
        acc[existingIndex] = current;
      }
      return acc;
    }, []);

    // Sắp xếp theo score và map về item gốc
    const sortedResults = uniqueResults
      .sort((a, b) => a.score - b.score)
      .map(r => ({
        ...r.item,
        // Khôi phục tên gốc
        name: r.item.originalName,
        brand: r.item.originalBrand,
        description: r.item.originalDescription,
        category: r.item.originalCategory
      }));

    setResults(sortedResults);
    setLoading(false);
  }, [originalQuery, Product_list]);

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h2>Kết quả tìm kiếm cho: <em>"{originalQuery}"</em></h2>
        {!loading && results.length > 0 && (
          <p className="results-count">Tìm thấy {results.length} sản phẩm</p>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      ) : !query.trim() ? (
        <div className="empty-query">
          <p>Vui lòng nhập từ khóa để tìm kiếm sản phẩm.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "<strong>{originalQuery}</strong>"</p>
          <div className="search-suggestions">
            <p>Gợi ý:</p>
            <ul>
              <li>Kiểm tra lại chính tả</li>
              <li>Thử sử dụng từ khóa khác</li>
              <li>Sử dụng từ khóa ngắn gọn hơn</li>
              <li>Có thể gõ không dấu: "nuoc hoa" thay vì "nước hoa"</li>
            </ul>
            <div className="search-examples">
              <p><strong>Ví dụ tìm kiếm:</strong></p>
              <div className="example-tags">
                <span
                  className="example-tag"
                  onClick={() => handleExampleClick('nước hoa nam')}
                >
                  nước hoa nam
                </span>
                <span
                  className="example-tag"
                  onClick={() => handleExampleClick('nuoc hoa nu')}
                >
                  nuoc hoa nu
                </span>
                <span
                  className="example-tag"
                  onClick={() => handleExampleClick('chanel')}
                >
                  chanel
                </span>
                <span
                  className="example-tag"
                  onClick={() => handleExampleClick('dior')}
                >
                  dior
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-results">
          <div className="product-list">
            {results.map((product) => (
              <Productitem key={product._id} {...product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

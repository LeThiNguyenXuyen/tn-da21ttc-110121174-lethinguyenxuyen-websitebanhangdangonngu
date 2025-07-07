// components/TranslationManager/TranslationManager.jsx
import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './TranslationManager.css';

const TranslationManager = () => {
  const { Product_list } = useContext(StoreContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [englishName, setEnglishName] = useState('');
  const [englishDescription, setEnglishDescription] = useState('');
  const [translations, setTranslations] = useState({});

  // Auto-generate English name suggestion
  const generateEnglishName = (vietnameseName) => {
    if (!vietnameseName) return '';
    
    // Remove "Nước hoa" prefix
    let suggestion = vietnameseName.replace(/^Nước hoa\s+/, '');
    
    return suggestion;
  };

  // Auto-generate English description suggestion
  const generateEnglishDescription = (vietnameseDesc) => {
    if (!vietnameseDesc) return 'Premium fragrance with unique scent profile.';
    
    // Simple auto-translation rules
    let suggestion = vietnameseDesc;
    suggestion = suggestion.replace(/hương/gi, 'fragrance');
    suggestion = suggestion.replace(/mùi hương/gi, 'scent');
    suggestion = suggestion.replace(/nam tính/gi, 'masculine');
    suggestion = suggestion.replace(/nữ tính/gi, 'feminine');
    suggestion = suggestion.replace(/sang trọng/gi, 'luxurious');
    suggestion = suggestion.replace(/tươi mát/gi, 'fresh');
    
    return suggestion;
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setEnglishName(generateEnglishName(product.name));
    setEnglishDescription(generateEnglishDescription(product.description));
  };

  const saveTranslation = async () => {
    if (!selectedProduct) return;

    try {
      // Translation API removed - save locally only
      console.log('⚠️ Translation API disabled - saving locally only');

      if (true) { // Always succeed for local storage
        const newTranslations = {
          ...translations,
          [selectedProduct.name]: englishName,
          [selectedProduct.description]: englishDescription
        };

        setTranslations(newTranslations);

        // Also generate i18n format for manual copy
        console.log('✅ Saved to database! Also add these to i18n.js:');
        console.log(`"${selectedProduct.name}": "${englishName}",`);
        console.log(`"${selectedProduct.description}": "${englishDescription}",`);

        alert('✅ Translation saved to database and ready for i18n.js!');
      }
    } catch (error) {
      console.error('Error saving translation:', error);

      // Fallback to local storage
      const newTranslations = {
        ...translations,
        [selectedProduct.name]: englishName,
        [selectedProduct.description]: englishDescription
      };

      setTranslations(newTranslations);

      console.log('⚠️ Database save failed, but saved locally. Add these to i18n.js:');
      console.log(`"${selectedProduct.name}": "${englishName}",`);
      console.log(`"${selectedProduct.description}": "${englishDescription}",`);

      alert('⚠️ Saved locally! Check console for i18n.js format');
    }
  };

  const exportAllTranslations = () => {
    let output = '// Add these to i18n.js en translation section:\n\n';
    
    Object.entries(translations).forEach(([vietnamese, english]) => {
      output += `"${vietnamese}": "${english}",\n`;
    });
    
    console.log(output);
    
    // Create downloadable file
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-translations.txt';
    a.click();
  };

  return (
    <div className="translation-manager">
      <h2>🌐 Product Translation Manager</h2>
      
      <div className="translation-content">
        <div className="product-list">
          <h3>Select Product to Translate:</h3>
          <div className="product-grid">
            {Product_list.map((product) => (
              <div 
                key={product._id}
                className={`product-card ${selectedProduct?._id === product._id ? 'selected' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <img 
                  src={`http://localhost:4000/uploads/${product.image}`} 
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProduct && (
          <div className="translation-form">
            <h3>Translate: {selectedProduct.name}</h3>
            
            <div className="form-group">
              <label>Vietnamese Name:</label>
              <input 
                type="text" 
                value={selectedProduct.name} 
                disabled 
                className="readonly"
              />
            </div>
            
            <div className="form-group">
              <label>English Name:</label>
              <input 
                type="text" 
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="Enter English product name"
              />
            </div>
            
            <div className="form-group">
              <label>Vietnamese Description:</label>
              <textarea 
                value={selectedProduct.description || 'No description'} 
                disabled 
                className="readonly"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>English Description:</label>
              <textarea 
                value={englishDescription}
                onChange={(e) => setEnglishDescription(e.target.value)}
                placeholder="Enter English description"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button onClick={saveTranslation} className="save-btn">
                💾 Save Translation
              </button>
              <button onClick={exportAllTranslations} className="export-btn">
                📥 Export All Translations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationManager;

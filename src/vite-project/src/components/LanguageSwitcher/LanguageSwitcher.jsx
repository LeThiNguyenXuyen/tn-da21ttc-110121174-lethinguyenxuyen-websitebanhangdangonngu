import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { assets } from '../../assets/assets';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'vi', name: 'Việt Nam', flag: assets.vn_flag },
    { code: 'en', name: 'English', flag: assets.en_flag }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="lang-selector"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="lang-text">{i18n.language === 'vi' ? 'Ngôn ngữ' : 'Language'}</span>
        <img
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          className="lang-flag"
        />
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`lang-option ${i18n.language === language.code ? 'active' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <img
                src={language.flag}
                alt={language.name}
                className="lang-flag-option"
              />
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

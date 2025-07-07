
import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-col company-info">
            <div className="footer-logo">
              <img src={assets.logo} alt="Logo" />
            </div>
            <p className="company-desc">
              {t('companyDescription')}
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/nguyen.xuyen.369765" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <img src={assets.fb_icon} alt="Facebook" className="social-icon" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <img src={assets.ig_icon} alt="Instagram" className="social-icon" />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>{t('quickLinks')}</h3>
            <ul className="footer-links">
              <li><a href="/perfume/Nam">🚹 {t('perfumeForMen')}</a></li>
              <li><a href="/perfume/Nữ">🚺 {t('perfumeForWomen')}</a></li>
              <li><a href="/promotions">🎉 {t('promotions')}</a></li>
              <li><a href="/wishlist">❤️ {t('wishlist')}</a></li>
            <li><a href="/contact">📞 {t('contact.title')}</a></li>

            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h3>{t('customerSupport')}</h3>
            <ul className="footer-links">
              <li><a href="#">📞 {t('hotline')}</a></li>
              <li><a href="mailto:lethinguyenxuyen2003@gmail.com">📧 {t('supportEmail')}</a></li>
              <li><a href="#">🕒 {t('workingHours')}</a></li>
              <li><a href="#">📋 {t('returnPolicy')}</a></li>
              <li><a href="#">🚚 {t('shippingPolicy')}</a></li>
            </ul>
          </div>

       
              
            <div className="payment-methods">
              <h4>{t('paymentMethods')}</h4>
              <div className="payment-icons">
                <span className="payment-icon visa">💳</span>
                <span className="payment-icon mastercard">💳</span>
                <span className="payment-icon momo">📱</span>
                <span className="payment-icon zalopay">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2024 Perfume Store. {t('copyright')}</p>
            </div>
            <div className="footer-bottom-links">
              <a href="#">{t('termsOfUse')}</a>
              <a href="#">{t('privacyPolicy')}</a>
              <a href="#">{t('sitemap')}</a>
            </div>
          </div>
        </div>
    
    </footer>
  );
};

export default Footer;

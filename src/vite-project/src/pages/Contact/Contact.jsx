// src/pages/Contact/Contact.jsx
import React from 'react';
import './Contact.css';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  const m = t('contact.methods', { returnObjects: true });
  const s = t('contact.social',  { returnObjects: true });
  const f = t('contact.faq.items', { returnObjects: true });

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h1>{t('contact.title')}</h1>
          <p> {t('contact.subtitle')} </p>
        </div>

        <div className="contact-content">
          {/* Contact Info */}
          <div className="contact-info">
            {['zalo','email','address'].map(key => (
              <div key={key} className="info-card">
                <div className="info-icon">
                  { key==='email' ? '📧' : key==='address' ? '📍' : '📞' }
                </div>
                <h3>{m[key].name}</h3>
                <p>{m[key].info}</p>
                <span className="info-note">{m[key].note}</span>
              </div>
            ))}
          </div>

          {/* Social Channels */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>{s.title}</h2>
              <p>{s.subtitle}</p>
            </div>
            <div className="social-contact-grid">
              {['facebook','instagram','zalo'].map(key => (
                <div key={key} className="social-contact-card">
                  <div className="social-icon">{ key==='facebook' ? '📘'
                                              : key==='instagram' ? '📷' : '💬' }</div>
                  <h3>{s[key].name}</h3>
                  <p>{s[key].desc}</p>
                  <a href={s[key].url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className={`contact-btn ${key}-btn`}>
                    {s[key].btn}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h2>{t('contact.faq.title')}</h2>
          <div className="faq-grid">
            {Object.values(f).map((item, i) => (
              <div key={i} className="faq-item">
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

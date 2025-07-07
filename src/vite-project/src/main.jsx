import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext';
import AuthProvider from './context/AuthContext.jsx';


import './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ Đúng: Auth ở ngoài cùng */}
        <StoreContextProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </StoreContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);


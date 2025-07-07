import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { showToast } from './utils/toastUtils';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOder from './pages/PlaceOder/PlaceOder';
import Login from './components/Login/Login';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import PerfumePage from './pages/PerfumePage/PerfumePage';
import Checkout from './pages/Checkout/Checkout';
import ConfirmOrder from './pages/ConfirmOrder/ConfirmOrder';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Verify from './pages/Verify/Verify';
import SearchResults from './pages/SearchResults/SearchResults';
import PromotionList from './pages/PromotionList/PromotionList';
import MyOrders from './pages/MyOrders/MyOrders';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers/AdminUsers';

import Wishlist from './pages/Wishlist/Wishlist';
import Contact from './pages/Contact/Contact';
import TranslationManager from './components/TranslationManager/TranslationManager';
import PromotionBanner from './components/PromotionBanner/PromotionBanner';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import EditAddress from './components/EditAddress/EditAddress';
import Address from './components/Address/Address';

const App = () => {
  const location = useLocation();

  // Clear any stuck toasts when app loads
  useEffect(() => {
    showToast.dismiss();
  }, []);

  return (
    <>
      {/* ✅ Luôn hiển thị Navbar */}
      <Navbar />

      {/* ✅ Banner khuyến mãi */}
      <PromotionBanner />



      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/Oder" element={<PlaceOder />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/perfume/:gender" element={<PerfumePage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirm" element={<ConfirmOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/promotions" element={<PromotionList />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/address" element={<Address />} />

          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/translations" element={<TranslationManager />} />
          <Route path="/address/edit/:id" element={<EditAddress />} />
        </Routes>
      </div>

      {/* ✅ Luôn hiển thị Footer */}
      <Footer />

      {/* ✅ Toast Notification - Fixed Configuration */}
      <ToastContainer
        position="top-right"
        autoClose={2000}               // 2 giây
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={false}
        theme="light"
        limit={1}
        style={{
          fontSize: '14px',
          zIndex: 9999,
          top: '80px'                  // đẩy toast 80px xuống từ trên cùng
        }}
      />
    </>
  );
};

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { paymentIcons } from '../../assets/assets';

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart, isUserLoggedIn, forceRefreshAuth } = useCart();
  const deliveryFee = 20000;
  const [addresses, setAddresses] = useState([]);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const total = subtotal + deliveryFee;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'VN',
    phone: ''
  });

  const [method, setMethod] = useState('stripe');

  useEffect(() => {
    forceRefreshAuth();

    const fetchAddress = async () => {
      const token = localStorage.getItem('token'); // Lấy token từ localStorage

      if (!token) {
        console.error("Không tìm thấy token.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/address/list', {
          headers: { token } // Gửi token trực tiếp trong header giống như bạn làm với wishlist
        });

        // Xử lý dữ liệu từ response
        if (response.data.success && Array.isArray(response.data.addressList)) {
          setAddresses(response.data.addressList); // Cập nhật danh sách địa chỉ vào state
        }
      } catch (error) {
        console.error("Không thể lấy danh sách địa chỉ:", error);
      }
    };




    fetchAddress();

    const pendingData = localStorage.getItem('pendingCheckoutData');
    if (pendingData) {
      try {
        const { formData: savedFormData, timestamp } = JSON.parse(pendingData);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - timestamp < thirtyMinutes) {
          setFormData(savedFormData);
          toast.success("✅ Đã khôi phục thông tin đặt hàng của bạn!");
        }
        localStorage.removeItem('pendingCheckoutData');
      } catch (error) {
        localStorage.removeItem('pendingCheckoutData');
      }
    }
  }, []);

  const handleDeleteAddress = async (addressId) => {
    const token = localStorage.getItem('token');  // lấy token từ localStorage
    if (!token) return;

    if (!window.confirm("Bạn có chắc chắn muốn xoá địa chỉ này không?")) return;

    try {
      const res = await axios.delete(`http://localhost:4000/api/address/delete/${addressId}`, {
        headers: {
          token: token  // ✅ Gửi token với key là 'token'
        }
      });
      if (res.data.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        toast.success("✅ Đã xoá địa chỉ giao hàng!");
      } else {
        toast.error("❌ Không thể xoá địa chỉ: " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ Lỗi khi xoá địa chỉ: " + (error.response?.data?.message || error.message));
    }
  };





  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^[0-9+\-\s()]*$/.test(value)) return;
    if (name === 'zipcode' && !/^[0-9A-Za-z\s\-]*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleStripe = async () => {
    const token = localStorage.getItem("token");
    
    const orderData = {
      address: formData,
      items: cart.map(item => ({
        _id: item._id || item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
     amount: subtotal + deliveryFee,
      payment: 'stripe'
    };

    console.log("Dữ liệu đơn hàng Stripe:", orderData);  // Log dữ liệu đơn hàng để kiểm tra

    try {
      const response = await axios.post("http://localhost:4000/api/order/place", orderData, {
        headers: { token }
      });

      console.log("Phản hồi từ backend tạo đơn hàng:", response.data);  // Log phản hồi từ backend

      if (response.data.success) {
        // Kiểm tra nếu URL có trong phản hồi từ backend
        if (response.data.url) {
          console.log("Stripe checkout URL:", response.data.url);  // Log URL thanh toán của Stripe
          clearCart();
          window.location.replace(response.data.url);  // Điều hướng người dùng đến Stripe checkout
        } else {
          console.error("Lỗi: Không nhận được đường link thanh toán từ Stripe.");
          alert("Lỗi: Không nhận được đường link thanh toán từ Stripe.");
        }
      } else {
        console.error("Lỗi khi đặt hàng:", response.data.message);
        alert("Lỗi: " + (response.data.message || "Không thể đặt hàng"));
      }
    } catch (error) {
      console.error("Lỗi khi gọi API backend:", error);  // Log lỗi nếu có
      alert("Có lỗi xảy ra khi đặt hàng: " + (error.response?.data?.message || error.message));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUserLoggedIn()) {
      localStorage.setItem('pendingCheckoutData', JSON.stringify({ formData, cart, timestamp: Date.now() }));
      localStorage.setItem('redirectAfterLogin', '/checkout');
      alert("Vui lòng đăng nhập để đặt hàng!");
      navigate('/login');
      return;
    }

    if (cart.length === 0) return alert("Giỏ hàng trống!");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneNumbers = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.street ||
      !formData.city || !formData.state || !formData.zipcode || !formData.country || !formData.phone) {
      return alert(t('shippingInfo'));
    }
    if (!emailRegex.test(formData.email)) return alert("Email không hợp lệ!");
    if (phoneNumbers.length < 10) return alert("Số điện thoại phải có ít nhất 10 chữ số!");

    // 🔁 Gọi đúng handler theo method:
    if (method === 'stripe') {
      await handleStripe();
    } else if (method === 'payos') {
      await handlePayOS();
    } else if (method === 'cod') {
      await handleCOD();
    }
  };


  const handleCOD = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem('userId'); // Đảm bảo lấy userId từ localStorage

      if (!userId) {
        console.error("Không tìm thấy userId trong localStorage");
        return;
      }

      const orderData = {
        address: formData,
        items: cart.map(item => ({
          _id: item._id || item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        amount: total,
        payment: 'COD',
        userId: userId  // Đảm bảo userId được truyền vào đúng
      };

      console.log("Dữ liệu đơn hàng COD:", orderData);  // Log dữ liệu để kiểm tra

      const response = await axios.post("http://localhost:4000/api/order/placeCOD", orderData, {
        headers: { token }
      });

      if (response.data.success) {
        await axios.post('http://localhost:4000/api/order/reduceStock', { items: orderData.items }, { headers: { token } });

        clearCart();
        toast.success("🧾 Đơn hàng đã được đặt. Thanh toán khi nhận hàng!");
        navigate('/my-orders');
      } else {
        alert("Lỗi: " + (response.data.message || "Không thể đặt hàng"));
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng (COD):", error);
      alert("Lỗi khi đặt hàng (COD): " + (error.response?.data?.message || error.message));
    }
  };



  const handlePayOS = async () => {
    try {
      const orderData = {
        address: formData,
        items: cart.map(item => ({
          _id: item._id || item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        amount: total,
        userId: localStorage.getItem('userId')  // Lấy userId từ localStorage hoặc sessionStorage
      };

      const token = localStorage.getItem('token'); // Hoặc sessionStorage.getItem('token')

      if (!token) {
        alert("Bạn cần đăng nhập để thanh toán.");
        return;
      }

      // Gửi yêu cầu đến backend với token trong header và userId trong body
      const response = await axios.post(
        'http://localhost:4000/api/order/payos',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}` // Thêm token vào header yêu cầu
          }
        }
      );

      if (response.data.success && response.data.checkoutUrl) {
        clearCart();
        window.location.href = response.data.checkoutUrl;
      } else {
        alert("Lỗi tạo link thanh toán PayOS: " + response.data.message || "Vui lòng thử lại.");
      }
    } catch (error) {
      console.error('Lỗi kết nối đến PayOS:', error);
      alert("Lỗi kết nối đến PayOS: " + (error.response?.data?.message || error.message || "Vui lòng thử lại."));
    }
  };




  return (
    <div className="checkout-page">
      {addresses.length > 0 && (
        <div className="address-list">
         <h4>{t('checkout.chooseAddress')}</h4>
          {addresses.map((addr) => (
            <div key={addr._id} className={`address-card ${formData._id === addr._id ? 'selected' : ''}`}>
              <p>{addr.firstName} {addr.lastName}, {addr.street}, {addr.city}, {addr.state}, {addr.zipcode}, {addr.country}</p>
              <p>📞 {addr.phone} | ✉️ {addr.email}</p>
              <button onClick={() => setFormData(prev => ({
                ...prev,
                firstName: addr.firstName,
                lastName: addr.lastName,
                email: addr.email,
                street: addr.street,
                city: addr.city,
                state: addr.state,
                zipcode: addr.zipcode,
                country: addr.country || 'VN',
                phone: addr.phone,
                _id: addr._id
              }))}>{t('checkout.useThisAddress')}</button>

            <button onClick={() => navigate(`/address/edit/${addr._id}`)} className="edit-address-btn">{t('edit')}</button>
             <button onClick={() => handleDeleteAddress(addr._id)}>{t('delete')}</button>


            </div>
          ))}
        </div>
      )}


      <form onSubmit={handleSubmit} className="checkout-form">
        <h2 className="hidden">{t('shippingInfo')}</h2>

        <div className="form-grid">
           <button onClick={() => navigate('/address')} className="change-address-btn">
         {t('checkout.addNewAddress')}
       </button>

        </div>

        <div className="payment-method">
          <label className={`payment-option ${method === 'stripe' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={method === 'stripe'}
              onChange={() => setMethod('stripe')}
            />
            <img src={paymentIcons.stripe} alt="Stripe" className="payment-icon" />
             {t('payment.stripe')}
          </label>

          <label className={`payment-option ${method === 'payos' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="payos"
              checked={method === 'payos'}
              onChange={() => setMethod('payos')}
            />
            <img src={paymentIcons.payos} alt="PayOS" className="payment-icon" />
           {t('payment.payos')}

          </label>

          <label className={`payment-option ${method === 'cod' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={method === 'cod'}
              onChange={() => setMethod('cod')}
            />
            <img src={paymentIcons.cod} alt="COD" className="payment-icon" />
            {t('payment.cod')}
          </label>
        </div>


        <button type="submit" className="checkout-btn">{t('checkout.placeOrder')}</button>
      </form>

      <div className="checkout-summary">
        <h3>{t('orderSummary')}</h3>
        <p><span>{t('subtotal')}</span><span>{subtotal.toLocaleString()} đ</span></p>
        <p><span>{t('shippingFee')}</span><span>{deliveryFee.toLocaleString()} đ</span></p>
        <hr />
        <p className="total"><span>{t('total')}</span><span>{total.toLocaleString()} đ</span></p>
      </div>
    </div>
  );
};

export default Checkout;

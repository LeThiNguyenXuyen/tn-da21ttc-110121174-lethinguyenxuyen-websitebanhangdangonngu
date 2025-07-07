import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Address = () => {
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
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Address Component
const handleSave = async (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneNumbers = formData.phone.replace(/[^0-9]/g, '');

  // Kiểm tra các trường cần thiết
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.street ||
    !formData.city || !formData.state || !formData.zipcode || !formData.country || !formData.phone) {
    return alert("Vui lòng điền đầy đủ thông tin!");
  }

  if (!emailRegex.test(formData.email)) return alert("Email không hợp lệ!");
  if (phoneNumbers.length < 10) return alert("Số điện thoại phải có ít nhất 10 chữ số!");

  const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage hoặc từ sessionStorage
  const token = localStorage.getItem('token'); // Lấy token từ localStorage

  if (!userId) {
    return toast.error("Vui lòng đăng nhập để lưu địa chỉ!");
  }

  if (!token) {
    return toast.error("Vui lòng đăng nhập để lưu địa chỉ!");
  }

  try {
    const response = await axios.post('http://localhost:4000/api/address/add', formData, {
      headers: {
        token: token, // Gửi token trong header
      }
    });

    if (response.data.success) {
      toast.success("✅ Địa chỉ của bạn đã được lưu!");
      navigate('/checkout'); // ✅ Quay lại trang Checkout sau khi lưu thành công
    } else {
      toast.error("Lỗi khi lưu địa chỉ: " + response.data.message);
    }
  } catch (error) {
    console.error("Có lỗi khi lưu địa chỉ: ", error);
    toast.error("Có lỗi xảy ra khi lưu địa chỉ.");
  }
};


  return (
    <div className="address-page">
      <h2>Thay đổi địa chỉ</h2>
      <form onSubmit={handleSave} className="address-form">
        <div className="form-grid">
          <input name="firstName" placeholder="Họ" value={formData.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Tên" value={formData.lastName} onChange={handleChange} />
          <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} />
          <input name="street" placeholder="Địa chỉ" value={formData.street} onChange={handleChange} />
          <input name="zipcode" placeholder="Mã bưu điện" value={formData.zipcode} onChange={handleChange} />
          <input name="city" placeholder="Thành phố" value={formData.city} onChange={handleChange} />
          <input name="state" placeholder="Tỉnh/Thành phố" value={formData.state} onChange={handleChange} />
          <select name="country" value={formData.country} onChange={handleChange}>
            <option value="VN">Việt Nam</option>
            <option value="US">USA</option>
            <option value="JP">Japan</option>
            <option value="KR">Korea</option>
          </select>
          <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
        </div>
        <button type="submit" className="save-address-btn">Lưu địa chỉ</button>
      </form>
    </div>
  );
};

export default Address;

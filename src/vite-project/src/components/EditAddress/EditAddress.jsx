import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const EditAddress = () => {
  const { id } = useParams(); // Lấy addressId từ URL
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !id) return;

        const res = await axios.get(`http://localhost:4000/api/address/${id}`, {
          headers: { token }
        });

        if (res.data.success) {
          setFormData(res.data.address);
        } else {
          toast.error("Không tìm thấy địa chỉ.");
          navigate('/checkout');
        }
      } catch (error) {
        toast.error("Lỗi khi tải địa chỉ: " + error.message);
        navigate('/checkout');
      }
    };

    fetchAddress();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) return toast.error("Bạn cần đăng nhập!");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneNumbers = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.street ||
      !formData.city || !formData.state || !formData.zipcode || !formData.country || !formData.phone) {
      return toast.error("Vui lòng điền đầy đủ thông tin!");
    }
    if (!emailRegex.test(formData.email)) return toast.error("Email không hợp lệ!");
    if (phoneNumbers.length < 10) return toast.error("Số điện thoại quá ngắn!");

    try {
      const res = await axios.put(`http://localhost:4000/api/address/edit/${id}`, formData, {
        headers: { token }
      });

      if (res.data.success) {
        toast.success("✅ Cập nhật địa chỉ thành công!");
        navigate('/checkout');
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật địa chỉ!");
    }
  };

  return (
    <div className="address-page">
      <h2>✏️ Sửa địa chỉ</h2>
      <form onSubmit={handleSave} className="address-form">
        <div className="form-grid">
          <input name="firstName" placeholder="Họ" value={formData.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Tên" value={formData.lastName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="street" placeholder="Địa chỉ" value={formData.street} onChange={handleChange} />
          <input name="zipcode" placeholder="Mã bưu điện" value={formData.zipcode} onChange={handleChange} />
          <input name="city" placeholder="Thành phố" value={formData.city} onChange={handleChange} />
          <input name="state" placeholder="Tỉnh/Thành phố" value={formData.state} onChange={handleChange} />
          <select name="country" value={formData.country} onChange={handleChange}>
            <option value="VN">Việt Nam</option>
            <option value="US">Mỹ</option>
            <option value="JP">Nhật Bản</option>
            <option value="KR">Hàn Quốc</option>
          </select>
          <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
        </div>
        <button type="submit" className="save-address-btn">💾 Lưu thay đổi</button>
      </form>
    </div>
  );
};

export default EditAddress;

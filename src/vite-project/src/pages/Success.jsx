// src/pages/Success.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (orderId) {
        try {
          const token = localStorage.getItem('token');
          await axios.post('http://localhost:4000/api/order/verify', {
            orderId,
            success: true
          }, {
            headers: { token }
          });
          console.log('Order status updated successfully');
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }
      setIsUpdating(false);

      // Tự động chuyển về trang chủ sau 5 giây
      setTimeout(() => {
        navigate('/');
      }, 5000);
    };

    updateOrderStatus();
  }, [orderId, navigate]);

  return (
    <div style={{
      padding: '60px 40px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      marginTop: '50px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
      <h2 style={{ color: '#28a745', marginBottom: '20px', fontSize: '28px' }}>
        Thanh toán thành công!
      </h2>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>
        Cảm ơn bạn đã mua hàng với chúng tôi.
      </p>
      {orderId && (
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          <strong>Mã đơn hàng:</strong> {orderId}
        </p>
      )}
      {isUpdating && (
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
          Đang cập nhật trạng thái đơn hàng...
        </p>
      )}
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
        Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn sớm nhất.
      </p>
      <p style={{ fontSize: '14px', color: '#888' }}>
        Bạn sẽ được chuyển về trang chủ sau 5 giây...
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          backgroundColor: '#f55a2c',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Về trang chủ ngay
      </button>
    </div>
  );
};

export default Success;

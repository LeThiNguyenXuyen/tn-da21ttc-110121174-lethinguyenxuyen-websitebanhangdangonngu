import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Cancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Tự động chuyển về giỏ hàng sau 5 giây
    setTimeout(() => {
      navigate('/cart');
    }, 5000);
  }, [navigate]);

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
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
      <h2 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '28px' }}>
        Thanh toán đã bị hủy!
      </h2>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>
        Bạn đã hủy quá trình thanh toán.
      </p>
      {orderId && (
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          <strong>Mã đơn hàng bị hủy:</strong> {orderId}
        </p>
      )}
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
        Đơn hàng của bạn chưa được xử lý. Bạn có thể quay lại giỏ hàng để thử lại.
      </p>
      <p style={{ fontSize: '14px', color: '#888' }}>
        Bạn sẽ được chuyển về giỏ hàng sau 5 giây...
      </p>
      <button
        onClick={() => navigate('/cart')}
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
        Quay lại giỏ hàng
      </button>
    </div>
  );
};

export default Cancel;
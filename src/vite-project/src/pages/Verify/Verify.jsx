import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Verify.css';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [message, setMessage] = useState('');

  const success = searchParams.get('success');
  const statusParam = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const isPaid =
          success === 'true' ||
          statusParam?.toUpperCase() === 'PAID';

        console.log('Verifying payment...', { success, statusParam, orderId });

        if (isPaid) {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');

          if (orderId) {
            try {
              const token = localStorage.getItem('token');
              await axios.post('http://localhost:4000/api/order/verify', {
                orderId,
                success: success === 'true',
                status: statusParam
              }, {
                headers: { token }
              });

            } catch (error) {
              console.error('Error updating order status:', error);
            }
          }

          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage('Thanh toán thất bại! Vui lòng thử lại.');
          setTimeout(() => {
            navigate('/cart');
          }, 3000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setMessage('Có lỗi xảy ra khi xác minh thanh toán.');
      }
    };

    if (orderId) {
      verifyPayment();
    } else {
      setStatus('failed');
      setMessage('Thông tin thanh toán không hợp lệ.');
    }
  }, [success, statusParam, orderId, navigate]);

  // ✅ Đặt return ở đây, bên trong hàm Verify
  return (
    <div className="verify-container">
      <div className="verify-content">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h2>Đang xác minh thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✅</div>
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <p>Mã đơn hàng: {orderId}</p>
            <p>Bạn sẽ được chuyển về trang chủ sau 3 giây...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="error-icon">❌</div>
            <h2>Thanh toán thất bại!</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/cart')} className="retry-btn">
              Quay lại giỏ hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
};



export default Verify;

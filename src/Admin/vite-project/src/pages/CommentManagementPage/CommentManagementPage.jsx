import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentManagementPage.css';

const API_BASE_URL = 'http://localhost:4000';

const CommentManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
 const [replyText, setReplyText] = useState('');
const [replyingReviewId, setReplyingReviewId] = useState(null);



  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/review/admin/reviews`);

      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        setError('Không thể tải bình luận');
      }
    } catch (err) {
      setError('Lỗi khi tải bình luận');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (reviewId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/review/admin/reply`, {
      reviewId,
      reply: replyText
    });

    if (response.data.success) {
      const updatedReviews = reviews.map(r =>
        r._id === reviewId ? { ...r, adminReply: replyText } : r
      );
      setReviews(updatedReviews);
      setReplyingReviewId(null);
      setReplyText('');
      alert('✅ Đã gửi phản hồi thành công');
    } else {
      alert('❌ Gửi phản hồi thất bại');
    }
  } catch (err) {
    alert('Lỗi khi gửi phản hồi');
    console.error(err);
  }
};


  const handleDeleteComment = async (reviewId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/review/${reviewId}`);
      if (response.data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        alert('Bình luận đã được xóa');
      }
    } catch (err) {
      alert('Lỗi khi xóa bình luận');
      console.error(err);
    }
  };

  const handleToggleVisibility = async (reviewId, currentVisible) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/review/toggle-visibility`, {
      reviewId,
      visible: !currentVisible
    });

    if (response.data.success) {
      const updatedReviews = reviews.map((review) =>
        review._id === reviewId ? { ...review, visible: !currentVisible } : review
      );
      setReviews(updatedReviews);
      alert(`Bình luận đã được ${!currentVisible ? 'hiển thị' : 'ẩn'}`);
    }
  } catch (err) {
    alert('Lỗi khi thay đổi trạng thái hiển thị bình luận');
    console.error(err);
  }
};


  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          token: token
        }
      });
      console.log("✅ Users fetched:", response.data);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error("Lỗi khi tải người dùng:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          token: token
        }
      });

      console.log("✅ Orders fetched:", response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/product/list`);
      console.log("✅ Products fetched:", response.data);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
    }
  };
  useEffect(() => {
    fetchReviews();
    fetchUsers();
    fetchOrders();
    fetchProducts();
  }, []);


  const handleReportComment = async (reviewId) => {
    try {
      const response = await axios.post(`http://localhost:4000/api/review/report/${reviewId}`);
      if (response.data.success) {
        alert('Bình luận đã được báo cáo');
      }
    } catch (err) {
      alert('Lỗi khi báo cáo bình luận');
      console.error(err);
    }
  };



  const handleEditComment = (reviewId) => {
    const review = reviews.find(r => r._id === reviewId);
    setEditReview(review);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put('http://localhost:4000/api/review/edit', {
        reviewId: editReview._id,
        comment: editComment
      });

      if (response.data.success) {
        const updatedReviews = reviews.map(review =>
          review._id === editReview._id ? { ...review, comment: editComment } : review
        );
        setReviews(updatedReviews);
        setEditReview(null);
        setEditComment('');
        alert('Bình luận đã được cập nhật');
      }
    } catch (err) {
      alert('Lỗi khi chỉnh sửa bình luận');
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '⭐' : '☆');
    }
    return stars.join(' ');
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="comment-management">
      <h2>Quản lý bình luận</h2>


      <div className="review-list">
        {!Array.isArray(reviews) || reviews.length === 0 ? (
          <p>Chưa có bình luận nào</p>
        ) : (
          reviews.map((review) => {
            const user = Array.isArray(users) ? users.find(u => u._id === review.userId) : null;
            const product = Array.isArray(products) ? products.find(p => p._id === review.productId) : null;
            const order = Array.isArray(orders) ? orders.find(o => o._id === review.orderId) : null;
            

            return (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-user">
                    <strong>
                      {user?.name || `Khách hàng ${review.userId?.slice(-4)}`} ({user?.email || "Không có email"})
                    </strong>
                    <p>{renderStars(review.rating)}</p>
                    <div className="product-info">
                      <strong>Sản phẩm:</strong>
                      {product ? (
                        <div className="product-details">
                          <div className="product-image">
                            <img
                              src={product.image ? `${API_BASE_URL}/uploads/${product.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUwyNSA0NUw1NSA0NUw1NSAzNUwyNSAzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'}
                              alt={product.name || 'Sản phẩm'}
                              className="product-thumbnail"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUwyNSA0NUw1NSA0NUw1NSAzNUwyNSAzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                                e.target.alt = 'Không có hình ảnh';
                              }}
                            />
                          </div>
                          <div className="product-name">
                            {product.name}
                          </div>
                        </div>
                      ) : (
                        <span className="no-product">Không tìm thấy sản phẩm</span>
                      )}
                    </div>

                    <p><strong>Đơn hàng:</strong> {order?._id || "Không tìm thấy đơn hàng"}</p>
                  </div>
                  <div className="review-actions">
                    
                    <button
  onClick={() => handleToggleVisibility(review._id, review.visible)}
  className="toggle-visibility-btn"
>
  {review.visible ? 'Ẩn' : 'Hiện'}
</button>

                  </div>
                </div>
                <p className={review.visible ? '' : 'comment-hidden'}>{review.comment}</p>
                {review.adminReply && (
  <div className="admin-reply">
    <strong>Phản hồi của quản trị viên:</strong>
    <p>{review.adminReply}</p>
  </div>
)}

{!review.adminReply && (
  <>
    {replyingReviewId === review._id ? (
      <div className="admin-reply-box">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Nhập phản hồi..."
        />
        <div className="reply-actions">
          <button onClick={() => handleSendReply(review._id)} className="reply-send-btn">Gửi</button>
          <button onClick={() => setReplyingReviewId(null)} className="reply-cancel-btn">Hủy</button>
        </div>
      </div>
    ) : (
      <button
        onClick={() => {
          setReplyingReviewId(review._id);
          setReplyText('');
        }}
        className="reply-btn"
      >
        Trả lời
      </button>
    )}
  </>
)}

                <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
              </div>
            );
          })
        )}
      </div>



      {/* Modal chỉnh sửa bình luận */}
      {editReview && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Chỉnh sửa bình luận</h3>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="save-btn">Lưu</button>
              <button onClick={() => setEditReview(null)} className="cancel-btn">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagementPage;

// models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },

  visible: {
  type: Boolean,
  default: true
},

adminReply: {
  type: String,
  default: ''
}
});


// Index để tối ưu query
reviewSchema.index({ productId: 1, date: -1 });
reviewSchema.index({ userId: 1, date: -1 });
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

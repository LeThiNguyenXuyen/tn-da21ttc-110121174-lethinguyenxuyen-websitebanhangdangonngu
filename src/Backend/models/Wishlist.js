// models/Wishlist.js
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Index để tối ưu query và đảm bảo unique
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
wishlistSchema.index({ userId: 1, addedAt: -1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;

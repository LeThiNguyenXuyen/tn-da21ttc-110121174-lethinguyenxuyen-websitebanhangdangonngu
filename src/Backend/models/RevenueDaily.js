// models/RevenueDaily.js
import mongoose from 'mongoose';

const revenueDailySchema = new mongoose.Schema({
  date: {
    type: String, // dạng YYYY-MM-DD
    required: true,
    unique: true
  },
  revenue: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('RevenueDaily', revenueDailySchema);

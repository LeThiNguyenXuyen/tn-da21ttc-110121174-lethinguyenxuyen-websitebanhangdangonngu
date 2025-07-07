// models/Address.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  email: String,
  street: String,
  city: String,
  state: String,
  zipcode: String,
  country: String,
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 👇 Tránh lỗi OverwriteModelError nếu đã có model
const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address;

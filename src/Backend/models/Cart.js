// models/CartModel.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },       // Sử dụng itemId, KHÔNG dùng _id
  name: { type: String, required: true },
  image: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  hasPromotion: { type: Boolean, default: false },
  promotion: { type: Object, default: null },
  discountPercentage: { type: Number, default: 0 },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
}, { _id: false }); // _id: false để tránh Mongo tự tạo _id cho mỗi item

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // Firebase UID (string)
  cartData: {
    type: [cartItemSchema],
    default: [],
  },
}, { timestamps: true });

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);
export default cartModel;

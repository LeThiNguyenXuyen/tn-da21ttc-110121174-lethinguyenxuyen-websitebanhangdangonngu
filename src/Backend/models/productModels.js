// ✅ productModel.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  importPrice: Number, // ✅ Giá nhập
  price: Number,       // ✅ Giá bán
  category: String,
  brand: String,
  sizes: [String],
  image: String,
  description: String,
  quantity: { type: Number, default: 0 }, // ✅ Số lượng tồn kho
});

const productModel = mongoose.model("Product", productSchema);
export default productModel;
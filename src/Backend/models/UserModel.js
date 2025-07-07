// models/UserModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firebaseUid: { type: String, unique: true, required: false },  // Lưu firebaseUid riêng biệt
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  otp: { type: String },
  otpExpires: { type: Date },
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;

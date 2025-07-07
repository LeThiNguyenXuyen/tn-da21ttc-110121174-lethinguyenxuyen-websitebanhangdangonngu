import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from "../models/UserModel.js";  // Đảm bảo bạn sử dụng đúng userModel

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  const { username, email, password, firebaseUid } = req.body;  // Lấy firebaseUid từ request

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new userModel({ 
      name: username, 
      email, 
      password: hashed, 
      firebaseUid  // Lưu firebaseUid
    });

    await user.save();
    res.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email không đúng' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.message });
  }
});

export default router;

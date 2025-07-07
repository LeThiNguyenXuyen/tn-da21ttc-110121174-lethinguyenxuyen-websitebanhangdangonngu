import userModel from "../models/UserModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import nodemailer from "nodemailer";

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Sai mật khẩu" });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      userId: user._id,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi máy chủ khi đăng nhập" });
  }
}

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Đăng ký người dùng
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email đã được sử dụng" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Email không hợp lệ" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Mật khẩu quá ngắn" });
    }

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires
    });

    await user.save();

    // Gửi OTP vào email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: email,
      subject: "Xác thực đăng ký Orchard Perfume",
      html: `<p>Mã xác thực (OTP) của bạn là: <b>${otp}</b><br>Hạn sử dụng: 10 phút</p>`
    });

    return res.json({ success: true, message: "Đã gửi mã OTP đến email" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi máy chủ" });
  }
};

const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      to: email,
      subject: "Đặt lại mật khẩu - Orchard Perfume",
      html: `<p>Mã OTP đặt lại mật khẩu là: <b>${otp}</b><br>Hiệu lực trong 10 phút.</p>`
    });

    return res.json({ success: true, message: "Đã gửi mã OTP đến email" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi gửi OTP" });
  }
};
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Mật khẩu quá ngắn (tối thiểu 8 ký tự)" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Đặt lại mật khẩu thành công" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi khi đặt lại mật khẩu" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    if (user.isActive) {
      // Nếu muốn cấp token luôn cả khi isActive = true
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        message: "Tài khoản đã được kích hoạt",
        token,
        userId: user._id,
        name: user.name
      });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.json({ success: false, message: "OTP không đúng hoặc đã hết hạn" });
    }

    user.isActive = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Xác thực thành công",
      token,
      userId: user._id,
      name: user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


export { loginUser, registerUser,verifyOtp, sendResetOtp, resetPassword };

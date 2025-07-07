import express from "express";
import { loginUser, registerUser,verifyOtp,sendResetOtp,resetPassword } from "../controllers/userController.js";

const userRouter = express.Router(); // Đổi đúng tên

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser); // Thêm dấu '/'
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/send-reset-otp", sendResetOtp);      // 🆕 gửi OTP
userRouter.post("/reset-password", resetPassword);
export default userRouter;

import jwt from "jsonwebtoken";

const authJWT = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: "Không được phép truy cập. Vui lòng đăng nhập lại" });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET || "random#secret");

    // Đảm bảo req.body tồn tại cho POST requests
    if (!req.body) {
      req.body = {};
    }

    // Log thông tin token đã được giải mã
    console.log("✅ Token decoded:", token_decode);

    // Set userId cho cả req.body và req.user
    req.body.userId = token_decode.id;  // Set vào body
    req.user = { id: token_decode.id }; // Set vào req.user

    console.log("✅ JWT token verified for user:", token_decode.id);
    next();
  } catch (error) {
    console.log("❌ JWT token verification failed:", error.message);
    res.json({ success: false, message: "JWT token không hợp lệ" });
  }
};

export default authJWT;

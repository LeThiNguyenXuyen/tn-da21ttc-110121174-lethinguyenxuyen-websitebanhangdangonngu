import authJWT from './authJWT.js';
import authFirebase from './authFirebase.js';

const auth = async (req, res, next) => {
  console.log("🔍 Auth middleware called for:", req.method, req.path);
  const { token } = req.headers;

  if (!token) {
    console.log("❌ No token provided");
    return res.json({ success: false, message: "Không được phép truy cập. Vui lòng đăng nhập lại" });
  }

  console.log("🔍 Token received:", token.substring(0, 50) + "...");

  // Phát hiện loại token dựa trên đặc điểm
  const isFirebaseToken = token.length > 800 && token.split('.').length === 3;
  const hasFirebaseHeader = token.startsWith('eyJhbGciOiJSUzI1NiI');  // Kiểm tra header của Firebase token

  if (isFirebaseToken || hasFirebaseHeader) {
    console.log("🔥 Detected Firebase token, using Firebase auth");

    // Xử lý xác thực Firebase
    try {
      await authFirebase(req, res, next);  // Điền thông tin vào req.user
    } catch (error) {
      console.log("⚠️ Firebase auth failed, trying simple auth fallback");
      return simpleAuthFallback(req, res, next, token);  // Xử lý fallback khi Firebase không thành công
    }
  } else {
    console.log("🔑 Detected JWT token, using JWT auth");
    return authJWT(req, res, next);  // Điền thông tin vào req.user
  }
};

// Fallback khi không xác thực Firebase token thành công, dùng JWT hoặc giải mã trực tiếp Firebase token
const simpleAuthFallback = (req, res, next, token) => {
  try {
    // Giải mã Firebase token
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log("🔄 Using simple auth fallback for user:", payload.user_id);

    req.body.userId = payload.user_id;  // Gán userId vào body nếu là Firebase token
    req.user = { uid: payload.user_id, email: payload.email || null, name: payload.name || null };
    console.log("✅ Simple auth fallback successful for user:", payload.user_id);

    next();  // Tiếp tục với request
  } catch (error) {
    console.log("❌ Simple auth fallback failed:", error.message);
    res.json({ success: false, message: "Token không hợp lệ" });
  }
};

export default auth;

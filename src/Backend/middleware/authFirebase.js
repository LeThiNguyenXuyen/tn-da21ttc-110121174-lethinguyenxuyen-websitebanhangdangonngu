// middleware/authFirebase.js
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../config/firebaseServiceAccount.json');


// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
} else {
  console.log("🔥 Firebase Admin already initialized");
}

const authFirebase = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: "Không được phép truy cập. Vui lòng đăng nhập lại" });
  }

  try {
    console.log("🔥 Verifying Firebase token...");

    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token, true);

    console.log("🔥 Firebase token decoded:", {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      iss: decoded.iss,
      aud: decoded.aud
    });

    // Đảm bảo req.body tồn tại cho POST requests
    if (!req.body) {
      req.body = {};
    }

    // Set userId cho cả req.body và req.user
    req.body.userId = decoded.uid;
    req.user = {
      uid: decoded.uid,
      id: decoded.uid,
      userId: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null
    };

    console.log("✅ Firebase token verified for user:", decoded.uid, "email:", decoded.email);
    next();
  } catch (error) {
    console.log("❌ Firebase token verification failed:", error.message);
    console.log("❌ Error code:", error.code);
    console.log("❌ Error details:", error);

    res.json({
      success: false,
      message: "Firebase token không hợp lệ: " + error.message,
      errorCode: error.code
    });
  }
};

export default authFirebase;

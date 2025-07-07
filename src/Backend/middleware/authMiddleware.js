// middleware/authMiddleware.js
import admin from 'firebase-admin';
import serviceAccount from '../config/firebaseServiceAccount.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const requireLogin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null, // fallback nếu không có
};
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

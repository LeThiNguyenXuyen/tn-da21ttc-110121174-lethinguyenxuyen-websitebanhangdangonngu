// config/firebaseAdmin.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Đường dẫn tuyệt đối đến file JSON
const serviceAccountPath = path.resolve('./config/firebaseServiceAccount.json');

// Đọc nội dung và parse JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

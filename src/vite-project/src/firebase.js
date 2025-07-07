// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZz2VdtujT11pF0HZQMqGCu2Hr8acdk1Q",
  authDomain: "webbanhang-e3dfe.firebaseapp.com",
  projectId: "webbanhang-e3dfe",
  storageBucket: "webbanhang-e3dfe.firebasestorage.app",
  messagingSenderId: "618813069721",
  appId: "1:618813069721:web:cdbdb026960da479eadb08",
  measurementId: "G-YCTTKJSNYP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Cấu hình để tránh CORS issues
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, signInWithPopup, signOut };

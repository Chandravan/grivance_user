// src/firebaseConfig.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvszyysrWYMq5CRviCFRKCchGPiZ4_Dpc",
  authDomain: "grievance-sys-2025.firebaseapp.com",
  projectId: "grievance-sys-2025",
  storageBucket: "grievance-sys-2025.firebasestorage.app",
  messagingSenderId: "4942010481",
  appId: "1:4942010481:web:5fdbdbce6c61ac6ffea3d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };

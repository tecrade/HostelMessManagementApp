import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkGlefdzV97BcYLVwLWXQxQzz7nQSkz8I",
  authDomain: "messapp-501814.firebaseapp.com",
  projectId: "messapp-501814",
  storageBucket: "messapp-501814.firebasestorage.app",
  messagingSenderId: "127519411103",
  appId: "1:127519411103:web:dce2d4a4290cfea7568baa",
  measurementId: "G-YT7TQR8EBG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

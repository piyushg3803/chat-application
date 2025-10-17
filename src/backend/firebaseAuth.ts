// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "@firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-4e74b.firebaseapp.com",
  projectId: "chatapp-4e74b",
  storageBucket: "chatapp-4e74b.firebasestorage.app",
  messagingSenderId: "927892028718",
  appId: "1:927892028718:web:00ed5cf640c1adfa4c4ebf",
  measurementId: "G-BMFT276YYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)
const auth = getAuth(app)

getAuth().authStateReady();

export { app, analytics, db, auth }

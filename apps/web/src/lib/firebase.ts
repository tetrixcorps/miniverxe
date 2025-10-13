import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TEMP: Hardcoded config for debugging
const firebaseConfig = {
  apiKey: "AIzaSyCAg70wIYtFwKDafodE6kkcRffuk0ewL5w",
  authDomain: "rtc-7b55d.firebaseapp.com",
  projectId: "fir-rtc-7b55d",
  storageBucket: "fir-rtc-7b55d.appspot.com",
  messagingSenderId: "1073036366262",
  appId: "1:1073036366262:web:a76a0e270753f3e9497117",
};

console.log("FIREBASE CONFIG (HARDCODED):", firebaseConfig);

// Check if app already exists to prevent duplicate initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 
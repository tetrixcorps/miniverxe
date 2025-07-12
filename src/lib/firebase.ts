import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAg70wIYtFwKDafodE6kkcRffuk0ewL5w",
  authDomain: "fir-rtc-7b55d.firebaseapp.com",
  projectId: "fir-rtc-7b55d",
  storageBucket: "fir-rtc-7b55d.appspot.com",
  messagingSenderId: "1073036366262",
  // appId is optional for most frontend auth flows
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
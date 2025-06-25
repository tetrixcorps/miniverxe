// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

// Your Firebase configuration object
// TODO: Replace with your complete Firebase web app configuration
// Get this from Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY || "AIzaSyCAg70wIYtFwKDafodE6kkcRffuk0ewL5w",
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN || "fir-rtc-7b55d.firebaseapp.com",
  projectId: import.meta.env.FIREBASE_PROJECT_ID || "fir-rtc-7b55d",
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET || "fir-rtc-7b55d.appspot.com",
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID || "1073036366262",
  appId: import.meta.env.FIREBASE_APP_ID || "1:1073036366262:web:a76a0e270753f3e9497117"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Function to submit contact form data
export async function submitContactForm(formData) {
  try {
    const docRef = await addDoc(collection(db, 'contact_submissions'), {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      timestamp: serverTimestamp(),
      status: 'new'
    });
    
    console.log('Contact form submitted with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting contact form: ', error);
    return { success: false, error: error.message };
  }
}

// Function to get all contact submissions (for admin panel)
export async function getContactSubmissions() {
  try {
    const querySnapshot = await getDocs(collection(db, 'contact_submissions'));
    const submissions = [];
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return submissions;
  } catch (error) {
    console.error('Error getting contact submissions: ', error);
    return [];
  }
}

export { db }; 
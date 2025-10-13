// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { env } from './env.js';

// Firebase configuration object for TETRIX application
// Configuration loaded from centralized environment management
const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId
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
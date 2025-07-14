import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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

export const getContactSubmissions = async () => {
  try {
    const submissionsCol = collection(db, 'contact-submissions');
    const submissionsSnapshot = await getDocs(submissionsCol);
    return submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    throw new Error('Failed to fetch contact submissions');
  }
};

export const submitContactForm = async (data: Record<string, any>) => {
  try {
    const submissionsCol = collection(db, 'contact-submissions');
    const docRef = await addDoc(submissionsCol, {
      ...data,
      timestamp: new Date(),
      status: 'new',
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: error.message };
  }
}; 
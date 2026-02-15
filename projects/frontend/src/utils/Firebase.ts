import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // <--- NEW IMPORT

const firebaseConfig = {
  apiKey: "AIzaSyA2IO7DO7qoB1gg0jOxWBMvjKrwYEivRSU",
  authDomain: "commifi.firebaseapp.com",
  projectId: "commifi",
  storageBucket: "commifi.firebasestorage.app",
  messagingSenderId: "855761291550",
  appId: "1:855761291550:web:932dd3ce01707fdfc1e10f",
  measurementId: "G-7FRW6HD9GY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- EXPORT STORAGE
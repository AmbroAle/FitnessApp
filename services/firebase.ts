// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBemt3IehXEbzDzWXI9v__LRjugeIWAis",
  authDomain: "fitnessapp-e83a4.firebaseapp.com",
  projectId: "fitnessapp-e83a4",
  storageBucket: "fitnessapp-e83a4.firebasestorage.app",
  messagingSenderId: "329295534455",
  appId: "1:329295534455:web:57d7bb30412460822fa972",
  measurementId: "G-DG64908M4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
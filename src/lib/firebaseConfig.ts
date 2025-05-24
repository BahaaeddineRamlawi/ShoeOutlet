import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBH4XEP9k9MuJWVQXgn_0uzXLtT2w4kQO4",
  authDomain: "my-e-commerce-free.firebaseapp.com",
  projectId: "my-e-commerce-free",
  storageBucket: "my-e-commerce-free.firebasestorage.app",
  messagingSenderId: "234369360208",
  appId: "1:234369360208:web:f285afacd0d01beeaf8c55",
  measurementId: "G-GECT4WWJ4B",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
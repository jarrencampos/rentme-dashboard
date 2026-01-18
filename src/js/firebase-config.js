// js/firebase-config.js - Centralized Firebase Configuration
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-8sarU_q2gdfBSLQAUhNlnbmj3T2o8nA",
  authDomain: "ryntit-b503c.firebaseapp.com",
  databaseURL: "https://ryntit-b503c-default-rtdb.firebaseio.com",
  projectId: "ryntit-b503c",
  storageBucket: "ryntit-b503c.appspot.com",
  messagingSenderId: "908115066071",
  appId: "1:908115066071:web:1de252c17cce4346be0492",
  measurementId: "G-PDBZNLKYKC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Re-export all Firebase functions for use across the app
export {
  // Auth
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  // Firestore
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  Timestamp,
  arrayUnion,
  // Storage
  ref,
  uploadBytesResumable,
  getDownloadURL
};

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
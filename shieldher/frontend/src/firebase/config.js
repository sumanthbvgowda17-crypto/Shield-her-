import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// These are placeholders for the Firebase configuration.
// Replace them with your actual Firebase project config.
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDemoPurposes12345",
  authDomain: "shieldher-demo.firebaseapp.com",
  databaseURL: "https://shieldher-demo-default-rtdb.firebaseio.com",
  projectId: "shieldher-demo",
  storageBucket: "shieldher-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// ✅ Auth
export const auth = getAuth(app);

// ✅ Firestore (FIXED)
export const db = getFirestore(app);

// ✅ Google Provider
export const googleProvider = new GoogleAuthProvider();

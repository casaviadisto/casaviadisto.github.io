import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getDatabase} from "firebase/database";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyArorV6s1Y84MY5DDxrsqTU8Coi7e-2v5w",
    authDomain: "web-lr4.firebaseapp.com",
    databaseURL: "https://web-lr4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "web-lr4",
    storageBucket: "web-lr4.firebasestorage.app",
    messagingSenderId: "489955989215",
    appId: "1:489955989215:web:7fe413d5ff674f7cd23b6a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
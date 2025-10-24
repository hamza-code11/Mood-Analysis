import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA_FXNcqL7YZy2zZ3XKE6OmsD4nvzHgIrA",
  authDomain: "project-3486b.firebaseapp.com",
  projectId: "project-3486b",
  storageBucket: "project-3486b.appspot.com",
  messagingSenderId: "174581193299",
  appId: "1:174581193299:web:76797093d38a85a296c4a6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

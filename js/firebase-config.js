// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDBhTRc-6arb4enak5hVaPFU2rnywPP9nw",
    authDomain: "appointment-app-36a26.firebaseapp.com",
    projectId: "appointment-app-36a26",
    storageBucket: "appointment-app-36a26.appspot.com",
    messagingSenderId: "432871478315",
    appId: "1:432871478315:web:1f7d24ec6acbf6aad1066e",
    measurementId: "G-QJLP652MR2"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db,storage };

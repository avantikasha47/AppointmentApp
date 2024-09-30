// Firebase and other imports
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Function to show the login form and hide the register form
function showLoginForm() {
    document.getElementById('student-login-form').classList.remove('hidden');
    document.getElementById('student-register-form').classList.add('hidden');
}

// Function to show the register form and hide the login form
function showRegisterForm() {
    document.getElementById('student-login-form').classList.add('hidden');
    document.getElementById('student-register-form').classList.remove('hidden');
}

// Initialize the forms to display the login form by default
document.addEventListener('DOMContentLoaded', () => {
    showLoginForm();
});

// Toggle between login and register forms
document.getElementById('show-login').addEventListener('click', showLoginForm);
document.getElementById('show-register').addEventListener('click', showRegisterForm);

// Handle student registration
document.getElementById('student-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const department = document.getElementById('register-department').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the user's profile with the display name
        await updateProfile(user, {
            displayName:name
        });

        // Add student details to Firestore
        await addDoc(collection(db, "students"), {
            name: name,
            department: department,
            email: email,
            uid: user.uid,
            displayName: user.displayName // Store the display name
        });

        alert('Student registered successfully!');
        window.location.href = 'student-login-register.html'; // Redirect to login/register page
    } catch (error) {
        console.error('Registration failed:', error);
        alert('Failed to register: ' + error.message);
    }
});

// Handle student login
document.getElementById('student-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        

        window.location.href = 'student.html'; // Redirect to the student homepage after successful login
    } catch (error) {
        console.error('Login failed:', error);
        alert('Failed to login: ' + error.message);
    }
});

// Handle Home button click to redirect to the home page
document.getElementById('home-btn').addEventListener('click', () => {
    window.location.href = 'index.html'; // Update with your actual home page URL
});

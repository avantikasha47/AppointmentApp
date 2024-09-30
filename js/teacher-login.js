import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Handle form submission for teacher login
document.getElementById('teacher-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get input values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Authenticate teacher
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Redirect to teacher homepage after successful login
        window.location.href = 'teacher.html';
    } catch (error) {
        console.error('Login failed:', error);
        alert('Failed to login: ' + error.message);
    }
});

// Handle Home button click
document.getElementById('home-btn').addEventListener('click', () => {
    // Redirect to the home page
    window.location.href = 'index.html'; // Update 'index.html' with your actual home page
});

// Handle Logout button click
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        // Sign out the user
        await signOut(auth);
        alert('Logged out successfully.');
        // Redirect to login page after logout
        window.location.href = 'index.html'; // Redirect to your login or landing page
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to logout: ' + error.message);
    }
});

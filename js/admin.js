import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Wait until DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Get the form and add an event listener for the submit event
    const addTeacherForm = document.getElementById('add-teacher-form');
    
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission behavior

            // Get form values
            const name = document.getElementById('name').value;
            const department = document.getElementById('department').value;
            const subject = document.getElementById('subject').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Create a new teacher account using Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Set the display name for the teacher (so it appears when they log in)
                await updateProfile(user, {
                    displayName: name
                    
                });

                // Add the teacher's additional information to Firestore
                await setDoc(doc(db, 'teachers', user.uid), {
                    name: name,
                    email: email,
                    department: department,
                    subject: subject,
                    uid: user.uid // Store the UID of the teacher for future reference
                });

                // Notify the admin that the teacher was added successfully
                alert("Teacher added successfully!");

                // Clear the form
                addTeacherForm.reset();
            } catch (error) {
                console.error("Error adding teacher: ", error.message);
                alert("Failed to add teacher: " + error.message);
            }
        });
    }

    // Home button functionality
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html'; // Redirect to the Admin home page
        });
    }

    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'admin-login.html'; // Redirect to the main index page (logout)
        });
    }
});

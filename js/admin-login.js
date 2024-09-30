document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('error-message');

    // Predefined admin credentials
    const validAdminId = 'admin123'; // Predefined Admin ID
    const validAdminPassword = 'password123'; // Predefined Admin Password

    // Handle login form submission
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting

        // Get entered admin ID and password
        const enteredAdminId = document.getElementById('admin-id').value.trim(); // Trimmed to remove extra spaces
        const enteredPassword = document.getElementById('admin-password').value.trim();

        // Validate credentials
        if (enteredAdminId === validAdminId && enteredPassword === validAdminPassword) {
            // If valid, redirect to the admin dashboard
            window.location.href = 'admin1.html'; // Admin dashboard page
        } else {
            // If invalid, show an error message
            if (errorMessage) {
                errorMessage.textContent = 'Invalid Admin ID or Password';
                errorMessage.style.display = 'block'; // Ensure it's visible
            }
        }
    });

    // Optional: You can hide the error message when the user starts typing again
    document.getElementById('admin-id').addEventListener('input', () => {
        if (errorMessage) errorMessage.style.display = 'none'; // Hide when input changes
    });
    document.getElementById('admin-password').addEventListener('input', () => {
        if (errorMessage) errorMessage.style.display = 'none'; // Hide when input changes
    });

    // Home button functionality
    document.getElementById('home-btn').addEventListener('click', () => {
        try {
            // Redirect to the index.html (home page)
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Redirect to home failed:', error);
            alert('Failed to navigate to home: ' + error.message);
        }
    });
});

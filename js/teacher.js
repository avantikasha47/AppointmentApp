import { auth, db, storage } from './firebase-config.js'; 
import { 
    onAuthStateChanged, 
    signOut, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Ensure the DOM is fully loaded before running any scripts
document.addEventListener('DOMContentLoaded', () => {

    // Check if a user is logged in and display their details in the navbar
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const teacherName = document.getElementById('teacher-name');
            const teacherEmail = document.getElementById('teacher-email');
            const teacherPhoto = document.getElementById('teacher-photo');
            const profileUpload = document.getElementById('profile-picture-upload');
            const homeBtn = document.getElementById('home-btn');
            const logoutBtn = document.getElementById('logout-btn');

            // Ensure these elements exist before interacting with them
            if (teacherName && teacherEmail && teacherPhoto) {
                teacherName.textContent = `Name: ${user.displayName || 'Teacher'}`;
                teacherEmail.textContent = `Email: ${user.email}`;
                
                if (user.photoURL) {
                    teacherPhoto.src = user.photoURL;
                }

                // Profile photo click and upload functionality
                if (teacherPhoto && profileUpload) {
                    teacherPhoto.addEventListener('click', () => {
                        profileUpload.click();
                    });

                    profileUpload.addEventListener('change', (event) => {
                        updateProfilePhoto(event.target.files[0]);
                    });
                }
            }

            // Home button functionality
            if (homeBtn) {
                homeBtn.addEventListener('click', () => {
                    window.location.href = 'index.html'; 
                });
            }

            // Logout button functionality
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await signOut(auth);
                    window.location.href = 'teacher-login.html'; 
                });
            }

            // Fetch pending appointment requests
            fetchAppointmentRequests(user.uid);
        } else {
            window.location.href = 'teacher-login.html';
        }
    });

    // Search for students by name or email
    const searchBtn = document.getElementById('student-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const studentQuery = document.getElementById('student-search').value.trim();
            if (studentQuery) {
                searchStudents(studentQuery);
            }
        });
    }

    // Dropdown functionality for profile icon
    const profileIcon = document.getElementById('profile-icon');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const dropdownMenu = document.getElementById('profile-dropdown');

    const toggleDropdown = () => {
        if (dropdownMenu) {
            dropdownMenu.classList.toggle('active');
        }
    };

    if (profileIcon) {
        profileIcon.addEventListener('click', toggleDropdown);
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleDropdown);
    }

    // Fetch appointment requests after ensuring teacherId is available
    const teacherId = '123456'; // Replace with actual teacherId
    fetchAppointmentRequests(teacherId);
});

// Function to update profile photo
async function updateProfilePhoto(file) {
    const user = auth.currentUser;

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    try {
        const storageRef = ref(storage, `profilePhotos/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        await updateProfile(user, { photoURL: downloadURL });
        document.getElementById('teacher-photo').src = downloadURL;

        alert('Profile photo updated successfully!');
    } catch (error) {
        console.error('Error updating profile photo:', error);
        alert('Failed to update profile photo: ' + error.message);
    }
}

// Search for students by name or email
async function searchStudents(studentQuery) {
    const usersRef = collection(db, 'students'); 
    const searchTerms = studentQuery.split(',').map(term => term.trim());

    const resultsDiv = document.getElementById('student-results');
    resultsDiv.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="student-table-body"></tbody>
    `;
    resultsDiv.appendChild(table);

    const tableBody = document.getElementById('student-table-body');
    let studentResults = [];

    for (const term of searchTerms) {
        const nameQuery = query(
            usersRef,
            where('name', '>=', term.toLowerCase()), 
            where('name', '<=', term.toLowerCase() + '\uf8ff')
        );

        const emailQuery = query(
            usersRef,
            where('email', '==', term)
        );

        const nameSnapshot = await getDocs(nameQuery);
        const emailSnapshot = await getDocs(emailQuery);

        const combinedResults = [...nameSnapshot.docs, ...emailSnapshot.docs];

        combinedResults.forEach(doc => {
            if (!studentResults.some(result => result.id === doc.id)) {
                studentResults.push(doc);
            }
        });
    }

    if (studentResults.length > 0) {
        studentResults.forEach((studentDoc) => {
            const studentData = studentDoc.data();
            const studentRow = document.createElement('tr');

            studentRow.innerHTML = `
                <td>${studentData.name}</td>
                <td>${studentData.email}</td>
                <td>${studentData.department}</td>
                <td class="status">Pending</td>
                <td><button class="btn" data-student-id="${studentDoc.id}">Send Appointment Notice</button></td>
            `;
            tableBody.appendChild(studentRow);

            studentRow.querySelector('button').addEventListener('click', async () => {
                const teacher = auth.currentUser;
                if (teacher) {
                    await addDoc(collection(db, 'appointmentNotices'), {
                        teacherId: teacher.uid,
                        teacherName: teacher.email,
                        studentId: studentData.uid,
                        studentName: studentData.name,
                        status: 'pending',
                    });

                    studentRow.querySelector('.status').textContent = 'Sent';
                    studentRow.querySelector('button').disabled = true; 
                    alert('Appointment notice sent to student!');
                }
            });
        });
    } else {
        resultsDiv.innerHTML = `<p>No students found matching "${studentQuery}".</p>`;
    }
}

// Function to fetch and display appointment requests
async function fetchAppointmentRequests(teacherId) {
    try {
        console.log(`Fetching appointment requests for teacher ID: ${teacherId}`);

        const appointmentRequestsRef = collection(db, 'appointmentRequests');
        const q = query(appointmentRequestsRef, where('teacherId', '==', teacherId));

        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot:", querySnapshot);
        console.log("Number of documents fetched:", querySnapshot.size);

        const responsesDiv = document.getElementById('notice-responses');
        responsesDiv.innerHTML = ''; // Clear previous content

        if (querySnapshot.empty) {
            responsesDiv.innerHTML = `<p>No appointment requests found for this teacher ID.</p>`;
            console.log("No appointment requests found.");
            return; // Exit if no requests found
        }

        // Create the table structure
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Student Email</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="request-table-body"></tbody>
        `;
        responsesDiv.appendChild(table);
        
        const tableBody = document.getElementById('request-table-body');

        // Loop through appointment requests and create rows for each request
        querySnapshot.forEach((requestDoc) => {
            const requestData = requestDoc.data();
            console.log("Request Data:", requestData); // Log the request data

            const requestRow = document.createElement('tr');

            requestRow.innerHTML = `
                <td>${requestData.studentName || 'N/A'}</td>
                <td>${requestData.email || 'N/A'}</td>
                <td class="status">${requestData.status || 'N/A'}</td>
                <td>
                    <button class="approve-btn" data-id="${requestDoc.id}">Approve</button>
                    <button class="reject-btn" data-id="${requestDoc.id}">Reject</button>
                </td>
            `;
            tableBody.appendChild(requestRow);

            // Approve button click event
            requestRow.querySelector('.approve-btn').addEventListener('click', async () => {
                await updateAppointmentStatus(requestDoc.id, 'approved');
                requestRow.querySelector('.status').textContent = 'Approved';
                requestRow.querySelector('.approve-btn').disabled = true;
                requestRow.querySelector('.reject-btn').disabled = true;
            });

            // Reject button click event
            requestRow.querySelector('.reject-btn').addEventListener('click', async () => {
                await updateAppointmentStatus(requestDoc.id, 'rejected');
                requestRow.querySelector('.status').textContent = 'Rejected';
                requestRow.querySelector('.approve-btn').disabled = true;
                requestRow.querySelector('.reject-btn').disabled = true;
            });
        });
    } catch (error) {
        console.error('Error fetching appointment requests:', error);
    }
}

// Function to update appointment status
async function updateAppointmentStatus(requestId, status) {
    try {
        const requestDocRef = doc(db, 'appointmentRequests', requestId);
        await updateDoc(requestDocRef, { status: status });
        console.log(`Appointment request ${requestId} updated to ${status}.`);
    } catch (error) {
        console.error('Error updating appointment status:', error);
    }
}
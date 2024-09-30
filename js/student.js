import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { collection,updateDoc, query, where, getDocs, addDoc,onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Check if a user is logged in and display their details in the navbar
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('student-name').textContent = `Name: ${user.displayName || 'Student'}`;
        document.getElementById('student-email').textContent = `Email: ${user.email}`;
        fetchStudentAppointments(user.uid);
        fetchAppointmentNotices(user.uid);
    } else {
        window.location.href = 'student-login-register.html'; // Redirect to login if not authenticated
    }
});

// Handle logout button
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'student-login-register.html'; // Redirect to login after logout
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out: ' + error.message);
    }
});

// Function to search for teachers by name or subject
async function searchTeachers(searchTerm) {
    const teachersRef = collection(db, 'teachers');

    // Create a query to search teachers by name or subject
    const nameQuery = query(teachersRef, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
    const subjectQuery = query(teachersRef, where('subject', '>=', searchTerm), where('subject', '<=', searchTerm + '\uf8ff'));

    const nameSnapshot = await getDocs(nameQuery);
    const subjectSnapshot = await getDocs(subjectQuery);

    const resultsTableBody = document.getElementById('teacher-results').getElementsByTagName('tbody')[0];
    resultsTableBody.innerHTML = ''; // Clear previous results

    // Combine results from both queries
    const uniqueTeachers = new Set();

    nameSnapshot.forEach((teacherDoc) => {
        const teacherData = teacherDoc.data();
        if (!uniqueTeachers.has(teacherData.uid)) {
            uniqueTeachers.add(teacherData.uid);
            const row = resultsTableBody.insertRow();
            row.innerHTML = `
                <td><strong>${teacherData.name}</strong></td>
                <td>${teacherData.department}</td>
                <td>${teacherData.subject}</td>
                <td>${teacherData.email}</td>
                <td class="status">Pending</td>
                <td>
                <button class="btn request-btn" 
                        data-teacher-id="${teacherDoc.id}" 
                        data-teacher-name="${teacherDoc.name}">Request Appointment</button>
            </td>
            `;
        }
    });

    subjectSnapshot.forEach((teacherDoc) => {
        const teacherData = teacherDoc.data();
        console.log(teacherData);
        if (!uniqueTeachers.has(teacherData.uid)) {
            uniqueTeachers.add(teacherData.uid);
            const row = resultsTableBody.insertRow();
            row.innerHTML = `
                <td><strong>${teacherData.name}</strong></td>
                <td>${teacherData.department}</td>
                <td>${teacherData.subject}</td>
                <td>${teacherData.email}</td>
                <td class="status">Pending</td>
                <td>
                <button class="btn request-btn" 
                        data-teacher-id="${teacherData.id}" 
                        data-teacher-name="${teacherData.name}">Request Appointment</button>
            </td>
            `;
        }
    });

    // Add event listener for appointment requests
    const appointmentButtons = document.querySelectorAll('.request-btn');
    appointmentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const student = auth.currentUser;
            const teacherId = button.getAttribute('data-teacher-id')
            const teacherName = button.getAttribute('data-teacher-name')
            
            if (student) {
                // Send the appointment request
                await addDoc(collection(db, 'appointmentRequests'), {
                    name:teacherName,
                    studentId: student.uid,
                    studentName: student.displayName,
                    teacherId: teacherId,
                    email:student.email,
                    status: 'Sent',
                });

                // Update the UI to show the status as "Sent"
                const row = button.closest('tr'); // Find the closest table row
                const statusCell = row.querySelector('.status');
                if (statusCell) {
                    statusCell.textContent = 'Sent'; // Update status
                }
                button.disabled = true; // Disable the button after sending

                alert('Appointment request sent to teacher!');
            }
        });
    });
}

// Search teachers when the button is clicked
document.getElementById('search-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('subject-search').value.trim().toLowerCase();
    if (searchTerm) {
        searchTeachers(searchTerm);
    } else {
        alert('Please enter a name or subject to search.');
    }
});

// Function to fetch student appointments with real-time updates
async function fetchStudentAppointments(studentId) {
    try {
        const appointmentRequestsRef = collection(db, 'appointmentRequests');
        const q = query(appointmentRequestsRef, where('studentId', '==', studentId));

        // Set up a real-time listener
        onSnapshot(q, async (querySnapshot) => {
            const appointmentsDiv = document.getElementById('appointment-requests');
            appointmentsDiv.innerHTML = ''; // Clear previous content

            if (querySnapshot.empty) {
                appointmentsDiv.innerHTML = `<p>No appointment requests found for this student.</p>`;
                return; // Exit if no appointments found
            }

            // Create a list to display appointment requests
            const list = document.createElement('ul');

            // Array to hold promises for fetching teacher details
            const teacherPromises = [];

            // Loop through appointments and create list items for each request
            querySnapshot.forEach((doc) => {
                const appointmentData = doc.data();
                const teacherId = appointmentData.teacherId; // Get the teacherId from appointment data

                // Push the promise to fetch teacher data
                const teacherPromise = getTeacherDetails(teacherId).then((teacherData) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                         <div class="card">
                        <strong>Teacher:</strong> ${teacherData.name || 'N/A'} <br>
                        <strong>Email:</strong> ${teacherData.email || 'N/A'} <br>
                        <strong>Status:</strong> ${appointmentData.status || 'N/A'} <br>
                        </div>
                    `;

                    list.appendChild(listItem);
                });

                teacherPromises.push(teacherPromise); // Store the promise
            });

            // Wait for all teacher data to be fetched before displaying
            await Promise.all(teacherPromises);
            appointmentsDiv.appendChild(list);
        });
    } catch (error) {
        console.error('Error fetching student appointments:', error);
    }
}

// Function to fetch teacher details based on teacherId
async function getTeacherDetails(teacherId) {
    const teachersRef = collection(db, 'teachers');
    const teacherQuery = query(teachersRef, where('uid', '==', teacherId)); // Adjust the field name as necessary
    const teacherSnapshot = await getDocs(teacherQuery);
    
    if (!teacherSnapshot.empty) {
        const teacherDoc = teacherSnapshot.docs[0];
        return { name: teacherDoc.data().name, email: teacherDoc.data().email }; // Return teacher's name and email
    }
    
    return { name: 'N/A', email: 'N/A' }; // Default values if teacher not found
}


// Function to fetch and display appointment notices for the student portal
async function fetchAppointmentNotices(studentId) {
    try {
        const appointmentRequestsRef = collection(db, 'appointmentNotices');
        const q = query(appointmentRequestsRef, where('studentId', '==', studentId));

        const querySnapshot = await getDocs(q);
       
        const responsesDiv = document.getElementById('notice-responses');
        responsesDiv.innerHTML = ''; // Clear previous content

        if (querySnapshot.empty) {
            responsesDiv.innerHTML = `<p>No appointment requests found for this student ID.</p>`;
            return; // Exit if no requests found
        }

        // Create the table structure
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Teacher Name</th>
                    <th>Teacher Email</th>
                </tr>
            </thead>
            <tbody id="request-table-body"></tbody>
        `;
        responsesDiv.appendChild(table);
        
        const tableBody = document.getElementById('request-table-body');

        // Loop through appointment requests and create rows for each request
        const teacherPromises = []; // Array to hold promises for fetching teacher details

        querySnapshot.forEach((requestDoc) => {
            const requestData = requestDoc.data();
            const teacherId = requestData.teacherId; // Get teacherId from the request
            
            // Push the promise to fetch teacher data
            const teacherPromise = fetchTeacherDetails(teacherId).then((teacherData) => {
                const requestRow = document.createElement('tr');
                requestRow.innerHTML = `
                    <td>${teacherData.name || 'N/A'}</td>
                    <td>${teacherData.email || 'N/A'}</td>
                `;
                tableBody.appendChild(requestRow);
            });
            
            teacherPromises.push(teacherPromise); // Store promise for later
        });

        // Wait for all teacher data to be fetched before resolving
        await Promise.all(teacherPromises);
        
    } catch (error) {
        console.error('Error fetching appointment requests:', error);
    }
}

// Function to fetch teacher details based on teacherId
async function fetchTeacherDetails(teacherId) {
    const teachersRef = collection(db, 'teachers');
    const teacherQuery = query(teachersRef, where('uid', '==', teacherId)); // Assuming 'uid' is the field that corresponds to teacherId
    const teacherSnapshot = await getDocs(teacherQuery);
    
    if (!teacherSnapshot.empty) {
        const teacherDoc = teacherSnapshot.docs[0];
        return { name: teacherDoc.data().name, email: teacherDoc.data().email }; // Return the teacher data
    }
    
    return { name: 'N/A', email: 'N/A' }; // Default values if teacher not found
}

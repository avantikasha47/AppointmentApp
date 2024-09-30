import { db } from './firebase-config.js';
import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Reference to the Firestore 'teachers' collection
const teachersCollectionRef = collection(db, 'teachers');

// Fetch and display the teacher data
async function loadTeachers() {
    const teacherList = document.getElementById('teacher-list');
    teacherList.innerHTML = ''; // Clear the table body

    const querySnapshot = await getDocs(teachersCollectionRef);
    querySnapshot.forEach((doc) => {
        const teacher = doc.data();
        const row = `
            <tr data-id="${doc.id}">
                <td>${teacher.name}</td>
                <td>${teacher.department}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.email}</td>
                <td>
                    <button class="btn update-btn" data-id="${doc.id}">Update</button>
                    <button class="btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            </tr>
        `;
        teacherList.innerHTML += row;
    });

    // Attach event listeners for dynamically created buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => deleteTeacher(button.getAttribute('data-id')));
    });

    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', () => updateTeacher(button.getAttribute('data-id')));
    });
}

// Function to delete a teacher
async function deleteTeacher(teacherId) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        try {
            await deleteDoc(doc(db, 'teachers', teacherId));
            alert('Teacher deleted successfully');
            document.querySelector(`tr[data-id="${teacherId}"]`).remove(); // Remove row from DOM
        } catch (error) {
            console.error('Error deleting teacher:', error);
            alert('Failed to delete teacher');
        }
    }
}

// Function to update a teacher's information (partial update allowed)
async function updateTeacher(teacherId) {
    const newName = prompt('Enter the new name (leave blank to keep current):');
    const newDepartment = prompt('Enter the new department (leave blank to keep current):');
    const newSubject = prompt('Enter the new subject (leave blank to keep current):');
    
    // Create an object to hold the updated fields
    const updates = {};

    // Only add fields to updates if they are not empty
    if (newName) updates.name = newName;
    if (newDepartment) updates.department = newDepartment;
    if (newSubject) updates.subject = newSubject;
    
    // If at least one field has been updated, perform the update
    if (Object.keys(updates).length > 0) {
        try {
            const teacherRef = doc(db, 'teachers', teacherId);
            await updateDoc(teacherRef, updates);

            // Update the row in the DOM with the new values if provided
            const row = document.querySelector(`tr[data-id="${teacherId}"]`);
            if (newName) row.children[0].textContent = newName;
            if (newDepartment) row.children[1].textContent = newDepartment;
            if (newSubject) row.children[2].textContent = newSubject;

            alert('Teacher updated successfully');
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Failed to update teacher');
        }
    } else {
        alert('No fields were updated.');
    }
}

// Handle home button click
document.getElementById('home-btn').addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to home page
});

// Handle logout button click
document.getElementById('logout-btn').addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to login page
});

// Load the teachers when the page is loaded
window.onload = loadTeachers;

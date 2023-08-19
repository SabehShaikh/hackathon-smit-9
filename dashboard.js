import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { collection, addDoc, getFirestore, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBHO2psCdz8PwHkXtN293GEq5MhsZ02UD8",
    authDomain: "hackathon-9eef8.firebaseapp.com",
    projectId: "hackathon-9eef8",
    storageBucket: "hackathon-9eef8.appspot.com",
    messagingSenderId: "771294258194",
    appId: "1:771294258194:web:4a130d2835604d1655a4cb"
  };
;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ids = [];
let total = 0;

// ... your existing code ...

const blogContainer = document.getElementById("blogContainer");

const publishBlog = async () => {
    const blogTitleInput = document.getElementById("blogTitle");
    const blogContentInput = document.getElementById("blogContent");

    const blogTitle = blogTitleInput.value;
    const blogContent = blogContentInput.value;

    if (!blogTitle || !blogContent) {
        alert("Please enter both blog title and content.");
        return;
    }

    try {
        const date = new Date().toLocaleString();
        const docRef = await addDoc(collection(db, "blogs"), {
            title: blogTitle,
            content: blogContent,
            time: date
        });

        blogTitleInput.value = "";
        blogContentInput.value = "";
    } catch (err) {
        console.log(err);
    }
};

const getBlogs = () => {
    onSnapshot(collection(db, "blogs"), (snapshot) => {
        blogContainer.innerHTML = ""; // Clear existing content

        snapshot.forEach((blogDoc) => {
            const blogData = blogDoc.data();
            const blogCard = document.createElement("div");
            blogCard.classList.add("card", "mt-3");
            blogCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${blogData.title}</h5>
                    <p class="card-text">${blogData.content}</p>
                    <small>${blogData.time}</small>
                    <button onclick='deleteBlog("${blogDoc.id}")'>Delete</button> 
                    <button onclick='editBlog("${blogDoc.id}")'>Edit</button>
                </div>
            `;
            blogContainer.appendChild(blogCard);
        });
    });
};

getBlogs();

const editBlog = async (id) => {
    const newText = prompt("Edit blog content:");
    if (newText !== null) {
        try {
            await updateDoc(doc(db, "blogs", id), {
                content: newText
            });
        } catch (err) {
            console.log(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while updating the blog.',
            });
        }
    }
};

const deleteBlog = async (id) => {
    const confirmation = confirm("Are you sure you want to delete this blog?");
    if (confirmation) {
        try {
            await deleteDoc(doc(db, "blogs", id));
        } catch (err) {
            console.log(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while deleting the blog.',
            });
        }
    }
};

window.publishBlog = publishBlog;
window.getBlogs = getBlogs;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, where, onSnapshot, getDocs, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";



const firebaseConfig = {
    apiKey: "AIzaSyBHO2psCdz8PwHkXtN293GEq5MhsZ02UD8",
    authDomain: "hackathon-9eef8.firebaseapp.com",
    projectId: "hackathon-9eef8",
    storageBucket: "hackathon-9eef8.appspot.com",
    messagingSenderId: "771294258194",
    appId: "1:771294258194:web:4a130d2835604d1655a4cb"
};
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
// const provider = new GoogleAuthProvider();
// const userUid = localStorage.getItem("userUid");

const userProfile = document.getElementById("user-profile");


const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const mountainsRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    })
}

const getUserData = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let fullName = document.getElementById("fullName")
        let email = document.getElementById("email")
        if (location.pathname === "/profile.html") {
            fullName.value = docSnap.data().fullName;
            email.value = docSnap.data().email;
            if (docSnap.data().picture) {
                userProfile.src = docSnap.data().picture
            }
        } else {
            fullName.innerHTML = docSnap.data().fullName;
            email.innerHTML = docSnap.data().email;
            if (docSnap.data().picture) {
                userProfile.src = docSnap.data().picture
            }
        }
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }
}

onAuthStateChanged(auth, (user) => {
    const uid = localStorage.getItem("uid")
    if (user && uid) {
        console.log(user)
        getUserData(user.uid)
        getAllUsers(user.email)
        if (location.pathname !== '/profile.html' && location.pathname !== '/dashboard.html') {
            location.href = "profile.html"
        }
    } else {
        if (location.pathname !== '/index.html' && location.pathname !== "/index.html") {
            location.href = "index.html"
        }
    }
});

const logoutBtn = document.getElementById("logout-btn")

logoutBtn && logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.clear()
        location.href = "index.html"
    }).catch((error) => {
        // An error happened.
    });

})



const registerBtn = document.getElementById('register-btn');

registerBtn && registerBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let firstname = document.getElementById("firstName");
    let lastname = document.getElementById("lastName");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
            try {
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    password: password.value
                });
                Swal.fire({
                    icon: 'success',
                    title: 'User register successfully',
                })
                localStorage.setItem("uid", user.uid)
                location.href = "profile.html"
            } catch (err) {
                console.log(err)
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
})


const loginBtn = document.getElementById('login-btn');

loginBtn && loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    signInWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
            try {
                Swal.fire({
                    icon: 'success',
                    title: 'User login successfully',
                })
                localStorage.setItem("uid", userCredential.user.uid)
                location.href = "profile.html"
            } catch (err) {
                console.log(err)
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
})

const updateProfile = document.getElementById("update-profile");

updateProfile && updateProfile.addEventListener("click", async () => {
    let uid = localStorage.getItem("uid")
    let password = document.getElementById("password").value
    const imageUrl = await uploadFile(fileInput.files[0])
    const washingtonRef = doc(db, "users", uid);
    await updateDoc(washingtonRef, {
        password: password.value ,
        picture: imageUrl
    });
    console.log("new pass is-->" , password)
    Swal.fire({
        icon: 'success',
        title: 'Password updated successfully',
    })
})

const getAllUsers = async (email) => {
    console.log("email", email)
    const q = query(collection(db, "users"), orderBy("email"), where("email", "!=", email), orderBy("isActive", 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ ...doc.data(), uid: doc.id });
        });
    })
}

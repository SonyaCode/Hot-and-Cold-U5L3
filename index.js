/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"
import { onSnapshot} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"

/* === Firebase Setup === */
const firebaseConfig = {
   apiKey: "AIzaSyBZNlKRnm_ajNVh6MD7kmFhZ74TqBpnDE4",
   authDomain: "hot-and-cold-d05fd.firebaseapp.com",
   projectId: "hot-and-cold-d05fd",
   storageBucket: "hot-and-cold-d05fd.firebasestorage.app",
   messagingSenderId: "192859375818",
   appId: "1:192859375818:web:b6f3f39a3973f456f58c33"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const user = auth.currentUser;
// console.log(auth)
// test if it works
console.log(db)
/* === UI === */


/* == UI - Elements == */


const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")


const navbar = document.getElementById("navbar")


const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")


const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")


const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")


const signOutButtonEl = document.getElementById("sign-out-btn")


const userProfilePictureEl = document.getElementById("user-profile-picture")


const userGreetingEl = document.getElementById("user-greeting")


const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")




/* == UI - Event Listeners == */


signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)


signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)


signOutButtonEl.addEventListener("click", authSignOut)


postButtonEl.addEventListener("click", postButtonPressed)




/* === Main Code === */


showLoggedOutView()


/* === Functions === */


/* = Functions - Firebase - Authentication = */


function authSignInWithGoogle() {
   console.log("Sign in with Google")
}


function authSignInWithEmail() {
   console.log("Sign in with email and password")
   const email = emailInputEl.value
   const password = passwordInputEl.value
   signInWithEmailAndPassword(auth, email, password)
       .then((userCredential) => {
           // Signed in
           showLoggedInView()
       })
       .catch((error) => {
           console.error(error)
       })
}




function authCreateAccountWithEmail() {
   console.log("Sign up with email and password")
   const email = emailInputEl.value
   const password = passwordInputEl.value
   createUserWithEmailAndPassword(auth, email, password)
       .then((userCredential) => {
           // Signed up
           showLoggedInView()
       })
       .catch((error) => {
           console.error(error)
       })
}




function authSignOut() {
   signOut(auth)
       .then(() => {
           showLoggedOutView()
       })
       .catch((error) => {
           console.error(error)
       })
}


/* == Functions - UI Functions == */
function showLoggedOutView() {
   hideView(viewLoggedIn)
   showViewFlex(viewLoggedOut)
   hideView(navbar)
}
function showLoggedInView() {
   hideView(viewLoggedOut)
   showViewBlock(viewLoggedIn)
   showViewFlex(navbar)
}
function showViewFlex(view) {
   view.style.display = "flex"
}


function showViewBlock(view) {
   view.style.display = "block"
}
function hideView(view) {
   view.style.display = "none"
}




function showProfilePicture(imgElement, user) {
   if (user.photoURL) {
       imgElement.src = user.photoURL
   } else {
       imgElement.src = "assets/images/defaultPic.jpg"
   }
}




function showUserGreeting(element, user) {
   // if (user.displayName) {
   //     element.textContent = `Hi ${user.displayName}`
   // } else {
   //     element.textContent = "Hey friend, how are you?"
   // }
}


function clearInputField(field) {
   field.value = ""
}


async function postButtonPressed() {
   const postBody = textareaEl.value;
   const user = auth.currentUser;
   const time = serverTimestamp();


   // Get the current profile picture
   const profilePictureSrc = document.getElementById("user-profile-picture").src;


   if (postBody) {
       await addPostToDB(postBody, user, time, profilePictureSrc); // Pass profilePictureSrc
       document.getElementById("post-container").innerHTML = "";
       getAllPosts();
       clearInputField(textareaEl);
   }
}


/* = Functions - Firebase - Cloud Firestore = */
async function addPostToDB(postBody, user, time, profilePicSrc) {
   try {
       const docRef = await addDoc(collection(db, "posts"), {
           body: postBody,
           uid: user.uid,
           timestamp: time,
           profilePic: profilePicSrc, // Store the profile picture
       });
       console.log(`Document written with ID: ${docRef.id}`);
   } catch (error) {
       console.error(error.message);
   }
}
console.log(app.options.projectId)

function fetchInRealtimeAndRenderPostsFromDB() {
   onSnapshot(collection(db, "posts"), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
      // we are getting the posts in the console only for now
      console.log(doc.data())
      })
   })
}

console.log(firebaseConfig.apiKey)



async function getAllPosts() {
   try {
       const docRef = collection(db, "posts")
       const snapshot = await getDocs(collection(db, "posts"));
       console.log(snapshot)
       snapshot.docs.forEach((doc) => {
           const postData = doc.data();
         //   console.log(`Post ID: ${doc.id}`)
         //   console.log(`Body: ${postData.body}`)
         //   console.log(`User: ${postData.uid}`)
           console.log(`Timestamp: ${new Date(postData.timestamp.seconds * 1000).toLocaleString()}`)
           const timePosted = new Date(postData.timestamp.seconds * 1000).toLocaleString();


           // Pass the stored profile picture to addPostToWeb
           addPostToWeb(postData.body, postData.uid, timePosted, postData.profilePic);
       });
   } catch (error) {
       console.error(error);
   }
}


function addPostToWeb(postBody, user, time, profilePicSrc) {
   let postContainer = document.getElementById("post-container");


   let post = document.createElement("div");
   post.className = "post";


   // Create profile picture element
   let profilePic = document.createElement("img");
   profilePic.className = "profile-pic";


   // Use the profilePicSrc passed from the database or a default fallback
   profilePic.src = profilePicSrc || "assets/images/defaultPic.jpg";


   let username = document.createElement("h3")
   username.textContent = user

   let contentOfPost = document.createElement("p")
   contentOfPost.textContent = postBody

   let timePosted = document.createElement("p")
   timePosted.textContent = time

   let icons = document.createElement("div")
   icons.className = "icons"

   let like = document.createElement("img")
   like.id = "likeBtn"
   like.src = "assets/icons/like.png"

   let comment = document.createElement("img")
   comment.id = "commentBtn"
   comment.src = "assets/icons/comment.png"

   let share = document.createElement("img")
   share.id = "shareBtn"
   share.src = "assets/icons/share.png"

   postContainer.append(post)
   post.append(profilePic)
   post.append(username)
   post.append(contentOfPost)
   post.append(timePosted)
   post.append(icons)
   icons.append(like)
   icons.append(comment)
   icons.append(share)


   let isLiked = false
   like.addEventListener("click", function() {
      isLiked = !isLiked

      if (isLiked == true) {
         like.src = "assets/icons/liked-post.png"
      } else {
         like.src = "assets/icons/like.png"
      }
   })
}


// Main Code
onAuthStateChanged(auth, (user) => {
   if (user) {
       showLoggedInView()
       showProfilePicture(userProfilePictureEl, user)
       showUserGreeting(userGreetingEl, user)
       fetchInRealtimeAndRenderPostsFromDB()
   } else {
       showLoggedOutView()
       fetchInRealtimeAndRenderPostsFromDB()
   }
})

// Display all posts when the page loads
window.onload = () => {
   getAllPosts();
};

//credit: coursera


window.ChangeAngry = function () {
   document.getElementById("user-profile-picture").src = "assets/images/angry-emoji.webp";
};


window.ChangeGoofy = function () {
   document.getElementById("user-profile-picture").src = "assets/images/goofy-emoji.webp";
};


window.ChangeHappy = function () {
   document.getElementById("user-profile-picture").src = "assets/images/happy-emoji.png";
};


window.ChangeSad = function () {
   document.getElementById("user-profile-picture").src = "assets/images/sad-emoji.png";
};




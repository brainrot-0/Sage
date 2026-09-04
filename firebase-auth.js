import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAv75ZIf2YHovSBxPE7fAZZfzItXMYPUDI",
  authDomain: "mindease-f3641.firebaseapp.com",
  projectId: "mindease-f3641",
  storageBucket: "mindease-f3641.firebasestorage.app",
  messagingSenderId: "683571418303",
  appId: "1:683571418303:web:56183c8b6b48d2dfaa220a",
  measurementId: "G-NYJV83S884"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* =========================================================
   FIREBASE AUTH PERSISTENCE
   ========================================================= */

const authReady = setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Firebase persistence error:", error);
});

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginModal = document.getElementById("loginModal");
const closeBtn = document.querySelector(".close-btn");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");

/* =========================================================
   LOGIN MODAL
   ========================================================= */

if (loginBtn && loginModal) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
  });
}

if (closeBtn && loginModal) {
  closeBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
}

window.addEventListener("click", event => {
  if (event.target === loginModal) {
    loginModal.style.display = "none";
  }
});

/* =========================================================
   SIGN IN
   ========================================================= */

if (signInBtn) {
  signInBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorMsg.textContent = "Please enter your email and password.";
      return;
    }

    signInBtn.disabled = true;
    errorMsg.textContent = "Signing in...";

    try {
      await authReady;
      await signInWithEmailAndPassword(auth, email, password);

      errorMsg.textContent = "";

      if (loginModal) {
        loginModal.style.display = "none";
      }

      emailInput.value = "";
      passwordInput.value = "";

    } catch (error) {
      console.error("Sign in error:", error);

      if (error.code === "auth/invalid-credential") {
        errorMsg.textContent = "Incorrect email or password.";
      } else if (error.code === "auth/user-not-found") {
        errorMsg.textContent = "No account exists with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMsg.textContent = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg.textContent = "Please enter a valid email address.";
      } else {
        errorMsg.textContent = error.message;
      }

    } finally {
      signInBtn.disabled = false;
    }
  });
}

/* =========================================================
   SIGN UP
   ========================================================= */

if (signUpBtn) {
  signUpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorMsg.textContent = "Please enter an email and password.";
      return;
    }

    if (password.length < 6) {
      errorMsg.textContent = "Password must contain at least 6 characters.";
      return;
    }

    signUpBtn.disabled = true;
    errorMsg.textContent = "Creating your account...";

    try {
      await authReady;
      await createUserWithEmailAndPassword(auth, email, password);

      errorMsg.textContent = "";

      if (loginModal) {
        loginModal.style.display = "none";
      }

      emailInput.value = "";
      passwordInput.value = "";

    } catch (error) {
      console.error("Sign up error:", error);

      if (error.code === "auth/email-already-in-use") {
        errorMsg.textContent = "An account already exists with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg.textContent = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMsg.textContent = "Password is too weak. Use at least 6 characters.";
      } else {
        errorMsg.textContent = error.message;
      }

    } finally {
      signUpBtn.disabled = false;
    }
  });
}

/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}

/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Logged in:", user.email);
    console.log("Firebase UID:", user.uid);

    if (loginBtn) {
      loginBtn.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    /*
      This event can be used by other MindEase pages
      to know that a real user is logged in.
    */
    window.dispatchEvent(
      new CustomEvent("mindease-auth-changed", {
        detail: {
          user: user,
          loggedIn: true,
          uid: user.uid
        }
      })
    );

  } else {
    console.log("No user is logged in.");

    if (loginBtn) {
      loginBtn.style.display = "inline-block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    window.dispatchEvent(
      new CustomEvent("mindease-auth-changed", {
        detail: {
          user: null,
          loggedIn: false,
          uid: null
        }
      })
    );
  }
});

/* =========================================================
   FAQ TOGGLE
   ========================================================= */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");

  if (question) {
    question.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  }
});

/* =========================================================
   SLEEP CHECK
   ========================================================= */

const sleepInput = document.getElementById("sleepHours");
const checkBtn = document.getElementById("checkSleep");
const sleepResult = document.getElementById("sleepResult");

if (checkBtn && sleepInput && sleepResult) {
  checkBtn.addEventListener("click", () => {
    const hours = parseFloat(sleepInput.value);

    if (isNaN(hours) || hours < 0 || hours > 24) {
      sleepResult.textContent =
        "Please enter a valid number of hours between 0 and 24.";
      return;
    }

    if (hours < 5) {
      sleepResult.textContent =
        `You slept ${hours} hours. That's not enough sleep. Try to get at least 7–9 hours for better health.`;
    } else if (hours <= 7) {
      sleepResult.textContent =
        `You slept ${hours} hours. Not bad, but aim for 7–9 hours to feel fully rested.`;
    } else if (hours <= 9) {
      sleepResult.textContent =
        `You slept ${hours} hours. Perfect! Your sleep duration is ideal.`;
    } else {
      sleepResult.textContent =
        `You slept ${hours} hours. That's more than recommended. Too much sleep can also affect your health.`;
    }
  });
}

/* =========================================================
   BLOG "EXPLORE MORE"
   ========================================================= */

const exploreBtn = document.getElementById("explore-btn");
const moreBlogs = document.querySelector(".more-blogs");

if (exploreBtn && moreBlogs) {
  exploreBtn.addEventListener("click", () => {
    moreBlogs.classList.toggle("hidden");

    exploreBtn.textContent =
      moreBlogs.classList.contains("hidden")
        ? "Explore More"
        : "Show Less";
  });
}

/* =========================================================
   EXPORT AUTH
   ========================================================= */

export { auth };

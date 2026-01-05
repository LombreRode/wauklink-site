import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const userStatus  = document.getElementById("userStatus");
const guestStatus = document.getElementById("guestStatus");
const userNameEl  = document.getElementById("userName");
const logoutBtn   = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userStatus?.classList.add("hidden");
    guestStatus?.classList.remove("hidden");
    return;
  }

  guestStatus?.classList.add("hidden");
  userStatus?.classList.remove("hidden");

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      userNameEl.textContent = `${data.firstName} ${data.lastName}`;
    } else {
      userNameEl.textContent = user.email;
    }
  } catch {
    userNameEl.textContent = user.email;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "../auth/login.html";
});

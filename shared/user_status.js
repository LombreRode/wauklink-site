// shared/user_status.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔗 IDs DU HTML
const userNav     = document.getElementById("userNav");
const guestStatus = document.getElementById("guestStatus");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn   = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userNav?.classList.add("hidden");
    guestStatus?.classList.remove("hidden");
    return;
  }

  guestStatus?.classList.add("hidden");
  userNav?.classList.remove("hidden");

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      userEmailEl.textContent =
        data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : user.email;
    } else {
      userEmailEl.textContent = user.email;
    }
  } catch (e) {
    userEmailEl.textContent = user.email;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "/wauklink-site/auth/login.html";
});

import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || !snap.data().profile?.completed) {
    location.href = "../auth/profile.html";
  }
});

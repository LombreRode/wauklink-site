// auth/user_sync.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let lastUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    lastUid = null;
    window.currentUser = null;
    return;
  }

  if (lastUid === user.uid) return;
  lastUid = user.uid;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    window.currentUser = null;
    return;
  }

  const data = snap.data();
  window.currentUser = {
    uid: user.uid,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    address: data.address,
    role: data.role
  };

  await updateDoc(ref, {
    lastLoginAt: serverTimestamp()
  });
});

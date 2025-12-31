// auth/user_sync.js
import { auth, db } from "../shared/firebase.js";
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

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.error("❌ users/{uid} inexistant — inscription non conforme aux rules");
      window.currentUser = null;
      return;
    }

    const data = snap.data();

    // 🔒 ALIGNÉ AUX RULES (lecture uniquement)
    window.currentUser = {
      uid: user.uid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      role: data.role
    };

    // ✅ Mise à jour autorisée (champ neutre)
    await updateDoc(ref, {
      lastLoginAt: serverTimestamp()
    });

    console.log("👤 user_sync OK", window.currentUser);

  } catch (err) {
    console.error("user_sync error:", err);
    window.currentUser = null;
  }
});

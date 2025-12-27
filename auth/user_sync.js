import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
});

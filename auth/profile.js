import { auth, db } from "../wauklink-site/shared/firebase.js
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("profileForm");
const msg  = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    msg.textContent = "❌ Vous devez être connecté";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const activity = document.getElementById("activity").value;

    if (!activity) {
      msg.textContent = "❌ Activité obligatoire";
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);

      // ✅ UNIQUEMENT champs autorisés par les rules
      await updateDoc(ref, {
        activity,
        lastLoginAt: serverTimestamp()
      });

      msg.textContent = "✅ Activité enregistrée";

    } catch (err) {
      console.error(err);
      msg.textContent = "❌ " + err.code;
    }
  });
});

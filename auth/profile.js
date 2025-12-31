// auth/profile.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import { doc, getDoc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔗 DOM
const profileForm = document.getElementById("profileForm");
const activity = document.getElementById("activity");
const description = document.getElementById("description");
const msg = document.getElementById("msg");

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  if (!auth.currentUser) {
    msg.textContent = "❌ Non connecté";
    return;
  }

  try {
    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      msg.textContent = "❌ Profil utilisateur introuvable";
      return;
    }

    await updateDoc(ref, {
      activity: {
        type: activity.value,
        description: description.value,
        requestedAt: serverTimestamp()
      }
    });

    // 🔁 Redirection dashboard pro
    location.replace("/wauklink-site/dashboard/pro.html");

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de l’enregistrement";
  }
});

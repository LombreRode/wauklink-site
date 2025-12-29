// auth/profile.js
import { auth, db } from "../shared/firebase.js";
import { doc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔗 DOM (OBLIGATOIRE)
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
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      activity: {
        type: activity.value,
        description: description.value,
        requestedAt: serverTimestamp()
      }
    });

    location.href = "../dashboard/pro.html";
  } catch (e) {
    console.error(e);
    msg.textContent = "❌ Erreur lors de l’enregistrement";
  }
});

import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("profileForm");
const activity = document.getElementById("activity");
const description = document.getElementById("description");
const msg = document.getElementById("msg");

// 🔐 Vérifie que l’utilisateur est connecté
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.replace("./login.html");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  if (!activity.value || !description.value.trim()) {
    msg.textContent = "❌ Tous les champs sont obligatoires";
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      msg.textContent = "❌ Utilisateur non connecté";
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      activity: {
        type: activity.value,
        description: description.value.trim(),
        completedAt: serverTimestamp()
      },
      role: "pro",
      updatedAt: serverTimestamp()
    });

    // 🔁 Redirection après succès
    location.replace("../dashboard/pro.html");

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de l’enregistrement";
  }
});

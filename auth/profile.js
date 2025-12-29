import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, updateDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;
const form = document.getElementById("profileForm");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "./login.html";
    return;
  }
  currentUser = user;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      profile: {
        type: type.value,
        ville: ville.value,
        completed: true
      }
    });

    location.href = "../dashboard/pro.html";
  } catch {
    msg.textContent = "Erreur enregistrement";
  }
});

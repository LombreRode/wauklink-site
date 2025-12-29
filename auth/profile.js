import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, updateDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("profileForm");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "./login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const ville = document.getElementById("ville").value;

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      profile: {
        type,
        ville,
        completed: true
      }
    });

    location.href = "../dashboard/pro.html";
  } catch (e) {
    msg.textContent = "Erreur lors de l’enregistrement.";
  }
});

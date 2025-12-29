import { auth, db } from "../_shared/firebase.js";
import { doc, updateDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      activity: {
        type: activity.value,
        description: description.value,
        requestedAt: new Date()
      }
    });

    location.href = "../dashboard/pro.html";
  } catch {
    msg.textContent = "Erreur lors de l’enregistrement";
  }
});

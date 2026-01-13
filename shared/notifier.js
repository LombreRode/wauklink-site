import { db, auth } from "./firebase.js";
import { 
  collection, query, where, onSnapshot, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    listenForNotifications(user.uid);
  }
});

function listenForNotifications(userId) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  // Écoute en temps réel (onSnapshot)
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const notif = change.doc.data();
        renderToast(change.doc.id, notif);
      }
    });
  });
}

function renderToast(id, notif) {
  // Création de l'élément visuel
  const toast = document.createElement("div");
  toast.className = "card shadow";
  
  // Style dynamique selon le type (success ou danger)
  const accentColor = notif.type === "success" ? "#22c55e" : "#ef4444";
  
  toast.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    width: 300px;
    border-left: 6px solid ${accentColor};
    background: #111827;
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    animation: slideIn 0.4s ease-out;
  `;

  toast.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px; display: flex; justify-content: space-between;">
      <span>${notif.title}</span>
    </div>
    <div class="meta" style="font-size: 0.9em; margin-bottom: 12px;">${notif.message}</div>
    <button class="btn btn-ok" style="width: 100%; padding: 6px; font-size: 12px; cursor: pointer;">
      J'ai compris
    </button>
  `;

  // Marquer comme lu au clic
  toast.querySelector("button").onclick = async () => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    toast.style.animation = "slideOut 0.4s ease-in";
    setTimeout(() => toast.remove(), 350);
  };

  document.body.appendChild(toast);
}

import { db, auth } from "./firebase.js";
import { 
  collection, addDoc, query, where, getDocs, serverTimestamp, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// --- CHARGER LES AVIS ---
export async function loadReviews(targetId) {
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";

  const q = query(
    collection(db, "reviews"), 
    where("targetId", "==", targetId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    container.innerHTML = "<p class='meta'>Aucun avis pour le moment.</p>";
    return;
  }

  snap.forEach(doc => {
    const r = doc.data();
    const div = document.createElement("div");
    div.style = "border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;";
    div.innerHTML = `
      <div style="color: #f1c40f;">${"⭐".repeat(r.rating)}</div>
      <p style="margin: 5px 0;">${r.comment}</p>
      <small class="meta">Posté le ${r.createdAt?.toDate().toLocaleDateString()}</small>
    `;
    container.appendChild(div);
  });
}

// --- ENVOYER UN AVIS ---
export async function submitReview(targetId, rating, comment) {
  if (!auth.currentUser) return alert("Vous devez être connecté !");

  try {
    await addDoc(collection(db, "reviews"), {
      targetId: targetId,
      authorId: auth.currentUser.uid,
      rating: parseInt(rating),
      comment: comment,
      createdAt: serverTimestamp()
    });
    alert("Merci pour votre avis !");
    location.reload();
  } catch (e) {
    console.error(e);
    alert("Erreur lors de l'envoi.");
  }
}

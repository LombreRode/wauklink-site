import { db, auth, storage } from "/wauklink-site/shared/firebase.js";
import { 
  doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { 
  ref, uploadBytesResumable, getDownloadURL, uploadBytes 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// --- ÉLÉMENTS HTML ---
const avatarImg = document.getElementById("avatarImg");
const emailDisplay = document.querySelector("#emailDisplay span");
const typeDisplay = document.querySelector("#typeDisplay span");
const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const avatarInput = document.getElementById("avatarInput");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const avatarMsg = document.getElementById("avatarMsg");

// --- ÉLÉMENTS PRO & AVIS ---
const proSection = document.getElementById("proSection");
const proForm = document.getElementById("proForm");
const proPending = document.getElementById("proPending");
const btnSendPro = document.getElementById("btnSendPro");
const proDocInput = document.getElementById("proDocInput");
const reviewsContainer = document.getElementById("reviewsContainer");
const averageRatingDiv = document.getElementById("averageRating");

/* ==========================================
   1. CHARGEMENT DU PROFIL & AVIS
========================================== */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      // Affichage des infos de base
      emailDisplay.textContent = data.email || user.email;
      typeDisplay.textContent = data.plan === "pro" ? "🚀 Professionnel" : "👤 Particulier";
      firstNameInput.value = data.firstName || "";
      phoneInput.value = data.phone || "";
      avatarImg.src = data.avatarUrl || "/wauklink-site/assets/avatar-default.png";

      // --- LOGIQUE INTERFACE PRO ---
      if (data.plan === "pro") {
        proSection.classList.add("hidden"); 
      } else {
        proSection.classList.remove("hidden");
        const reqSnap = await getDoc(doc(db, "pro_requests", user.uid));
        if (reqSnap.exists()) {
          proForm.classList.add("hidden");
          proPending.classList.remove("hidden");
        }
      }

      // --- CHARGEMENT DES AVIS ---
      loadUserReviews(user.uid);
    }
  } else {
    window.location.href = "/wauklink-site/auth/login.html";
  }
});

/* ==========================================
   2. FONCTION POUR CHARGER LES AVIS
========================================== */
async function loadUserReviews(targetId) {
  try {
    const q = query(
      collection(db, "reviews"), 
      where("targetId", "==", targetId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      reviewsContainer.innerHTML = "<p class='meta'>Aucun avis pour le moment.</p>";
      averageRatingDiv.innerHTML = "⭐⭐⭐⭐⭐ (0 avis)";
      return;
    }

    let totalScore = 0;
    let count = 0;
    reviewsContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const rev = doc.data();
      totalScore += rev.rating;
      count++;

      const reviewHtml = `
        <div class="review-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;">
          <div style="color: #f1c40f;">${"⭐".repeat(rev.rating)}</div>
          <p style="margin: 5px 0; font-size: 14px;">${rev.comment}</p>
          <div class="review-meta">Le ${rev.createdAt?.toDate().toLocaleDateString()}</div>
        </div>
      `;
      reviewsContainer.insertAdjacentHTML("beforeend", reviewHtml);
    });

    // Calcul de la moyenne
    const avg = (totalScore / count).toFixed(1);
    averageRatingDiv.innerHTML = `${"⭐".repeat(Math.round(avg))} <strong>${avg} / 5</strong> (${count} avis)`;

  } catch (err) {
    console.error("Erreur avis:", err);
    reviewsContainer.innerHTML = "<p class='meta'>Impossible de charger les avis.</p>";
  }
}

/* ==========================================
   3. GESTION DE L'AVATAR
========================================== */
avatarInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 6 * 1024 * 1024) {
    alert("L'image est trop lourde (max 6 Mo)");
    return;
  }

  const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  progressContainer.style.display = "block";

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + "%";
    }, 
    (error) => { alert("Erreur upload avatar"); }, 
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarUrl: downloadURL });
      avatarImg.src = downloadURL;
      avatarMsg.textContent = "✅ Avatar mis à jour !";
      setTimeout(() => { progressContainer.style.display = "none"; }, 1000);
    }
  );
};

/* ==========================================
   4. SAUVEGARDE INFOS
========================================== */
document.getElementById("saveProfileBtn").onclick = async () => {
  const btn = document.getElementById("saveProfileBtn");
  const msg = document.getElementById("profileMsg");

  try {
    btn.disabled = true;
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      firstName: firstNameInput.value.trim(),
      phone: phoneInput.value.trim(),
      updatedAt: serverTimestamp()
    });
    msg.style.color = "#22c55e";
    msg.textContent = "✅ Profil enregistré !";
  } catch (err) {
    msg.style.color = "#ef4444";
    msg.textContent = "❌ Erreur de sauvegarde.";
  } finally {
    btn.disabled = false;
  }
};

/* ==========================================
   5. ENVOYER DEMANDE PRO
========================================== */
btnSendPro.onclick = async () => {
  const bName = document.getElementById("businessName").value.trim();
  const siret = document.getElementById("siret").value.trim();
  const docFile = proDocInput.files[0];

  if (!bName || siret.length < 14 || !docFile) {
    alert("Merci de remplir tous les champs et d'ajouter un justificatif.");
    return;
  }

  try {
    btnSendPro.disabled = true;
    btnSendPro.textContent = "⏳ Envoi du dossier...";

    const fileExt = docFile.name.split('.').pop();
    const docPath = `pro_documents/${auth.currentUser.uid}_justificatif.${fileExt}`;
    const docRef = ref(storage, docPath);
    
    await uploadBytes(docRef, docFile);
    const docUrl = await getDownloadURL(docRef);

    await setDoc(doc(db, "pro_requests", auth.currentUser.uid), {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      businessName: bName,
      siret: siret,
      documentUrl: docUrl,
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("✅ Dossier envoyé avec succès !");
    location.reload(); 
  } catch (e) {
    alert("Erreur lors de l'envoi.");
    btnSendPro.disabled = false;
  }
};

import { db, auth, storage } from "/wauklink-site/shared/firebase.js";
import { 
  doc, getDoc, updateDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { 
  ref, uploadBytesResumable, getDownloadURL 
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

// --- ÉLÉMENTS PRO ---
const proSection = document.getElementById("proSection");
const proForm = document.getElementById("proForm");
const proPending = document.getElementById("proPending");
const btnSendPro = document.getElementById("btnSendPro");

/* ==========================================
   1. CHARGEMENT DU PROFIL
========================================== */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      // Affichage des infos
      emailDisplay.textContent = data.email || user.email;
      typeDisplay.textContent = data.plan === "pro" ? "🚀 Professionnel" : "👤 Particulier";
      firstNameInput.value = data.firstName || "";
      phoneInput.value = data.phone || "";
      avatarImg.src = data.avatarUrl || "/wauklink-site/assets/default-avatar.png";

      // --- LOGIQUE INTERFACE PRO ---
      if (data.plan === "pro") {
        proSection.style.display = "none"; // Déjà pro, on cache la section
      } else {
        proSection.classList.remove("hidden");
        // Vérifier si une demande est déjà en attente
        const reqSnap = await getDoc(doc(db, "pro_requests", user.uid));
        if (reqSnap.exists()) {
          proForm.classList.add("hidden");
          proPending.classList.remove("hidden");
        }
      }
    }
  } else {
    window.location.href = "/wauklink-site/auth/login.html";
  }
});

/* ==========================================
   2. GESTION DE L'AVATAR (STORAGE)
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
    (error) => { alert("Erreur upload"); }, 
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarUrl: downloadURL });
      avatarImg.src = downloadURL;
      avatarMsg.textContent = "✅ Avatar mis à jour !";
      progressContainer.style.display = "none";
    }
  );
};

/* ==========================================
   3. ENREGISTRER LES INFOS TEXTUELLES
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
    msg.style.color = "#27ae60";
    msg.textContent = "✅ Profil enregistré avec succès !";
  } catch (err) {
    msg.style.color = "#ef4444";
    msg.textContent = "❌ Erreur de sauvegarde.";
  } finally {
    btn.disabled = false;
  }
};

/* ==========================================
   4. ENVOYER DEMANDE PRO
========================================== */
btnSendPro.onclick = async () => {
  const bName = document.getElementById("businessName").value.trim();
  const siret = document.getElementById("siret").value.trim();

  if (!bName || siret.length < 14) {
    alert("Veuillez entrer le nom de l'entreprise et un SIRET valide (14 chiffres).");
    return;
  }

  try {
    btnSendPro.disabled = true;
    btnSendPro.textContent = "Envoi en cours...";

    await setDoc(doc(db, "pro_requests", auth.currentUser.uid), {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      businessName: bName,
      siret: siret,
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("✅ Demande envoyée !");
    location.reload(); 
  } catch (e) {
    alert("Erreur lors de l'envoi de la demande.");
    btnSendPro.disabled = false;
    btnSendPro.textContent = "🚀 Envoyer ma demande PRO";
  }
};

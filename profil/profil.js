/* =================================================
    WAUKLINK — PROFIL.JS
    VERSION NETTOYÉE ET OPTIMISÉE (6 MO + CORS)
================================================= */
import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Sélection des éléments HTML (IDs basés sur ton index.html)
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profileMsg = document.getElementById("profileMsg");

let currentUser = null;

// Chargement des données au démarrage
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }
    currentUser = user;
    
    // Affichage de l'email
    const emailSpan = document.getElementById("email").querySelector("span");
    if (emailSpan) emailSpan.textContent = user.email;

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.avatarUrl) avatarImg.src = data.avatarUrl;
            if (data.firstName) firstNameInput.value = data.firstName;
            if (data.phone) phoneInput.value = data.phone;
        }
    } catch (e) { console.error("Erreur de chargement profil:", e); }
});

// Gestion de l'upload de l'avatar
avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file || !currentUser) return;

    // Validation 6 Mo (6 * 1024 * 1024 octets)
    if (file.size > 6291456) {
        avatarMsg.textContent = "❌ Image trop lourde (max 6 Mo)";
        return;
    }

    avatarMsg.textContent = "⏳ Upload en cours...";
    if (progressContainer) progressContainer.style.display = "block";
    if (progressBar) progressBar.style.width = "0%";

    try {
        const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        const task = uploadBytesResumable(fileRef, file);

        task.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressBar) progressBar.style.width = progress + "%";
                avatarMsg.textContent = `⏳ Upload : ${Math.round(progress)}%`;
            }, 
            (error) => { throw error; }, 
            async () => {
                const url = await getDownloadURL(fileRef);
                await updateDoc(doc(db, "users", currentUser.uid), {
                    avatarUrl: url,
                    updatedAt: serverTimestamp()
                });
                avatarImg.src = url + "?t=" + Date.now();
                avatarMsg.textContent = "✅ Avatar mis à jour !";
                setTimeout(() => { if (progressContainer) progressContainer.style.display = "none"; }, 3000);
            }
        );
    } catch (e) {
        console.error("Erreur d'upload :", e);
        avatarMsg.textContent = "❌ Erreur : Vérifiez CORS ou connexion";
    }
});

// Enregistrement des informations (Prénom, Tél)
saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    profileMsg.textContent = "⏳ Sauvegarde...";
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            firstName: firstNameInput.value,
            phone: phoneInput.value,
            updatedAt: serverTimestamp()
        });
        profileMsg.textContent = "✅ Informations enregistrées !";
    } catch (e) {
        profileMsg.textContent = "❌ Erreur de sauvegarde";
    }
});

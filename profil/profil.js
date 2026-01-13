import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Sélection des éléments
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
    document.getElementById("emailDisplay").querySelector("span").textContent = user.email;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.avatarUrl) avatarImg.src = data.avatarUrl;
        if (data.firstName) firstNameInput.value = data.firstName;
        if (data.phone) phoneInput.value = data.phone;
        if (data.role) document.getElementById("typeDisplay").querySelector("span").textContent = data.role;
    }
});

// Gestion de l'upload (6 Mo)
avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file || !currentUser) return;

    // Validation 6 Mo
    if (file.size > 6 * 1024 * 1024) {
        avatarMsg.textContent = "❌ Image trop lourde (max 6 Mo)";
        return;
    }

    avatarMsg.textContent = "⏳ Initialisation de l'envoi...";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    try {
        const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        const task = uploadBytesResumable(fileRef, file);

        task.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + "%";
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
                setTimeout(() => { progressContainer.style.display = "none"; }, 3000);
            }
        );
    } catch (e) {
        console.error("Erreur Storage:", e);
        avatarMsg.textContent = "❌ Erreur : Vérifiez votre connexion ou CORS";
        progressContainer.style.display = "none";
    }
});

// Enregistrement des informations textuelles
saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    profileMsg.textContent = "⏳ Sauvegarde...";
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            firstName: firstNameInput.value,
            phone: phoneInput.value,
            updatedAt: serverTimestamp()
        });
        profileMsg.textContent = "✅ Profil mis à jour !";
    } catch (e) {
        profileMsg.textContent = "❌ Erreur de sauvegarde";
    }
});

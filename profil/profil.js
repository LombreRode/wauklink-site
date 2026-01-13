import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Éléments DOM
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profileMsg = document.getElementById("profileMsg");

const newPassword = document.getElementById("newPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordMsg = document.getElementById("passwordMsg");

let currentUser = null;

// 1. CHARGEMENT DU PROFIL
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }
    currentUser = user;
    document.getElementById("email").querySelector("span").textContent = user.email;

    // Charger données Firestore
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.avatarUrl) avatarImg.src = data.avatarUrl;
            if (data.firstName) firstNameInput.value = data.firstName;
            if (data.phone) phoneInput.value = data.phone;
            if (data.role) document.getElementById("type").querySelector("span").textContent = data.role;
        }
    } catch (e) { console.error("Erreur chargement:", e); }
});

// 2. GESTION DE L'AVATAR (MAX 6 MO)
avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file || !currentUser) return;

    if (file.size > 6 * 1024 * 1024) {
        avatarMsg.textContent = "❌ Image trop lourde (max 6 Mo)";
        return;
    }

    avatarMsg.textContent = "⏳ Préparation...";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    try {
        const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        const task = uploadBytesResumable(fileRef, file);

        task.on('state_changed', 
            (snap) => {
                const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
                progressBar.style.width = prog + "%";
                avatarMsg.textContent = `⏳ Upload : ${Math.round(prog)}%`;
            },
            (err) => { throw err; },
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
        console.error(e);
        avatarMsg.textContent = "❌ Erreur upload (Vérifiez CORS)";
        progressContainer.style.display = "none";
    }
});

// 3. MODIFIER INFOS (Prénom / Tél)
saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    profileMsg.textContent = "⏳ Enregistrement...";
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

// 4. CHANGER MOT DE PASSE
changePasswordBtn.addEventListener("click", async () => {
    const pass = newPassword.value;
    if (pass.length < 6) {
        passwordMsg.textContent = "❌ 6 caractères minimum";
        return;
    }
    passwordMsg.textContent = "⏳ Modification...";
    try {
        await updatePassword(currentUser, pass);
        passwordMsg.textContent = "✅ Mot de passe changé !";
        newPassword.value = "";
    } catch (e) {
        passwordMsg.textContent = "❌ Déconnectez-vous et reconnectez-vous pour cette action";
    }
});

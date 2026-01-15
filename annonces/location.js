import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const form = document.getElementById("annonceForm");
const msg = document.getElementById("msg");
const photosInput = document.getElementById("photosInput");
const preview = document.getElementById("preview");

let currentUser = null;
let selectedFiles = [];

// Vérification de l'utilisateur
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/wauklink-site/auth/login.html";
        return;
    }
    currentUser = user;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && ["particulier", "professionnel", "admin"].includes(snap.data().role)) {
        form.classList.remove("hidden");
        msg.textContent = "Complétez votre annonce ci-dessous.";
    } else {
        document.getElementById("planBlock").classList.remove("hidden");
        msg.textContent = "";
    }
});

// Prévisualisation des photos
photosInput.addEventListener("change", () => {
    selectedFiles = Array.from(photosInput.files).slice(0, 6);
    preview.innerHTML = "";
    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.width = "70px";
            img.style.margin = "5px";
            img.style.borderRadius = "5px";
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Envoi de l'annonce
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "⏳ Publication en cours...";

    try {
        // 1. Création du document avec status 'pending'
        const docRef = await addDoc(collection(db, "annonces"), {
            title: document.getElementById("title").value,
            city: document.getElementById("city").value,
            postalCode: document.getElementById("postalCode").value,
            type: document.getElementById("type").value, // Récupère 'emploi', 'travaux', etc.
            description: document.getElementById("description").value,
            phone: document.getElementById("phone").value,
            userId: currentUser.uid,
            status: "pending",
            createdAt: serverTimestamp(),
            photos: []
        });

        // 2. Upload des photos
        for (const file of selectedFiles) {
            const path = `annonces/${currentUser.uid}/${docRef.id}/${file.name}`;
            const fileRef = ref(storage, path);
            await uploadBytesResumable(fileRef, file);
            const url = await getDownloadURL(fileRef);
            await updateDoc(doc(db, "annonces", docRef.id), {
                photos: arrayUnion(url)
            });
        }

        msg.textContent = "🚀 Succès ! Votre annonce est en cours de validation.";
        form.reset();
        preview.innerHTML = "";
    } catch (err) {
        msg.textContent = "❌ Erreur lors de l'envoi.";
        console.error(err);
    }
});

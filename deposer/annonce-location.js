import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, addDoc, updateDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { wauklinkCategories } from "../shared/categories_data.js";

const form = document.getElementById("annonceForm");
const typeSelect = document.getElementById("type");
const specBlock = document.getElementById("specialiteBlock");
const specSelect = document.getElementById("specialite");
const msg = document.getElementById("msg");
const photosInput = document.getElementById("photosInput");
const preview = document.getElementById("preview");

let currentUser = null;
let files = [];

// --- GESTION DYNAMIQUE DES CATÉGORIES ---
typeSelect.addEventListener("change", () => {
    const selected = typeSelect.value;
    specSelect.innerHTML = '<option value="">— Choisir une spécialité —</option>';
    
    if (wauklinkCategories[selected]) {
        specBlock.classList.remove("hidden");
        wauklinkCategories[selected].specs.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            specSelect.appendChild(opt);
        });
    } else {
        specBlock.classList.add("hidden");
    }
});

// --- PREVIEW PHOTOS ---
photosInput.addEventListener("change", () => {
    files = Array.from(photosInput.files).slice(0, 6);
    preview.innerHTML = "";
    files.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "80px"; img.style.height = "80px"; img.style.objectFit = "cover";
        img.style.borderRadius = "5px"; img.style.margin = "5px";
        preview.appendChild(img);
    });
});

// --- AUTH CHECK ---
onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = "../auth/login.html"; return; }
    currentUser = user;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) form.classList.remove("hidden");
});

// --- SUBMIT ---
form.addEventListener("submit", async e => {
    e.preventDefault();
    if (files.length === 0) { msg.textContent = "⚠️ Photo obligatoire."; return; }

    msg.innerHTML = "⏳ Publication...";
    document.getElementById("submitBtn").disabled = true;

    try {
        // 1. Création Document
        const docRef = await addDoc(collection(db, "annonces"), {
            title: document.getElementById("title").value.trim(),
            city: document.getElementById("city").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            postalCode: document.getElementById("postalCode").value.trim(),
            type: typeSelect.value,
            specialite: specSelect.value || "Général",
            price: Number(document.getElementById("price").value) || 0,
            description: document.getElementById("description").value.trim(),
            userId: currentUser.uid,
            status: "pending",
            photos: [],
            createdAt: serverTimestamp()
        });

        // 2. Upload Photos
        const urls = [];
        for (const file of files) {
            const path = `annonces/${currentUser.uid}/${docRef.id}/${Date.now()}_${file.name}`;
            const fileRef = ref(storage, path);
            await uploadBytesResumable(fileRef, file);
            const url = await getDownloadURL(fileRef);
            urls.push(url);
        }

        // 3. Update final
        await updateDoc(doc(db, "annonces", docRef.id), { photos: urls });

        msg.innerHTML = "<b style='color:green;'>✅ Publiée !</b>";
        form.reset(); preview.innerHTML = "";
    } catch (err) {
        msg.innerHTML = "❌ Erreur : " + err.message;
    } finally {
        document.getElementById("submitBtn").disabled = false;
    }
});

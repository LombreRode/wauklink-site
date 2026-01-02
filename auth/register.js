document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const msg  = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const privacy = document.getElementById("acceptPrivacy");
    const cgu = document.getElementById("acceptCgu");
    const legal = document.getElementById("acceptLegal");
    const adult = document.getElementById("isAdult");
    
    if (!privacy.checked || !cgu.checked || !legal.checked || !adult.checked) {
      msg.textContent =
        "❌ Vous devez accepter la confidentialité, les CGU, les mentions légales et confirmer être majeur.";
      return;
    }

    if (!cgu.checked || !privacy.checked || !adult.checked) {
      msg.textContent = "❌ Vous devez accepter les conditions pour continuer.";
      return;
    }

    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const phone     = document.getElementById("phone").value.trim();
    const address   = document.getElementById("address").value.trim();
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value;
    const passwordConfirm =
      document.getElementById("passwordConfirm")?.value;

    if (password !== passwordConfirm) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    msg.textContent = "⏳ Création du compte…";

    try {
      const cred =
        await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        phone,
        address,
        email,
        role: "user",
        abonnement: { type: "free" },
        cgu: {
          accepted: true,
          acceptedAt: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Compte créé avec succès";

      setTimeout(() => {
        location.href = "/wauklink-site/index.html";
      }, 800);

    } catch (err) {
  console.error("ERREUR INSCRIPTION :", err);

  if (err && err.code) {
    msg.textContent = "❌ " + err.code;
  } else if (err && err.message) {
    msg.textContent = "❌ " + err.message;
  } else {
    msg.textContent = "❌ Erreur technique lors de la création du compte";
  }
}
  });
});

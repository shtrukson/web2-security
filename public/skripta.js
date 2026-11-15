async function posalji(adresa, podaci) {
  const odgovor = await fetch(adresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(podaci)
  });
  return odgovor.json();
}

function prikaziTablicu(redovi) {
  const tablica = document.createElement("table");
  const zaglavlje = tablica.insertRow();
  ["Korisničko ime", "Email", "Broj kartice"].forEach((naziv) => {
    const celija = document.createElement("th");
    celija.textContent = naziv;
    zaglavlje.appendChild(celija);
  });
  redovi.forEach((red) => {
    const redTablice = tablica.insertRow();
    redTablice.insertCell().textContent = red.korisnicko_ime;
    redTablice.insertCell().textContent = red.email;
    redTablice.insertCell().textContent = red.broj_kartice;
  });
  return tablica;
}

document.getElementById("sqlGumb").addEventListener("click", async () => {
  const rezultat = document.getElementById("sqlRezultat");
  const podaci = await posalji("/podaci", {
    korisnickoIme: document.getElementById("sqlKorisnickoIme").value,
    lozinka: document.getElementById("sqlLozinka").value,
    ranjivost: document.getElementById("sqlRanjivost").checked
  });

  rezultat.innerHTML = "";
  const upit = document.createElement("pre");
  upit.textContent = "Izvršeni upit: " + podaci.upit;
  rezultat.appendChild(upit);

  if (podaci.greska) {
    const greska = document.createElement("p");
    greska.textContent = "Greška u upitu: " + podaci.greska;
    rezultat.appendChild(greska);
  } else if (podaci.redovi.length === 0) {
    const poruka = document.createElement("p");
    poruka.textContent = "Nema pronađenih podataka.";
    rezultat.appendChild(poruka);
  } else {
    rezultat.appendChild(prikaziTablicu(podaci.redovi));
  }
});

document.getElementById("prijavaGumb").addEventListener("click", async () => {
  const podaci = await posalji("/prijava", {
    korisnickoIme: document.getElementById("authKorisnickoIme").value,
    lozinka: document.getElementById("authLozinka").value,
    ranjivost: document.getElementById("authRanjivost").checked
  });
  document.getElementById("authRezultat").textContent = podaci.poruka;
});

document.getElementById("bruteForceGumb").addEventListener("click", async () => {
  const ispis = document.getElementById("authRezultat");
  const ranjivost = document.getElementById("authRanjivost").checked;
  const lozinke = ["123456", "password", "qwerty", "admin", "12345678", "letmein", "iloveyou", "sunshine", "football", "monkey"];

  ispis.textContent = "Brute-force napad na korisnika 'admin'...\n";

  for (let i = 0; i < lozinke.length; i++) {
    const podaci = await posalji("/prijava", { korisnickoIme: "admin", lozinka: lozinke[i], ranjivost });
    ispis.textContent += (i + 1) + ". pokušaj: " + lozinke[i] + " -> " + podaci.poruka + "\n";
    if (podaci.uspjeh) {
      ispis.textContent += "\nNAPAD USPJEŠAN! Lozinka korisnika admin je: " + lozinke[i];
      return;
    }
  }

  ispis.textContent += "\nNapad nije uspio, lozinka nije pronađena.";
});

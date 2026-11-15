async function posalji(adresa, podaci) {
  const odgovor = await fetch(adresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(podaci)
  });
  return odgovor.json();
}

function povezi(prekidacId, stanjeId) {
  const prekidac = document.getElementById(prekidacId);
  const stanje = document.getElementById(stanjeId);
  prekidac.addEventListener("change", () => {
    stanje.textContent = prekidac.checked ? "RANJIVO" : "ZASTICENO";
    stanje.classList.toggle("ranjivo", prekidac.checked);
  });
}

povezi("sqlRanjivost", "sqlStanje");
povezi("authRanjivost", "authStanje");

function napraviTablicu(redovi) {
  const tablica = document.createElement("table");
  const zaglavlje = tablica.insertRow();
  ["korisnik", "email", "kartica"].forEach((naziv) => {
    const celija = document.createElement("th");
    celija.textContent = naziv;
    zaglavlje.appendChild(celija);
  });
  redovi.forEach((red) => {
    const novi = tablica.insertRow();
    novi.insertCell().textContent = red.korisnicko_ime;
    novi.insertCell().textContent = red.email;
    novi.insertCell().textContent = red.broj_kartice;
  });
  return tablica;
}

document.getElementById("sqlGumb").addEventListener("click", async () => {
  const konzola = document.getElementById("sqlRezultat");
  const podaci = await posalji("/podaci", {
    korisnickoIme: document.getElementById("sqlKorisnickoIme").value,
    lozinka: document.getElementById("sqlLozinka").value,
    ranjivost: document.getElementById("sqlRanjivost").checked
  });

  konzola.textContent = "> " + podaci.upit + "\n";

  if (podaci.greska) {
    konzola.textContent += "greska: " + podaci.greska;
  } else if (podaci.redovi.length === 0) {
    konzola.textContent += "nema rezultata";
  } else {
    konzola.textContent += "broj redaka: " + podaci.redovi.length;
    konzola.appendChild(napraviTablicu(podaci.redovi));
  }
});

document.getElementById("prijavaGumb").addEventListener("click", async () => {
  const podaci = await posalji("/prijava", {
    korisnickoIme: document.getElementById("authKorisnickoIme").value,
    lozinka: document.getElementById("authLozinka").value,
    ranjivost: document.getElementById("authRanjivost").checked
  });
  document.getElementById("authRezultat").textContent = "> " + podaci.poruka;
});

document.getElementById("bruteForceGumb").addEventListener("click", async () => {
  const konzola = document.getElementById("authRezultat");
  const ranjivost = document.getElementById("authRanjivost").checked;
  const lozinke = ["123456", "password", "qwerty", "admin", "12345678", "letmein", "iloveyou", "sunshine", "football", "monkey"];

  konzola.textContent = "brute force na korisnika admin\n";

  for (let i = 0; i < lozinke.length; i++) {
    const podaci = await posalji("/prijava", { korisnickoIme: "admin", lozinka: lozinke[i], ranjivost });
    konzola.textContent += (i + 1) + ". " + lozinke[i] + " -> " + podaci.poruka + "\n";
    if (podaci.uspjeh) {
      const poruka = document.createElement("span");
      poruka.className = "crveno";
      poruka.textContent = "\nlozinka pronadena: " + lozinke[i];
      konzola.appendChild(poruka);
      return;
    }
  }

  konzola.textContent += "\nlozinka nije pronadena";
});

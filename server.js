const express = require("express");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const baza = new Database(":memory:");

baza.exec(`
  CREATE TABLE korisnici (
    id INTEGER PRIMARY KEY,
    korisnicko_ime TEXT,
    lozinka TEXT,
    email TEXT,
    broj_kartice TEXT
  );
  INSERT INTO korisnici (korisnicko_ime, lozinka, email, broj_kartice) VALUES
    ('admin', 'sunshine', 'admin@projekt2.hr', '4111-1111-1111-1111'),
    ('ana', 'Ana!Sigurna#2026', 'ana@projekt2.hr', '5500-0000-0000-0004'),
    ('marko', 'Marko$Jaka%Lozinka9', 'marko@projekt2.hr', '3400-0000-0000-009');
`);

app.post("/podaci", (req, res) => {
  const { korisnickoIme, lozinka, ranjivost } = req.body;

  if (ranjivost) {
    const upit = "SELECT korisnicko_ime, email, broj_kartice FROM korisnici WHERE korisnicko_ime = '" + korisnickoIme + "' AND lozinka = '" + lozinka + "'";
    try {
      const redovi = baza.prepare(upit).all();
      res.json({ upit, redovi });
    } catch (greska) {
      res.json({ upit, redovi: [], greska: greska.message });
    }
    return;
  }

  const upit = "SELECT korisnicko_ime, email, broj_kartice FROM korisnici WHERE korisnicko_ime = ? AND lozinka = ?";
  const redovi = baza.prepare(upit).all(korisnickoIme, lozinka);
  res.json({ upit, redovi });
});

const MAKS_POKUSAJA = 3;
const TRAJANJE_BLOKADE = 60 * 1000;
const neuspjesniPokusaji = {};

app.post("/prijava", (req, res) => {
  const { korisnickoIme, lozinka, ranjivost } = req.body;
  const korisnik = baza.prepare("SELECT * FROM korisnici WHERE korisnicko_ime = ?").get(korisnickoIme);

  if (ranjivost) {
    if (!korisnik) {
      res.json({ uspjeh: false, poruka: "Korisnik '" + korisnickoIme + "' ne postoji." });
      return;
    }
    if (korisnik.lozinka !== lozinka) {
      res.json({ uspjeh: false, poruka: "Pogrešna lozinka za korisnika '" + korisnickoIme + "'." });
      return;
    }
    res.json({ uspjeh: true, poruka: "Prijava uspješna! Dobrodošli, " + korisnickoIme + "." });
    return;
  }

  const stanje = neuspjesniPokusaji[korisnickoIme] || { broj: 0, blokiranDo: 0 };

  if (stanje.blokiranDo > Date.now()) {
    const sekunde = Math.ceil((stanje.blokiranDo - Date.now()) / 1000);
    res.json({ uspjeh: false, poruka: "Previše neuspjelih pokušaja. Pokušajte ponovno za " + sekunde + " s." });
    return;
  }

  if (!korisnik || korisnik.lozinka !== lozinka) {
    stanje.broj = stanje.broj + 1;
    if (stanje.broj >= MAKS_POKUSAJA) {
      stanje.broj = 0;
      stanje.blokiranDo = Date.now() + TRAJANJE_BLOKADE;
    }
    neuspjesniPokusaji[korisnickoIme] = stanje;
    res.json({ uspjeh: false, poruka: "Neispravno korisničko ime ili lozinka." });
    return;
  }

  delete neuspjesniPokusaji[korisnickoIme];
  res.json({ uspjeh: true, poruka: "Prijava uspješna! Dobrodošli, " + korisnickoIme + "." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server radi na http://localhost:" + PORT);
});

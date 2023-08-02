const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config(); // Načtení e-mailových údajů ze souboru .env

const app = express();
const port = 3000; // Změňte na požadovaný port

// Nastavení e-mailového účtu
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Načtení e-mailu ze souboru .env
    pass: process.env.EMAIL_PASS, // Načtení hesla ze souboru .env
  },
});

// Nastavení připojení k databázi
const db = mysql.createConnection({
  host: 'sql6.webzdarma.cz', // Zde vložte adresu serveru s MySQL
  user: 'putovanibrne0591', // Zde vložte uživatelské jméno pro přihlášení k MySQL
  password: '&%d9QJ)g96AmLD^s*K39', // Zde vložte heslo pro přihlášení k MySQL
  database: 'anone', // Zde vložte název vaší MySQL databáze
});

// Připojení k databázi
db.connect((err) => {
  if (err) {
    console.error('Chyba při připojení k databázi:', err);
  } else {
    console.log('Připojení k databázi bylo úspěšné.');
  }
});

// Nastavení zpracování těla požadavku jako JSON
app.use(bodyParser.json());

// Přijetí požadavků POST na cestě /odeslat
app.post('/odeslat', (req, res) => {
  const odpoved = req.body.odpoved;
  if (odpoved && (odpoved === 'ano' || odpoved === 'ne')) {
    // Vytvoření e-mailové zprávy
    const mailOptions = {
      from: process.env.EMAIL_USER, // Načtení e-mailu ze souboru .env
      to: 'vendaciki@seznam.cz', // Zde vložte e-mailovou adresu, kam chcete zprávu odeslat
      subject: 'Odpověď na rande',
      text: `Uživatel odpověděl: ${odpoved}`,
    };

    // Uložení odpovědi do databáze
    const sql = 'INSERT INTO odpovedi (odpoved) VALUES (?)';
    db.query(sql, [odpoved], (err, result) => {
      if (err) {
        console.error('Chyba při ukládání do databáze:', err);
        res.status(500).send('Chyba při ukládání odpovědi');
      } else {
        console.log('Odpověď byla úspěšně uložena do databáze.');
        // Odeslání e-mailu
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            res.status(500).send('Chyba při odesílání e-mailu');
          } else {
            console.log('E-mail byl úspěšně odeslán: ' + info.response);
            res.status(200).send('E-mail byl úspěšně odeslán');
          }
        });
      }
    });
  } else {
    res.status(400).send('Prosím vyberte odpověď "ano" nebo "ne"');
  }
});

// Spuštění serveru
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});

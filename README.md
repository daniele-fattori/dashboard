# Dashboard personale

Una pagina che riassume le tue app: **Bilancio** (spese, entrate, conti, carte, rate, abbonamenti, patrimonio),
**Palestra** (schede e allenamenti) e **Lavoro** (giornate). Tutto funziona dal browser del telefono o del computer,
senza installare niente.

I dati stanno sul **tuo** progetto Firebase, ma prima di partire dal telefono sono **cifrati con la tua passphrase**:
su Firebase ci sono solo testi illeggibili. Nemmeno chi ha accesso a Firebase può leggerli. Se dimentichi la
passphrase i dati non si possono recuperare, quindi scrivila da qualche parte.

## Cosa c'è

- **Dashboard** (`index.html`): saldo del mese, patrimonio, spese del mese per categoria, grafico entrate/uscite,
  prossima giornata di lavoro, allenamento del giorno, calendario e scadenze (rate, abbonamenti). Le app si aprono
  dentro la Dashboard.
- **Bilancio** (`bilancio/`): movimenti, riepilogo mensile, conti e patrimonio, carte di credito, rate, abbonamenti.
  **Importa estratto conto**: in Movimenti (o in Impostazioni) scegli il file scaricato dalla banca, in **CSV, Excel
  o PDF**. L'app trova tutti i movimenti, propone la categoria e, dopo la conferma, li registra nei mesi giusti.
  - I movimenti già registrati vengono saltati.
  - Prelievi e giroconti tra i tuoi conti non si contano.
  - Se cambi la categoria di un negozio, la volta dopo te la propone già giusta.
  - Il file resta sul telefono.
  - Un PDF ottenuto da una scansione (una foto) non si può leggere: in quel caso scarica dalla banca la lista dei
    movimenti in CSV o Excel.
- **Palestra** (`palestra/`): programma, schede, pesi, storico.
- **Lavoro** (`lavoro/`): le giornate di lavoro, con agenzia, nave, tariffa lorda, netto ed extra, a elenco o a
  calendario. Il netto di ogni giornata passata entra da solo tra le entrate del Bilancio.
- **Backup**: ogni giorno una copia cifrata di tutto. Si gestiscono in Dashboard → Impostazioni → Backup.

## Mettere online (una volta sola, circa 15 minuti)

### 1. Il progetto Firebase

1. Vai su <https://console.firebase.google.com>, premi **Aggiungi progetto**, dagli un nome (es. `mia-dashboard`).
   Google Analytics non serve.
2. **Authentication**:
   1. Premi **Inizia** e attiva **Email/password**.
   2. In **Utenti → Aggiungi utente** crea il tuo account (la tua email e una password).
   3. Copia l'**UID utente** che compare nella tabella: ti serve al punto 4.
3. **Firestore Database**: premi **Crea database**, modalità **produzione**, scegli una località europea (es.
   `europe-west`). Il piano gratuito (Spark) basta e avanza: non serve la carta di credito.
4. **Firestore → Regole**:
   1. Cancella tutto e incolla il contenuto del file `firestore.rules`.
   2. Sostituisci `IL_TUO_UID` con l'UID copiato al punto 2.
   3. Premi **Pubblica**.

### 2. Collegare il sito a Firebase

1. In Firebase: **Impostazioni progetto** (rotella) → **Generali** → **Le tue app** → icona **Web** (`</>`).
   Registra l'app con un nome qualsiasi; Firebase Hosting non serve.
2. Copia i valori `apiKey`, `authDomain`, `projectId` e `appId`.
3. Aprili nel file **`comune/config.js`** (è l'unico file da modificare) e scrivi il tuo nome in `nome`:

```js
window.CONFIG_APP = {
  firebase: {
    apiKey: 'AIza...',
    authDomain: 'mia-dashboard.firebaseapp.com',
    projectId: 'mia-dashboard',
    appId: '1:123...:web:abc...'
  },
  googleClientId: '',
  nome: 'Marco'
};
```

### 3. Pubblicare su GitHub Pages

1. Crea un repository su GitHub (es. `dashboard`) e carica **tutti** i file e le cartelle di questo progetto:
   `index.html`, `bilancio/`, `palestra/`, `lavoro/`, `comune/`, le icone, `firestore.rules`, `README.md`.
   Mantieni la stessa struttura: la Dashboard da sola non basta, le app stanno nelle cartelle.
2. Nel repository: **Settings → Pages → Build and deployment → Deploy from a branch**, ramo `main`, cartella `/ (root)`.
3. Dopo un minuto il sito è su `https://TUONOME.github.io/dashboard/`.
4. In Firebase: **Authentication → Impostazioni → Domini autorizzati → Aggiungi dominio** → `TUONOME.github.io`.

### 4. Primo accesso

1. Apri il sito, accedi con l'email e la password del punto 1.2.
2. Scegli una **passphrase** (almeno 10 caratteri): cifra tutti i dati. Annotala bene.
3. Dal telefono: Condividi → **Aggiungi alla schermata Home**, così si apre come un'app.

### 5. Sicurezza (consigliato)

- **Authentication → Impostazioni → Azioni utente**: togli la spunta a **Abilita creazione (registrazione)**, così
  nessun altro può crearsi un account sul tuo progetto.
- **Google Cloud Console → API e servizi → Credenziali** → la chiave "Browser key (auto created by Firebase)":
  1. In **Limitazioni delle applicazioni** scegli **Siti web** e aggiungi `https://TUONOME.github.io/*`.
  2. In **Limitazioni API** scegli **Identity Toolkit API**, **Token Service API** e **Cloud Firestore API**.
- **Non serve** attivare la fatturazione né un account Google Cloud a pagamento.

### 6. Google Calendar (facoltativo)

Serve solo se vuoi vedere e aggiungere gli eventi di Google Calendar nella Dashboard. Senza, tutto il resto
funziona lo stesso.

1. Google Cloud Console (stesso progetto di Firebase) → **API e servizi → Libreria** → attiva **Google Calendar API**.
2. **Schermata consenso OAuth**:
   1. Tipo **Esterno**, poi nome dell'app e la tua email.
   2. In **Utenti di prova** aggiungi la tua email.
3. **Credenziali → Crea credenziali → ID client OAuth**:
   1. Tipo **Applicazione web**.
   2. In **Origini JavaScript autorizzate** aggiungi `https://TUONOME.github.io`.
4. Copia l'**ID client** (finisce con `.apps.googleusercontent.com`) in `googleClientId` dentro `comune/config.js`.
5. Nella Dashboard: **Impostazioni → Google Calendar → Collega**.

## Se qualcosa non va

- **"Manca la configurazione di Firebase"**: `comune/config.js` è ancora vuoto o non è stato caricato su GitHub.
- **"Accesso negato" o "permission-denied"**: le regole non sono pubblicate, oppure l'UID in `firestore.rules` non è
  quello del tuo utente.
- **Il login con l'email non parte**: manca il dominio `TUONOME.github.io` tra i domini autorizzati di Firebase
  (punto 3.4).
- **Dati vecchi dopo un aggiornamento del sito**: chiudi e riapri l'app, oppure ricarica la pagina.

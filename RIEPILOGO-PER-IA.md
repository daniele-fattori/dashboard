# Riepilogo del progetto (da leggere per primo)

Questo file è per un assistente di intelligenza artificiale (o uno sviluppatore) che riceve lo zip del progetto e deve
aiutare il proprietario a metterlo online, usarlo e modificarlo. Spiega cos'è, come è fatto, cosa è stato cambiato
rispetto all'originale e cosa resta da fare. Le istruzioni di installazione per l'utente sono nel `README.md`.

## 1. In breve

- È una **Dashboard personale** fatta solo di pagine HTML statiche: niente server, niente build, niente npm.
- Va pubblicata su **GitHub Pages** e usa **Firebase** (Authentication email/password + Firestore) del proprietario.
- Contiene quattro app che si aprono dentro la Dashboard: **Bilancio**, **Palestra**, **Lavoro**, più la **Panoramica**.
- È una **copia adattata** della Dashboard di un'altra persona (l'amico che l'ha passata). È **completamente
  separata** dall'originale: nessuna chiave, nessun progetto Firebase e nessun dato in comune. Il nuovo proprietario
  crea il suo Firebase e il suo repository GitHub.
- Tutti i dati sono **cifrati nel browser** (AES-GCM 256, chiave derivata dalla passphrase con PBKDF2-SHA256,
  600.000 iterazioni) prima di arrivare su Firestore. Su Firebase ci sono solo testi cifrati. Passphrase persa =
  dati persi: non c'è recupero.

## 2. Cosa è stato chiesto per questa versione (e fatto)

Richieste del proprietario originale per la versione da dare all'amico:

1. **Togliere il collegamento a Port Mobility** (sito del porto di Civitavecchia usato per moli e navi): fatto.
   Non esiste più `comune/porto.js`, la CSP non permette più quel dominio e nessuna pagina lo contatta.
2. **Togliere l'app Mezzi** (veicoli, carburante, manutenzioni): fatto. Via dalla barra, dal dock, dalla Panoramica,
   dal calendario, dalle impostazioni e dal Bilancio (la lettura dei dati di Mezzi è disattivata in `bordoLeggi()`).
   La cartella `giornale/` non c'è.
3. **Bilancio e Palestra: come l'originale.** Il Bilancio parte vuoto: niente conti o carte predefiniti (nell'originale
   venivano creati in automatico ING, BBVA, N26, Telepass ecc.: rimossi).
4. **Lavoro: solo "Giornate"**: niente schede Prossime, Fatture e Riepilogo, niente stato fatturata/pagata e niente
   numero di fattura. Una giornata è "fatta" (passata) o "in programma" (futura).
5. **Nuova funzione: importare gli estratti conto dei mesi passati** e registrare in automatico tutte le spese e le
   entrate (CSV, Excel e PDF). Dettagli al punto 6.

Altre modifiche fatte per renderla di un'altra persona:

- Tutta la configurazione sta in **un solo file**: `comune/config.js` (Firebase, ID client Google facoltativo, nome).
- Il nome dell'utente (saluto "Buongiorno, Marco", iniziale nell'avatar) viene da `config.js`.
- Al posto del riquadro Mezzi, in Panoramica c'è **"Spese del mese per categoria"** (le 5 categorie più alte).
- Se `config.js` è vuoto, la Dashboard mostra un messaggio che spiega cosa fare, invece di dare errori.
- La CSP accetta qualunque `*.firebaseapp.com` (serve per il login di qualsiasi progetto Firebase).
- Tolti file e testi personali del vecchio proprietario (nome, email, ID progetto, foto delle carte, note interne).

## 3. Struttura dei file

```
index.html            Dashboard (Panoramica, calendario, impostazioni, backup, Google Calendar facoltativo)
bilancio/index.html   Bilancio (file unico, ~3.900 righe: HTML + CSS + JS)
palestra/index.html   Palestra
lavoro/index.html     Lavoro (solo Giornate)
comune/config.js      ← L'UNICO FILE DA COMPILARE: Firebase, googleClientId, nome
comune/cassaforte.js  accesso unico, cifratura, lettura/scrittura su Firestore, unione tra dispositivi, backup, registro attività
comune/fisso.js       sicurezza (anti-clickjacking, registro violazioni CSP), tastiera e finestre su iPhone, tira-per-aggiornare
comune/moto.js        animazioni
comune/suggerimenti.js suggerimenti sotto i campi (al posto di <datalist>, che su iPhone dava problemi)
comune/agenzie.js     loghi di alcune agenzie portuali e della compagnia Costa (usati in Lavoro e Bilancio; innocui se non servono)
comune/programma.js   programma di allenamento della Palestra
comune/sfondo.svg     sfondo
firestore.rules       regole di sicurezza di Firestore (da incollare nella console, con il proprio UID)
README.md             istruzioni di installazione per l'utente
```

Non ci sono dipendenze da installare. Librerie esterne caricate solo quando servono, da cdnjs: SheetJS
(`xlsx 0.18.5`) e pdf.js (`3.11.174`) per gli estratti conto. Il Firebase SDK compat è il `10.14.1` da gstatic.

## 4. Dati: dove stanno e com'è fatto

Tutto sta sotto `bilancio/{uid}` su Firestore, cifrato:

- `bilancio/{uid}`: documento "cassaforte" (sale, iterazioni, verifica della passphrase). Nessun dato in chiaro.
- `bilancio/{uid}/sez/{sezione}`: le sezioni del Bilancio, una per documento, ognuna cifrata (compressa sopra i 50 KB).
  Sezioni: `tx` (movimenti), `conti`, `rate`, `inv`, `trading`, `carte`, `servizi`, `opz` (opzioni), `storico`
  (foto mensili del patrimonio), `abbo` (abbonamenti).
- `bilancio/{uid}/palestra/{voce}`: dati della Palestra.
- `bilancio/{uid}/dashboard/{voce}`: dati di Lavoro (voce `lavoro`), Google Calendar, backup automatici (`bk_AAAAMMGG`), registro.
- `bilancio/{uid}/giornale/{voce}`: era di Mezzi. Resta permesso dalle regole perché i backup lo leggono, ma è vuoto.

Ogni documento ha un numero di revisione (`rev`) che cresce sempre. Se due dispositivi salvano insieme, l'app unisce
le modifiche (unione a tre vie in `Cassaforte.unisci`) invece di sovrascrivere. Le regole Firestore rifiutano
revisioni più vecchie, documenti con campi non previsti e cancellazioni (tranne i backup vecchi).

**Movimento del Bilancio** (`S.tx[]`):

- Campi principali: `{id, d:'AAAA-MM-GG', t, cat, sub, det, amt, note}`.
  - `t`: `'u'` uscita, `'e'` entrata, `'r'` rata, `'rb'` rimborso.
  - `amt`: importo, sempre positivo.
- Campi facoltativi:
  - `pag`/`conto`: metodo di pagamento. Se presente, l'importo esce dal saldo di quel conto.
  - `carta`: carta di credito.
  - `quota`: acquisto di gruppo.
  - `lav`: entrata generata da una giornata di Lavoro.
  - `est`: impronta del movimento importato da estratto conto, per evitare doppioni.

**Giornata di Lavoro** (voce `dashboard/lavoro`):

- `{giornate:[{id, d, agenzia, nave, tipo, lordo, extra, stato, fattura, note}], aliquote:{imponibile:0.85, ritenuta:0.21, rivalsa:0.04}}`.
- `stato` e `fattura` restano nel formato, ma in questa versione sono sempre vuoti.
- Calcoli:
  - netto = lordo − ritenuta (21%) sull'85% del lordo + rivalsa (4%);
  - totale = netto + extra.
- Le percentuali si cambiano in `aliquote`. In questa versione non c'è il pulsante per cambiarle: era nel Riepilogo,
  che è stato tolto.
- Ogni giornata passata entra da sola nel Bilancio come entrata (categoria `Lavoro`, voce `Porto`, dettaglio =
  agenzia).

## 5. Installazione (riassunto: i passi completi sono nel README)

1. **Firebase**:
   1. Crea il progetto.
   2. Authentication: attiva Email/password e crea l'utente a mano. Copia l'UID.
   3. Crea il database Firestore in modalità produzione. Basta il piano gratuito Spark.
2. **Regole**: incolla `firestore.rules` nella console, sostituisci `IL_TUO_UID` con l'UID e pubblica.
3. **Configurazione**: app Web nelle impostazioni del progetto → copia `apiKey`, `authDomain`, `projectId` e `appId`
   in `comune/config.js`, più il nome.
4. **GitHub Pages**:
   1. Carica tutti i file mantenendo le cartelle.
   2. Settings → Pages → branch `main`, cartella root.
5. **Dominio**: Firebase → Authentication → Impostazioni → Domini autorizzati → aggiungi `NOMEUTENTE.github.io`.
6. **Primo accesso**: email e password, poi scegli la passphrase (almeno 10 caratteri) e annotala.
7. **Consigliato**:
   - disattiva la registrazione di nuovi utenti in Authentication;
   - limita la chiave API ai siti web `https://NOMEUTENTE.github.io/*` e alle API Identity Toolkit, Token Service e
     Cloud Firestore.
8. **Facoltativo, Google Calendar**:
   1. Attiva la Google Calendar API.
   2. Configura la schermata di consenso OAuth (tipo Esterno, con la propria email tra gli utenti di prova).
   3. Crea un ID client OAuth "Applicazione web" con origine `https://NOMEUTENTE.github.io`.
   4. Copia l'ID in `googleClientId` dentro `config.js`.

Non serve alcun account Google Cloud a pagamento. Se arriva la mail "il periodo di prova è terminato, esegui
l'upgrade", non va fatto: basta verificare che il progetto Firebase sia sul piano Spark.

## 6. Importazione degli estratti conto (la funzione nuova)

Dove si trova:

- Bilancio → **Movimenti** → pulsante "Importa estratto conto (CSV, Excel, PDF)".
- Anche in Bilancio → Impostazioni → Estratti conto.
- Codice: in `bilancio/index.html`, il blocco `/* ============ ESTRATTI CONTO ... */`, subito prima di
  `/* ============ IMPOSTAZIONI ============ */`.

Come funziona:

1. **Lettura del file** (`estLeggiFile`): tutto avviene nel browser, il file non viene inviato da nessuna parte.
   - **CSV** (`estCSV` + `estDaTabella`):
     - separatore riconosciuto da solo (`;`, `,`, tab, `|`), virgolette gestite;
     - codifica UTF-8, oppure Windows-1252 se ci sono caratteri strani (file salvati da Excel).
   - **Excel** (.xlsx, .xls, .ods): SheetJS. Prende il foglio con più movimenti riconosciuti.
   - **PDF**: pdf.js. Le righe si ricompongono dalle posizioni del testo:
     - una riga che inizia con una data è un movimento;
     - le righe successive senza data (fino a 2) completano la descrizione;
     - uscita o entrata si decide dalla colonna più vicina tra "Dare/Uscite/Addebiti" e "Avere/Entrate/Accrediti",
       ignorando la colonna "Saldo";
     - le righe di saldo iniziale e finale e i totali sono esclusi.
     - Nota tecnica: il worker di pdf.js viene caricato come script prima di pdf.js, così non si crea un Web Worker
       esterno, che la CSP bloccherebbe.
   - **Intestazione delle tabelle**: cerca nelle prime 40 righe le colonne data, descrizione/causale, importo oppure
     dare/avere. Se l'intestazione non c'è, deduce le colonne dal contenuto.
   - **Numeri**: formato italiano `1.234,56` e inglese `1,234.56`; segno davanti, dietro (`12,50-`) o tra parentesi.
   - **Date**: `GG/MM/AAAA`, `GG/MM/AA`, `AAAA-MM-GG`, `GG.MM.AAAA`, `12 gen 2026` e date di Excel.
2. **Categoria proposta** (`estProponi`):
   1. Prima le scelte fatte a mano in passato per lo stesso negozio. Sono salvate in `S.opz.estRegole` con la
      "chiave negozio": le prime 3 parole significative della descrizione (`estChiave`).
   2. Poi l'elenco di parole note `EST_REGOLE`: supermercati, carburante, pedaggi, parcheggi, viaggi, ristoranti e
      bar, abbonamenti digitali, shopping online, bollette luce/gas, telefono/internet, affitto, salute, sport, svago,
      assicurazioni, tasse, commissioni bancarie; tra le entrate stipendio, pensione, rimborsi, interessi.
   3. Altrimenti "Altre spese" o "Altre entrate".
   - Prelievi e giroconti tra i propri conti (incluso il pagamento del saldo della carta di credito) sono proposti
     come **"Non registrare"**.
3. **Anteprima**:
   - Ogni movimento ha un menu per cambiare la categoria. Cambiandola per un negozio cambiano anche gli altri
     movimenti dello stesso negozio non toccati a mano.
   - Si può creare una categoria nuova.
4. **Doppioni**: impronta `data|importo|descrizione` salvata in `t.est`. Sono proposti come "Non registrare":
   - un movimento già importato;
   - un movimento scritto a mano con la stessa data, lo stesso importo e lo stesso tipo.
5. **Registrazione**:
   - Crea i movimenti con nota = descrizione della banca + "estratto NOMEBANCA".
   - **Non cambia i saldi dei conti**, perché sono soldi già usciti o entrati: i saldi attuali si aggiornano a mano in
     Patrimonio.

Per adattarla a una banca specifica:

- Se il formato non viene letto bene, controlla le espressioni regolari dell'intestazione in `estDaTabella`
  (variabile `col`) e, per i PDF, i nomi delle colonne in `estDaPDF` (`intest.dare`, `intest.avere`, `intest.saldo`).
- Per aggiungere parole e negozi, aggiungi righe a `EST_REGOLE`: `[espressione, 'u'|'e'|'x', 'Categoria', 'Voce']`.
  L'ordine conta: vince la prima regola che corrisponde.
- I PDF ottenuti da una scansione (immagini) non contengono testo: serve il CSV o l'Excel della banca.

## 7. Cose da sapere prima di modificare il codice

- **Mai** mettere dati personali (movimenti, saldi, giornate) nel codice o nel repository. Il `.gitignore` esclude
  già `*.csv`, `*.json`, `*.xlsx`, file di backup e segreti.
- **Mai** salvare dati in chiaro su Firestore o nel `localStorage`: tutto passa da `cifraSez` (Bilancio) o da
  `Cassaforte.scrivi` (le altre app).
- **CSP**: ogni pagina ha una Content-Security-Policy nel `<meta>`. Script esterni sono permessi solo da gstatic,
  cdnjs, accounts.google.com e apis.google.com. Niente `eval`. Se si aggiunge una libreria o un servizio esterno, va
  aggiunto alla CSP di **tutte** le pagine che lo usano (`index.html`, `bilancio/`, `palestra/`, `lavoro/`).
- Le app comunicano con la Dashboard con `postMessage`, controllando sempre `origin` e `source`.
- Lo stato del Bilancio è nell'oggetto globale `S`. Si salva con `save()`, si ridisegna con `render()`. Le finestre
  si aprono con `sheet(html)` e si chiudono con `closeSheet()`.
- Il registro "attività sospette" (Dashboard → Impostazioni) segnala anche le violazioni della CSP. Se compare un
  dominio bloccato, di solito è una libreria o un servizio da aggiungere alla CSP, non un attacco.

## 8. Limiti noti e possibili sviluppi

- La versione è stata provata con un Firebase finto (test automatici nel browser), non con un progetto Firebase vero.
  Al primo avvio, se qualcosa non va:
  - "permission-denied" → regole non pubblicate o UID sbagliato;
  - il login non parte → manca il dominio tra i domini autorizzati.
- L'importazione degli estratti conto è stata provata con file di esempio in stile ING (CSV con Uscite/Entrate),
  Intesa (Excel con importo con segno) e un PDF con colonne Dare/Avere/Saldo. Altre banche potrebbero richiedere
  piccoli ritocchi (punto 6).
- La sezione Lavoro è pensata per lavoro a giornata in porto (agenzia, nave, tariffa lorda, ritenuta). Se il lavoro
  è diverso si possono rinominare i campi nella finestra della giornata (`modifica()` in `lavoro/index.html`).
- Possibili aggiunte su richiesta:
  - pulsante per cambiare le percentuali di Lavoro;
  - importazione degli estratti della carta di credito collegata alla carta in Bilancio;
  - regole di categoria modificabili da una schermata.

## 9. Aggiornamento del 13 novembre 2026

Per le correzioni successive alla versione originale di questo riepilogo, leggere `VERIFICA.md`.
In particolare, Bilancio non offre più il salvataggio locale senza Firebase: richiede configurazione completa e cassaforte sbloccata. Il lettore CSV gestisce campi su più righe e separatori nelle descrizioni; le date vengono validate sul calendario. Il minimo di 10 caratteri per nuove passphrase è ora applicato anche dal codice.

La configurazione Firebase è ancora da compilare. Non è stato eseguito un collaudo con Firebase reale né pubblicato il sito.


## Configurazione del 14 novembre 2026

Parametri Firebase dell’app Web `dashboard-daniele` e nome Daniele inseriti in `comune/config.js` dai dati forniti dal proprietario. UID proprietario inserito in `firestore.rules`. Nessuna password o passphrase inserita.

Restano da creare il database Firestore `(default)`, pubblicare le regole configurate, pubblicare il sito e completare il collaudo con login e salvataggio reali. Le precedenti note sulla configurazione vuota sono superate da questo aggiornamento.

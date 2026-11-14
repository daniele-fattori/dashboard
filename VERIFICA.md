# Verifica del 13 novembre 2026

## Correzioni

- Bilancio richiede ora tutti e quattro i parametri Firebase: apiKey, authDomain, projectId, appId.
- Senza configurazione completa mostra un blocco di accesso. Non carica i dati locali precedenti e non scrive movimenti in chiaro nel localStorage.
- I dati locali delle vecchie versioni possono ancora essere letti per la migrazione dopo lo sblocco della cassaforte. Non vengono eliminati prima del salvataggio cifrato.
- Il controllo della configurazione completa è presente anche nella Dashboard e nella Cassaforte comune.
- Import CSV: separatore scelto dalla regolarità delle colonne, ignorando le virgole nei campi tra virgolette; supportate descrizioni su più righe e virgolette raddoppiate.
- Import date: scartate date inesistenti come il 31 febbraio; accettato il 29 febbraio negli anni bisestili.
- Creazione e cambio passphrase richiedono almeno 10 caratteri, come documentato. Le passphrase già esistenti continuano a sbloccare i dati.

## Controlli eseguiti

- Sintassi di 12 blocchi/file JavaScript: superata.
- Import CSV italiano con descrizioni contenenti virgole e importi decimali: superato.
- Import CSV inglese con importo negativo e separatore delle migliaia: superato.
- Campi CSV su più righe e virgolette raddoppiate: superati.
- Separatori tab e pipe: superati.
- Date inesistenti e anni bisestili: superati.
- Avvio di Bilancio senza configurazione: mostra il blocco prima di caricare Firebase.
- Salvataggio senza configurazione o senza chiave: nessuna scrittura. Con configurazione e chiave: inoltro al salvataggio cloud.

## Limiti e prossimi passi

Non è una verifica di sicurezza completa. Non sono stati provati il rendering nel browser, il login, le regole Firestore, la sincronizzazione su più dispositivi o il salvataggio su un progetto Firebase reale. Excel e PDF non sono stati nuovamente verificati.

Il progetto Firebase deve essere creato dal proprietario. Configurazione e UID sono ancora vuoti: non sono stati creati account né pubblicato il sito.

La sezione Lavoro resta impostata per giornate in porto; nessun adattamento alle attività O&M è stato concordato. Restano funzioni legacy inattive relative a Mezzi, compresi due collegamenti alla cartella rimossa.


## Configurazione del 14 novembre 2026

Parametri Firebase dell’app Web `dashboard-daniele` e nome Daniele inseriti in `comune/config.js` dai dati forniti dal proprietario. UID proprietario inserito in `firestore.rules`. Nessuna password o passphrase inserita.

Restano da creare il database Firestore `(default)`, pubblicare le regole configurate, pubblicare il sito e completare il collaudo con login e salvataggio reali. Le precedenti note sulla configurazione vuota sono superate da questo aggiornamento.

/* ============ CONFIGURAZIONE ============
   L'unico file da modificare per far funzionare la Dashboard sul TUO progetto Firebase.
   Le istruzioni passo per passo sono nel README.md.

   - firebase: Console Firebase → Impostazioni progetto (rotella) → Generali → Le tue app → app Web → "Configurazione SDK".
     Copia apiKey, authDomain, projectId e appId. Non sono segreti: chi può leggere i dati lo decidono le regole
     Firestore (firestore.rules) e i dati sono comunque cifrati con la tua passphrase prima di partire dal telefono.
   - googleClientId: facoltativo, serve solo per collegare Google Calendar alla Dashboard (README, punto 6).
     Vuoto = la Dashboard funziona lo stesso, senza Google Calendar.
   - nome: come ti saluta la Dashboard ("Buongiorno, Marco"). Vuoto = saluto senza nome. */
window.CONFIG_APP = {
  firebase: {
    apiKey: 'AIzaSyD6jHMUaJyyMrTtp3pTRvs5nFbQLrL1vdc',
    authDomain: 'dashboard-daniele.firebaseapp.com',
    projectId: 'dashboard-daniele',
    appId: '1:760635740563:web:00ca8af29e62c12d1ad866'
  },
  googleClientId: '',
  nome: 'Daniele'
};

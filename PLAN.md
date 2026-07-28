# Hestía — Piano di sviluppo

> Documento di pianificazione derivato dalla specifica. Nessun codice ancora scritto.
> Data: 28 luglio 2026 (Hekatombaiṓn 14).

---

## 1. Decisioni prese

| Ambito | Decisione | Perché |
|---|---|---|
| Piattaforma d'uso | iPhone | Scelta di Gaia |
| Stack | **PWA** — Vite + React + TypeScript | Scelta di Gaia (spec §2, alternativa leggera) |
| Contenuti | Si parte **senza** `gods.json` e senza il prototipo HTML | Gli allegati non sono reperibili sul PC |
| Sveglie | **Tagliate** — la tab "Sveglie" non esiste | Vedi §2 |
| Repo | `Flayris/Hestia`, privato | Già creato e collegato |

Conseguenza della scelta PWA: **nessun account Apple Developer, nessun costo, nessuna
review dell'App Store.** L'app si installa dal browser con "Aggiungi a Home".

---

## 2. Notifiche e promemoria (senza sveglie)

**Le sveglie sono fuori dal progetto.** La spec §4.5 e §10 le chiedeva come notifiche locali
programmate che suonassero ad app chiusa: sul web non è possibile, perché l'API necessaria
(Notification Triggers) non è mai stata implementata da nessun browser, e su iOS una PWA può
ricevere notifiche a orario solo tramite un server esterno che gliele mandi.

Tagliarle è la scelta giusta e non un ripiego: l'unica alternativa onesta era un backend con
push, cioè costi, manutenzione e un pezzo di infrastruttura da tenere vivo per una funzione
che l'iPhone svolge già benissimo con la sua app Sveglia. Hestía smette di rincorrere quel
terreno e fa quello che sa fare.

**Cosa sparisce:** la tab "Sveglie" (la barra passa da 5 a 4 voci), il tipo `Alarm`, la
relativa persistenza e la richiesta di permesso all'avvio.

**Cosa resta a coprire il bisogno reale** — ricordarsi le date sacre:
1. il **centro notifiche** in Home (§2.1), che all'apertura dice cosa sta arrivando;
2. l'**export `.ics`** delle date sacre nel Calendario di iOS (§2.2), opzionale.

### 2.1 Il centro notifiche (pattern ripreso da New-Burning-Fire)

Il progetto `Flayris/New-Burning-Fire` risolve le notifiche con due meccanismi, entrambi
legati all'app aperta: `new Notification(...)` chiamata in reazione a un'azione dell'utente
(nuova proposta, nuovo pagamento), e un **campanellino nell'header alimentato da una lista
calcolata** (`notifications = computed(...)`) che a ogni apertura riesamina gli eventi e
genera i promemoria con una scala di preavviso: 1 mese → 1 settimana → 2 giorni → oggi.
Quel repo non ha manifest né service worker né push: non è una PWA installata, quindi il
caso "app chiusa a orario" non si pone.

Il **secondo** meccanismo è ottimo e va adottato in Hestía. Un centro notifiche derivato dal
motore del calendario, ricalcolato a ogni apertura, con la stessa scala di preavviso:

- "Fra 3 giorni è Deîpnon — prepara le offerte a Ecate"
- "Domani è Noumenía: il mese si apre con Selene, Apollo ed Estia"
- "Dopodomani è il giorno di Artemide, una dei tuoi dèi"
- "Fra una settimana: Panathḗnaia"

con la stessa possibilità di scartare una singola voce (`dismissNotification`), persistita
in locale. Va in **M3**: è UI sopra il motore del calendario, non serve nient'altro.

### 2.2 Export `.ics` delle date sacre *(opzionale, M7)*

Un pulsante "Aggiungi al Calendario" che genera un file **iCalendar** con le Noumeníe, i
Deîpna, le feste attiche e i giorni dei "tuoi dèi" dei prossimi 12 mesi, ciascuno con il suo
avviso. Da lì in poi è il Calendario di iOS a ricordarlo, anche ad app chiusa.

Non è una sveglia e non prova a esserlo: è un'esportazione una tantum, un centinaio di righe
di codice, nessun server. Se anche questo sembra di troppo, si taglia senza toccare
nient'altro del piano.

**Se un giorno servissero notifiche vere a orario**, l'unica strada è la migrazione a Expo
(spec §2). Per questo il piano tiene motore del calendario e dati in TypeScript puro, senza
dipendenze dal DOM: è la parte più costosa da riscrivere ed è giusto che sia già portabile.

---

## 3. Stack definitivo

| Ruolo | Scelta | Note |
|---|---|---|
| Build | Vite | veloce, TS nativo |
| UI | React 19 + TypeScript | |
| Routing | React Router | 4 tab + rotte di dettaglio |
| PWA / offline | `vite-plugin-pwa` (Workbox) | precache del bundle e dei JSON |
| Persistenza | IndexedDB via `idb` | diario, myGods, myMusic, notifiche scartate, impostazioni |
| Test | Vitest | obbligatori sul motore calendario |
| Font | Cormorant (serif) + Inter (sans) | self-hosted, per funzionare offline |
| Hosting | **Netlify** (o Cloudflare Pages) | vedi nota sotto |

**Nota sull'hosting.** GitHub Pages **non** funziona su repository privati con un account
gratuito. Poiché Hestía è privata, si usa Netlify (piano free, si collega a repo privati,
HTTPS incluso — e l'HTTPS è obbligatorio perché una PWA sia installabile su iPhone). Il
deploy sarà automatico a ogni push su `main`. Alternativa equivalente: Cloudflare Pages.

**Lo scaffold attuale viene sostituito.** I file vanilla creati all'inizio (`index.html`,
`js/app.js`, `css/style.css`) erano un segnaposto e la loro palette arancione non è quella
della spec §3. Restano validi come riferimento il service worker e il manifest, che
verranno riscritti su base Workbox.

---

## 4. Struttura del repo

```
Hestia/
├─ public/                 # manifest, icone (PNG 192/512 + maskable), robots
├─ src/
│  ├─ routes/              # oggi, calendario, grimorio, diario, musica, i-tuoi-dei
│  ├─ components/          # Card, Sheet, Orb, Toggle, SegmentedControl, MoonWidget, ...
│  ├─ lib/
│  │  ├─ calendar/         # meeus.ts, athenianCalendar.ts, moonPhase.ts  ← zero dipendenze
│  │  ├─ notifications/    # centro notifiche derivato dal calendario (§2.1)
│  │  ├─ ics/              # export delle date sacre (§2.2, opzionale)
│  │  └─ store/            # IndexedDB, export/import
│  ├─ data/                # gods.json, festivals.json, monthlyDays.json, rites.json,
│  │                       # concepts.json, music.json  + tipi TS
│  ├─ theme/               # palette, tipografia, token
│  └─ types.ts             # Deity, Festival, Rite, DiaryEntry, MusicLink, ... (spec §5, senza Alarm)
└─ tests/                  # test del motore calendario
```

`src/lib/calendar` e `src/types.ts` non importano nulla da React o dal DOM: sono la parte
riusabile tale e quale in caso di migrazione a Expo.

---

## 5. Milestone

**Stato:** M0–M6 ✅ · M8 ✅ · M9 in gran parte fatta.

**M7 (export `.ics`) è stata cancellata**, non rimandata: serviva a portare le date
sacre fuori dall’app, ma il calendario ateniese vive dentro Hestía ed è più
ricco di quanto un evento di calendario possa essere. Duplicarlo altrove
aggiungeva manutenzione senza aggiungere niente.

Oltre al piano originale: interfaccia e contenuti bilingui IT/EN, tema scuro,
e 14 temi divini (uno per Olimpo, chiaro e scuro).


### M0 — Fondamenta e deploy *(mezza giornata)*
Sostituzione dello scaffold con Vite + React + TS; `vite-plugin-pwa`; manifest e icone PNG
(iOS ignora le icone SVG del manifest: servono PNG 192 e 512 più `apple-touch-icon`);
collegamento a Netlify.
**Accettazione:** esiste un URL HTTPS; Gaia lo apre su iPhone, fa "Aggiungi a Home" e vede
l'app a schermo intero con la sua icona.

*Il deploy è messo per primo apposta: da qui in poi Gaia vede ogni progresso sul telefono.*

### M1 — Motore del calendario *(il cuore, nessuna UI)*
Implementazione da zero di Meeus cap. 49 (`newMoonJDE(k)`, ΔT ≈ 70s) — il prototipo di
riferimento non è disponibile, quindi si scrive sull'algoritmo pubblicato. Poi `noumenia`,
`buildYear`, `locate`, `moonPhase`, conversione al **fuso locale del dispositivo** con
confronti su date civili e non su istanti.

**Accettazione (dalla spec §6, già verificata come internamente coerente):**
- fuso Europe/Rome, 2026-07-28 → **Hekatombaiṓn 14**
- inizio anno ellenico → **mercoledì 15 luglio 2026**, 12 mesi
- lune nuove 2026 entro ±1 giorno dalle effemeridi (gen 18 … dic 9 UTC)
- ogni mese di 29 o 30 giorni, nessun buco tra mesi consecutivi
- cambiando fuso a uno americano la data si ricalcola coerentemente

**Scelta tecnica sul solstizio.** La spec ammette il 21 giugno fisso per la v1. Il piano
prevede invece il **solstizio vero** (Meeus cap. 27): costa poche righe in più ed elimina
un bug latente: negli anni in cui una Noumenía cade a ridosso del 21 giugno, la data fissa
può far partire l'anno con un mese di scarto.

### M2 — Design system e navigazione
Palette §3, gradiente cielo→marmo, bagliore solare, colonnato, divisore a greca. Componenti:
Card, pulsanti a pillola, Orb, bottom sheet, toggle, segmented control, e tab bar a **4 voci**:
Oggi · Calendario · Grimorio · Diario. Musica e "I tuoi dèi" restano scorciatoie dalla Home.

### M3 — Oggi (Home) e centro notifiche
Saluto greco, orologio live, data ellenica grande, widget fase lunare coerente con la fase
reale, dedica del giorno, card festa, scorciatoie.
Più il **centro notifiche** del §2.1: lista derivata dal motore calendario con la scala di
preavviso 1 mese / 1 settimana / 2 giorni / oggi su Noumeníe, Deîpna, feste attiche e giorni
dei "tuoi dèi", con voci scartabili.

### M4 — Calendario
Vista di un mese ellenico, navigazione avanti/indietro, griglia allineata ai giorni della
settimana, indicatori (oliva/oro/terracotta/oggi), bottom sheet del giorno, nota fissa.

### M5 — Grimorio
Segmented control a 4 voci, griglia delle 8 categorie, liste, scheda del dio con Allora /
Oggi puoi / Invocazione / link "Fonte: Theoi" e stella ☆ per "i tuoi dèi".
**Dipende dai contenuti** (vedi §6): si costruisce l'interfaccia su un dataset ridotto di
esempio, pronta a ricevere i 67 record veri senza modifiche.

### M6 — Diario e I tuoi dèi
Voci legate alla data ellenica, umore, elenco cronologico. Selettore dei 67 per categoria,
con evidenziazione in calendario e Home.
**Incluso qui, non rimandato:** export/import del diario in JSON. Su iOS lo spazio dati di
un sito può essere ripulito dal sistema; senza un backup il diario è a rischio. La spec lo
elenca tra i nice-to-have (§11), ma in una PWA su iPhone è una misura di sicurezza.

### M7 — Export `.ics` delle date sacre *(opzionale)*
Generatore iCalendar per Noumeníe, Deîpna, feste e giorni dei "tuoi dèi" dei prossimi 12
mesi (§2.2). Tagliabile senza conseguenze sul resto.

### M8 — Musica
Cinque link di default (§8.5) + sezione "I tuoi link" persistita in locale.

### M9 — Rifinitura
Impostazioni (regola Noumenía configurabile, lingua IT/EN), audit offline, verifica
Lighthouse PWA, splash screen iOS, condivisione di una scheda.

---

## 6. Rischi aperti e cose che servono

| # | Questione | Impatto | Cosa serve |
|---|---|---|---|
| ~~1~~ | ~~Contenuti del Grimorio mancanti~~ | — | ✅ **Risolto.** `_input/Hestia - Grimorio completo_1.md` contiene tutto: 67 dèi con fonte, 5 riti, 24 feste, 4 concetti, 8 giorni sacri. Resta da convertire in JSON. |
| 2 | **Prototipo HTML mancante** | Perdiamo solo l'implementazione di riferimento del motore calendario; i testi sono salvi. Il motore si riscrive da Meeus (M1). | Nessuna azione: impatto assorbito. |
| 3 | **Account Netlify** | Blocca M0. | Registrazione gratuita e autorizzazione al repo. |
| 4 | **PDF *Hekatombaion*** | Serve a verificare date attiche ed epiteti mensili. | Scaricabile dall'URL in `SPEC.md` §7 quando arriviamo a M4. |
| 5 | **Regola della Noumenía** | Le ricostruzioni moderne divergono (giorno della congiunzione vs +1 di prima visibilità). | Default +1 come da spec, ma reso configurabile in M9. |
| 6 | **Invocazioni parziali** | Presenti solo per i 14 Olimpi; 53 schede ne sono prive. Campo opzionale, non blocca. | Se le si vuole, vanno tratte da Perseus (Inni Orfici e Omerici). Decisione rimandata. |

**Ordine consigliato dei prossimi passi:** l'unico vero sbloccante rimasto è l'account
Netlify per M0. M1 (motore calendario) non dipende da nulla. Il Grimorio (M5) ora ha tutti
i contenuti che gli servono.

---

## 7. Scostamenti dalla specifica (dichiarati)

1. **Sveglie rimosse** (spec §4.5, §10) — irrealizzabili in una PWA su iOS; il bisogno è
   coperto dal centro notifiche e, se lo si vuole, dall'export `.ics` (§2).
2. **Solstizio vero invece del 21 giugno fisso** — elimina un errore di un mese in certi anni (M1).
3. **Export del diario da nice-to-have a milestone** — protezione dei dati su iOS (M6).
4. **GitHub Pages → Netlify** — Pages non serve repo privati su account gratuiti (§3).
5. **Icone SVG → PNG** — iOS non usa le icone SVG del manifest (M0).

# Hestía — Specifica operativa

> **Cosa costruiamo, nel dettaglio.** Documento di riferimento per lo sviluppo: design
> system, schermate, modello dati, motore del calendario, regole sui contenuti.
> Il compagno di questo file è [`PLAN.md`](./PLAN.md), che dice *in che ordine* costruirlo.
> Deriva dal brief originale, aggiornato con le decisioni prese: **PWA su iPhone**,
> **niente sveglie**, **4 tab**.

## Indice
1. [Visione e principi](#1-visione-e-principi)
2. [Design system](#2-design-system)
3. [Schermate](#3-schermate)
4. [Modello dati](#4-modello-dati)
5. [Motore del calendario](#5-motore-del-calendario)
6. [Notifiche](#6-notifiche)
7. [Contenuti e fonti](#7-contenuti-e-fonti)
8. [Persistenza e offline](#8-persistenza-e-offline)
9. [Cosa non fare](#9-cosa-non-fare)

---

## 1. Visione e principi

Hestía è un **grimorio in formato app** per chi segue la religione ellenica. Aiuta a vivere
la pratica giorno per giorno: calendario ateniese lunare con le date sacre, archivio
completo di dèi ed eroi, riti e feste, un diario spirituale legato al calendario, e musica
per accompagnare la preghiera.

Quattro principi, da applicare a ogni decisione:

**Fonti affidabili, sempre.** Ogni contenuto religioso o mitologico deriva dalle fonti del
§7 e conserva il link. Nulla di inventato.

**"Allora / Oggi puoi".** Ogni scheda mostra sia la pratica antica sia un adattamento
moderno concreto. Onora la storia e la rende praticabile in casa, oggi.

**Bellezza sobria e classica.** L'app trasmette calma e sacralità. Molto spazio bianco,
niente sovraccarico. Non è un'app di produttività.

**Funziona ovunque, anche offline.** I contenuti sono nel bundle. Il calendario segue il
fuso del dispositivo: se Gaia si sposta dall'Italia agli USA, le date si ricalcolano da sole.

---

## 2. Design system

Estetica: **antichità luminosa** — marmo caldo, avorio, oro, azzurro cielo.
Non è un tema notturno scuro.

### 2.1 Colore

```css
:root {
  /* superfici */
  --sky:        #cfe0ec;               /* azzurro cielo, in alto */
  --marble1:    #f5eede;               /* avorio caldo, sfondo */
  --marble2:    #ece0c6;               /* marmo più saturo, in basso */
  --card:       rgba(255,253,247,.62); /* card translucide */
  --line:       rgba(120,96,44,.20);   /* bordi, divisori */

  /* testo */
  --ink:        #3c3320;               /* testo principale */
  --ink2:       #6c5f45;               /* testo secondario */
  --dim:        #8a7c5f;               /* testo terziario — vedi §2.2 */

  /* accenti */
  --gold:       #b28a2b;               /* accento principale: decori, bordi, icone */
  --gold-ink:   #7d5f1a;               /* variante per il TESTO oro — vedi §2.2 */
  --gold-soft:  #d8c489;               /* bordi dorati, stati hover */
  --terra:      #ab6544;               /* accento secondario: etichette, "tuoi dèi" */
  --olive:      #71804d;               /* accento terziario: riti, dediche */
}
```

### 2.2 Accessibilità del colore (verificato)

Ho misurato i contrasti sul fondo `--marble1`. Tre valori del brief non reggono e vanno
usati con criterio:

| Colore | Contrasto su `--marble1` | Verdetto |
|---|---|---|
| `--ink` #3c3320 | 10.77:1 | ✅ ovunque |
| `--ink2` #6c5f45 | 5.41:1 | ✅ testo corrente |
| `--dim` #8a7c5f | **3.54:1** | ⚠️ solo testo grande (≥18.66px bold / ≥24px) — mai per il corpo |
| `--gold` #b28a2b | **2.77:1** | ⚠️ **mai come testo**: solo decori, bordi, icone, filetti |
| `--gold-ink` #7d5f1a | 5.16:1 | ✅ usa questo quando il testo deve essere oro |

**Regola pratica:** la data ellenica grande, i titoli e i numeri che devono *leggersi* usano
`--gold-ink`. `--gold` resta per ciò che è puramente ornamentale.

**Pulsanti primari.** Avorio `#fffdf7` su `--gold` puro dà 3.15:1 — insufficiente. Il
gradiente del pulsante va da **`#8f6a1d`** (4.86:1 con l'avorio) a **`#6f5417`** (6.98:1):
entrambi gli stop superano 4.5:1, e la differenza fra i due resta abbastanza ampia da
leggersi come gradiente.

```css
--grad-gold: linear-gradient(180deg, #8f6a1d, #6f5417);
```

*Tutti i valori di questa tabella sono stati calcolati, non stimati.*

### 2.3 Sfondo e decori

```css
body {
  background:
    /* bagliore di sole, in alto a destra */
    radial-gradient(340px 300px at 82% 4%, rgba(255,236,180,.70), transparent 62%),
    /* cielo → marmo */
    linear-gradient(180deg, var(--sky) 0%, var(--marble1) 38%, var(--marble2) 100%);
  background-attachment: fixed;
  color: var(--ink);
}
```

**Colonnato.** Fascia decorativa lungo il bordo inferiore, `height: 180px`, `opacity: .10`,
`pointer-events: none`, dietro a tutto (`z-index: 0`). Colonne scanalate ottenute con
`repeating-linear-gradient`, sfumate verso l'alto con `mask-image: linear-gradient(to top,
#000, transparent)`.

**Greca (meandro).** Divisore sottile, SVG in `background-repeat: repeat-x`, tratto 1px in
`--line`, altezza 10px. Da usare con parsimonia: separa le sezioni, non decora ogni card.

### 2.4 Tipografia

Due famiglie, **self-hosted** in `public/fonts` (i font di Google via CDN non funzionano
offline, e l'app deve funzionare offline).

- **Cormorant Garamond** (serif) — titoli, numeri, data ellenica, orologio.
- **Inter** (sans) — testo corrente, etichette, UI.

| Ruolo | Font | Dimensione | Peso | Interlinea | Note |
|---|---|---|---|---|---|
| Data ellenica | Cormorant | 44px | 600 | 1.1 | `--gold-ink` |
| Orologio | Cormorant | 34px | 500 | 1.1 | cifre tabulari |
| Titolo schermata | Cormorant | 28px | 600 | 1.2 | |
| Titolo sezione | Cormorant | 22px | 600 | 1.25 | |
| Titolo card | Inter | 18px | 600 | 1.3 | |
| Corpo | Inter | 16px | 400 | 1.55 | `--ink` |
| Secondario | Inter | 14px | 400 | 1.5 | `--ink2` |
| Etichetta | Inter | 12px | 600 | 1.4 | maiuscoletto, `letter-spacing: .08em`, `--terra` |
| Greco | Cormorant | ereditata | 500 | | `lang="grc"`, mai in maiuscolo |

I nomi greci (Ἀπόλλων) non vanno mai trasformati con `text-transform: uppercase`: rompe i
diacritici.

### 2.5 Spazio, raggi, ombre, movimento

```css
:root {
  /* spaziatura */
  --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px;
  --s5: 20px; --s6: 24px; --s7: 32px; --s8: 40px; --s9: 56px;

  /* raggi */
  --r-chip: 12px;  --r-card: 20px;  --r-sheet: 28px;  --r-pill: 999px;

  /* ombre */
  --shadow-card:  0 2px 10px rgba(60,51,32,.06), 0 10px 30px rgba(60,51,32,.05);
  --shadow-sheet: 0 -8px 40px rgba(60,51,32,.14);

  /* movimento */
  --t-tap:   180ms cubic-bezier(.2,.8,.3,1);
  --t-sheet: 320ms cubic-bezier(.32,.72,0,1);
}
```

Rispettare `@media (prefers-reduced-motion: reduce)`: azzerare le transizioni non essenziali.

### 2.6 Componenti

**Card** — `background: var(--card)`, `backdrop-filter: blur(10px) saturate(115%)`,
`border: 1px solid var(--line)`, `border-radius: var(--r-card)`, `box-shadow: var(--shadow-card)`,
padding `var(--s5)`.

**Pulsante primario** — pillola, `background: var(--grad-gold)` (§2.2), testo `#fffdf7`,
padding `12px 22px`, peso 600. Area toccabile minima **44×44px** (linea guida Apple).

**Pulsante secondario ("ghost")** — fondo avorio traslucido, bordo `1px solid var(--gold-soft)`,
testo `--ink`.

**Orb** — cerchio 56px (44px nelle liste), gradiente dorato radiale, iniziale del nome in
Cormorant 24px `#fffdf7`. In futuro ospiterà l'immagine del dio: prevedere già
`overflow: hidden` e uno slot per `<img>`.

**Bottom sheet** — sale dal basso, fondo `--marble1` pieno (non traslucido: ci va del testo
lungo), angoli superiori `var(--r-sheet)`, maniglia grigia 36×4px, `--shadow-sheet`,
backdrop `rgba(60,51,32,.28)`. Chiusura per trascinamento verso il basso o tap sul backdrop.
Contenuto scrollabile con `padding-bottom: max(var(--s6), env(safe-area-inset-bottom))`.

**Tab bar** — 4 voci, fondo avorio traslucido con blur, bordo superiore `--line`, icona +
etichetta 11px. Tab attiva in `--gold-ink` con l'icona piena. Altezza 56px +
`env(safe-area-inset-bottom)`.

**Segmented control** — pillola contenitore in avorio, indicatore scorrevole dorato,
transizione `--t-tap`.

**Chip** — piccolo, `--r-chip`, fondo `rgba(178,138,43,.12)`, testo `--gold-ink`.

**Toggle** — traccia 50×30px, pallino avorio, traccia attiva in gradiente oro.

### 2.7 Regole specifiche iOS

Vanno messe subito, non a fine progetto: senza, la PWA "sa di sito web".

```css
html { -webkit-text-size-adjust: 100%; }
body {
  min-height: 100dvh;                    /* non 100vh: sbaglia con la barra di Safari */
  overscroll-behavior-y: none;           /* niente rimbalzo elastico della pagina */
  -webkit-tap-highlight-color: transparent;
}
/* la chrome dell'app non è selezionabile; il testo dei contenuti sì */
.app-chrome { -webkit-user-select: none; user-select: none; }
```

- `env(safe-area-inset-*)` su header, tab bar e sheet (notch e barra home).
- `<meta name="viewport" content="... viewport-fit=cover">`.
- `<meta name="apple-mobile-web-app-capable" content="yes">` e `status-bar-style`.
- Icone: iOS **ignora le icone SVG del manifest**. Servono PNG 192 e 512, maskable, più
  `apple-touch-icon` 180×180.
- Ogni campo di input a **≥16px**, altrimenti Safari zooma da solo al focus.

---

## 3. Schermate

**Barra inferiore a 4 tab: Oggi · Calendario · Grimorio · Diario.**
Musica e "I tuoi dèi" si raggiungono da scorciatoie nella Home, per non affollare la barra.

### 3.1 Oggi (Home)

Dall'alto:
1. Saluto in greco — "Χαῖρε, Gaia" — e **orologio live**.
2. **Data ellenica** grande (es. "Hekatombaiṓn 14") + data gregoriana + anno ellenico.
3. **Centro notifiche** (§6): cosa sta arrivando, voci scartabili.
4. Widget **fase lunare**: nome della fase e disegno della luna coerente con la fase reale.
5. **Dedica di oggi**: gli dèi del giorno (giorni sacri mensili + eventuali feste), ognuno
   un Orb cliccabile → scheda del dio.
6. Card **Festa di oggi**, se c'è.
7. Scorciatoie: **Musica per la pratica** · **Diario di oggi** · **I tuoi dèi**.

### 3.2 Calendario

Vista di **un mese ellenico** alla volta, dalla Noumenía al Deîpnon, navigabile avanti e
indietro. Griglia allineata ai giorni della settimana; ogni cella mostra il numero del
giorno lunare e, più piccola, la data gregoriana.

Indicatori:

| Segno | Significato |
|---|---|
| pallino oliva | giorno con rito o dedica |
| pallino oro | festa |
| contorno terracotta | giorno di uno dei "tuoi dèi" |
| riempimento pieno | oggi |

Tap su un giorno → **bottom sheet**: se è Noumenía o Deîpnon lo dichiara; note dei giorni
sacri; feste con Allora / Oggi puoi; dèi del giorno cliccabili.

In fondo alla schermata, nota fissa: *"Il mese inizia con la Noumenía (luna nuova) e finisce
col Deîpnon (luna scura); date calcolate sul fuso attuale."*

### 3.3 Grimorio

Segmented control a 4 voci: **Dèi · Riti · Feste · Altro**.

**Dèi** — prima una griglia delle 8 categorie, poi la lista, poi la scheda.

| chiave | Etichetta | Descrizione | Simbolo | Voci |
|---|---|---|---|---|
| `olimpi` | Dèi Olimpi | I dodici e gli dèi del cielo | Ω | 14 |
| `ctonii` | Dèi Ctonii | Oltretomba e mondo sotterraneo | Ψ | 7 |
| `marini` | Dèi Marini | Mare, onde e acque | ≈ | 7 |
| `titani` | Titani e Astri | Titani, sole, luna, aurora | ☉ | 8 |
| `primordiali` | Primordiali | Le origini del cosmo | ◍ | 6 |
| `rustici` | Nature e Campagne | Pan, ninfe, spiriti dei boschi | ❦ | 7 |
| `personificati` | Personificazioni | Muse, Grazie, Destino, Sorte | ✦ | 10 |
| `eroi` | Eroi | Culto degli eroi e patroni | Η | 10 |

I totali sommano a 69 perché alcune voci stanno in più categorie (Ade = Olimpi + Ctonii,
Poseidone = Olimpi + Marini): i record distinti sono **67**.

**Scheda del dio** — nome, nome greco, epiteto; Domini; **Simboli**; **Offerte**; **Allora**;
**Oggi puoi**; **Invocazione** (se presente); categoria; link **"Fonte: Theoi"**. In alto a
destra una stella ☆/★ per aggiungere o togliere dai "tuoi dèi".

**Riti** — khérnips (acqua lustrale), spondḗ (libagione), offerta quotidiana mattino/sera,
la triade lunare (Deîpnon–Noumenía–Agathòs Daímōn), Estia prima e ultima. Tutti con
Allora / Oggi puoi.

**Feste** — tutte le feste attiche in ordine di calendario → scheda festa con Allora / Oggi
puoi e gli dèi coinvolti.

**Altro** — kháris (reciprocità), míasma e kátharsis (purità rituale), gli dèi ctonii e come
onorarli, il tuo altare domestico.

### 3.4 Diario

Nuova voce **legata alla data ellenica** (mostra "Hekatombaiṓn 14"), selettore d'umore a
emoji, testo libero. Elenco cronologico delle voci passate, ciascuna con la sua data
ellenica — così col tempo si può rileggere *cosa sentivo all'ultima Noumenía*.

Include **esportazione e reimportazione** in JSON: su iOS il sistema può ripulire i dati di
un sito, e il diario è l'unica cosa insostituibile dell'app.

### 3.5 Musica *(da scorciatoia Home)*

Suggerimenti che aprono YouTube o Spotify in scheda esterna:

| Servizio | Titolo | Ricerca |
|---|---|---|
| YouTube | Musica greca antica (lira) | `ancient greek music lyre reconstructed` |
| YouTube | Inni Orfici e Omerici | `orphic hymns chanted` |
| YouTube | Ambiente per la preghiera | `hellenic polytheism ritual ambient meditation` |
| Spotify | Ancient Greek Music | `open.spotify.com/search/ancient%20greek%20music` |
| Spotify | Lyre & meditation | `open.spotify.com/search/greek%20lyre%20meditation` |

Più **"I tuoi link"**: nome + URL di playlist personali, salvati in locale, apribili o
eliminabili. Scelta di design deliberata: solo link esterni, così ognuno usa la propria
musica e il proprio abbonamento (vedi §9).

### 3.6 I tuoi dèi *(da scorciatoia Home)*

Selettore di tutti i 67, raggruppati per categoria. I selezionati si evidenziano nel
calendario e nella Home e generano voci nel centro notifiche.

---

## 4. Modello dati

```ts
type CategoryKey =
  | 'olimpi' | 'ctonii' | 'marini' | 'titani'
  | 'primordiali' | 'rustici' | 'personificati' | 'eroi';

interface Deity {
  id: string;          // "apollo"
  n: string;           // nome italiano; i gruppi al plurale ("Le Muse")
  gk: string;          // nome greco ("Ἀπόλλων")
  ep: string;          // epiteto/ruolo breve
  cats: CategoryKey[]; // una o più categorie
  dom: string;         // domini, una frase
  sim: string[];       // simboli e attributi
  off: string[];       // offerte coerenti con la pratica antica
  allora: string;      // pratica o mito antico, 2 frasi
  adesso: string;      // adattamento moderno concreto, 2 frasi
  inno?: string;       // invocazione breve
  src?: string;        // URL della fonte (Theoi)
}

interface Category { key: CategoryKey; label: string; desc: string; sym: string; }

interface Festival { d: number; n: string; gods: string[]; allora: string; adesso: string; }
// indicizzate per NOME BASE del mese: FEST["Hekatombaiṓn"] = Festival[]

interface MonthlySacredDay { day: number; gods: string[]; note: string; }

interface Rite    { n: string; sub: string; allora: string; adesso: string; inno?: string; }
interface Concept { n: string; sub: string; allora: string; adesso: string; }

// --- dati dell'utente, in IndexedDB ---
interface DiaryEntry { id: string; hellenicDate: string; gregorian: string;
                       text: string; mood: number | null; ts: number; }
interface MusicLink  { t: string; url: string; }
interface Settings   { noumeniaRule: 'conjunction' | 'firstVisibility';  // default: firstVisibility
                       lang: 'it' | 'en'; }

// --- centro notifiche, calcolato, mai persistito (§6) ---
interface AppNotification {
  id: string;                                   // "deipnon-2026-08-12"
  type: 'noumenia' | 'deipnon' | 'festival' | 'myGod' | 'monthlyDay';
  title: string;
  subtitle: string;
  date: Date;
  lead: 'month' | 'week' | 'twoDays' | 'today'; // scala di preavviso
  action: { route: string; id?: string };
}
```

Non esiste più il tipo `Alarm`: le sveglie sono fuori dal progetto (`PLAN.md` §2).

I dati statici (`Deity[]`, feste, giorni sacri, riti, concetti, musica) stanno nel bundle
come JSON: **non serve backend**. Le uniche cose dinamiche sono il calcolo astronomico e
ciò che l'utente salva in locale.

### 4.1 Giorni sacri mensili

Ricorrono in ogni mese lunare:

```json
{
  "1": { "gods": ["selene","apollo","hestia"],
         "note": "Noumenía — la luna nuova apre il mese. Si onorano gli dèi domestici, Selene e Apollo Noumenios." },
  "2": { "gods": ["agathos"], "note": "Giorno di Agathòs Daímōn, il buon spirito della casa." },
  "3": { "gods": ["atena"],   "note": "Giorno sacro ad Atena." },
  "4": { "gods": ["afrodite","ermes"], "note": "Giorno di Afrodite ed Ermes (anche Eros ed Eracle)." },
  "6": { "gods": ["artemide"], "note": "Giorno sacro ad Artemide." },
  "7": { "gods": ["apollo"],   "note": "Giorno sacro ad Apollo." },
  "8": { "gods": ["poseidone"],"note": "Giorno di Poseidone (e dell'eroe Teseo)." },
  "ultimo": { "gods": ["ecate"],
              "note": "Deîpnon — l'ultimo giorno del mese (luna scura). La Cena di Ecate agli incroci e la pulizia della casa chiudono il ciclo lunare." }
}
```

### 4.2 Feste attiche

| Mese | Feste |
|---|---|
| Hekatombaiṓn | 12 Krónia (Crono/Zeus) · 28 Panathḗnaia (Atena) |
| Metageitniṓn | 7 Metageítnia (Apollo) |
| Boēdromiṓn | 15 Misteri Eleusini (Demetra/Persefone) · 27 Boēdrómia (Apollo) |
| Pyanepsiṓn | 7 Pyanópsia (Apollo) · 11 Thesmophória (Demetra) |
| Maimaktēriṓn | 20 Pompaía (Zeus Meilichios) |
| Poseideṓn | 8 Poseídea (Poseidone) · 26 Halôa (Demetra/Dioniso) |
| Gamēliṓn | 12 Lḗnaia (Dioniso) · 27 Theogámia (Era/Zeus) |
| Anthestēriṓn | 11 Anthestḗria (Dioniso) · 23 Diásia (Zeus) |
| Elaphēboliṓn | 6 Elaphēbólia (Artemide) · 10 Grandi Dionísie (Dioniso) |
| Mounichiṓn | 6 Delphínia (Apollo/Artemide) · 16 Mounychía (Artemide) |
| Thargēliṓn | 6 Thargḗlia — Artemide · 7 Thargḗlia — Apollo · 25 Plyntḗria (Atena) |
| Skirophoriṓn | 3 Arrhēphória (Atena) · 12 Skíra (Atena/Demetra) · 14 Dipoliéia (Zeus) |

Ciascuna con il suo testo Allora / Oggi puoi. Date e feste minori da verificare col PDF
*Hekatombaion* (§7).

---

## 5. Motore del calendario

Il cuore dell'app. Deve essere **corretto** e **testato**. Vive in `src/lib/calendar`, senza
alcuna dipendenza da React o dal DOM.

### 5.1 Regole

1. Calendario **lunisolare**: 12 mesi lunari, 13 negli anni intercalari. Ogni mese inizia
   con la luna nuova.
2. **Lune nuove astronomiche** con l'algoritmo di Jean Meeus, *Astronomical Algorithms*,
   cap. 49: istante della congiunzione in Tempo Dinamico, meno ΔT ≈ 70s per l'UTC.
   `k ≈ round((anno − 2000) × 12.3685)`.
3. **Conversione al fuso locale del dispositivo.** L'istante della congiunzione diventa una
   *data civile locale*, e tutti i confronti avvengono fra date civili, mai fra istanti.
   È questo che fa adattare il calendario da solo tra Italia e USA.
4. **Noumenía(k)** = data locale della congiunzione **+ 1 giorno** (prima visibilità della
   falce). **Deîpnon** = ultimo giorno del mese, il giorno prima della Noumenía successiva.
5. Il **mese k** va da Noumenía(k) a Noumenía(k+1) − 1 giorno: dura 29 o 30 giorni.
   **Numero del giorno** = (data − Noumenía(k)) + 1.
6. **Inizio dell'anno** (Hekatombaiṓn 1) = prima Noumenía a partire dal **solstizio d'estate**.
7. **Nomi dei mesi**, in ordine: Hekatombaiṓn, Metageitniṓn, Boēdromiṓn, Pyanepsiṓn,
   Maimaktēriṓn, Poseideṓn, Gamēliṓn, Anthestēriṓn, Elaphēboliṓn, Mounichiṓn, Thargēliṓn,
   Skirophoriṓn.
8. **Anno intercalare**: se fra un inizio anno e il successivo ci sono 13 lunazioni, si
   inserisce un secondo Poseideṓn — *Poseideṓn deúteros* — all'indice 6.
9. **Configurabile**: la regola della Noumenía (congiunzione vs +1 giorno) è
   un'impostazione, perché le ricostruzioni moderne divergono. Default: +1 giorno, fuso
   locale.

**Sul solstizio.** Il brief ammetteva il 21 giugno fisso. Usiamo invece il solstizio vero
(Meeus cap. 27): costa poche righe ed elimina un errore latente di un mese intero negli anni
in cui una Noumenía cade a ridosso del 21 giugno.

### 5.2 Fase lunare

```
frazione = (JD_ora − JD_luna_nuova_precedente) / (JD_luna_nuova_successiva − JD_luna_nuova_precedente)
```

Mappata a: Luna nuova · Crescente · Primo quarto · Gibbosa crescente · Luna piena ·
Gibbosa calante · Ultimo quarto · Calante.

### 5.3 Criteri di accettazione

Test obbligatori (Vitest) prima di costruire qualsiasi UI:

- [ ] Fuso `Europe/Rome`, data **2026-07-28** → **Hekatombaiṓn 14**.
- [ ] L'anno ellenico inizia **mercoledì 15 luglio 2026**, con 12 mesi.
- [ ] Le lune nuove 2026 combaciano entro ±1 giorno con le effemeridi pubblicate:
      gen 18, feb 17, mar 19, apr 17, mag 16, giu 15, lug 14, ago 12, set 11, ott 10,
      nov 9, dic 9 (UTC).
- [ ] Ogni mese generato dura 29 o 30 giorni.
- [ ] Nessun buco né sovrapposizione fra un mese e il successivo.
- [ ] Cambiando il fuso a uno americano, la data ellenica di oggi si ricalcola coerentemente.

*Verifica già svolta: le prime due condizioni sono reciprocamente coerenti — luna nuova il
14 luglio 2026, Noumenía il 15 (che è davvero un mercoledì), 28 − 15 + 1 = 14.*

---

## 6. Notifiche

**Non ci sono sveglie.** Sul web non esiste un modo per programmare una notifica a un orario
futuro, e su iOS una PWA può riceverle solo tramite un server esterno. Motivazione completa
in `PLAN.md` §2.

Al loro posto, il **centro notifiche**: una lista *calcolata* dal motore del calendario a
ogni apertura dell'app — non programmata, ricalcolata. Il pattern viene da
`Flayris/New-Burning-Fire`, dove funziona bene.

Scala di preavviso: **1 mese → 1 settimana → 2 giorni → oggi**.

Esempi di voci:
- "Fra 3 giorni è Deîpnon — prepara le offerte a Ecate"
- "Domani è Noumenía: il mese si apre con Selene, Apollo ed Estia"
- "Dopodomani è il giorno di Artemide, una dei tuoi dèi"
- "Fra una settimana: Panathḗnaia"

Ogni voce è scartabile; gli id scartati restano in IndexedDB.

**Opzionale** (`PLAN.md` M7): un pulsante "Aggiungi al Calendario" che esporta un file
`.ics` con le date sacre dei prossimi 12 mesi, così è il Calendario di iOS a ricordarle
anche ad app chiusa.

---

## 7. Contenuti e fonti

Tutto ciò che è religioso o mitologico viene da queste fonti e **conserva il link**:

| Fonte | Uso |
|---|---|
| [theoi.com](https://www.theoi.com) | dèi, eroi, miti, epiteti, offerte — fonte primaria delle schede, `Deity.src` punta qui |
| [ysee.gr](https://www.ysee.gr/index-english.html) | ellenismo moderno, pratica contemporanea — per le sezioni "Oggi puoi" |
| [Perseus](https://www.perseus.tufts.edu/hopper/) | testi originali (Inni Omerici e Orfici) per invocazioni e citazioni |
| [PDF *Hekatombaion*](https://hellenismo.wordpress.com/wp-content/uploads/2020/06/hekatombaion.pdf) | calendario: date attiche, feste, epiteti mensili |

Regole non negoziabili:
1. **Non inventare** fatti mitologici o rituali. Se una cosa non è confermabile da queste
   fonti, si omette oppure si segnala esplicitamente come *ricostruzione moderna*.
2. Ogni scheda mantiene la struttura **Allora** (antichità, con fonte) / **Oggi puoi**
   (adattamento moderno praticabile).
3. Il link "Fonte" è visibile nella scheda del dio.
4. La struttura deve permettere di **aggiungere voci** (altri eroi ed eroine, ninfe
   specifiche, epiteti) mantenendo lo schema `Deity` e queste stesse regole.

> **Stato attuale:** `gods.json` (i 67 record già compilati) e il prototipo HTML — che
> conteneva anche i testi di feste, riti e concetti — non sono al momento reperibili.
> Vedi `PLAN.md` §6.

---

## 8. Persistenza e offline

**In IndexedDB:** `diary`, `myGods`, `myMusic`, `dismissedNotifications`, `settings`.

**Nel bundle, precacheati dal service worker:** tutti i JSON dei contenuti, i font, le icone.
L'app deve essere pienamente utilizzabile in aereo.

**Rischio iOS.** Safari può liberare lo spazio dati dei siti; le PWA installate sono più
protette, ma non intoccabili. Per questo l'esportazione del diario non è un
*nice-to-have* ma parte della milestone M6.

---

## 9. Cosa non fare

- **Non copiare layout di app di terzi.** L'estetica è quella classica del §2, non quella di
  un'app di produttività o di meditazione.
- **Non usare contenuti mitologici non verificabili** dalle fonti del §7.
- **Non legare il calendario a un fuso fisso.** Deve seguire il dispositivo.
- **Non includere musica protetta da copyright.** Solo link esterni a YouTube e Spotify e
  link inseriti dall'utente.
- **Non usare `--gold` come colore del testo** (§2.2): esiste `--gold-ink` per quello.
- **Non trasformare in maiuscolo il testo greco**: rompe i diacritici.

---

## Roadmap oltre la v1

- Immagini degli dèi al posto delle iniziali negli Orb (statue e opere in pubblico dominio).
- Inni completi (Orfici e Omerici) da Perseus dentro le schede.
- Lingua IT/EN.
- Condivisione di una scheda o del "giorno di oggi".
- Tema scuro alternativo, mantenendo la palette classica.

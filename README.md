# Hestía

Grimorio in formato app per la pratica della religione ellenica: calendario ateniese lunare,
archivio di dèi ed eroi, riti e feste, diario spirituale. PWA, installabile su iPhone.

## Documenti

| File | Contenuto |
|---|---|
| [`SPEC.md`](./SPEC.md) | **Cosa** costruiamo: design system, schermate, modello dati, motore del calendario, fonti |
| [`PLAN.md`](./PLAN.md) | **In che ordine**: decisioni prese, milestone M0–M9, rischi aperti |

## Struttura attuale

> Scaffold provvisorio: verrà sostituito in M0 da Vite + React + TypeScript.

```
Hestia/
├── index.html              # pagina principale
├── manifest.webmanifest    # metadati PWA (nome, icone, colori, display)
├── sw.js                   # service worker (cache + funzionamento offline)
├── css/style.css           # stili, con tema chiaro/scuro automatico
├── js/app.js               # registrazione SW, stato rete, prompt di installazione
└── icons/                  # icone dell'app (SVG)
```

## Avviare in locale

Il service worker richiede `http://` (non funziona aprendo il file direttamente).
Da dentro la cartella del progetto:

```bash
python -m http.server 8000
```

Poi apri http://localhost:8000

## Note

- Cambia `CACHE_VERSION` in `sw.js` a ogni rilascio, altrimenti i browser
  continuano a servire i file vecchi dalla cache.
- Le icone sono SVG: funzionano su Chrome/Edge/Android. Per il supporto pieno
  su iOS servirà aggiungere anche dei PNG (192px e 512px).

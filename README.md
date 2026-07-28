# Hestia

PWA (Progressive Web App) in sviluppo.

## Struttura

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

# _input — materiale grezzo

Qui dentro va il **materiale così com'è**: file scritti da Gaia, esportazioni, appunti,
prototipi, PDF di riferimento. Non è codice e non finisce nell'app: è la sorgente da cui
ricavo i JSON strutturati.

## Come funziona

```
_input/  (materiale grezzo, qualsiasi formato)
   ↓  conversione secondo lo schema di SPEC.md §4
src/data/  (JSON puliti che l'app carica)
```

Il file originale **resta qui** anche dopo la conversione, come riferimento e come prova di
provenienza dei contenuti (regole sulle fonti in `SPEC.md` §7).

## Formati che posso leggere

`.json` · `.md` · `.txt` · `.html` · `.csv` · `.docx` · `.pdf` · immagini

Non serve che siano ordinati o già nel formato giusto. Se il contenuto c'è, lo struttturo io.

## Cosa manca in questo momento

| File | Cosa contiene | Serve per |
|---|---|---|
| `gods.json` | i 67 dèi ed eroi completi (schema `Deity`) | Grimorio → Dèi (M5) |
| `Hestia - Calendario Ellenico.html` | prototipo funzionante: **i testi già scritti** di feste, riti e concetti | Grimorio → Riti, Feste, Altro (M5) |
| `hekatombaion.pdf` | verifica di date attiche ed epiteti mensili | Calendario (M4) |

Il PDF si scarica da
<https://hellenismo.wordpress.com/wp-content/uploads/2020/06/hekatombaion.pdf>

## Nota

Questa cartella **è versionata** su Git di proposito: gli allegati originali si erano già
persi una volta, e da qui in poi ogni cosa che ci metti dentro è al sicuro su GitHub
(il repository è privato).

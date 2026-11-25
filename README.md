# Dominio Esagonale · Ordine e Caos

Gioco di strategia a turni su mappa esagonale (hex and counter), Ordine contro Caos, in una sola pagina HTML con JavaScript. Tutto il gioco vive in un canvas a schermo intero.

Il regolamento completo è in [`docs/regole.md`](docs/regole.md); gli scenari giocabili sono quelli dei capitoli 18, 19 e 20.

## Come si prova

Apri `dist/dominio-esagonale.html` in un browser. Non servono server né connessione.

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `src/` | Il codice, diviso per argomento (mappa, scenari, armate, disegno, interfaccia) |
| `assets/` | Le immagini originali delle pedine, delle magie e la mappa di riferimento per lo stile |
| `docs/regole.md` | Il regolamento |
| `tools/build.py` | Assembla `dist/dominio-esagonale.html` concatenando i file di `src/` |
| `tools/crop_sprites.py` | Ritaglia le pedine e le icone delle magie da `assets/` e genera `src/sprites.js` |
| `tools/units_from_rules.py` | Legge le tabelle delle unità dal regolamento e genera `src/units.js` |
| `tests/` | Prove automatiche con Node (`node tests/mapgen.test.js`) |

## Ricostruire la pagina

```sh
python3 tools/crop_sprites.py      # solo se cambiano le immagini
python3 tools/units_from_rules.py  # solo se cambiano le tabelle delle unità
python3 tools/build.py
```

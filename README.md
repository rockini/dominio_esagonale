# Dominio Esagonale · Ordine e Caos

Gioco di strategia a turni su mappa esagonale (hex and counter), Ordine contro Caos, in una sola pagina HTML con JavaScript. Tutto il gioco vive in un canvas a schermo intero.

Il regolamento completo è in [`docs/regole.md`](docs/regole.md); gli scenari giocabili sono quelli dei capitoli 18, 19 e 20.

## Come si gioca

Apri `dist/dominio-esagonale.html` in un browser: non servono server né connessione. Dal menu scegli lo scenario, la tua parte (Ordine, Caos oppure IA contro IA) e il seme della mappa, poi premi **Gioca**.

- **Schieramento**: puoi spostare le tue pile dentro la tua zona, poi premi “Inizia la partita”.
- **Reclutamento**: tocca un tuo insediamento; nel pannello a destra trovi unità, costruzioni, addestramento o Mutazione Forzata.
- **Movimento**: tocca una pila, scegli con le spunte quali unità muovere; verde = raggiungibile (passandoci sopra vedi percorso e PM). `M` attiva la Marcia Forzata.
- **Combattimento**: Magie (pulsante “Magie” sull’incantatore), poi Tiro e Mischia toccando un esagono nemico evidenziato. Il pannello mostra colonna, spostamenti e probabilità di ogni risultato prima di tirare.
- **Comandi**: trascina per spostare la mappa, rotella o pizzico per lo zoom, tasto destro o `Esc` per annullare, `Invio` per la fase successiva, `L` per il registro.

Le mosse dell’avversario sono animate; il pulsante `▶ ×1` in alto cambia la velocità.

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `src/` | Generatore di mappe, scenari, armate e disegno della mappa |
| `src/engine/` | Il motore delle regole: stato, movimento, combattimento e morale, magie, sequenza del turno, regole speciali degli scenari |
| `src/ai/` | L'IA (valutazione per obiettivi e minacce, simulazione dei sei risultati del dado per tiri e mischie) e il Caos automatico (20.2) |
| `src/ui/` | L'interfaccia nel canvas: menu, mappa, pannello azioni, animazioni, finestre |
| `assets/` | Le immagini originali delle pedine, delle magie e la mappa di riferimento per lo stile |
| `docs/regole.md` | Il regolamento |
| `tools/build.py` | Assembla `dist/dominio-esagonale.html` concatenando i file di `src/` |
| `tools/crop_sprites.py` | Ritaglia le pedine e le icone delle magie da `assets/` e genera `src/sprites.js` |
| `tools/units_from_rules.py` | Legge le tabelle delle unità dal regolamento e genera `src/units.js` |
| `tests/` | Prove automatiche con Node: `node tests/mapgen.test.js` (mappe) e `node tests/engine.test.js [scenario] [semi]` (partite complete IA contro IA) |

## Ricostruire la pagina

```sh
python3 tools/crop_sprites.py      # solo se cambiano le immagini
python3 tools/units_from_rules.py  # solo se cambiano le tabelle delle unità
python3 tools/build.py
```

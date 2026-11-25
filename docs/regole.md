# Dominio Esagonale: Ordine e Caos – Regolamento

Nov 15, 2026 · @Claudio

Regolamento unificato: ogni regola compare una sola volta. Dove due regole sembrano in conflitto, prevale quella più specifica (abilità di un'unità o scenario) su quella generale.

## 1. Introduzione, convenzioni e glossario

Dominio Esagonale è un gioco strategico a turni per 2 giocatori (Ordine contro Caos) su una mappa di esagoni. Ogni giocatore muove pedine che rappresentano unità, Eroi e Boss. La mappa non è fissa: ogni scenario indica i tipi di esagono e i luoghi presenti.

### 1.1 Dadi e tiri

- Si usa solo il dado a sei facce (d6).
- Un **tiro modificato** non scende mai sotto 1 e non supera 6, salvo dove una regola usa il totale (Prova di Lancio, 11.4).
- "Risultato naturale" indica il numero mostrato dal dado prima dei modificatori.
- Un **Test** su un valore (es. Morale) riesce se il d6 è **minore o uguale** al valore modificato. Un 6 naturale fallisce sempre.
- Un tiro "X+" riesce se il d6 modificato è pari o superiore a X.

### 1.2 Arrotondamenti

- Le frazioni si arrotondano **per difetto**, salvo dove è scritto diversamente.
- Nessuna caratteristica scende sotto 0, e F, D e V non scendono sotto 1 per effetto di stati e modificatori.

### 1.3 Unità di tempo

| Termine | Significato |
| --- | --- |
| Turno di Gioco (TG) | Un giro completo: il turno del primo giocatore e poi quello del secondo |
| Turno del giocatore | La parte del TG in cui un giocatore è "attivo" e svolge tutte le sue fasi |
| Giocatore attivo | Il giocatore di cui è il turno; l'altro è il giocatore reattivo |
| "Fino al tuo prossimo turno" | L'effetto finisce all'inizio della tua prossima Fase di Manutenzione |
| "Fino alla fine del TG" | L'effetto finisce nella Fase di Fine Turno |
| "Una volta per turno" | Una volta per ogni turno del giocatore che usa l'abilità |
| "Una volta per partita" | Una sola volta in tutta la partita |
| Attacco | Una singola risoluzione sulla Tabella di Mischia o sulla Tabella di Tiro |

### 1.4 Altri termini

- **Unità**: ogni pedina (comprese Eroi e Boss). Quando una regola dice "unità normali" esclude Eroi e Boss.
- **Pila**: tutte le unità amiche nello stesso esagono.
- **Adiacente**: esagono che condivide un lato.
- **Distanza**: numero di esagoni contati dall'esagono di partenza (escluso) a quello di arrivo (incluso), per il percorso più breve.
- **Danno / perdita di R**: ogni punto di danno toglie 1 Resistenza (R). A R 0 l'unità è eliminata e si toglie dalla mappa.
- **Insediamento**: Città minore, Città maggiore, Castello minore, Castello maggiore o Capitale.
- **Luogo**: Tempio dell'Ordine, Altare del Caos, Fenditura del Caos, Rovina.
- **Comandante**: l'Eroe o Boss che lo scenario designa come capo di una fazione.

### 1.5 Ordine di precedenza

1. Le regole dello scenario prevalgono su tutto.
2. Le abilità di un'unità, di un oggetto o di una magia prevalgono sulle regole generali.
3. Se due effetti dei due giocatori vanno risolti nello stesso momento, il giocatore attivo risolve per primo i suoi.
4. Se una regola non dice chi sceglie, sceglie il proprietario dell'unità interessata.

## 2. Le unità

### 2.1 Caratteristiche

| Sigla | Nome | Uso |
| --- | --- | --- |
| V | Velocità | Punti Movimento (PM) per turno |
| F | Forza | Valore d'attacco in mischia e a distanza |
| D | Difesa | Valore in difesa contro la mischia; influisce sul tiro a distanza |
| P | Portata | 0 = solo mischia; 1–3 = può attaccare a distanza fino a quella distanza |
| R | Resistenza | Punti ferita; a 0 l'unità è eliminata |
| FM | Fattore Magico | Riserva di magia per turno (Sez. 11); 0 = nessuna magia |
| Costo | — | Punti esercito e Oro per reclutare |

I danni subiti si segnano con marker accanto alla pedina. Un'unità non può mai superare la sua R massima.

### 2.2 Gradi

Ogni unità normale ha un grado: **Base**, **Veterano** o **Elite**. Eroi e Boss non hanno gradi.

| Grado | Modifiche rispetto a Base | Valore di Morale |
| --- | --- | --- |
| Base | — | 3 |
| Veterano | +1 R e +1 alla caratteristica indicata nella colonna "Vet" della scheda | 4 |
| Elite | Come Veterano, più +1 D | 5 |

Il costo di ogni grado è nelle schede (Sez. 3 e 4). Un trattino nella colonna Elite significa che quell'unità non può diventare Elite. Il passaggio di grado si ottiene come indicato nella Sez. 13 oppure reclutando direttamente al costo maggiorato (14.4).

### 2.3 Parole chiave

Ogni scheda elenca le parole chiave dell'unità. Le regole fanno riferimento solo a queste.

| Parola chiave | Effetto principale (dettagli nelle sezioni indicate) |
| --- | --- |
| Fanteria | Nessun effetto proprio; serve ad altre regole |
| Cavalleria | Non può entrare in Montagna; malus in Bosco (6.1); subisce le abilità anti-cavalleria |
| Pesante | +1 PM per entrare in Bosco, Collina e Palude; non attraversa fiumi senza ponte o guado |
| Leggera | Nessun costo extra per uscire da una Zona di Controllo nemica |
| Grande | Conta 2 per l'impilamento |
| Disciplinata | Può formare la Formazione (9.6) |
| Orda | Può formare l'Orda (9.6) |
| Tiratore | Può attaccare a distanza (P ≥ 1) |
| Incantatore | Può lanciare magie (FM ≥ 1) |
| Volante | Può volare durante il movimento (8.7) |
| Elfica | Costo 1 in Bosco |
| Nanica | Costo 2 in Montagna |
| Anfibia | Costo 1 in Palude; può entrare in Lago (costo 2); ignora il costo dei fiumi |
| Sacra | Può Purificare (12.3); immune al Test di Corruzione se lo dice la sua scheda |
| Non-morto | Immune ai Test di Morale; colpita dalle magie di Purificazione |
| Demone | Colpita dalle magie di Purificazione; subisce danni in esagoni Purificati (12.2) |
| Mutante | Può fare Test di Mutazione (12.5) |
| Bestia | Conta come Cavalleria per terreno e abilità anti-cavalleria |
| Immune al Morale | Non fa mai Test di Morale |
| Assedio | Riduce la difesa dei Castelli e può aprire brecce (Sez. 16) |

Una parola chiave è "di fazione": un'abilità che colpisce "unità del Caos" colpisce tutte le unità della fazione Caos, a prescindere dalle parole chiave.

## 3. Schede delle unità dell'Ordine

### 3.1 Abilità comuni

Queste abilità compaiono in più schede, di entrambe le fazioni.

- **Carica:** quando l'unità attacca in mischia un esagono di Pianura o Deserto, e non ha iniziato il turno adiacente a quell'esagono, ha +1 F per quell'attacco.
- **Anti-cavalleria:** se un attacco in mischia contro la pila dell'unità include almeno un'unità Cavalleria o Bestia, l'attacco subisce –1 colonna (una sola volta per attacco, anche con più unità Anti-cavalleria). Quando l'unità attacca una pila che contiene Cavalleria o Bestie ha +1 F.
- **Anti-volo:** +1 colonna ai tiri a distanza dell'unità contro pile che contengono un'unità Volante. Un attacco in mischia che include unità Volanti contro la pila dell'unità subisce –1 colonna (una volta per attacco).
- **Perforante:** quando l'unità partecipa a un tiro a distanza, si ignora lo spostamento per Difesa alta del bersaglio (9.9).
- **Flagello +N:** +N F negli attacchi contro pile che contengono almeno un'unità Demone, Non-morto o Mutante.

### 3.2 Tabella delle unità dell'Ordine

Valori al grado Base. "Vet" indica la caratteristica che sale di 1 al grado Veterano. Costi: Base / Veterano / Elite.

| Unità | V | F | D | P | R | FM | Vet | Costo | Parole chiave | Abilità |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fanteria disciplinata | 2 | 3 | 3 | 0 | 2 | 0 | F | 3 / 5 / 7 | Fanteria, Disciplinata | Quadrato: da sola basta per la Formazione (9.6) |
| Lancieri | 2 | 4 | 3 | 0 | 2 | 0 | F | 4 / 6 / 8 | Fanteria, Disciplinata | Anti-cavalleria |
| Picchieri | 2 | 3 | 4 | 0 | 2 | 0 | D | 4 / 6 / 8 | Fanteria, Disciplinata | Anti-cavalleria; Muro di picche: la Carica non si applica contro la loro pila |
| Scudieri | 2 | 2 | 3 | 0 | 1 | 0 | D | 2 / 3 / — | Fanteria, Disciplinata | Copertura: i tiri a distanza contro la loro pila subiscono –1 colonna |
| Cavalieri | 4 | 5 | 3 | 0 | 2 | 0 | F | 6 / 9 / 12 | Cavalleria | Carica |
| Cavalieri pesanti | 3 | 6 | 4 | 0 | 3 | 0 | F | 10 / 14 / 17 | Cavalleria, Pesante | Carica |
| Cavalieri del Tempio | 3 | 5 | 4 | 0 | 3 | 1 | F | 11 / 15 / 18 | Cavalleria, Pesante, Sacra, Incantatore | Carica; Flagello +1 |
| Arcieri | 2 | 2 | 2 | 2 | 1 | 0 | F | 4 / 6 / 8 | Fanteria, Tiratore | — |
| Arcieri lunghi | 2 | 2 | 2 | 3 | 1 | 0 | F | 5 / 7 / 9 | Fanteria, Tiratore | — |
| Balestrieri | 2 | 3 | 2 | 2 | 1 | 0 | F | 5 / 7 / 9 | Fanteria, Tiratore | Perforante; Anti-volo |
| Arcieri elfici | 3 | 2 | 2 | 3 | 1 | 0 | F | 6 / 8 / 10 | Fanteria, Tiratore, Elfica | Vista silvana: il Bosco non blocca la loro linea di vista e non dà malus ai loro tiri |
| Esploratori | 3 | 2 | 2 | 0 | 1 | 0 | F | 3 / 5 / — | Fanteria, Leggera | Esploratore: +1 ai tiri sulle tabelle di Saccheggio e Rovine |
| Guardie cittadine | 2 | 3 | 3 | 0 | 2 | 0 | D | 3 / 5 / 7 | Fanteria, Disciplinata | Presidio: +1 D in un insediamento controllato dall'Ordine |
| Maghi dell'Ordine | 2 | 1 | 2 | 2 | 1 | 4 | FM | 8 / 11 / 14 | Fanteria, Tiratore, Incantatore | — |
| Maghi elementali | 2 | 1 | 2 | 2 | 1 | 5 | FM | 9 / 12 / 15 | Fanteria, Tiratore, Incantatore | Fuoco controllato: Colonna di Fuoco costa 1 FM in meno |
| Sacerdoti | 2 | 1 | 2 | 1 | 2 | 3 | FM | 7 / 10 / 13 | Fanteria, Tiratore, Incantatore, Sacra | Immuni al Test di Corruzione |
| Guaritori | 2 | 0 | 2 | 0 | 1 | 2 | FM | 5 / 7 / — | Fanteria, Incantatore, Sacra | Cura: nella Manutenzione un'unità amica della pila recupera 1 R; non possono attaccare |
| Paladini | 3 | 5 | 4 | 0 | 3 | 2 | F | 13 / 17 / 20 | Fanteria, Incantatore, Sacra | Aura di disciplina: le unità dell'Ordine nella pila hanno +1 Morale; immuni al Test di Corruzione |
| Campioni della Legge | 3 | 6 | 4 | 0 | 3 | 1 | F | 13 / 17 / 20 | Fanteria, Incantatore, Sacra | Flagello +2; immuni al Test di Corruzione |
| Ranger elfici | 3 | 3 | 2 | 2 | 2 | 0 | F | 7 / 10 / 13 | Fanteria, Tiratore, Elfica, Leggera | Imboscata: +1 colonna quando attaccano (mischia o distanza) da un esagono di Bosco |
| Guardiani del Bosco | 3 | 3 | 3 | 1 | 2 | 0 | F | 6 / 9 / 12 | Fanteria, Tiratore, Elfica | Difensori del bosco: se sono in Bosco, gli attacchi in mischia contro la loro pila subiscono –1 colonna |
| Guerrieri nanici | 2 | 4 | 4 | 0 | 3 | 0 | F | 7 / 10 / 13 | Fanteria, Nanica | Montanari: +1 D in Collina e Montagna |
| Ingegneri nanici | 2 | 2 | 3 | 0 | 2 | 0 | D | 6 / 9 / 12 | Fanteria, Nanica, Assedio | Genio: le costruzioni nel loro esagono costano 2 Oro in meno (14.6) |
| Cavalieri grifoni | 5 | 5 | 3 | 0 | 2 | 0 | F | 13 / 17 / 20 | Volante | Picchiata: Carica anche in Collina e Bosco, se hanno volato in quel turno |
| Golem controllati | 2 | 5 | 5 | 0 | 4 | 0 | F | 10 / 14 / 17 | Grande, Pesante, Immune al Morale | — |
| Inquisitori | 2 | 3 | 3 | 1 | 2 | 2 | F | 8 / 11 / 14 | Fanteria, Tiratore, Incantatore, Sacra | Flagello +1; +1 ai tiri di Purificazione (12.3); immuni al Test di Corruzione |

## 4. Schede delle unità del Caos

Abilità comuni del Caos (oltre a quelle della 3.1):

- **Furia:** all'inizio della propria Fase di Combattimento l'unità può entrare In Furia (10.4).
- **Rigenerazione:** nella propria Manutenzione l'unità recupera 1 R.
- **Soffio:** l'unità può attaccare a distanza (fino alla sua P) usando la propria F, invece di attaccare in mischia.
- **Terrore:** le unità nemiche adiacenti all'unità hanno –1 Morale. Più fonti di Terrore non si sommano.

| Unità | V | F | D | P | R | FM | Vet | Costo | Parole chiave | Abilità |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Orchi guerrieri | 2 | 4 | 2 | 0 | 2 | 0 | F | 3 / 5 / 7 | Fanteria, Orda | — |
| Orchi berseker | 2 | 5 | 1 | 0 | 2 | 0 | F | 4 / 6 / 8 | Fanteria, Orda | Furia; Sete di sangue: +1 F se ha perso almeno 1 R |
| Goblin | 3 | 2 | 1 | 0 | 1 | 0 | F | 1 / 2 / — | Fanteria, Orda, Leggera | — |
| Goblin arcieri | 3 | 1 | 1 | 2 | 1 | 0 | F | 2 / 3 / — | Fanteria, Orda, Leggera, Tiratore | — |
| Goblin genieri | 2 | 2 | 1 | 0 | 1 | 0 | F | 3 / 4 / — | Fanteria, Orda, Assedio | — |
| Troll | 2 | 6 | 3 | 0 | 4 | 0 | F | 9 / 12 / 15 | Grande | Rigenerazione |
| Troll di montagna | 2 | 7 | 4 | 0 | 4 | 0 | F | 10 / 13 / 16 | Grande, Nanica | Pelle di roccia: +1 D in Collina e Montagna |
| Ogre | 2 | 6 | 2 | 0 | 3 | 0 | F | 8 / 11 / 14 | Grande | — |
| Lupi giganti | 4 | 4 | 2 | 0 | 2 | 0 | F | 5 / 7 / 9 | Bestia, Leggera | Carica |
| Chimere minori | 3 | 5 | 2 | 0 | 2 | 0 | F | 8 / 11 / 14 | Bestia | Attacchi multipli: può dividersi tra due attacchi in mischia contro esagoni diversi, con F 3 in ciascuno (Veterana: 3 e 4) |
| Scheletri | 2 | 3 | 2 | 0 | 1 | 0 | F | 2 / 3 / 5 | Fanteria, Orda, Non-morto, Immune al Morale | — |
| Zombie | 1 | 3 | 2 | 0 | 2 | 0 | F | 2 / 3 / 5 | Fanteria, Orda, Non-morto, Immune al Morale | — |
| Spettri | 3 | 3 | 1 | 0 | 1 | 1 | F | 5 / 7 / 9 | Non-morto, Incantatore, Immune al Morale | Incorporei: muovono come se volassero (8.7), ma non sono Volanti |
| Guerrieri del Caos | 2 | 5 | 3 | 0 | 3 | 0 | F | 6 / 9 / 12 | Fanteria, Mutante | — |
| Cavalieri del Caos | 4 | 6 | 3 | 0 | 3 | 0 | F | 9 / 13 / 16 | Cavalleria, Pesante | Carica |
| Campioni mutati | 3 | 7 | 3 | 0 | 3 | 1 | F | 12 / 16 / 19 | Fanteria, Mutante, Incantatore | Mutazione instabile: all'inizio della propria Fase di Combattimento tira 1d6 — 1–2: +1 F; 3–4: +1 D; 5–6: +1 V; dura fino alla fine del TG |
| Draghi giovani | 4 | 6 | 3 | 1 | 3 | 1 | F | 14 / 18 / 22 | Volante, Grande, Incantatore | Soffio |
| Demoni minori | 3 | 5 | 2 | 0 | 2 | 2 | F | 9 / 12 / 15 | Demone, Incantatore | Terrore |
| Stregoni del Caos | 2 | 1 | 1 | 2 | 1 | 5 | FM | 10 / 13 / 16 | Fanteria, Tiratore, Incantatore | — |
| Sciamani | 2 | 2 | 2 | 1 | 2 | 4 | FM | 7 / 10 / 13 | Fanteria, Tiratore, Incantatore | Riti di guerra: Furia Bestiale costa 1 FM in meno |
| Mutanti | 2 | 4 | 2 | 0 | 2 | 0 | F | 4 / 6 / 8 | Fanteria, Orda, Mutante | Evoluzione: dopo un attacco in mischia a cui sopravvivono possono fare un Test di Mutazione (una volta per turno) |
| Abomini | 2 | 6 | 2 | 0 | 3 | 0 | F | 8 / 11 / 14 | Grande, Mutante | Travolgere: se il loro attacco ottiene DE o migliore, un'altra unità nemica adiacente agli Abomini (fuori dall'esagono attaccato), scelta dal Caos, perde 1 R |
| Sciami di insetti corrotti | 3 | 3 | 1 | 0 | 2 | 0 | F | 4 / 6 / — | Orda, Leggera, Immune al Morale | Sciame: i tiri a distanza contro la loro pila subiscono –1 colonna |

## 5. Eroi e Boss

### 5.1 Regole generali

- Ogni Eroe e Boss è unico: ne esiste una sola pedina. Una fazione può avere al massimo 4 tra Eroi e Boss in gioco.
- Eroi e Boss si ottengono solo dallo scenario o con l'Ascensione (13.5); non si reclutano durante la partita.
- Non contano per il limite di impilamento, ma in un esagono possono stare al massimo 2 tra Eroi e Boss.
- Combattono come le altre unità: aggiungono la loro F all'attacco e la loro D alla difesa.
- Valore di Morale: Eroe 5, Boss 6.
- Possono portare più oggetti magici (15.1). Non guadagnano PE.

### 5.2 Comando

- **Comando in combattimento:** se un Eroe partecipa a un attacco, l'attacco ha +1 colonna; se un Eroe è nella pila che difende, l'attacco ha –1 colonna. Un Boss dà +2 / –2 invece di +1 / –1. Per ogni lato conta solo il valore più alto, non la somma.
- **Comando sul morale:** un Eroe dà +1 Morale alle unità amiche nella sua pila; un Boss dà +2 Morale alle unità amiche entro 2 esagoni. Conta solo il bonus più alto.
- **Fuori comando (solo Ordine):** un'unità dell'Ordine a più di 4 esagoni da qualsiasi Eroe o Boss dell'Ordine non può fare Marcia Forzata e non conta per la Formazione. Il Caos non subisce questa regola.
- **Pericolo per l'Eroe:** quando un lato con un Eroe o Boss subisce 2 o più danni in un singolo attacco, il proprietario tira 1d6: con 1 l'Eroe o Boss perde 1 R in aggiunta.
- Quando un Eroe o Boss è eliminato, vedi 10.1 (Test di Morale) e 15.4 (bottino).

### 5.3 Eroi generici

| Eroe | V | F | D | P | R | FM | Costo | Parole chiave | Abilità |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Capitano (Ordine) | 3 | 5 | 3 | 0 | 3 | 0 | 18 | Fanteria | Solo Comando |
| Capobanda (Caos) | 3 | 6 | 2 | 0 | 3 | 0 | 16 | Fanteria | Furia |

### 5.4 Eroi dell'Ordine

| Eroe | V | F | D | P | R | FM | Costo | Parole chiave |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| General Kael, il Baluardo | 3 | 6 | 5 | 0 | 4 | 1 | 26 | Fanteria, Incantatore |
| Lyria Ventogelido, Arciera Leggendaria | 4 | 3 | 3 | 3 | 3 | 0 | 22 | Fanteria, Tiratore, Elfica |
| Fratello Theron, Sacerdote Guerriero | 2 | 4 | 4 | 1 | 4 | 4 | 24 | Fanteria, Tiratore, Incantatore, Sacra |
| Lady Seris, Maga del Concilio | 2 | 2 | 3 | 3 | 3 | 7 | 26 | Fanteria, Tiratore, Incantatore |

- **Kael.** *Presenza comandante:* il suo bonus al Morale vale per le unità amiche entro 2 esagoni, non solo nella sua pila. *Difesa strenua:* se difende in un insediamento, l'attacco subisce –1 colonna in più. *Ultimo baluardo:* una volta per partita, quando sarebbe eliminato, resta con 1 R e diventa Disgregato.
- **Lyria.** *Tiro perfetto:* ignora 1 colonna di malus nei suoi tiri a distanza. *Freccia del giuramento:* una volta per turno ha +2 F in un tiro a distanza contro unità del Caos. *Mobilità elfica:* la Collina le costa 1 PM.
- **Theron.** *Aura di purificazione:* le unità amiche nella sua pila e adiacenti sono immuni al Test di Corruzione. *Luce guaritrice maggiore:* quando lancia Luce Guaritrice cura 3 R invece di 2. *Giuramento di protezione:* una volta per TG può prendere su di sé fino a 2 danni assegnati a un'unità amica nella sua pila o adiacente.
- **Seris.** *Maestria delle barriere:* Barriera di Luce le costa 2 FM e dà +3 D. *Controincantesimo:* una volta per TG, quando una magia nemica viene lanciata entro 3 esagoni da lei, può spendere FM pari a metà del costo della magia (arrotondato per eccesso) e tirare 1d6: con 4+ la magia è annullata (il nemico perde comunque il FM). *Chiarezza mentale:* immune ai Test di Morale causati da magie.

### 5.5 Eroi del Caos

| Eroe | V | F | D | P | R | FM | Costo | Parole chiave |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gorath Craniomanto, Campione Mutante | 3 | 8 | 3 | 0 | 5 | 1 | 26 | Fanteria, Mutante, Incantatore |
| Veyla Sussurrante, Strega della Fenditura | 3 | 2 | 2 | 3 | 3 | 7 | 24 | Fanteria, Tiratore, Incantatore |
| Korgash, il Macellaio | 3 | 7 | 4 | 0 | 4 | 0 | 24 | Fanteria |
| Zhara, Invocatrice di Demoni | 2 | 3 | 2 | 2 | 3 | 6 | 24 | Fanteria, Tiratore, Incantatore |

- **Gorath.** *Furia incontrollabile:* Furia; In Furia ha +2 F invece di +1. *Presenza terrificante:* Terrore. *Mutazione continua:* all'inizio della propria Fase di Combattimento sceglie +1 F, +1 D oppure recupera 1 R; l'aumento di F o D dura fino alla fine del TG.
- **Veyla.** *Corruzione dilagante:* Piaga Strisciante, Tentacoli della Corruzione e Frattura della Realtà hanno +1 Portata quando le lancia lei. *Sussurri del vuoto:* una volta per turno, senza spendere FM, un'unità nemica entro 2 esagoni fa un Test di Morale con –1 (non conta come magia). *Patto oscuro:* una volta per turno può perdere 1 R per avere +2 FM in quel turno.
- **Korgash.** *Massacro:* una volta per Fase di Combattimento, se un attacco a cui partecipa elimina tutte le unità dell'esagono attaccato, può fare subito un altro attacco in mischia, da solo, contro un altro esagono nemico adiacente. *Terrore. Pelle cicatrizzata:* ignora il primo danno assegnatogli in ogni Fase di Combattimento.
- **Zhara.** *Richiamo demoniaco:* Risveglio Demoniaco le costa 4 FM. *Legame oscuro:* i Demoni che evoca hanno +1 F e restano in gioco un turno in più. *Sacrificio del sangue:* una volta per turno può eliminare un'unità normale amica di costo Base 2 o più nella sua pila o adiacente, per recuperare 2 R oppure avere +2 FM in quel turno.

### 5.6 Boss

I Boss compaiono solo negli scenari che li prevedono. Il costo serve per calcolare i punti esercito.

| Boss | Fazione | V | F | D | P | R | FM | Costo | Parole chiave | Abilità |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Arcimago del Concilio | Ordine | 2 | 2 | 3 | 3 | 4 | 9 | 40 | Tiratore, Incantatore | Lancia fino a 2 magie per turno; Barriera di Luce gli costa 2 FM |
| Gran Maestro dei Cavalieri | Ordine | 4 | 8 | 5 | 0 | 5 | 2 | 40 | Cavalleria, Incantatore | Carica; le unità dell'Ordine entro 2 esagoni contano sempre per la Formazione |
| Re-Sacerdote | Ordine | 2 | 4 | 5 | 2 | 5 | 7 | 40 | Tiratore, Incantatore, Sacra | Cura di massa: nella sua Manutenzione le unità amiche entro 2 recuperano 1 R; una volta per turno Purifica senza tiro un esagono entro 2 |
| Drago Antico | Caos | 5 | 10 | 5 | 2 | 6 | 3 | 45 | Volante, Grande, Incantatore | Soffio; Terrore (entro 2 esagoni invece che adiacenti) |
| Signore del Caos | Caos | 3 | 9 | 4 | 0 | 5 | 4 | 40 | Fanteria, Mutante, Incantatore | Furia; le unità del Caos entro 2 possono entrare In Furia anche senza l'abilità Furia |
| Demone Maggiore | Caos | 4 | 8 | 3 | 1 | 5 | 6 | 40 | Demone, Incantatore | Terrore; l'esagono in cui termina il movimento diventa Corrotto; Risveglio Demoniaco gli costa 4 FM |
| Stregone Supremo del Caos | Caos | 2 | 2 | 2 | 3 | 4 | 10 | 40 | Tiratore, Incantatore | Lancia fino a 2 magie per turno; +1 Portata a tutte le sue magie |

## 6. Terreno

Ogni esagono ha un solo tipo di terreno. I lati possono avere ostacoli. Questa è l'unica tabella del terreno: gli effetti non scritti qui non esistono.

### 6.1 Tipi di esagono

Le colonne "Mischia" e "Distanza" indicano lo spostamento di colonna (9.4, 9.9) per chi attacca un'unità che si trova in quell'esagono. Conta solo il terreno dell'esagono attaccato.

| Terreno | Costo in PM | Mischia | Distanza | Blocca la linea di vista | Note |
| --- | --- | --- | --- | --- | --- |
| Pianura | 1 | 0 | 0 | No | — |
| Collina | 2 (Pesante 3) | –1 | –1 | No | Un Tiratore in Collina ha +1 P |
| Bosco | 2 (Elfica 1; Pesante 3) | –1 (–2 se l'attacco include Cavalleria o Bestie) | –1 | Sì | — |
| Palude | 3 (Anfibia 1; Pesante 4) | –1 | 0 | No | Le unità non Anfibie in Palude hanno –1 F |
| Deserto | 2 | 0 | 0 | No | Fine movimento in Deserto: tiro 3+ o l'unità diventa Stanca (Volanti e Demoni esenti) |
| Montagna | 3 (Nanica 2) | –2 | –2 | Sì | Vietata a Cavalleria e Bestie |
| Città minore / maggiore | 1 | –1 | –1 | Sì | Insediamento |
| Castello minore | 1 | –2 | –2 | Sì | Insediamento; Assedio (Sez. 16) |
| Castello maggiore / Capitale | 1 | –3 | –3 | Sì | Insediamento; Assedio (Sez. 16) |
| Rovina | 2 | –1 | –1 | No | Esplorabile (14.8) |
| Tempio dell'Ordine | 1 | –1 se difende l'Ordine, altrimenti 0 | come Mischia | No | Luogo (12.4) |
| Altare / Fenditura del Caos | 1 | –1 se difende il Caos, altrimenti 0 | come Mischia | No | Luogo (12.4) |
| Lago | Vietato (Anfibia 2) | 0 | 0 | No | Le unità Volanti possono sorvolarlo ma non fermarsi |

### 6.2 Strada

La strada è disegnata sopra gli esagoni. Un'unità che passa da un esagono con strada a uno adiacente seguendo la strada spende ½ PM, qualunque sia il terreno e senza costi per i fiumi (la strada include il ponte). Le frazioni di PM si sommano nel corso del movimento. I costi delle Zone di Controllo si pagano normalmente.

### 6.3 Ostacoli sui lati

| Lato | Movimento | Combattimento | Altro |
| --- | --- | --- | --- |
| Fiume | +2 PM; vietato alle unità Pesanti; Anfibie +0 | Mischia attraverso il fiume: –2 colonne | Le Zone di Controllo non lo attraversano |
| Guado | +1 PM | Mischia attraverso il guado: –1 colonna | — |
| Ponte | +0 PM | Mischia attraverso il ponte: –1 colonna | — |
| Cresta | +1 PM salendo, +0 scendendo | Mischia dal lato basso verso quello alto: –1 colonna | La mappa indica il lato alto |
| Mura | +1 PM per attraversarle | Mischia attraverso le mura: –1 colonna | Costruibili (14.6) |
| Barriera magica | Vietata alle unità della fazione indicata | — | Creata da scenario |

Uno spostamento di colonna dovuto a un lato si applica solo se **tutte** le unità che attaccano in mischia attraversano quel tipo di lato. Se gli attaccanti attraversano lati diversi, si applica il malus più piccolo. Le unità che volano (8.7) ignorano i lati, salvo la Barriera magica.

### 6.4 Stato degli esagoni

Ogni esagono può essere Normale, Corrotto o Purificato (Sez. 12). Lo stato si aggiunge al tipo di terreno e non lo cambia.

## 7. Sequenza del turno

Lo scenario stabilisce chi gioca per primo; se non lo dice, gioca per primo l'Ordine. L'ordine resta lo stesso per tutta la partita. Ogni Turno di Gioco si svolge così.

### 7.1 Turno del primo giocatore

**A. Fase di Manutenzione**, in quest'ordine:

1. Terminano gli effetti che duravano "fino al tuo prossimo turno".
2. La riserva di FM di ogni Incantatore torna pari al suo FM (11.1).
3. Riscuoti l'Oro (14.1) e paga l'eventuale mantenimento (14.2).
4. Danni da Piaga (Piaga Strisciante, 11.7) alle tue unità negli esagoni con Piaga.
5. Cure: Rigenerazione, Cura dei Guaritori, Templi e Altari (12.4), Cura di massa.
6. Stanchezza: le unità Esauste diventano Stanche; le unità Stanche tornano normali.
7. Riorganizzazione delle unità Disgregate (10.5).
8. Trasferimento di oggetti tra unità amiche nella stessa pila (15.1); test degli oggetti della fazione avversaria (15.5).
9. Avanzamenti rimasti in sospeso per il limite di Veterani (13.4).

**B. Fase di Reclutamento e Costruzione** (Sez. 14): reclutamento, costruzioni, addestramento (13.3), Mutazione Forzata (12.5), Ascensione (13.5).

**C. Fase di Movimento** (Sez. 8): muovi le tue unità una alla volta o in pile.

**D. Fase di Combattimento** (Sez. 9):

1. Dichiarazione: annunci Furia, tutti gli attacchi in mischia, a distanza e le magie (con i bersagli).
2. Magie, nell'ordine che scegli.
3. Attacchi a distanza, nell'ordine che scegli.
4. Attacchi in mischia, nell'ordine che scegli; ritirate e avanzate subito dopo ogni attacco.
5. Test di Morale (Sez. 10).
6. Azioni speciali delle unità che non hanno attaccato né lanciato magie: Purificare (12.3), Esplorare (14.8), Aprire una breccia (16.2).
7. Annoti i PE guadagnati (13.1) e applichi gli avanzamenti.

**E. Fase Finale del giocatore:**

1. Tentativi di corruzione degli insediamenti (12.3, solo Caos).
2. Test di Corruzione per le unità dell'Ordine in esagoni Corrotti (12.2).
3. Profanazione e Sigillatura dei luoghi (12.4).

### 7.2 Turno del secondo giocatore

Il secondo giocatore svolge le stesse fasi da A a E.

### 7.3 Fase di Fine Turno

1. Terminano gli effetti che duravano "fino alla fine del TG".
2. Si controllano le condizioni di vittoria e di sconfitta (Sez. 17). Questo è l'unico momento in cui si controllano, salvo che lo scenario dica altro.
3. Si avanza il segnalino sulla traccia dei turni.

### 7.4 Cosa fa il giocatore reattivo

Durante il turno dell'avversario il giocatore reattivo non attacca e non muove. Può solo:

- lanciare magie di Reazione (11.5) e Controincantesimi;
- usare abilità che dicono espressamente di funzionare nel turno nemico;
- scegliere come assegnare i danni, ritirare le proprie unità e fare i Test richiesti.

## 8. Movimento

### 8.1 Principi

- Ogni unità ha PM pari alla sua V (modificata dagli stati). I PM non usati si perdono.
- Si muove un'unità o una pila alla volta; un movimento finisce prima di iniziare il successivo. Le unità di una pila possono separarsi.
- Per entrare in un esagono si paga il costo del terreno (6.1), più i costi del lato attraversato (6.3) e delle Zone di Controllo (8.3).
- Non si può entrare in un esagono se non si hanno abbastanza PM, salvo il **movimento minimo**: un'unità che all'inizio del suo movimento non si è ancora mossa può sempre muovere di esattamente 1 esagono spendendo tutti i suoi PM, se quell'esagono non è vietato. Il movimento minimo non si combina con la Marcia Forzata.
- **Non si può mai entrare in un esagono che contiene unità nemiche.** Il combattimento avviene sempre tra esagoni adiacenti.
- Si può attraversare un esagono con unità amiche; il limite di impilamento conta solo dove ci si ferma.

### 8.2 Impilamento

- In un esagono possono stare al massimo **4 punti** di unità normali: ogni unità vale 1, le unità Grandi valgono 2.
- In più possono starci al massimo 2 tra Eroi e Boss, che non contano nei 4 punti.
- Il limite vale alla fine del movimento, dopo le ritirate e dopo il reclutamento. Se dopo una ritirata un esagono è sovraffollato, l'unità in ritirata deve continuare (10.3).

### 8.3 Zone di Controllo (ZdC)

- Ogni unità esercita una ZdC nei 6 esagoni adiacenti, anche se Stanca, Disgregata o ferita. La ZdC non attraversa i lati di Fiume (sì Guado e Ponte).
- Fanno eccezione le unità Volanti mentre volano (8.7): non esercitano ZdC durante quel movimento.
- **Entrare** in un esagono in ZdC nemica costa +1 PM.
- **Uscire** da un esagono in ZdC nemica costa +1 PM (le unità Leggere non pagano questo costo).
- Passare direttamente da una ZdC nemica a un'altra costa quindi +2 PM (uscita + entrata). Non ci sono altri costi.
- Se più unità nemiche proiettano ZdC sullo stesso esagono, il costo si paga una volta sola.
- La ZdC non obbliga a fermarsi e non obbliga a combattere.

### 8.4 Marcia Forzata

- Si dichiara prima di muovere l'unità: ha +2 PM per quel movimento.
- Alla fine del movimento tira 1d6 (Elite +1): con 3+ nessun effetto; altrimenti diventa Stanca. Un'unità già Stanca che fallisce diventa Esausta.
- Non possono fare Marcia Forzata le unità Disgregate, Esauste, Fuori comando (5.2) o che usano il movimento minimo.

### 8.5 Uscire dal contatto

Un'unità adiacente a nemici può sempre allontanarsi durante il suo movimento pagando i costi normali, inclusa l'uscita dalla ZdC.

### 8.6 Muoversi dopo il reclutamento

Le unità reclutate in questo turno possono muovere e combattere normalmente.

### 8.7 Volo

- All'inizio del movimento di un'unità Volante il proprietario dichiara se vola. In volo:
  - ogni esagono costa 1 PM, qualunque sia il terreno;
  - si ignorano i lati, salvo la Barriera magica;
  - si ignorano le ZdC nemiche;
  - si possono sorvolare esagoni con unità nemiche e Laghi.
- Alla fine del movimento l'unità atterra sempre: deve fermarsi in un esagono in cui potrebbe entrare a piedi, senza nemici. Nel combattimento e nel turno nemico è un'unità normale (le abilità Anti-volo funzionano comunque contro di lei).
- Gli Spettri (Incorporei) muovono con queste stesse regole.

## 9. Combattimento

### 9.1 Chi può attaccare

- Attacca solo il giocatore attivo, nella sua Fase di Combattimento. Il combattimento è sempre facoltativo.
- Ogni unità fa al massimo **un attacco** per turno, in mischia oppure a distanza (salvo abilità come Attacchi multipli o Massacro). Lanciare una magia non impedisce di attaccare.
- Non possono attaccare le unità Disgregate e quelle con F 0.
- Un attacco è sempre diretto contro **un esagono** e colpisce tutte le unità che vi si trovano.
- Si gioca **un solo round** per Fase di Combattimento.

### 9.2 Dichiarazione

- Si dichiarano insieme tutti gli attacchi: quali unità attaccano quale esagono, e se in mischia o a distanza.
- Un esagono nemico può subire al massimo **un attacco in mischia** per turno, ma anche più attacchi a distanza e più magie.
- Più unità da esagoni diversi possono unirsi nello stesso attacco in mischia, se sono tutte adiacenti all'esagono attaccato.
- Le dichiarazioni non si cambiano. Un'unità eliminata, ritirata o Disgregata prima del suo attacco non vi partecipa; se non resta nessun attaccante l'attacco è annullato. Se l'esagono bersaglio è vuoto quando si risolve l'attacco, l'attacco è annullato e gli attaccanti in mischia possono avanzare (9.8).

### 9.3 Fattore Totale in mischia

- **FT dell'attaccante** = somma delle F delle unità che attaccano.
- **FT del difensore** = somma delle D di tutte le unità nell'esagono attaccato.
- F e D sono quelle modificate da gradi, stati, abilità, oggetti e magie. Il FT del difensore è almeno 1.

### 9.4 Rapporto e spostamenti di colonna

1. Dividi il FT dell'attaccante per il FT del difensore.
2. Scegli la colonna più alta il cui rapporto è minore o uguale al risultato: 1:3 o peggio (meno di 0,5), 1:2 (da 0,5), 1:1 (da 1), 3:2 (da 1,5), 2:1 (da 2), 3:1 (da 3), 4:1 o meglio (da 4). Esempio: 7 contro 5 = 1,4 → colonna 1:1.
3. Somma tutti gli spostamenti che si applicano. Un numero positivo sposta verso destra (meglio per l'attaccante), uno negativo verso sinistra. Il totale non può superare +3 o –3. Oltre le colonne estreme non si va.

| Spostamento | Valore |
| --- | --- |
| Terreno dell'esagono attaccato (6.1) | Come da tabella |
| Lato attraversato (6.3) | Come da tabella |
| Comando (5.2) | +1 / +2 per l'attaccante, –1 / –2 per il difensore |
| Formazione: la pila che difende è dell'Ordine e contiene 2 unità Disciplinate (o una Fanteria disciplinata), nessuna Disgregata o Fuori comando | –1 |
| Orda: l'attacco è del Caos e include almeno 3 unità Orda | +1 |
| Accerchiamento: gli attaccanti arrivano da almeno 3 esagoni diversi | +1 |
| Esagono attaccato Corrotto | +1 se attacca il Caos, –1 se attacca l'Ordine |
| Esagono attaccato Purificato | +1 se attacca l'Ordine, –1 se attacca il Caos |
| Abilità delle unità (Anti-cavalleria, Imboscata, Assedio…) | Come da scheda |

### 9.5 Tabella di Mischia

Tira 1d6 (senza modificatori) e incrocia con la colonna finale.

| d6 | 1:3 o peggio | 1:2 | 1:1 | 3:2 | 2:1 | 3:1 | 4:1 o meglio |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | AE | AE | AE | AR | EX | DR | DE |
| 2 | AE | AE | AR | EX | DR | DE | DE |
| 3 | AE | AR | EX | DR | DE | DE | DE\* |
| 4 | AR | AR | DR | DE | DE | DE\* | DE\*\* |
| 5 | AR | EX | DE | DE | DE\* | DE\*\* | DE\*\* |
| 6 | DR | DR | DE | DE\* | DE\*\* | DE\*\* | DE\*\*\* |

### 9.6 Significato dei risultati

| Risultato | Effetto |
| --- | --- |
| AE | Gli attaccanti subiscono 2 danni, si ritirano di 1 esagono e diventano Disgregati |
| AR | Gli attaccanti subiscono 1 danno e si ritirano di 1 esagono |
| EX | Attaccanti e difensori subiscono 1 danno ciascuno; nessuna ritirata |
| DR | I difensori subiscono 1 danno e si ritirano di 1 esagono |
| DE | I difensori subiscono 2 danni, si ritirano di 1 esagono e diventano Disgregati |
| \* | +1 danno ai difensori |
| \*\* | +1 danno ai difensori; tutti i difensori sopravvissuti fanno un Test di Morale con –1 |
| \*\*\* | +2 danni ai difensori; la ritirata è di 2 esagoni invece di 1 |

"Gli attaccanti" sono tutte le unità che hanno partecipato all'attacco; "i difensori" tutte le unità dell'esagono attaccato.

### 9.7 Assegnare i danni

- Il proprietario assegna i danni uno alla volta alle sue unità coinvolte, come preferisce. Un Eroe o Boss può ricevere danni solo se lo sceglie il proprietario o se non restano altre unità coinvolte (più il Pericolo per l'Eroe, 5.2).
- I danni oltre la R delle unità coinvolte vanno persi.
- Un'unità già Disgregata che dovrebbe diventare di nuovo Disgregata subisce invece 1 danno.

### 9.8 Ritirate e avanzate

- **Ritirata:** il proprietario sposta ogni unità sopravvissuta del numero di esagoni indicato, ignorando i costi in PM. Ogni esagono deve essere più lontano dell'esagono precedente da tutte le unità nemiche coinvolte. Non si può entrare in esagoni nemici o vietati, né attraversare lati vietati. Unità della stessa pila possono ritirarsi in esagoni diversi.
- Si può entrare in un esagono in ZdC nemica solo se non c'è alternativa; ogni esagono così subisce 1 danno.
- Se un'unità non può ritirarsi del tutto, resta dove si è fermata e subisce 1 danno per ogni esagono mancante.
- La ritirata deve terminare rispettando l'impilamento; se non è possibile, l'unità prosegue di un altro esagono (stesse regole).
- **Avanzata:** se dopo un attacco in mischia l'esagono attaccato è vuoto, qualsiasi attaccante non Disgregato può entrarvi subito, ignorando PM e ZdC ma rispettando terreni e lati vietati e l'impilamento. Le unità che avanzano non fanno altri attacchi in questo turno.

### 9.9 Combattimento a distanza

- Può tirare un'unità Tiratore (o con Soffio) contro un esagono a distanza non superiore alla sua P, se ha la linea di vista. Può tirare anche contro un esagono adiacente.
- **Linea di vista:** si traccia una retta tra i centri dei due esagoni. È bloccata se attraversa l'interno di un esagono intermedio che blocca la vista (6.1). Se la retta corre esattamente lungo un lato, è bloccata solo se lo sono entrambi gli esagoni ai lati. Gli esagoni di partenza e di arrivo non bloccano mai. Le unità non bloccano.
- Più Tiratori possono unirsi in un solo tiro contro lo stesso esagono; ognuno deve avere portata e linea di vista.
- **FT a distanza** = somma delle F dei tiratori.
- **Spostamenti:** terreno dell'esagono bersaglio (colonna "Distanza" della 6.1); Difesa alta: –1 se un'unità bersaglio ha D 4 o 5, –2 se ha D 6 o più; abilità (Copertura, Sciame, Imboscata, Anti-volo, Perforante). Il totale non supera ±3.

| d6 | FT 1–2 | 3–4 | 5–7 | 8–11 | 12–15 | 16–20 | 21+ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | — | — | 1D | 1D | 2D | 1E | 2E |
| 2 | — | 1D | 1D | 2D | 1E | 2E | 3E |
| 3 | — | 1D | 2D | 1E | 2E | 3E | 3E |
| 4 | 1D | 1D | 1E | 2E | 3E | 3E | 4E |
| 5 | 1D | 2D | 2E | 3E | 3E | 4E | 5E |
| 6 | 1D | 1E | 2E | 3E | 4E | 5E | 6E |

- **nD:** n unità diverse del bersaglio, scelte dal proprietario, diventano Disgregate. Ogni D in più rispetto alle unità presenti diventa 1 danno.
- **nE:** il bersaglio subisce n danni.
- Il tiro a distanza non causa ritirate.

## 10. Morale, Rotta e stati

### 10.1 Quando si fa un Test di Morale

Nel passo 5 della Fase di Combattimento (7.1 D) fanno un Test di Morale le unità di **entrambi** i giocatori che, in questa Fase di Combattimento:

- hanno subito danni pari ad almeno metà della loro R massima (arrotondata per eccesso) e sono sopravvissute;
- erano nella pila colpita da un risultato \*\*;
- avevano un Eroe o Boss amico entro 2 esagoni che è stato eliminato.

Ogni unità fa al massimo un Test in questo passo, anche se le cause sono più di una; si applicano tutti i modificatori pertinenti. I Test causati da magie, abilità e oggetti si fanno invece subito, quando l'effetto si risolve. Le unità Immuni al Morale non fanno mai Test.

### 10.2 Come si fa

Tira 1d6: il Test riesce se il risultato è minore o uguale al Valore di Morale modificato. Un 6 naturale fallisce sempre.

Valore di base: Base 3, Veterano 4, Elite 5, Eroe 5, Boss 6.

| Modificatore al valore |  |
| --- | --- |
| Comando: Eroe amico nella pila / Boss amico entro 2 esagoni (vale il più alto) | +1 / +2 |
| Formazione (la pila soddisfa 9.4) | +1 |
| In Furia | +1 |
| Difende un insediamento controllato dalla propria fazione | +1 |
| Stendardo della Disciplina nella pila | +1 |
| Aura di disciplina (Paladini) nella pila | +1 |
| Unità Disgregata | –1 |
| Ha perso almeno il 75% della R massima | –1 |
| Risultato \*\* sulla propria pila | –1 |
| Unità nemica con Terrore adiacente | –1 |
| Unità dell'Ordine in esagono Corrotto, o del Caos in esagono Purificato | –1 |
| Eroe o Boss amico eliminato entro 2 esagoni | –2 |

### 10.3 Tabella di Rotta

Se il Test fallisce, tira 1d6 senza modificatori:

| d6 | Risultato | Effetto |
| --- | --- | --- |
| 1 | Sbandamento | L'unità è eliminata. Se è un Eroe o Boss, o se nella sua pila c'è un Eroe o Boss amico, si applica invece il risultato 2 |
| 2 | Rotta | Si ritira di 2 esagoni e diventa Disgregata |
| 3 | Fuga | Si ritira di 1 esagono e diventa Disgregata |
| 4 | Disgregazione | Diventa Disgregata |
| 5 | Vacillamento | Diventa Vacillante |
| 6 | Tiene | Nessun effetto |

Le ritirate seguono la 9.8, allontanandosi dall'unità nemica più vicina.

### 10.4 Stati delle unità

Gli stati si segnano con marker e i loro malus si sommano (F, D e V non scendono sotto 1).

| Stato | Effetti | Come finisce |
| --- | --- | --- |
| Disgregato | –1 F, –1 D; non può attaccare né fare Marcia Forzata né entrare In Furia | Riorganizzazione (10.5) |
| Stanco | –1 V, –1 F, –1 D | Nella propria Manutenzione |
| Esausto | –2 V, –2 F, –2 D | Nella propria Manutenzione torna Stanco |
| Vacillante | –1 F | Alla fine del proprio turno successivo |
| In Furia | +1 F, –1 D, +1 Morale; se è adiacente a nemici deve partecipare a un attacco in mischia nel turno in cui entra In Furia | Alla fine del TG |
| Corrotto (solo unità dell'Ordine) | –1 F, –1 Morale; se diventa Corrotta una seconda volta è eliminata (diserta) | Purificazione dell'unità (12.3), Runa di Purificazione, Pozione di Guarigione |

### 10.5 Riorganizzazione

Nella propria Manutenzione ogni unità Disgregata:

- torna normale automaticamente se nella sua pila c'è un Eroe o Boss amico;
- altrimenti fa un Test di Morale con +1: se riesce torna normale, se fallisce resta Disgregata (non si tira sulla Tabella di Rotta).

## 11. Magia

### 11.1 Riserva di FM

- Ogni Incantatore ha una **riserva** di FM. All'inizio della propria Manutenzione la riserva torna pari al suo FM; quella non spesa non si accumula.
- Per lanciare una magia si spende il suo costo dalla riserva. Non si può lanciare una magia che costa più della riserva disponibile.
- Ogni Incantatore lancia al massimo **una magia per turno** (alcuni Boss due), più le magie di Reazione nel turno nemico.
- Un Incantatore può lanciare qualsiasi magia della propria fazione.
- **Concentrazione:** se l'Incantatore non si è mosso in questo turno, la sua magia costa 1 FM in meno (minimo 1).
- **Magia di gruppo:** più Incantatori nella stessa pila possono sommare le riserve per una sola magia; tutti contano come se l'avessero lanciata, e un Contraccolpo colpisce ognuno di loro.

### 11.2 Quando si lancia

Le magie si lanciano nel passo 2 della propria Fase di Combattimento (7.1 D), dopo averle dichiarate con il bersaglio. Le magie di Reazione si lanciano nel turno nemico (11.5).

### 11.3 Portata e bersaglio

- La Portata si conta dall'esagono dell'Incantatore. Portata 0 = solo il proprio esagono.
- Serve la linea di vista (9.9) verso l'esagono bersaglio, salvo se è adiacente.
- Se la magia colpisce "un'unità", il lanciatore la sceglie. Se colpisce "un esagono", colpisce tutte le unità presenti. I danni ai singoli bersagli non si ridistribuiscono.

### 11.4 Prova di Lancio

Dopo aver speso il FM, tira 1d6 e somma i modificatori:

| Modificatore |  |
| --- | --- |
| Incantatore dell'Ordine entro 3 esagoni da un Tempio dell'Ordine controllato dall'Ordine | +1 |
| Incantatore del Caos entro 3 esagoni da un Altare o Fenditura controllati dal Caos | +1 |
| Incantatore del Caos in esagono Corrotto, o dell'Ordine in esagono Purificato | +1 |
| Incantatore dell'Ordine in esagono Corrotto, o del Caos in esagono Purificato | –1 |
| Incantatore Disgregato, Stanco o Esausto | –1 |
| Magia offensiva contro un bersaglio in Castello o Capitale | –1 |
| Boss che lancia | +1 |

| Totale | Ordine | Caos |
| --- | --- | --- |
| 1 o meno | Fallimento | Fallimento (con 1 naturale: Catastrofe) |
| 2 | Successo | Fallimento |
| 3–4 | Successo | Successo |
| 5 | Successo | Successo potenziato |
| 6 o più | Successo potenziato | Successo potenziato (con 6 naturale: Trionfo) |

- **Fallimento:** nessun effetto; il FM è speso.
- **Successo:** la magia ha l'effetto scritto.
- **Successo potenziato:** +1 ai danni o ai bonus/malus numerici della magia; se non ne ha, la durata aumenta di un turno.
- **Catastrofe (solo Caos):** nessun effetto e l'Incantatore subisce 1 danno (Contraccolpo).
- **Trionfo (solo Caos):** come Successo potenziato, ma +2 invece di +1.

### 11.5 Magie di Reazione

Le magie segnate "Reazione" si possono lanciare nel turno nemico, quando un'unità amica entro portata viene dichiarata bersaglio di un attacco o di una magia, con 1 FM in più di costo. Si risolvono prima dell'attacco.

### 11.6 Magie dell'Ordine

| Magia | Costo | Portata | Effetto | Durata |
| --- | --- | --- | --- | --- |
| Barriera di Luce | 3 | 2 | Le unità amiche in un esagono hanno +2 D. Reazione | Fino al tuo prossimo turno |
| Purga del Caos | 4 | 3 | 3 danni a un'unità Demone, Non-morto o Mutante; l'esagono del bersaglio, se Corrotto, torna Normale | Immediato |
| Giuramento di Ferro | 3 | 2 | Un'unità amica non può diventare Disgregata e supera automaticamente i Test di Morale | Fino al tuo prossimo turno |
| Luce Guaritrice | 2 | 2 | Un'unità amica recupera 2 R e perde lo stato Stanco | Immediato |
| Sigillo di Immobilità | 4 | 3 | Un'unità nemica ha V 0 nel suo prossimo turno | Fino alla fine del prossimo turno nemico |
| Aura di Disciplina | 4 | 0 | Le unità amiche nell'esagono del lanciatore e adiacenti hanno +1 F e +1 D | Fino al tuo prossimo turno |
| Colonna di Fuoco | 5 | 3 | 3 danni a un'unità, oppure 1 danno a ogni unità di un esagono | Immediato |
| Purificazione del Terreno | 3 | 2 | Un esagono diventa Purificato | Permanente |
| Scudo di Fede | 2 | 1 | Un'unità amica ignora il primo danno che subisce. Reazione | Fino al tuo prossimo turno |
| Chiamata all'Ordine | 3 | 3 | Tutte le unità amiche entro la portata non sono più Disgregate | Immediato |

### 11.7 Magie del Caos

| Magia | Costo | Portata | Effetto | Durata |
| --- | --- | --- | --- | --- |
| Vampata Mutante | 4 | 2 | 1 danno a ogni unità di un esagono; poi ogni unità del Caos colpita fa un Test di Mutazione e ogni unità dell'Ordine un Test di Corruzione | Immediato |
| Sussurro della Fenditura | 2 | 3 | Un'unità nemica fa un Test di Morale con –1 | Immediato |
| Piaga Strisciante | 5 | 2 | Un esagono diventa Corrotto e riceve il marker Piaga: ogni unità lì presente all'inizio della Manutenzione del suo proprietario subisce 1 danno | Finché l'esagono non torna Normale o Purificato |
| Furia Bestiale | 2 | 2 | Un'unità amica entra In Furia (anche senza l'abilità) con +2 F invece di +1 | Fino alla fine del TG |
| Tentacoli della Corruzione | 4 | 2 | 2 danni a un'unità nemica e –1 V nel suo prossimo turno; l'esagono diventa Corrotto | Danni immediati; Corruzione permanente |
| Urlo del Vuoto | 4 | 0 | Le unità nemiche adiacenti al lanciatore fanno un Test di Morale con –1 | Immediato |
| Dono Mutante | 3 | 1 | Un'unità normale amica fa un Test di Mutazione con +1 | Immediato |
| Pioggia di Cenere Nera | 5 | 3 | 1 danno a ogni unità di un esagono; l'esagono blocca la linea di vista | Danni immediati; blocco fino alla fine del TG |
| Risveglio Demoniaco | 6 | 2 | Compare un Demone minore Base in un esagono vuoto entro la portata (rispettando l'impilamento); non conta per i limiti e non dà PE né bottino | Fino alla fine del tuo prossimo turno |
| Frattura della Realtà | 6 | 3 | 4 danni a un'unità; l'esagono diventa Corrotto; ogni unità Veterana o Elite del Caos in quell'esagono fa un Test di Instabilità | Immediato |

## 12. Corruzione, Purificazione, Luoghi, Mutazione

### 12.1 Stati degli esagoni

Ogni esagono è **Normale**, **Corrotto** o **Purificato** (un solo marker, mai entrambi).

- **Corrompere** un esagono: Normale → Corrotto; Purificato → Normale.
- **Purificare** un esagono: Corrotto → Normale; Normale → Purificato.
- Una magia o un effetto che dice "diventa Corrotto/Purificato" imposta direttamente quello stato.

### 12.2 Effetti

| Effetto | Dove è descritto |
| --- | --- |
| Spostamento di colonna in mischia | 9.4 |
| Modificatore al Morale | 10.2 |
| Modificatore alla Prova di Lancio | 11.4 |
| Rendita dell'Ordine –1 per ogni suo insediamento Corrotto | 14.1 |

Inoltre, nella Fase Finale del proprio turno:

- ogni unità dell'Ordine in un esagono Corrotto fa un **Test di Corruzione**;
- ogni unità Demone o Non-morto in un esagono Purificato tira 1d6: con 1 subisce 1 danno.

**Test di Corruzione:** tira 1d6; con 1 l'unità diventa Corrotta (10.4). Sono immuni le unità la cui scheda lo dice e le unità del Caos.

### 12.3 Azioni di Corruzione e Purificazione

- **Corruzione degli insediamenti (Caos):** nella Fase Finale del Caos, per ogni insediamento controllato dal Caos e non Corrotto, tira 1d6: con 4+ diventa Corrotto. +1 se nell'esagono c'è un Incantatore del Caos; +1 se c'è un Altare o Fenditura del Caos entro 3 esagoni.
- **Corrompere (azione del Caos):** nel passo 6 della Fase di Combattimento, un Incantatore del Caos che in questo turno non ha attaccato né lanciato magie sceglie il proprio esagono o uno adiacente e tira 1d6: con 4+ l'esagono viene corrotto. +1 se c'è un Altare o Fenditura del Caos entro 3 esagoni.
- **Purificare (azione dell'Ordine):** nel passo 6 della Fase di Combattimento, un'unità Sacra che in questo turno non ha attaccato né lanciato magie sceglie il proprio esagono, uno adiacente oppure un'unità Corrotta della propria pila, e tira 1d6: con 4+ l'esagono viene purificato, oppure l'unità non è più Corrotta. +1 per gli Inquisitori; +1 se c'è un Tempio dell'Ordine controllato dall'Ordine entro 3 esagoni.
- Ogni esagono può essere bersaglio di una sola azione di Corruzione o Purificazione per turno.

### 12.4 Luoghi

I Luoghi si controllano come gli insediamenti (17.1) ma non sono insediamenti.

| Luogo | Effetti per chi lo controlla |
| --- | --- |
| Tempio dell'Ordine (se controllato dall'Ordine) | +1 Oro; le unità dell'Ordine nell'esagono recuperano 1 R nella Manutenzione; +1 alle Prove di Lancio entro 3; può reclutare 1 unità Sacra per turno; l'esagono è sempre Purificato |
| Altare del Caos / Fenditura del Caos (se controllati dal Caos) | +1 Oro; le unità del Caos nell'esagono recuperano 1 R nella Manutenzione; +1 alle Prove di Lancio entro 3; può reclutare 1 unità Demone o Mutante per turno; l'esagono è sempre Corrotto |
| Rovina | Può essere esplorata una volta (14.8) |

Il Tempio controllato dal Caos e l'Altare o la Fenditura controllati dall'Ordine non danno alcun effetto.

- **Profanazione:** se il Caos controlla un Tempio nella sua Fase Finale per due turni consecutivi, il Tempio diventa un Altare del Caos.
- **Consacrazione:** se l'Ordine controlla un Altare del Caos con un'unità Sacra nell'esagono, nella sua Fase Finale per due turni consecutivi, l'Altare diventa un Tempio dell'Ordine.
- **Sigillatura:** come la Consacrazione, ma per una Fenditura: la Fenditura diventa una Rovina già esplorata.

### 12.5 Mutazione

**Test di Mutazione** (solo unità del Caos): tira 1d6.

| d6 | Effetto |
| --- | --- |
| 1 | 1 danno |
| 2–3 | Nessun effetto |
| 4–5 | +1 F permanente |
| 6 | +1 F e +1 R massima permanenti (recupera anche 1 R) |

Ogni unità può ottenere al massimo +2 F in totale con le mutazioni; oltre questo limite i risultati 4–6 non hanno effetto. Si segna con un marker.

**Mutazione Forzata:** una volta per turno, nella Fase di Reclutamento, il Caos sceglie un'unità normale del Caos Base o Veterana e paga 2 Oro, oppure elimina un'unità normale Base amica nella stessa pila o adiacente. Poi tira 1d6:

| d6 | Effetto |
| --- | --- |
| 1 | Degenerazione: una Veterana torna Base; una Base subisce 1 danno |
| 2 | Nessun effetto |
| 3–4 | +2 PE |
| 5 | +3 PE |
| 6 | Avanza subito di un grado (se il limite della 13.4 lo impedisce: +3 PE) |

### 12.6 Instabilità

Le unità normali del Caos Veterane o Elite fanno un **Test di Instabilità** quando diventano Disgregate, quando subiscono gli effetti di una magia dell'Ordine e quando lo richiede un oggetto o una magia. Tira 1d6:

| d6 | Effetto |
| --- | --- |
| 1 | Perde un grado (Elite → Veterano → Base); i suoi PE tornano a 0; i danni subiti restano |
| 2–5 | Nessun effetto |
| 6 | +1 PE |

## 13. Avanzamento delle unità

Solo le unità normali guadagnano Punti Esperienza (PE). Ogni pedina ha i suoi PE, annotati su un foglio di fazione o con un marker. I PE non si trasferiscono.

### 13.1 Come si guadagnano i PE

| Evento | PE |
| --- | --- |
| Partecipa a un attacco in mischia (come attaccante o difensore) e sopravvive | 1 (una volta per Fase di Combattimento) |
| Per ogni unità nemica normale eliminata dall'attacco a cui partecipa, con costo Base pari o inferiore al proprio | +1 |
| Come sopra, ma con costo Base superiore al proprio | +2 |
| Per ogni Eroe, Boss o unità Elite nemica eliminata dall'attacco a cui partecipa | +3 |
| Difende un insediamento attaccato in mischia e vi resta | +1 |
| Comando dell'Ordine: unità dell'Ordine che guadagna PE in un attacco a cui partecipa (o che subisce) un Eroe o Boss dell'Ordine | +1 |
| Obiettivi di scenario | Come da scenario |

- "Partecipare" a un attacco a distanza dà solo i PE per le eliminazioni, non il PE di sopravvivenza.
- Le eliminazioni contano per tutte le unità che hanno partecipato all'attacco (o che lo hanno subito, se le eliminazioni sono avvenute tra gli attaccanti).
- I PE di entrambi i giocatori si annotano nel passo 7 della Fase di Combattimento del giocatore attivo.

### 13.2 Soglie e avanzamento

- Da Base a Veterano: **4 PE**. Da Veterano a Elite: **6 PE**.
- Al raggiungimento della soglia l'unità avanza subito e obbligatoriamente; i suoi PE tornano a 0 (gli eventuali PE in eccesso si perdono).
- L'unità riceve le modifiche del nuovo grado (2.2). Il +1 R aumenta sia la R massima sia quella attuale.
- Un'unità che non può diventare Elite (trattino nella scheda) smette di accumulare PE da Veterana. Un'unità Elite continua ad accumularli solo per l'Ascensione (13.5).

### 13.3 Addestramento (solo Ordine)

Nella Fase di Reclutamento, per ogni Castello o Tempio controllato dall'Ordine, un'unità Base o Veterana dell'Ordine che si trova in quell'esagono può ricevere +1 PE pagando 2 Oro.

### 13.4 Limite di Veterani

- Ogni fazione può avere al massimo un numero di unità normali Veterane + Elite pari al doppio degli insediamenti che controlla, con un minimo di 2.
- Un'unità che raggiunge la soglia quando il limite è pieno resta ferma alla soglia e non avanza. Avanza in una Manutenzione successiva, appena il limite lo permette (scegli tu l'ordine se più unità aspettano).
- Le unità già avanzate non perdono il grado se il limite scende.

### 13.5 Ascensione

Una volta per partita per fazione, nella Fase di Reclutamento, un'unità Elite con almeno 6 PE accumulati da Elite può tentare l'Ascensione: paga 10 Oro e tira 1d6 (+1 se nella sua pila c'è un Eroe o Boss amico).

- Con 4+ l'unità diventa un Eroe: mantiene caratteristiche e abilità, ha +1 R, Morale 5 e il Comando (5.2). Conta nel limite di 4 Eroi e Boss e non può essere il Comandante.
- Altrimenti i suoi PE tornano a 0.

## 14. Economia

### 14.1 Oro iniziale e rendita

Ogni giocatore parte con l'Oro indicato dallo scenario (10 se non è indicato). L'Oro non speso si conserva. Nella propria Manutenzione si riscuote:

| Fonte | Oro per turno |
| --- | --- |
| Città minore | 2 |
| Città maggiore | 4 |
| Castello minore | 3 |
| Castello maggiore | 5 |
| Capitale | 6 |
| Tempio dell'Ordine (solo Ordine) | +1 |
| Altare o Fenditura del Caos (solo Caos) | +1 |

- Un insediamento con marker **Saccheggiato** rende la metà.
- Ogni insediamento Corrotto controllato dall'Ordine rende 1 Oro in meno (minimo 0).

### 14.2 Mantenimento (regola opzionale per le campagne)

Nella Manutenzione si paga 1 Oro ogni 5 unità normali (arrotondato per difetto). Per ogni Oro che non si può pagare si elimina un'unità normale a scelta.

### 14.3 Reclutamento

Nella Fase di Reclutamento si possono reclutare unità della propria fazione al grado Base, pagando il costo Base in Oro. Le nuove unità si piazzano nell'esagono in cui sono reclutate, rispettando l'impilamento. Non si recluta in un esagono adiacente a unità nemiche.

| Luogo controllato | Unità reclutabili per turno |
| --- | --- |
| Città minore / Castello minore | 1 |
| Città maggiore / Castello maggiore | 2 |
| Capitale | 3 |
| Tempio dell'Ordine | 1 unità Sacra |
| Altare o Fenditura del Caos | 1 unità Demone o Mutante |

### 14.4 Reclutare Veterani

In un Castello maggiore o nella Capitale si può reclutare un'unità direttamente come Veterana, pagando il costo Veterano. Rispetta il limite della 13.4. Le unità Elite non si reclutano mai direttamente.

### 14.5 Costruire l'esercito iniziale

Lo scenario indica i punti esercito di ogni fazione. Si spendono con i costi delle schede (Base o Veterano), compresi Eroi e Boss. I punti non spesi si perdono.

### 14.6 Costruzioni

Nella Fase di Reclutamento, in un esagono controllato non adiacente a unità nemiche, si può fare una costruzione per esagono per turno:

| Costruzione | Costo | Requisito |
| --- | --- | --- |
| Mura su un lato di un insediamento | 5 Oro | — |
| Fortificare una Città: in combattimento conta come Castello minore (rendita e reclutamento restano da Città) | 10 Oro | — |
| Castello minore → Castello maggiore | 15 Oro | — |
| Riparare una breccia (16.2) | 5 Oro | — |
| Ponte su un lato di Fiume dell'esagono | 5 Oro | Un'unità con Assedio nell'esagono |
| Creare un oggetto Consumabile (tiro sulla tabella 15.3) | 3 Oro | Un Incantatore nell'esagono, in un insediamento |

Gli Ingegneri nanici (Genio) riducono il costo di 2 Oro nel loro esagono.

### 14.7 Saccheggio

Quando un giocatore prende il controllo di un insediamento che non controllava, può saccheggiarlo subito: tira sulla Tabella di Saccheggio (15.3). Poi l'insediamento riceve il marker **Saccheggiato**, che si toglie dopo 2 Manutenzioni del giocatore che lo controlla.

| Modificatore al tiro di saccheggio |  |
| --- | --- |
| Città maggiore, Castello maggiore o Capitale | +1 |
| Eroe o Boss amico nell'esagono | +1 |
| Esploratori nell'esagono | +1 |
| L'insediamento ha già il marker Saccheggiato | –2 |
| Caos: saccheggio violento (poi tira subito per corrompere l'insediamento, 12.3) | +1 |
| Ordine: requisizione ordinata (l'insediamento non riceve il marker Saccheggiato) | –1 |

### 14.8 Esplorazione delle Rovine

Nel passo 6 della Fase di Combattimento, un'unità non Disgregata in una Rovina non ancora esplorata, che in questo turno non ha attaccato né lanciato magie, può esplorarla: tira sulla Tabella delle Rovine (15.3), con +1 per gli Esploratori. La Rovina diventa esplorata e non si può più esplorare.

## 15. Oggetti magici e bottino

### 15.1 Regole generali

| Portatore | Permanenti | Consumabili |
| --- | --- | --- |
| Unità normale | 1 | 1 |
| Eroe | 2 | 2 |
| Boss | 3 | 2 |

- Un oggetto ottenuto va subito a un'unità indicata dalla regola che lo dà (chi saccheggia, chi esplora, un'unità che ha partecipato all'eliminazione). Se non c'è posto, si scarta l'oggetto nuovo o uno vecchio.
- Gli oggetti permanenti funzionano sempre, senza attivazione.
- Nella Manutenzione (7.1 A, passo 8) si possono scambiare oggetti tra unità amiche della stessa pila.
- Un Consumabile si usa una volta e si scarta. Si usa nel proprio turno, in qualsiasi momento tranne durante la risoluzione di un attacco. Pozione di Guarigione e Pergamena di Barriera si possono usare anche nel turno nemico, quando la pila del portatore viene dichiarata bersaglio.
- Quando un'unità normale è eliminata, i suoi oggetti si scartano. Gli oggetti di un Eroe o Boss eliminato vanno al giocatore che l'ha eliminato, che li assegna a un'unità partecipante (oppure li scarta).
- Degli oggetti normali esistono copie illimitate; gli Artefatti unici esistono in una sola copia.

### 15.2 Elenco degli oggetti

**Permanenti minori**

| Ordine | Effetto | Caos | Effetto |
| --- | --- | --- | --- |
| Spada della Legge | +1 F; Flagello +1 | Lama Mutante | +1 F; quando il suo attacco elimina un'unità, il portatore del Caos può fare un Test di Mutazione |
| Scudo del Giuramento | +1 D; una volta per turno ignora il primo risultato che lo renderebbe Disgregato | Elmo delle Corna Rotte | +1 F e +1 R massima; il portatore non può allontanarsi volontariamente da un esagono adiacente a nemici |
| Arco delle Radici Antiche (solo Tiratori) | +1 P; +1 F a distanza se il portatore è in Bosco o Collina | Arco d'Ossa Corrotte (solo Tiratori) | +1 F a distanza; se un tiro a cui partecipa infligge almeno 1 danno, l'esagono bersaglio diventa Corrotto |
| Amuleto di Chiarezza | +1 FM (anche a chi ha FM 0, che diventa Incantatore); immune a Terrore e ai Test di Morale da magie | Amuleto della Fenditura | +1 FM (come a sinistra); +1 ai Test di Mutazione |

**Talismano** (neutrale): +1 a F, D o V, scelto quando lo si ottiene.

**Permanenti maggiori**

| Ordine | Effetto | Caos | Effetto |
| --- | --- | --- | --- |
| Stendardo della Disciplina | Le unità amiche nella pila del portatore hanno +1 D e +1 Morale | Totem del Sangue | Le unità del Caos nella pila del portatore e adiacenti hanno +1 F; alla fine di ogni proprio turno il portatore, se Veterano o Elite, fa un Test di Instabilità |
| Elmo del Guardiano | +1 D; una volta per TG il portatore può prendere su di sé 1 danno assegnato a un'unità amica della pila o adiacente | Corazza di Scaglie Demoniache | +2 D, –1 V; chi lancia una magia dell'Ordine contro il portatore ha –1 alla Prova di Lancio |

**Consumabili**

| Oggetto | Effetto |
| --- | --- |
| Pozione di Guarigione | Il portatore recupera 3 R e perde uno stato tra Stanco, Disgregato o Corrotto |
| Pergamena di Barriera | Le unità amiche nella pila del portatore hanno +3 D fino al tuo prossimo turno |
| Runa di Purificazione | Un esagono entro 1 diventa Normale, oppure un'unità della pila non è più Corrotta |
| Fiala di Mutazione | Il portatore ha +3 F fino alla fine del TG; poi fa un Test di Mutazione (se del Caos) o di Corruzione (se dell'Ordine) |
| Polvere di Terrore | Le unità nemiche di un esagono adiacente fanno un Test di Morale |
| Elisir di Velocità | Per un movimento il portatore ha +3 V e ogni esagono gli costa 1 PM |
| Pergamena di Richiamo (Ordine) | Compare una Fanteria disciplinata Base adiacente al portatore, fino alla fine del tuo secondo turno successivo; non dà PE né bottino |
| Cuore di Demone Imprigionato (Caos) | Compare un Demone minore Base adiacente al portatore fino alla fine del tuo secondo turno successivo, oppure un'unità della pila ha +4 F fino alla fine del TG e poi fa un Test di Instabilità |

**Artefatti unici** (solo se lo scenario li prevede)

| Artefatto | Effetto |
| --- | --- |
| Lama del Giuramento Spezzato (Ordine) | +3 F; nei suoi attacchi in mischia il FT del difensore è ridotto di 2 (minimo 1); la Sigillatura (12.4) con il portatore presente richiede un solo turno |
| Scudo dell'Ultimo Baluardo (Ordine) | Le unità amiche nella pila del portatore hanno +2 D e non possono diventare Disgregate |
| Cuore della Fenditura (Caos) | +2 FM; una volta per turno corrompe senza tiro un esagono entro 1; in ogni propria Manutenzione tira 1d6: con 1–2 il portatore subisce 1 danno |
| Corona di Corna Mutanti (Caos) | Un portatore che è un'unità normale diventa un Eroe (come l'Ascensione, 13.5); fa un Test di Instabilità in ogni propria Manutenzione (se è Base, con 1 subisce 1 danno) |

### 15.3 Tabelle di bottino

Il tiro modificato si legge sempre tra 1 e 6. "Cons" = un tiro sulla tabella Consumabili; "Min" = un tiro sui Permanenti minori; "Mag" = un tiro sui Permanenti maggiori.

| d6 | Saccheggio di Città | Saccheggio di Castello o Capitale | Rovine | Eroe eliminato | Boss eliminato |
| --- | --- | --- | --- | --- | --- |
| 1 | 2 Oro | 4 Oro | Trappola: l'unità che esplora subisce 1 danno | 3 Oro | 8 Oro + Mag |
| 2 | 3 Oro | 5 Oro + Cons | 2 Oro + Cons | 3 Oro | 8 Oro + Mag |
| 3 | 4 Oro | 7 Oro + Min | 4 Oro + Min | 5 Oro + Min | 12 Oro + Mag |
| 4 | 5 Oro + Cons | 9 Oro + Min | 6 Oro + Min | 5 Oro + Min | 12 Oro + Mag |
| 5 | 6 Oro + Min | 11 Oro + Min + Cons | 8 Oro + Min + Cons | 7 Oro + Min + Cons | 16 Oro + Mag + Min |
| 6 | 8 Oro + Min + Cons | 14 Oro + Mag | 10 Oro + Mag | 9 Oro + Mag | 20 Oro + Mag + Mag (o l'Artefatto unico previsto dallo scenario) |

**Luoghi sacri:** la prima volta che l'Ordine prende un Tempio, o il Caos un Altare o una Fenditura, tira 1d6: 1–2 Cons; 3–4 Min; 5 Mag; 6 Pergamena di Richiamo (Ordine) o Cuore di Demone Imprigionato (Caos). Una volta per Luogo per fazione.

| d6 | Consumabili | Permanenti minori | Permanenti maggiori |
| --- | --- | --- | --- |
| 1 | Pozione di Guarigione | Spada della Legge / Lama Mutante | Stendardo della Disciplina / Totem del Sangue |
| 2 | Pergamena di Barriera | Scudo del Giuramento / Elmo delle Corna Rotte | Stendardo della Disciplina / Totem del Sangue |
| 3 | Runa di Purificazione | Arco delle Radici Antiche / Arco d'Ossa Corrotte | Elmo del Guardiano / Corazza di Scaglie Demoniache |
| 4 | Fiala di Mutazione | Amuleto di Chiarezza / Amuleto della Fenditura | Elmo del Guardiano / Corazza di Scaglie Demoniache |
| 5 | Polvere di Terrore | Talismano | Due tiri sui Permanenti minori |
| 6 | Elisir di Velocità | Tira sui Permanenti maggiori | Due tiri sui Permanenti minori |

Si riceve sempre la versione della propria fazione. Se l'oggetto non può essere usato da nessuna unità adatta (es. un arco senza Tiratori), si può ritirare una volta.

### 15.4 Oro e oggetti da Eroi e Boss

Il tiro sulla tabella "Eroe eliminato" o "Boss eliminato" lo fa il giocatore che ha eliminato l'Eroe o il Boss (con un attacco, una magia o un effetto suo).

### 15.5 Oggetti della fazione avversaria

- Un'unità dell'Ordine che porta un oggetto del Caos fa un Test di Corruzione in ogni propria Manutenzione.
- Per un'unità del Caos che porta un oggetto dell'Ordine si tira 1d6 in ogni propria Manutenzione: con 1 l'oggetto si spezza e si scarta.
- I Talismani sono neutrali.

## 16. Assedi

Un Castello, una Capitale o una Città fortificata (14.6) si attaccano con le normali regole di combattimento. Le loro difese sono gli spostamenti della 6.1 (Città fortificata come Castello minore), più eventuali Mura sui lati (6.3).

### 16.1 Unità da Assedio

Un attacco in mischia contro un esagono fortificato che include almeno un'unità con la parola chiave Assedio ha +1 colonna (una sola volta per attacco).

### 16.2 Brecce

- Nel passo 6 della Fase di Combattimento, un'unità con Assedio adiacente a un esagono fortificato nemico, che in questo turno non ha attaccato né lanciato magie, può tirare 1d6: con 4+ si piazza un marker Breccia su quell'esagono.
- Ogni Breccia riduce di 1 lo spostamento di terreno dell'esagono (Castello minore da –2 a –1; Castello maggiore o Capitale da –3 a –2, poi a –1). Lo spostamento non scende sotto –1 e un esagono ha al massimo 2 Brecce.
- Chi controlla l'esagono può riparare una Breccia (14.6).
- Le Brecce restano anche se l'esagono cambia proprietario.

### 16.3 Assedio prolungato

- Un esagono fortificato è **Assediato** se ognuno dei 6 esagoni adiacenti contiene unità nemiche oppure è in ZdC nemica senza unità amiche.
- Un insediamento Assediato non dà Oro e non permette di reclutare.
- Se all'inizio della Manutenzione del proprietario è Assediato da 3 o più turni consecutivi, tutte le unità al suo interno diventano Stanche (in quella Manutenzione non si riprendono dalla stanchezza).
- Le sortite sono normali attacchi delle unità assediate.

## 17. Controllo del territorio e vittoria

### 17.1 Controllo

- Ogni insediamento e Luogo è controllato da una fazione oppure è neutrale, come indica lo scenario all'inizio. Si segna con un marker di controllo.
- Un giocatore prende il controllo di un esagono quando una sua unità vi **termina** un movimento, una ritirata o un'avanzata. Passarci attraverso o sorvolarlo non basta.
- Il controllo resta anche quando l'esagono è vuoto, finché non lo prende l'avversario.

### 17.2 Punti Vittoria (PV)

I PV si calcolano a ogni controllo (7.3) come somma di:

- **PV di territorio**, ricalcolati ogni volta in base a cosa si controlla in quel momento:

| Esagono controllato | PV |
| --- | --- |
| Città minore | 1 |
| Città maggiore | 2 |
| Castello minore | 2 |
| Castello maggiore | 3 |
| Capitale | 4 |
| Tempio, Altare o Fenditura (solo se lo scenario lo dice) | Come da scenario |

- **PV di eliminazione**, che si accumulano e non si perdono: 2 PV per ogni Eroe nemico eliminato, 5 PV per ogni Boss nemico eliminato, 5 PV per il Comandante nemico (al posto dei 2 o 5).
- **PV di scenario**, se lo scenario li prevede.

### 17.3 Modalità di vittoria

Ogni scenario indica quali modalità usa. Tutte si controllano solo nella Fase di Fine Turno (7.3).

| Modalità | Condizione |
| --- | --- |
| Dominio | Controllare almeno il numero di insediamenti indicato |
| Soglia di PV | Avere almeno i PV indicati |
| Limite di turni | Alla fine dell'ultimo TG vince chi ha più PV |
| Decapitazione | Il Comandante nemico è stato eliminato (se lo scenario non la usa, valgono solo i PV di eliminazione) |
| Obiettivo | Condizione specifica dello scenario |

"Per N turni consecutivi" significa: la condizione è vera in N Fasi di Fine Turno consecutive.

### 17.4 Vittoria simultanea e spareggi

Se entrambi i giocatori soddisfano una condizione di vittoria nello stesso controllo, oppure sono pari alla fine del limite di turni, si confrontano in quest'ordine:

1. più PV;
2. più Castelli e Capitali controllati;
3. più Eroi e Boss nemici eliminati;
4. più unità Elite in gioco;
5. più Oro.

Se la parità resta, la partita è pari.

### 17.5 Sconfitta immediata

Nella Fase di Fine Turno un giocatore perde se:

- non ha più unità sulla mappa; oppure
- non controlla alcun insediamento **e** ne aveva controllato almeno uno in un momento precedente della partita (all'inizio o a un controllo precedente).

Una fazione che inizia senza insediamenti non perde per la seconda condizione finché non ne ha preso almeno uno. Se entrambi perdono nello stesso momento, la partita è pari.

## 18. Scenari principali

Le armate sono già calcolate con i costi delle Sez. 3–5 (tutte le unità al grado Base). Dove lo scenario non dice altro valgono tutte le regole del regolamento.

### 18.1 La Difesa del Passo di Pietraluce

**Durata:** 12 TG · **Primo giocatore:** Caos · **Oro iniziale:** Ordine 10, Caos 15 · **Comandanti:** Kael e Gorath

**Mappa:** un passo montano al centro. Sul passo il Castello maggiore di Pietraluce; nella metà dell'Ordine 2 Città minori; nella metà del Caos 1 Città minore neutrale e 1 Fenditura del Caos.

**Controllo iniziale:** Ordine: Pietraluce e le sue 2 Città. Caos: la Fenditura. Neutrale: la Città della metà del Caos.

**Schieramento:** l'Ordine per primo, entro 4 esagoni da Pietraluce nella sua metà; poi il Caos, entro 3 esagoni dal bordo della propria metà.

| Fazione | Armata (110 punti) |
| --- | --- |
| Ordine | Kael; 1 Sacerdoti; 2 Cavalieri; 4 Fanteria disciplinata; 3 Lancieri; 2 Arcieri; 1 Picchieri; 1 Balestrieri; 1 Arcieri lunghi; 2 Guardie cittadine; 1 Ingegneri nanici; 2 Scudieri; 1 Esploratori |
| Caos | Gorath; 1 Stregoni del Caos; 1 Sciamani; 5 Orchi guerrieri; 2 Orchi berseker; 4 Goblin; 2 Goblin arcieri; 1 Goblin genieri; 1 Troll; 1 Ogre; 2 Lupi giganti; 1 Guerrieri del Caos |

**Vittoria:**

- **Caos:** controlla Pietraluce per 2 turni consecutivi.
- **Ordine:** controlla Pietraluce alla fine del TG 12.
- **Entrambi:** il Comandante nemico è stato eliminato e si controllano almeno 3 insediamenti.
- Se nessuno ha vinto alla fine del TG 12, vince chi ha più PV (17.2).

### 18.2 La Corruzione di Vallearida

**Durata:** 16 TG · **Primo giocatore:** Caos · **Oro iniziale:** 10 ciascuno · **Comandanti:** Kael e Veyla

**Mappa:** una valle con 5 Città minori, 1 Tempio dell'Ordine e 2 Fenditure del Caos.

**Controllo iniziale:** Ordine: il Tempio e 3 Città. Caos: 1 Fenditura. Neutrali: 2 Città e l'altra Fenditura.

**Schieramento:** l'Ordine per primo, entro 3 esagoni dai propri insediamenti; poi il Caos, entro 2 esagoni da un bordo scelto dall'Ordine.

| Fazione | Armata (150 punti) |
| --- | --- |
| Ordine | Kael; Theron; 1 Sacerdoti; 1 Inquisitori; 1 Maghi dell'Ordine; 1 Paladini; 3 Cavalieri; 4 Fanteria disciplinata; 3 Lancieri; 3 Arcieri; 1 Picchieri; 2 Guardie cittadine |
| Caos | Veyla; Korgash; 2 Stregoni del Caos; 1 Sciamani; 5 Orchi guerrieri; 2 Orchi berseker; 5 Goblin; 2 Goblin arcieri; 1 Troll; 2 Mutanti; 2 Guerrieri del Caos; 1 Demoni minori; 1 Lupi giganti |

**PV di scenario** (in aggiunta alla 17.2): Tempio controllato dall'Ordine 3 PV; Altare (Tempio profanato) controllato dal Caos 4 PV; ogni Fenditura controllata dal Caos 1 PV; ogni Città Corrotta controllata dal Caos +1 PV.

**Vittoria:**

- **Soglia:** 15 PV.
- **Caos:** controlla l'Altare nato dalla profanazione del Tempio per 2 turni consecutivi.
- **Ordine:** tutti gli Eroi del Caos sono stati eliminati e sulla mappa non c'è nessuna Città Corrotta.
- Alla fine del TG 16 vince chi ha più PV.

### 18.3 L'Assedio della Capitale di Luminara

**Durata:** 20 TG · **Primo giocatore:** Caos · **Oro iniziale:** Ordine 15, Caos 10 · **Comandanti:** Kael e Gorath

**Mappa:** grande. La Capitale Luminara, 2 Castelli minori e 2 Città minori nella metà dell'Ordine; nella metà del Caos 2 Città minori, 1 Altare del Caos e 1 Fenditura del Caos.

**Controllo iniziale:** Ordine: Luminara, i 2 Castelli e le sue 2 Città. Caos: le sue 2 Città (Corrotte), l'Altare e la Fenditura. Prima dello schieramento il Caos rende Corrotti 6 esagoni a scelta nella propria metà.

**Schieramento:** l'Ordine per primo, entro 3 esagoni dai propri insediamenti; poi il Caos, nella propria metà ad almeno 6 esagoni da Luminara.

| Fazione | Armata (200 punti) |
| --- | --- |
| Ordine | Kael; Seris; Theron; 1 Sacerdoti; 1 Maghi dell'Ordine; 1 Paladini; 2 Cavalieri; 1 Cavalieri pesanti; 4 Fanteria disciplinata; 2 Lancieri; 2 Picchieri; 2 Arcieri lunghi; 2 Balestrieri; 3 Guardie cittadine; 1 Golem controllati; 1 Guerrieri nanici |
| Caos | Gorath; Zhara; Korgash; 2 Stregoni del Caos; 6 Orchi guerrieri; 3 Orchi berseker; 2 Goblin; 3 Goblin arcieri; 2 Goblin genieri; 2 Troll; 1 Draghi giovani; 2 Guerrieri del Caos; 1 Cavalieri del Caos; 1 Demoni minori |

**Rinforzi:** all'inizio della propria Fase di Reclutamento nei TG 4, 8, 12 e 16, l'Ordine riceve 25 punti di unità Base gratuite (in Luminara o in un Castello controllato) e il Caos 30 punti (nella Fenditura o nell'Altare, se controllati, altrimenti sul proprio bordo). Si rispettano i limiti di impilamento; i punti che non si possono piazzare si perdono.

**Rituale Finale:** nella propria Fase Finale, se il Caos controlla almeno 3 tra Altari e Fenditure e ha un Incantatore entro 3 esagoni da Luminara, può pagare 15 Oro e tirare 1d6: con 5+ (+1 per ogni Altare o Fenditura oltre il terzo) il Rituale riesce. Se fallisce, ogni Incantatore del Caos entro 3 esagoni da Luminara subisce 1 danno. Al massimo un tentativo per turno.

**Vittoria:**

- **Caos:** controlla Luminara per 2 turni consecutivi, oppure il Rituale Finale è riuscito.
- **Ordine:** tutti gli Eroi del Caos sono stati eliminati e l'Ordine controlla almeno il 70% degli insediamenti della mappa (arrotondato per eccesso).
- Alla fine del TG 20: se l'Ordine controlla Luminara e ha più PV, vince l'Ordine; in ogni altro caso vince chi ha più PV (17.4 per le parità).

## 19. Scenari brevi

In questi scenari ogni giocatore costruisce la propria armata con i punti indicati (14.5), al grado Base, rispettando questi vincoli comuni:

- almeno 1 Eroe, che è il Comandante; nessun Boss, salvo dove indicato;
- al massimo 3 unità uguali di costo Base 9 o più;
- Oro iniziale 10; primo giocatore indicato in tabella;
- schieramento: il primo giocatore schiera per secondo, ciascuno entro 3 esagoni dal proprio bordo o dai propri insediamenti.

| # | Scenario | TG | Punti (Ordine / Caos) | Primo | Mappa e controllo iniziale | Vittoria |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Scontro al Guado di Pietranera | 8 | 90 / 90 | Caos | Un fiume al centro con un Guado; l'esagono di Pianura su ogni sponda del Guado è un Luogo "Testa di guado"; 2 Città minori neutrali, una per sponda | Alla fine del TG 8 vince chi controlla entrambe le Teste di guado e almeno 1 Città; Decapitazione in qualsiasi momento; altrimenti PV |
| 2 | La Notte dei Lupi | 10 | 100 / 110 | Caos | 3 Città minori dell'Ordine al centro; per tutta la partita le Bestie del Caos hanno +1 V | Alla fine del TG 10 l'Ordine vince se controlla almeno 2 delle 3 Città; altrimenti vince il Caos |
| 3 | La Reliquia Perduta | 12 | 110 / 110 | Ordine | 3 Rovine al centro; 1 Castello minore per fazione sul proprio bordo | Vedi nota A |
| 4 | Blocco del Passo del Drago | 12 | 100 / 130 | Caos | Un passo montano largo 3 esagoni; il Caos entra dal bordo opposto a quello dell'Ordine | Vedi nota B |
| 5 | La Città Divisa | 13 | 120 / 120 | Ordine | 7 Città minori adiacenti tra loro (i "quartieri"); ognuno ne controlla 3, quella centrale è neutrale; massimo 2 unità Cavalleria per armata | Alla fine del TG 13 vince chi controlla più quartieri; in parità, 17.4 |
| 6 | Fuoco sulla Frontiera | 14 | 130 / 130 | Ordine | 6 Castelli minori in linea al centro, 3 per fazione; almeno 2 Eroi per armata | Limite di turni: alla fine del TG 14 vince chi ha più PV |
| 7 | Il Risveglio dell'Antico | 15 | 140 / 140 | Caos | Una Rovina al centro con il Colosso dormiente (nota C); 2 Città minori per fazione | Alla fine del TG 15 vince chi controlla il Colosso; se nessuno lo controlla, PV |
| 8 | Operazione Purificazione | 16 | 130 / 140 | Ordine | 8 "luoghi chiave" segnati: 3 Città minori e 2 Altari del Caos controllati dal Caos e Corrotti, più 3 esagoni di Pianura Corrotti; 2 Città minori dell'Ordine | Alla fine del TG 16: l'Ordine vince se almeno 5 luoghi chiave non sono Corrotti; il Caos vince se almeno 4 sono Corrotti e controlla almeno 3 Città; altrimenti PV |
| 9 | La Battaglia delle Quattro Torri | 17 | 150 / 150 | Ordine | 4 Castelli minori ("torri") neutrali al centro; 2 Città minori per fazione; ammesso 1 Boss | Controllare 3 torri, oppure 2 torri con il Comandante nemico eliminato; alla fine del TG 17, PV |
| 10 | Guerra di Logoramento | 20 | 160 / 160 | Ordine | Mappa grande; per fazione 1 Capitale, 2 Castelli minori e 3 Città minori; ammesso 1 Boss; si usa il Mantenimento (14.2) | Soglia di 20 PV; alla fine del TG 20, PV. Rinforzi: 35 punti di unità Base gratuite all'inizio della Fase di Reclutamento nei TG 4, 8, 12 e 16, in un proprio insediamento |

**Nota A – La Reliquia Perduta.** Quando un'unità esplora una delle 3 Rovine centrali tira 1d6: con 5–6 trova la Reliquia (la terza Rovina esplorata la contiene sempre, se non è già stata trovata). La Reliquia non occupa spazio oggetti. Se il portatore è eliminato, la Reliquia resta nel suo esagono; la prende la prima unità che vi termina un movimento, una ritirata o un'avanzata. Vince chi ha la Reliquia nel proprio Castello per 2 turni consecutivi. Alla fine del TG 12 senza vincitore, PV.

**Nota B – Blocco del Passo.** Un'unità del Caos che si trova in un esagono del bordo dell'Ordine può uscire dalla mappa spendendo 1 PM: è "passata" e non rientra. Il Caos vince se alla fine del TG 12 sono passate almeno 6 unità (Eroi e unità Grandi contano 2); altrimenti vince l'Ordine.

**Nota C – Il Colosso.** Colosso dormiente: V 2, F 8, D 6, P 0, R 6, FM 0, Grande, Immune al Morale. Finché dorme non può essere attaccato, non esercita ZdC e blocca il suo esagono. Nel passo 6 della Fase di Combattimento un Eroe adiacente può tentare di risvegliarlo: 1d6, con 5+ il Colosso passa sotto il controllo di quel giocatore come un Boss (non è il Comandante). Un Colosso controllato e poi eliminato non torna in gioco: in quel caso a fine partita si usano i PV.

## 20. Scenari cooperativi e asimmetrici

### 20.1 Regole cooperative

- Da 2 a 4 giocatori controllano insieme l'Ordine: è una sola fazione con un solo turno. Ogni giocatore muove e combatte con le proprie unità; Oro e oggetti sono in comune. Se non c'è accordo decide il Comandante Supremo, un ruolo che passa al giocatore successivo ogni 3 TG.
- Il Caos gioca sempre per secondo ed è gestito dal **Caos automatico** (20.2). Non riceve Oro e non recluta, salvo con la Generazione.
- "Fuori comando" si misura da qualsiasi Eroe dell'Ordine.

### 20.2 Caos automatico

Nel turno del Caos i giocatori eseguono queste regole, nell'ordine indicato.

1. **Generazione** (al posto della Fase di Reclutamento): ogni Fenditura controllata dal Caos genera le unità della tabella, nell'esagono della Fenditura e poi negli esagoni adiacenti liberi più vicini.

| TG | Unità generate per Fenditura |
| --- | --- |
| 1–4 | 1 Goblin + 1 Orchi guerrieri |
| 5–8 | 2 Orchi guerrieri + 1 Orchi berseker |
| 9–12 | 1 Troll + 2 Orchi guerrieri |
| 13 o più | 1 Guerrieri del Caos + 1 Troll + 1 Demoni minori |

2. **Movimento:** si muovono prima le pile più vicine a unità dell'Ordine. Un'unità già adiacente a unità dell'Ordine non si muove. Le altre si muovono, per la via che costa meno PM, verso il bersaglio più vicino in questo ordine di priorità: l'insediamento non controllato dal Caos più vicino; l'Eroe dell'Ordine più vicino. In caso di parità scelgono i giocatori. Non usano la Marcia Forzata.
3. **Magie:** ogni Incantatore lancia la magia di danno più costosa che può permettersi, contro l'esagono a portata con più unità dell'Ordine; se non ce ne sono, Sussurro della Fenditura contro l'unità dell'Ordine più vicina.
4. **Attacchi:** tutte le unità del Caos adiacenti a uno stesso esagono dell'Ordine lo attaccano insieme. Un'unità adiacente a più esagoni attacca quello con il FT del difensore più basso. I Tiratori sparano all'esagono a portata con il FT del difensore più basso. Le unità con Furia entrano sempre In Furia.
5. **Scelte del Caos:** i danni vanno prima alle unità di costo Base più basso; le ritirate vanno verso la Fenditura più vicina; le avanzate si fanno sempre.

### 20.3 L'Ombra sulla Contea dei Tre Fiumi (cooperativo)

**Giocatori:** 2–3 · **Durata:** 14 TG · **Armate:** 65 punti per giocatore, ciascuna con 1 Eroe · **Mappa:** 5 Città minori dell'Ordine e 3 Fenditure del Caos attive (all'inizio ciascuna con le unità della fascia TG 1–4).

- **Vittoria:** alla fine del TG 14 almeno 2 Fenditure sono state Sigillate (12.4) e l'Ordine controlla almeno 3 Città.
- **Sconfitta:** in una Fase di Fine Turno l'Ordine non controlla nessuna Città, oppure non ha più Eroi; oppure alla fine del TG 14 la vittoria non è raggiunta.
- Una Città presa dal Caos genera ogni turno 1 Goblin, come una Fenditura minore.

### 20.4 L'Assedio della Torre del Faro (cooperativo)

**Giocatori:** 2–4 · **Durata:** 16 TG · **Armate:** 150 punti in totale, divisi tra i giocatori · **Mappa:** la Torre del Faro è un Castello maggiore con Mura su tutti e 6 i lati; intorno, entro 5 esagoni, 2 Città minori dell'Ordine.

- **Caos:** 200 punti schierati a 4–6 esagoni dalla Torre, con il Signore del Caos (Boss) come Comandante e almeno 2 Goblin genieri. Non ci sono Fenditure: al loro posto, a ogni turno del Caos compaiono sul bordo più lontano dalla Torre 2 Orchi guerrieri (TG 1–5), poi 2 Orchi guerrieri e 1 Goblin genieri (TG 6–10), poi 1 Troll e 2 Orchi guerrieri (TG 11 o più). Il Caos automatico si muove sempre verso la Torre.
- **Rinforzi dell'Ordine:** 25 punti di unità Base sul bordo opposto nei TG 8 e 12.
- **Vittoria:** l'Ordine controlla la Torre alla fine del TG 16; oppure, entro la fine del TG 14, il Signore del Caos è stato eliminato insieme ad almeno metà delle unità del Caos schierate all'inizio.
- **Sconfitta:** il Caos controlla la Torre in una Fase di Fine Turno.

### 20.5 La Corsa contro la Frattura (cooperativo)

**Giocatori:** 2–4 · **Durata:** 18 TG · **Armate:** 60 punti per giocatore, ciascuna con 1 Eroe · **Mappa:** grande; 1 Fenditura primaria al centro (genera il doppio delle unità della tabella), 4 Rovine sparse, 1 Tempio dell'Ordine (il "luogo di potere") e 3 Città minori dell'Ordine.

- Ogni Rovina contiene un Sigillo: chi la esplora trova il Sigillo al posto del tiro normale. Un'unità qualsiasi porta i Sigilli senza usare spazi oggetto. Se il portatore è eliminato i Sigilli restano nell'esagono, e li prende la prima unità dell'Ordine che vi termina un movimento. Il Caos automatico li ignora.
- **Vittoria:** almeno 3 Sigilli si trovano nell'esagono del Tempio, con almeno un'unità dell'Ordine, per 2 turni consecutivi, entro la fine del TG 18.
- **Sconfitta:** qualsiasi altro esito alla fine del TG 18, oppure tutti gli Eroi dell'Ordine eliminati.

### 20.6 La Caccia al Portatore (asimmetrico)

**Durata:** 14 TG · **Primo giocatore:** Ordine · **Armate:** Ordine 75 punti, Caos 140 punti senza Boss.

- L'Ordine sceglie un Eroe come Portatore, che porta la Lama del Giuramento Spezzato. Il Portatore ha anche +1 D ed è immune al Terrore. L'Ordine schiera entro 2 esagoni da un angolo della mappa; il luogo sacro è un Tempio dell'Ordine nell'angolo opposto.
- Il Caos schiera metà dei punti entro 2 esagoni da due bordi a sua scelta (non quelli che toccano l'angolo dell'Ordine); l'altra metà entra nel TG 3 da qualsiasi bordo, come se fosse movimento dal bordo.
- Se il Portatore è eliminato la Lama resta nel suo esagono; la prende la prima unità (di qualsiasi fazione) che vi termina un movimento, una ritirata o un'avanzata.
- **Vittoria dell'Ordine:** un Eroe dell'Ordine con la Lama termina un movimento nel Tempio entro la fine del TG 14.
- **Vittoria del Caos:** un'unità del Caos porta la Lama per 2 turni consecutivi; oppure l'Ordine non ha vinto alla fine del TG 14.

### 20.7 Il Contagio (asimmetrico)

**Durata:** 16 TG · **Primo giocatore:** Caos · **Armate:** Ordine 140 punti (almeno 3 unità Sacre), Caos 85 punti (almeno 3 Incantatori).

- **Mappa:** 10 "esagoni chiave" segnati: il Tempio dell'Ordine, 5 Città minori e 4 esagoni di Pianura scelti dall'Ordine prima dello schieramento. L'Ordine controlla il Tempio e le Città. Il Caos controlla 1 Fenditura e rende Corrotti 3 esagoni non chiave.
- **Diffusione:** nella Fase Finale del Caos, ogni esagono Corrotto sceglie un esagono adiacente non Corrotto e tira 1d6: con 5+ (+1 se c'è un Incantatore del Caos adiacente a quell'esagono) lo corrompe.
- **Vittoria del Caos:** in una Fase di Fine Turno almeno 6 esagoni chiave sono Corrotti, oppure il Tempio è Corrotto.
- **Vittoria dell'Ordine:** tutti gli Incantatori del Caos sono eliminati e la Fenditura è Sigillata; oppure, alla fine del TG 16, sulla mappa ci sono meno di 4 esagoni Corrotti e l'Ordine controlla tutte le 5 Città.
- Altrimenti, alla fine del TG 16, PV.

### 20.8 L'Ultima Roccaforte (asimmetrico)

**Durata:** 18 TG · **Primo giocatore:** Caos · **Armate:** Ordine 100 punti (si possono comprare unità Veterane al costo Veterano), Caos 200 punti con 1 Boss e almeno 2 Goblin genieri.

- **Mappa:** la fortezza è un Castello maggiore con Mura su tutti i lati e 2 Castelli minori adiacenti (i bastioni): sono i 3 "esagoni chiave", tutti dell'Ordine. Il Caos schiera a 3–5 esagoni dalla fortezza.
- **Scorte:** dal TG 10, nella Manutenzione dell'Ordine, le unità negli esagoni chiave non si riprendono dalla stanchezza e ogni pila tira 1d6: con 1 subisce 1 danno.
- **Morale degli assedianti:** quando il Caos ha perso unità per almeno metà dei punti iniziali, tutte le sue unità hanno –1 Morale.
- **Rinforzi:** nel TG 12 l'Ordine riceve 40 punti di unità Base sul bordo della mappa scelto dall'Ordine.
- **Vittoria del Caos:** controlla tutti e 3 gli esagoni chiave in una Fase di Fine Turno entro la fine del TG 18.
- **Vittoria dell'Ordine:** il Boss del Caos è eliminato e il Caos ha perso unità per almeno il 60% dei punti iniziali; oppure, alla fine del TG 18, il Caos non ha vinto.

## Appendice: correzioni applicate

Riferimento ai problemi del documento di analisi e alla soluzione adottata in questo regolamento.

| Problema | Soluzione | Sezione |
| --- | --- | --- |
| Il documento conteneva parti di conversazione e più versioni della stessa regola | Una sola versione per regola; numerazione da 1 a 20 senza duplicati | Tutto |
| La Difesa non entrava in nessun calcolo | FT del difensore = somma delle D; D alta riduce il tiro a distanza | 9.3, 9.9 |
| Risultati di mischia senza numeri | Ogni risultato è espresso in danni e caselle di ritirata | 9.6 |
| Nessuna assegnazione delle perdite | Il proprietario assegna i danni; regole per Eroi e Disgregazioni ripetute | 9.7, 5.2 |
| Morale impossibile per Eroi e Boss | Test riuscito con d6 ≤ valore; valori 3–6; 6 naturale fallisce | 10.2 |
| Modificatori al FT con tabella a rapporto | Tutti i modificatori sono spostamenti di colonna (massimo ±3); arrotondamento a favore del difensore; FT difensore minimo 1 | 9.4 |
| Superiorità numerica e terreno contati due o tre volte | Il rapporto già misura i numeri; il terreno conta una volta sola, sull'esagono attaccato | 9.4, 6.1 |
| Metodo "a somma diretta" senza tabella | Eliminato: c'è un solo metodo | 9.5 |
| Unità lente bloccate dal terreno | Movimento minimo di 1 esagono | 8.1 |
| Il Caos perdeva al primo turno dello Scenario 1 | La sconfitta per perdita degli insediamenti vale solo per chi ne aveva già controllato uno; il Caos ha anche una Città neutrale da prendere | 17.5, 18.1 |
| Combattimento adiacente o nello stesso esagono | Vietato entrare negli esagoni nemici; si combatte solo tra adiacenti, un round, facoltativo | 8.1, 9.1 |
| Magia: FM, costi, tabelle e momenti incoerenti | Riserva di FM che si ricarica; costi 2–6; una Prova di Lancio unica con esiti fissi; lancio nella Fase di Combattimento | Sez. 11 |
| Tre sequenze del turno diverse | Una sola sequenza, ordine di gioco fisso, vittoria controllata solo a fine TG | Sez. 7 |
| Zone di Controllo ambigue | Entrata +1, uscita +1, nessun obbligo di fermarsi | 8.3 |
| Volo con stati "in volo" e "a terra" | Si vola solo durante il movimento e si atterra sempre | 8.7 |
| Categorie di unità non definite | Parole chiave in ogni scheda | 2.3, Sez. 3–4 |
| Tiri e stati mai definiti | Test di Corruzione, Mutazione, Instabilità; tabella degli stati | 10.4, Sez. 12 |
| Tre tabelle dei costi in conflitto | Una sola tabella (la riveduta), con i costi mancanti aggiunti | Sez. 3–5 |
| Oggetti con lo stesso nome ed effetti diversi | Un solo elenco; la magia "Scudo del Giuramento" rinominata Scudo di Fede | 15.2, 11.6 |
| Bottino: tiri doppi e tabelle mancanti | Un solo tiro per fonte con Oro e oggetti; tabelle minori e maggiori complete | 15.3 |
| Reclutamento, costruzioni, saccheggio, assedi, corruzione assenti | Regole complete | Sez. 12, 14, 16 |
| Controllo e PV ambigui | Controllo persistente; PV di territorio ricalcolati e PV di eliminazione accumulati | 17.1, 17.2 |
| Punti delle armate non corrispondenti | Armate ricalcolate: 110/110, 150/150, 200/200; scenari brevi a punti liberi | Sez. 18–19 |
| Caos automatico e tabelle di rinforzo mancanti | Regole di comportamento e tabelle di generazione | 20.2 |
| Movimento nascosto, notte e "indizi" senza regole | Eliminati; lo scenario della Notte usa un bonus di Velocità | 19, 20.6 |

fd

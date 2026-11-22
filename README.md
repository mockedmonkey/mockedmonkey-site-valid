# Mocked Monkey - sito web (copia VALID)

Copia di lavoro per le modifiche importanti. Non è il sito pubblico: le pagine hanno `noindex` e non c'è il file `CNAME`.

## Struttura
- Italiano alla radice: `/`, `/live`, `/musica`, `/listening-is-loving`, `/booking-press`
- Inglese sotto `/en/`: `/en/`, `/en/live`, `/en/music`, `/en/listening-is-loving`, `/en/booking-press`
- Le vecchie pagine (about, shows, video, epk, press, contact, marasma) sono solo redirect verso le nuove.

## Come si modifica
- Le pagine HTML sono generate da `tools/build.js` (un solo file con tutti i testi IT/EN). Dopo ogni modifica: `node tools/build.js`.
- Calendario e storico dei palchi: `assets/data/events.json`. Una data passata esce dal calendario ed entra nello storico da sola.
- Stile: `css/style.css`. Comportamenti: `js/main.js`.

## Quando si porta sul sito vero
Nel file `tools/build.js` mettere `VALID_COPY = false` (attiva canonical, hreflang, sitemap e indicizzazione), rigenerare, poi aggiungere il `CNAME`.

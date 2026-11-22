#!/usr/bin/env node
// Generates the static pages (IT at the root, EN under /en/) from one content file.
// Run from the repo root:  node tools/build.js
// The output is plain HTML that is committed; there is no build step on GitHub Pages.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Flip to false when this work is ported to the live site (adds canonical, hreflang, indexing).
const VALID_COPY = true;
const BASE = 'https://mockedmonkey.com';

const L = {
  ig: 'https://www.instagram.com/mocked.monkey/',
  yt: 'https://www.youtube.com/@mockedmonkey',
  spArtist: 'https://open.spotify.com/artist/09dAeA3OPza0biB1lYnrai',
  spAlbum: 'https://open.spotify.com/intl-it/album/64OBRcdP6uWOfBTz26ZoRU',
  spTrack: 'https://open.spotify.com/intl-it/track/1w4fqFBlbKwiT34uVFwJ0S',
  game: 'https://mockedmonkey.itch.io/immovable-game',
  bandcamp: 'https://mockedmonkey.bandcamp.com/album/marasma',
  apple: 'https://music.apple.com/it/artist/mocked-monkey/1809920795',
  amazon: 'https://music.amazon.it/albums/B0GG7VDLK9',
  deezer: 'https://www.deezer.com/it/album/895351632',
  qobuz: 'https://www.qobuz.com/us-en/album/marasma-mocked-monkey/pdea76aivwxtj',
  rockit: 'https://www.rockit.it/recensione/72748/mocked-monkey-marasma',
  debaser: 'https://www.debaser.it/mocked-monkey/marasma/recensione',
  epk: 'https://drive.google.com/file/d/1LFBLlU2d_HuoLvXdtn8orJiCqk-r1r_D/view?usp=share_link',
  email: 'mockedmonkey@proton.me',
  tel: '+393926205914',
  telShow: '+39 392 620 5914'
};

const SLUG = {
  home:      { it: '',                    en: '' },
  live:      { it: 'live',                en: 'live' },
  music:     { it: 'musica',              en: 'music' },
  listening: { it: 'listening-is-loving', en: 'listening-is-loving' },
  booking:   { it: 'booking-press',       en: 'booking-press' }
};
const ORDER = ['live', 'music', 'listening', 'booking'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function build(lang, page) {
  const T = (it, en) => (lang === 'it' ? it : en);
  const other = lang === 'it' ? 'en' : 'it';
  const up = lang === 'it' ? '' : '../';            // path back to the site root
  const href = key => (key === 'home' ? './' : SLUG[key][lang]);
  const hrefTo = (key, hash) => href(key) + (hash || '');
  const switchHref = key => (lang === 'it'
    ? 'en/' + SLUG[key].en
    : (key === 'home' ? '../' : '../' + SLUG[key].it));

  const zig = (color, n) => {
    const pts = '0,18 40,4 80,32 120,6 160,30 200,8 240,28 280,10 320,26 360,12 400,24 440,14 480,22 520,16 560,20 600,18 640,22 680,14 720,26 760,10 800,28 840,8 880,30 920,6 960,32 1000,4 1040,30 1080,8 1120,28 1160,10 1200,18';
    return `<div class="zigzag ${color}" aria-hidden="true"><svg viewBox="0 0 1200 36" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg></div>`;
  };
  const ph = (tag, text, ratio) => `<div class="ph ${ratio || 'r43'}" role="img" aria-label="${esc(text)}"><span class="tag">${esc(tag)}</span><span>${esc(text)}</span></div>`;
  const TAG_SHOT = T('Scatto da fare', 'Shot to do');
  const archive = n => T('Archivio ' + n, 'Archive ' + n);
  const ext = 'target="_blank" rel="noopener"';

  const meta = {
    home: {
      title: T('Mocked Monkey | One man band di Bologna: la Wii è la cassa, il kazoo un synth', 'Mocked Monkey | One man band from Bologna: a Wii as the kick drum, a kazoo as a synth'),
      desc: T('Mocked Monkey è Alessandro Falchi, one man band di Bologna. Costruisce gli strumenti che sul mercato non esistono. Date live, musica, gioco e booking.', 'Mocked Monkey is Alessandro Falchi, a one man band from Bologna. He builds the instruments no shop sells. Live dates, music, game and booking.')
    },
    live: {
      title: T('Live | Mocked Monkey, date e storico dei palchi', 'Live | Mocked Monkey, dates and past shows'),
      desc: T('Prossime date di Mocked Monkey, contest e riprese, più lo storico dei palchi: dalla strada ai festival.', 'Upcoming Mocked Monkey dates, contests and shoots, plus past shows: from the street to the festivals.')
    },
    music: {
      title: T('Musica | Mocked Monkey, nuovo singolo, gioco e Marasma', 'Music | Mocked Monkey, new single, game and Marasma'),
      desc: T('Il nuovo singolo in lavorazione, Immovable: the game e il concept album Marasma (2025), con tracklist, crediti e link di ascolto.', 'The new single in the making, Immovable: the game and the 2025 concept album Marasma, with tracklist, credits and listening links.')
    },
    listening: {
      title: T('Listening is loving | Il manifesto e l\'officina di Mocked Monkey', 'Listening is loving | The Mocked Monkey manifesto and workshop'),
      desc: T('Il manifesto #listeningisloving, chi c\'è dietro Mocked Monkey, la strada, il palco e gli strumenti dell\'officina.', 'The #listeningisloving manifesto, who is behind Mocked Monkey, the street, the stage and the workshop instruments.')
    },
    booking: {
      title: T('Booking & Press | Mocked Monkey, EPK, scheda tecnica e contatti', 'Booking & Press | Mocked Monkey, EPK, tech specs and contact'),
      desc: T('EPK in forma di pagina per promoter, festival, etichette e stampa: bio, prove dal vivo, scheda tecnica, foto stampa e contatti.', 'The EPK as a page for promoters, festivals, labels and press: bio, live proof, tech specs, press photos and contact.')
    }
  }[page];

  const navLabels = { live: 'Live', music: T('Musica', 'Music'), listening: 'Listening is loving', booking: 'Booking & Press' };

  const head = () => `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.desc)}">
${VALID_COPY ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${BASE}/${lang === 'en' ? 'en/' : ''}${SLUG[page][lang]}">
<link rel="alternate" hreflang="it" href="${BASE}/${SLUG[page].it}">
<link rel="alternate" hreflang="en" href="${BASE}/en/${SLUG[page].en}">
<link rel="alternate" hreflang="x-default" href="${BASE}/${SLUG[page].it}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mocked Monkey">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:locale" content="${lang === 'it' ? 'it_IT' : 'en_GB'}">
<meta property="og:image" content="${BASE}/assets/images/share.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14130F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${up}css/style.css">
${page === 'home' ? jsonld() : ''}
</head>`;

  const jsonld = () => `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "Mocked Monkey",
  "alternateName": "Alessandro Falchi",
  "description": ${JSON.stringify(meta.desc)},
  "url": "${BASE}/",
  "image": "${BASE}/assets/images/portrait.jpg",
  "genre": ["Indie Rock", "Alternative Rock"],
  "foundingLocation": { "@type": "Place", "name": "Bologna, Italy" },
  "member": { "@type": "Person", "name": "Alessandro Falchi" },
  "album": { "@type": "MusicAlbum", "name": "Marasma", "datePublished": "2025-06-03" },
  "email": "${L.email}",
  "sameAs": ["${L.ig}", "${L.yt}", "${L.spArtist}", "${L.spAlbum}", "${L.apple}", "https://mockedmonkey.bandcamp.com"]
}
</script>`;

  const header = () => `<body data-events="${up}assets/data/events.json"${page === 'home' ? ' data-home' : ''}>
<a class="skip" href="#main">${T('Vai al contenuto', 'Skip to content')}</a>
<div class="top">
  <div class="datebar" hidden><a href="${hrefTo('live', '#prossimi')}"><span class="lbl">${T('Prossima data', 'Next date')}</span><span class="when"></span><span class="what"></span></a></div>
  <header class="site-header">
    <div class="wrap">
      <a href="${lang === 'it' ? './' : './'}" class="brand" aria-label="Mocked Monkey, home">Mocked <span>Monkey</span></a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="${T('Apri il menu', 'Open the menu')}"><span></span></button>
      <nav class="main-nav" id="main-nav" aria-label="${T('Principale', 'Main')}">
        <ul>
${ORDER.map(k => `          <li><a href="${href(k)}"${page === k ? ' aria-current="page"' : ''}>${navLabels[k]}</a></li>`).join('\n')}
          <li class="lang" aria-label="${T('Lingua', 'Language')}">${lang === 'it'
            ? `<span class="on">IT</span><span class="sep">/</span><a href="${switchHref(page)}" hreflang="en" lang="en" data-lang-switch="en">EN</a>`
            : `<a href="${switchHref(page)}" hreflang="it" lang="it" data-lang-switch="it">IT</a><span class="sep">/</span><span class="on">EN</span>`}</li>
        </ul>
      </nav>
    </div>
  </header>
</div>`;

  const footer = () => `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <p class="footer-tag">#listeningisloving</p>
      <div class="footer-social">
        <a href="${L.ig}" ${ext}>Instagram</a>
        <a href="${L.yt}" ${ext}>YouTube</a>
        <a href="${L.spArtist}" ${ext}>Spotify</a>
        <a href="mailto:${L.email}">${L.email}</a>
      </div>
    </div>
    <div class="footer-bottom">© 2025 Mocked Monkey, Alessandro Falchi · Bologna, Italy</div>
  </div>
</footer>
<button class="to-top" type="button" aria-label="${T('Torna su', 'Back to top')}">&uarr;</button>
<script src="${up}js/main.js"></script>
</body>
</html>
`;

  const quote = () => `<blockquote class="pin tilt-l" style="margin:0">
  <p class="pull">${T('«Va in una direzione opposta a quella del mercato, ma funziona alla grande. Il live è un punto di forza ancora più grande.»', '"It goes the opposite way to the market, and it works brilliantly. The live show is an even bigger strength."')}</p>
  <p class="pull-by">${T('Feedback da SONDA · Centro Musica Modena, 2026', 'Feedback from SONDA · Centro Musica Modena, 2026')}</p>
</blockquote>`;

  const yt = (id, title) => `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${esc(title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;

  // ------------------------------------------------------------ pages
  const pages = {};

  pages.home = () => `<main id="main">

<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">${T('Bologna, Italia · One man band', 'Bologna, Italy · One man band')}</span>
      <h1>${T('Quando si è troppo poveri per avere una band, una Wii diventa la cassa. Un kazoo diventa un synth.', 'When you\'re too poor to have a band, a Wii becomes the kick drum. A kazoo becomes a synth.')}</h1>
      <p class="lead">${T('Mocked Monkey è Alessandro Falchi. Costruisce gli strumenti che sul mercato non esistono, per trovare un suono che emozioni. Sul palco è da solo, ma sembra una band.', 'Mocked Monkey is Alessandro Falchi. He builds the instruments no shop sells, chasing a sound that actually moves you. He\'s alone on stage, but it sounds like a band.')}</p>
      <div class="actions">
        <a class="btn" href="${L.yt}" ${ext}>&#9654; ${T('Guarda il live', 'Watch him live')}</a>
        <a class="btn" href="${hrefTo('live', '#prossimi')}">${T('Prossime date', 'Upcoming dates')} &rarr;</a>
      </div>
    </div>
    <div class="hero-media">${ph(archive(117), T('Video live a Spazio Astra, 30 secondi, in loop e senza audio', 'Live video at Spazio Astra, 30 seconds, looping and muted'), 'r34')}</div>
  </div>
</section>

${zig('rust')}

<section>
  <div class="wrap">
    <span class="eyebrow">${T('Prossime date', 'Upcoming dates')}</span>
    <h2>${T('Dove vederlo dal vivo', 'Catch him live')}</h2>
    <ul class="events" id="home-events"></ul>
    <div class="actions"><a class="btn" href="${hrefTo('live', '#prossimi')}">${T('Tutte le date', 'All dates')} &rarr;</a></div>
  </div>
</section>

${zig('sage')}

<section class="alt">
  <div class="wrap">
    <span class="eyebrow">${T('Gli artefatti', 'The artefacts')}</span>
    <h2>${T('L\'Universo di Mocked Monkey', 'The Mocked Monkey universe')}</h2>
    <div class="grid-3" style="margin-top:34px">
      <article class="card">
        <h3>${T('Indizio per il prossimo brano', 'A clue for the next song')}</h3>
        <span class="eyebrow">${T('Nuovo singolo · In lavorazione', 'New single · In the making')}</span>
        <div class="media"><img src="${up}assets/images/work-in-progress.png" alt="${T('Cono stradale in pixel art con la scritta Work in progress', 'Pixel-art traffic cone with the words Work in progress')}" loading="lazy"></div>
        <p class="dim">${T('Il video si gira a dicembre, con un oggetto che non è nato per fare video. Secondo te qual è?', 'The video is shot in December, with an object never meant to shoot video. Which one do you think it is?')}</p>
        <div class="actions"><a class="btn" href="${L.ig}" ${ext}>${T('Segui il diario', 'Follow the diary')} &rarr;</a></div>
      </article>
      <article class="card">
        <h3>Marasma</h3>
        <span class="eyebrow">${T('Concept album, 2025', 'Concept album, 2025')}</span>
        <div class="media"><img src="${up}assets/images/marasma-cover.jpg" alt="${T('Copertina di Marasma, concept album di Mocked Monkey', 'Marasma album cover, the Mocked Monkey concept album')}" loading="lazy"></div>
        <p class="dim">${T('Un concept album sulla fuga, sul rumore e sull\'ascolto. Di sé e degli altri.', 'A concept album about escape, noise and listening. To yourself and to others.')}</p>
        <div class="actions"><a class="btn" href="${hrefTo('music', '#marasma')}">${T('Ascolta', 'Listen')} &rarr;</a></div>
      </article>
      <article class="card game">
        <h3>Immovable: the game</h3>
        <span class="eyebrow">${T('Il gioco · Gratis, nel browser', 'The game · Free, in your browser')}</span>
        <div class="media"><img class="contain" src="${up}assets/images/immovable-game-preview.gif" alt="${T('Immovable, il gioco: anteprima di una partita', 'Immovable, the game: gameplay preview')}" loading="lazy"></div>
        <p class="dim">${T('Suona Immovable a tempo, in stile Guitar Hero. Si impara in un minuto.', 'Play Immovable to the beat, Guitar Hero style. Takes a minute to learn.')}</p>
        <div class="actions"><a class="btn primary" href="${L.game}" ${ext}>&#9654; ${T('Gioca ora', 'Play now')}</a></div>
      </article>
    </div>
  </div>
</section>

${zig('rust')}

<section>
  <div class="wrap">
    <span class="eyebrow">${T('L\'officina', 'The workshop')}</span>
    <h2>${T('Quando quello che cerchi non esiste', 'When what you\'re looking for doesn\'t exist')}</h2>
    <p class="lead">${T('Ogni oggetto è qui per un motivo: il suono che cercavo, in commercio, non c\'era. Così me lo sono costruito.', 'Every object is here for a reason: the sound I was looking for didn\'t exist in any shop. So I built it.')}</p>
    <div class="grid-4" style="margin-top:34px">
      <div class="card">${ph(archive(137), T('Wii Balance Board aperta, vista dall\'alto', 'Wii Balance Board opened up, seen from above'))}
        <h3>${T('Era una pedana', 'Was a balance board')}</h3><p class="dim">Wii Balance Board &rarr; ${T('cassa', 'kick drum')}</p></div>
      <div class="card">${ph(TAG_SHOT, T('Kazoo-synth in primo piano mentre lo suona', 'Kazoo-synth close-up while he plays it'))}
        <h3>${T('Era un giocattolo', 'Was a toy')}</h3><p class="dim">Kazoo &rarr; synth</p></div>
      <div class="card">${ph(archive(143), T('La pedaliera con il mixer interno', 'The pedalboard with the built-in mixer'))}
        <h3>${T('Left / Right al fonico', 'Left / Right to the desk')}</h3><p class="dim">${T('Pedaliera', 'Pedalboard')} &rarr; mixer</p></div>
      <div class="card">${ph(TAG_SHOT, T('Game Boy Camera, un dettaglio per il teaser', 'Game Boy Camera, a detail for the teaser'))}
        <h3>${T('Era un gioco', 'Was a game')}</h3><p class="dim">Game Boy Camera &rarr; ${T('cinepresa', 'film camera')}</p></div>
    </div>
    <div class="actions"><a class="btn" href="${hrefTo('listening', '#officina')}">${T('Entra nell\'officina', 'Step into the workshop')} &rarr;</a></div>
  </div>
</section>

<div class="band-rust">
  <div class="wrap">
    <p class="big">${T('Ascoltare è un atto d\'amore. Verso gli altri, e verso sé stessi.', 'Listening is an act of love. Towards others, and towards yourself.')}</p>
    <p style="margin:24px 0 0; max-width:56ch">${T('Tutto è cominciato suonando per strada. Da lì viene l\'idea che tiene insieme canzoni, strumenti e concerti.', 'It all started busking. That\'s where the idea holding songs, instruments and shows together comes from.')}</p>
    <div class="actions"><a class="btn" style="border-color:var(--bg);color:var(--bg)" href="${hrefTo('listening')}">${T('Leggi il manifesto', 'Read the manifesto')} &rarr;</a></div>
  </div>
</div>

<section>
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <span class="eyebrow">Booking &amp; Press</span>
      <h2>${T('Organizzi un live o scrivi di musica?', 'Booking a show or writing about music?')}</h2>
      <p class="lead">${T('Un concerto da band, con le esigenze tecniche di un solista. Rider, foto ed EPK sono già pronti da scaricare.', 'A full-band show with the tech needs of a solo act. Rider, photos and EPK are ready to download.')}</p>
      <div class="actions">
        <a class="btn" href="${hrefTo('booking', '#scheda-tecnica')}">${T('EPK e scheda tecnica', 'EPK & tech rider')} &rarr;</a>
        <a class="btn" href="${hrefTo('booking', '#contatti')}">${T('Scrivi per booking', 'Booking enquiries')} &rarr;</a>
      </div>
    </div>
    ${quote()}
  </div>
</section>

</main>`;

  pages.live = () => `<main id="main">

<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">Live</span>
      <h1>${T('Dalla strada al palco', 'From the street to the stage')}</h1>
      <p class="lead">${T('Un uomo solo: chitarra e kazoo in alto, il ritmo battuto sulla wii in basso. Ogni live racconta una storia dall\'inizio alla fine, anche quando c\'è tempo solo per due brani. E tra un brano e l\'altro, qualcosa succede sempre.', 'One man alone: guitar and kazoo up top, the beat stamped out on the Wii below. Every show tells a story from start to finish, even when there\'s only time for two songs. And between songs, something always happens.')}</p>
      <div class="actions">
        <a class="btn" href="#prossimi">${T('Prossimi appuntamenti', 'Coming up')} &darr;</a>
        <a class="btn" href="#storico">${T('Dove ha già suonato', 'Where he\'s played')} &darr;</a>
      </div>
    </div>
    <img class="photo r43" src="${up}assets/images/gallery/03.jpg" alt="${T('Mocked Monkey dal vivo con la chitarra, sotto luci verdi e viola', 'Mocked Monkey live with the guitar under green and purple lights')}">
  </div>
</section>

${zig('rust')}

<section id="prossimi">
  <div class="wrap">
    <span class="eyebrow">${T('Prossimi appuntamenti', 'Coming up')}</span>
    <h2>${T('In calendario', 'On the calendar')}</h2>
    <p class="lead">${T('Non solo concerti', 'Not just gigs')}</p>
    <div class="filters" role="group" aria-label="${T('Filtra per tipo', 'Filter by type')}" style="margin-top:28px">
      <button type="button" data-filter="all" aria-pressed="true">${T('Tutto', 'All')}</button>
      <button type="button" data-filter="live" aria-pressed="false">Live</button>
      <button type="button" data-filter="contest" aria-pressed="false">Contest</button>
      <button type="button" data-filter="studio" aria-pressed="false">${T('In studio', 'Studio')}</button>
      <button type="button" data-filter="video" aria-pressed="false">Video</button>
    </div>
    <ul class="events" id="calendar" aria-live="polite"></ul>
  </div>
</section>

${zig('sage')}

<section class="alt" id="storico">
  <div class="wrap">
    <span class="eyebrow">${T('Storico dei palchi', 'Past shows')}</span>
    <h2>${T('Dove è già passato', 'Where he\'s played')}</h2>
    <ul class="past" id="past-list"></ul>
  </div>
</section>

${zig('rust')}

<section>
  <div class="wrap">
    <span class="eyebrow">${T('Foto e video', 'Photos & video')}</span>
    <h2>${T('Strada e palco', 'Street and stage')}</h2>
    <div class="grid-3" style="margin-top:30px">
      <a href="${up}assets/images/gallery/01.jpg" target="_blank" rel="noopener"><img class="photo r43" src="${up}assets/images/gallery/01.jpg" alt="${T('Mocked Monkey suona per strada tra i passanti', 'Mocked Monkey busking among the passers-by')}" loading="lazy"></a>
      <a href="${up}assets/images/press/press-01.jpg" target="_blank" rel="noopener"><img class="photo r43" src="${up}assets/images/press/press-01.jpg" alt="${T('Mocked Monkey dal vivo sotto una luce blu', 'Mocked Monkey live under a blue light')}" loading="lazy"></a>
      <a href="${up}assets/images/press/press-03.jpg" target="_blank" rel="noopener"><img class="photo r43" src="${up}assets/images/press/press-03.jpg" alt="${T('Sul palco con chitarra e porta-armonica', 'On stage with guitar and harmonica holder')}" loading="lazy"></a>
    </div>
    <div class="actions"><a class="btn" href="${L.yt}" ${ext}>${T('Tutti i video su YouTube', 'All videos on YouTube')} &rarr;</a></div>
  </div>
</section>

<div class="band-rust center">
  <div class="wrap">
    <h2 class="big">${T('Vuoi Mocked Monkey sul tuo palco?', 'Want Mocked Monkey on your stage?')}</h2>
    <p style="margin:20px auto 0; max-width:56ch">${T('Dal contest alla serata intera: il set si adatta alla tua programmazione e al tuo palco, anche il più piccolo.', 'From a contest slot to a full evening: the set fits your line-up and your stage, even the smallest one.')}</p>
    <div class="actions" style="justify-content:center"><a class="btn" style="border-color:var(--bg);color:var(--bg)" href="${hrefTo('booking')}">Booking &amp; Press &rarr;</a></div>
  </div>
</div>

</main>`;

  const platforms = [['Spotify', L.spAlbum], ['Bandcamp', L.bandcamp], ['Apple Music', L.apple], ['Amazon Music', L.amazon], ['Deezer', L.deezer], ['Qobuz', L.qobuz]];
  const tracks = ['Itching under the skin', 'Crystal Jail', 'Snoozing', 'Standing in the rain', 'Switch off', 'Immovable', 'That\'s what you gave it to me', 'Slipping', 'Guilt', 'Letter from Heaven', 'Let\'s start'];

  pages.music = () => `<main id="main">

<section class="hero">
  <div class="wrap grid-2">
    <div>
      <span class="eyebrow">${T('Musica', 'Music')}</span>
      <h1>${T('Ascolta, guarda, gioca', 'Listen, watch, play')}</h1>
      <p class="lead">${T('Un nuovo singolo in lavorazione, un concept album e un gioco costruito su una canzone. Tre modi per entrare nello stesso mondo.', 'A new single in the making, a concept album and a game built around a song. Three ways into the same world.')}</p>
      <nav class="index3" aria-label="${T('In questa pagina', 'On this page')}" style="grid-template-columns:1fr">
        <a href="#singolo"><small>${T('Singolo · In lavorazione', 'Single · In the making')}</small><span>${T('Il nuovo brano', 'The new song')}</span></a>
        <a href="#gioco"><small>${T('Gioco · Gratis', 'Game · Free')}</small><span>Immovable: the game</span></a>
        <a href="#marasma"><small>${T('Album · 2025', 'Album · 2025')}</small><span>Marasma</span></a>
      </nav>
    </div>
    <img class="photo r43" src="${up}assets/images/press/press-03.jpg" alt="${T('Sul palco con chitarra e porta-armonica', 'On stage with guitar and harmonica holder')}">
  </div>
</section>

${zig('rust')}

<section id="singolo">
  <div class="wrap grid-2">
    <div>
      <span class="eyebrow">${T('Nuovo singolo · In lavorazione', 'New single · In the making')}</span>
      <h2>${T('Un vecchio oggetto sta per riaccendersi', 'An old object is about to switch back on')}</h2>
      <p class="lead">${T('Nuovo brano, nuovo video. Girato con qualcosa che non era nato per fare video.', 'New song, new video. Shot with something that was never meant to shoot video.')}</p>
      <div class="actions">
        <a class="btn" href="${L.ig}" ${ext}>${T('Segui il diario su Instagram', 'Follow the diary on Instagram')} &rarr;</a>
        <a class="btn" href="${L.spArtist}" ${ext}>${T('Segui su Spotify', 'Follow on Spotify')} &rarr;</a>
      </div>
    </div>
    <img class="photo" style="aspect-ratio:1/1" src="${up}assets/images/work-in-progress.png" alt="${T('Cono stradale in pixel art con la scritta Work in progress', 'Pixel-art traffic cone with the words Work in progress')}" loading="lazy">
  </div>
</section>

${zig('sage')}

<section class="alt" id="gioco">
  <div class="wrap grid-2">
    <div>
      <span class="eyebrow">${T('Il gioco · Gratis, nel browser', 'The game · Free, in your browser')}</span>
      <h2>Immovable: the game</h2>
      <p class="lead">${T('Immovable è un brano di Marasma. È anche un gioco in stile Guitar Hero: le note scendono, tu le prendi a tempo. Il modo più divertente per ascoltare una canzone fino in fondo.', 'Immovable is a song from Marasma. It\'s also a Guitar Hero-style game: the notes fall, you hit them on the beat. The most fun way to listen to a song all the way through.')}</p>
      <ol class="steps">
        <li>${T('Apri il gioco: si avvia nel browser, senza scaricare nulla.', 'Open the game: it runs in your browser, nothing to download.')}</li>
        <li>${T('Prendi le note a tempo, mentre scendono sulla musica.', 'Hit the notes on time as they fall with the music.')}</li>
        <li>${T('Arriva alla fine del brano e prova a battere il tuo punteggio.', 'Make it to the end of the song and try to beat your score.')}</li>
      </ol>
      <div class="actions">
        <a class="btn primary" href="${L.game}" ${ext}>&#9654; ${T('Gioca ora', 'Play now')}</a>
        <a class="btn" href="#marasma">${T('Ascolta il brano', 'Listen to the song')} &darr;</a>
      </div>
    </div>
    <div style="text-align:center"><img src="${up}assets/images/immovable-game-preview.gif" alt="${T('Immovable, il gioco: anteprima di una partita', 'Immovable, the game: gameplay preview')}" style="width:220px;height:auto;margin:0 auto;border:1px solid var(--line-2)" loading="lazy"></div>
  </div>
</section>

${zig('rust')}

<section id="marasma">
  <div class="wrap">
    <div class="grid-2" style="align-items:start">
      <div>
        <span class="eyebrow">${T('Concept album, 2025', 'Concept album, 2025')}</span>
        <h2>Marasma</h2>
        <p class="dim">${T('Un disco sulla mancanza, sulla fuga e sull\'ascolto: degli altri e di sé.', 'A record about absence, escape and listening: to others, and to yourself.')}</p>
        <p class="dim">${T('Il protagonista scappa da tutti e da tutto, senza ascoltare nessuno, nemmeno le voci nella sua testa, che si fanno sempre più forti. La fuga lo porta vicino all\'autodistruzione. Solo alla fine capisce che scappare non è la soluzione e sceglie di ascoltarsi.', 'The protagonist runs from everyone and everything, listening to no one, not even the voices in his head, which grow louder as the story unfolds. The escape pushes him close to self-destruction. Only at the end does he understand that running was never the answer, and he chooses to listen to himself.')}</p>
        <p class="credits">${T('Scritto e pre-prodotto da Alessandro Falchi · Prodotto da Davide Fasulo · Testi rivisti da Robert Lincoln Hackett · Grafica di Alessandro Burelli · Uscito il 3 giugno 2025', 'Written and pre-produced by Alessandro Falchi · Produced by Davide Fasulo · Lyrics reviewed by Robert Lincoln Hackett · Artwork by Alessandro Burelli · Released 3 June 2025')}</p>
      </div>
      <img class="cover" src="${up}assets/images/marasma-cover.jpg" alt="${T('Copertina di Marasma', 'Marasma album cover')}" loading="lazy">
    </div>
    <div class="grid-2" style="margin-top:56px; align-items:start">
      <div>
        <h3>Tracklist</h3>
        <ol class="tracklist">
${tracks.map(t => `          <li><span>${esc(t)}</span>${t === 'Immovable' ? `<a class="game-tag" href="${L.game}" ${ext}>&#9654; ${T('Anche come gioco', 'Also a game')}</a>` : ''}</li>`).join('\n')}
        </ol>
      </div>
      <div>
        <h3>${T('Ascolta ovunque', 'Listen everywhere')}</h3>
        <ul class="chips" style="margin-top:16px">
${platforms.map(([n, u]) => `          <li><a href="${u}" ${ext}>${n} &rarr;</a></li>`).join('\n')}
        </ul>
        <h3 style="margin-top:44px">${T('Cosa ne ha scritto la stampa', 'What the press said')}</h3>
        <div class="pin tilt-r" style="margin-top:16px">
          <p class="pull-by" style="margin-bottom:8px">Rockit</p>
          <p style="margin:0 0 14px">«Un viaggio di fuga e ritorno, diviso tra busking, fragilità interiori e rumore urbano.»</p>
          <a class="link-arrow" href="${L.rockit}" ${ext}>${T('Leggi la recensione', 'Read the review')} &rarr;</a>
        </div>
        <div class="pin tilt-l" style="margin-top:22px">
          <p class="pull-by" style="margin-bottom:8px">De-Baser</p>
          <p style="margin:0 0 14px">${T('Recensione con il voto massimo.', 'Reviewed with the top rating.')}</p>
          <a class="link-arrow" href="${L.debaser}" ${ext}>${T('Leggi la recensione', 'Read the review')} &rarr;</a>
        </div>
      </div>
    </div>
  </div>
</section>

${zig('sage')}

<section class="alt" id="video">
  <div class="wrap">
    <span class="eyebrow">${T('Video', 'Video')}</span>
    <h2>${T('Guarda', 'Watch')}</h2>
    <div class="grid-2" style="margin-top:30px; align-items:start">
      <div>${yt('X_9uNMjH3Tg', 'Crystal Jail')}<p class="video-cap"><strong>Crystal Jail</strong><span class="dim">${T('Una sessione per il Centro Musica di Modena.', 'A session for Centro Musica Modena.')}</span></p></div>
      <div>${yt('XzyPm--jsms', 'Split Live Session')}<p class="video-cap"><strong>Split Live Session</strong><span class="dim">${T('Live session registrata allo Split di Bologna.', 'Live session recorded at Split, Bologna.')}</span></p></div>
    </div>
    <div class="actions"><a class="btn" href="${L.yt}" ${ext}>${T('Tutti i video su YouTube', 'All videos on YouTube')} &rarr;</a></div>
  </div>
</section>

<div class="band-rust center">
  <div class="wrap">
    <p class="big">${T('Ogni canzone nasce da un gesto semplice: fermarsi ad ascoltare.', 'Every song starts from a simple gesture: stopping to listen.')}</p>
    <div class="actions" style="justify-content:center"><a class="btn" style="border-color:var(--bg);color:var(--bg)" href="${hrefTo('listening')}">${T('Leggi il manifesto', 'Read the manifesto')} &rarr;</a></div>
  </div>
</div>

</main>`;

  const bench = T(
    ['Wii 2.0: la nuova versione della pedana: quella attuale, quando ci salgo sopra, schiaccia il circuito.', 'Chitarra: un secondo pickup per aggiungere il basso, così la one man band ha anche le frequenze basse.'],
    ['Wii 2.0: the new version of the board: the current one squashes its own circuit when I step on it.', 'Guitar: a second pickup to add bass, so the one man band gets its low end too.']);

  pages.listening = () => `<main id="main">

<section class="hero" style="padding-bottom:56px">
  <div class="wrap">
    <span class="eyebrow">#listeningisloving · ${T('Il manifesto', 'The manifesto')}</span>
  </div>
</section>
<div class="band-rust" style="margin-top:-56px">
  <div class="wrap">
    <h1 class="big" style="font-size:clamp(2rem,5vw,3.8rem); max-width:24ch">${T('In un mondo pieno di rumore, scegliere di ascoltare è un atto d\'amore.', 'In a world full of noise, choosing to listen is an act of love.')}</h1>
  </div>
</div>

<section>
  <div class="wrap grid-2" style="align-items:start">
    <ul style="list-style:none; margin:0; padding:0; display:grid; gap:18px">
${T(['Chi si ferma per strada non paga un biglietto: sceglie di ascoltare.', 'Ascoltiamo gli altri. E anche noi stessi.', 'Scappare non è la soluzione. Ascoltarsi sì.', 'L\'ascolto è l\'unico modo per cambiare davvero.'],
   ['Whoever stops on the street doesn\'t pay for a ticket: they choose to listen.', 'We listen to others. And to ourselves, too.', 'Running away is not the answer. Listening to yourself is.', 'Listening is the only way to truly change.']).map(l => `      <li class="pull" style="margin:0">${l}</li>`).join('\n')}
    </ul>
    <blockquote class="pin tilt-r" style="margin:0">
      <p class="pull">${T('«Credo davvero che l\'ascolto, verso gli altri e verso sé stessi, sia un atto d\'amore. A me ha salvato.»', '"I truly believe that listening, to others and to yourself, is an act of love. It saved me."')}</p>
      <p class="pull-by">Alessandro Falchi</p>
    </blockquote>
  </div>
</section>

${zig('sage')}

<section class="alt" id="chi">
  <div class="wrap grid-2" style="align-items:start">
    <img class="photo r34" src="${up}assets/images/portrait.jpg" alt="${T('Ritratto in bianco e nero di Alessandro Falchi', 'Black and white portrait of Alessandro Falchi')}" loading="lazy">
    <div>
      <span class="eyebrow">${T('Chi c\'è dietro', 'Who\'s behind it')}</span>
      <h2>Alessandro Falchi</h2>
      <p>${T('Mocked Monkey è il progetto di Alessandro Falchi, cantautore nato a Foligno e cresciuto, musicalmente, tra le strade e i palchi di Bologna. Dopo anni di collaborazioni, studio e sperimentazione, nel 2025 pubblica Marasma, un concept album sulla fuga e sull\'ascolto.', 'Mocked Monkey is the project of Alessandro Falchi, a songwriter born in Foligno who grew up, musically, between the streets and stages of Bologna. After years of collaborations, study and experimentation, in 2025 he released Marasma, a concept album about escape and listening.')}</p>
      <p>${T('Sul palco è da solo, con chitarra, voce, kazoo e gli strumenti dell\'officina, qui sotto.', 'On stage he\'s alone, with guitar, voice, kazoo and the instruments from the workshop below.')}</p>
      <p>${T('Durante i live qualcosa si rompe quasi sempre: una corda, un cavo, un pezzo dell\'officina. Fa parte dello spettacolo. Le canzoni, invece, sono serie: parlano di fuga, di rumore e di quanto sia difficile ascoltarsi.', 'Something almost always breaks during a show: a string, a cable, a piece of the workshop. It\'s part of the act. The songs, on the other hand, are serious: they\'re about escape, noise, and how hard it is to listen to yourself.')}</p>
      <dl class="facts">
        <div><dt>${T('Da', 'From')}</dt><dd>Foligno &rarr; Bologna</dd></div>
        <div><dt>${T('Formazione', 'Line-up')}</dt><dd>One man band</dd></div>
        <div><dt>${T('Genere', 'Genre')}</dt><dd>Indie / alt rock</dd></div>
      </dl>
    </div>
  </div>
</section>

${zig('rust')}

<section>
  <div class="wrap">
    <span class="eyebrow">${T('Dove nasce tutto', 'Where it all started')}</span>
    <h2>${T('La strada e il palco', 'The street and the stage')}</h2>
    <div class="grid-2" style="margin-top:30px; align-items:start">
      <div>
        <img class="photo r43" src="${up}assets/images/gallery/01.jpg" alt="${T('Busking tra i passanti, sotto i portici di Bologna', 'Busking among the passers-by in Bologna')}" loading="lazy" style="margin-bottom:18px">
        <p>${T('Il progetto nasce suonando per strada, tra i portici di Bologna, tra i paesini sperduti e in tutti i luoghi del mondo che sono stati casa per un po\'. È dagli scambi sinceri con le persone incontrate in strada che nasce #listeningisloving.', 'The project was born busking: under the porticoes of Bologna, in remote little villages and in every place in the world that has been home for a while. #listeningisloving was born from the sincere exchanges with the people met on the street.')}</p>
      </div>
      <div>
        <img class="photo r43" src="${up}assets/images/press/press-01.jpg" alt="${T('Live con luce blu', 'Live under a blue light')}" loading="lazy" style="margin-bottom:18px">
        <p>${T('Dai locali di Bologna ai festival, fino a un open mic a Los Angeles dove il pubblico ha cantato i ritornelli. Lo spirito è lo stesso della strada. Cambia solo il numero di cavi.', 'From Bologna\'s venues to festivals, all the way to an open mic in Los Angeles where the crowd sang the choruses. The spirit is the same as on the street. Only the number of cables changes.')}</p>
        <a class="link-arrow" href="${hrefTo('live', '#storico')}">${T('Vedi dove ha suonato', 'See where he\'s played')} &rarr;</a>
      </div>
    </div>
  </div>
</section>

${zig('sage')}

<section class="alt" id="officina">
  <div class="wrap">
    <span class="eyebrow">${T('L\'officina', 'The workshop')}</span>
    <h2>${T('Ogni oggetto ha avuto un\'altra vita', 'Every object had another life')}</h2>
    <p class="lead">${T('Non è nostalgia. Il suono che cercavo, in commercio, non c\'era: così ho preso oggetti nati per fare altro e li ho trasformati. Ognuno porta con sé un difetto, ed è proprio quel difetto a renderlo riconoscibile.', 'It isn\'t nostalgia. The sound I was looking for didn\'t exist in any shop, so I took objects made for something else and transformed them. Each one carries a flaw, and that flaw is exactly what makes it recognisable.')}</p>
    <div class="grid-4" style="margin-top:34px">
      <div class="card">${ph(archive(137), T('Wii Balance Board aperta', 'Wii Balance Board opened up'))}
        <h3>${T('Era una pedana, oggi è la cassa', 'Was a balance board, now it\'s the kick drum')}</h3>
        <p class="dim">${T('Nata per fare sport e ballare. Ora ci salgo sopra mentre suono e tengo il tempo con i piedi.', 'Made for sport and dancing. Now I stand on it while I play, and I keep time with my feet.')}</p></div>
      <div class="card">${ph(TAG_SHOT, T('Kazoo-synth in primo piano', 'Kazoo-synth close-up'))}
        <h3>${T('Era un giocattolo, oggi è un synth', 'Was a toy, now it\'s a synth')}</h3>
        <p class="dim">${T('Il più umile degli strumenti, collegato all\'elettronica giusta, diventa una linea di synth.', 'The humblest of instruments, wired to the right electronics, becomes a synth line.')}</p></div>
      <div class="card">${ph(archive(143), T('La pedaliera', 'The pedalboard'))}
        <h3>${T('Left / Right al fonico, è il mixer', 'Left / Right to the desk, it\'s the mixer')}</h3>
        <p class="dim">${T('Dentro c\'è un mixer: tutto quello che suono arriva al fonico su due soli canali.', 'There\'s a mixer inside: everything I play reaches the sound engineer on just two channels.')}</p></div>
      <div class="card">${ph(TAG_SHOT, T('Game Boy Camera', 'Game Boy Camera'))}
        <h3>${T('Era un gioco, oggi è una cinepresa', 'Was a game, now it\'s a film camera')}</h3>
        <p class="dim">${T('La fotocamera del Game Boy, uscita nel 1998. Con lei si gira il videoclip del prossimo singolo, un pixel alla volta.', 'The Game Boy\'s camera, released in 1998. The next single\'s video is being shot with it, one pixel at a time.')}</p></div>
    </div>
    <div class="pin tilt-l" style="margin-top:44px; max-width:760px">
      <span class="eyebrow">${T('Sul banco, adesso', 'On the bench, right now')}</span>
      <h3>${T('Lavori in corso', 'Work in progress')}</h3>
      <ul style="margin:0; padding-left:20px">${bench.map(b => `<li style="margin-bottom:8px">${b}</li>`).join('')}</ul>
    </div>
  </div>
</section>

<section>
  <div class="wrap narrow" style="text-align:center">
    <h2>${T('Resta in ascolto', 'Keep listening')}</h2>
    <p class="lead" style="margin:0 auto">${T('Il diario dell\'officina, le prove fallite e le nuove canzoni: su Instagram, ogni volta che c\'è qualcosa da dire.', 'The workshop diary, the failed attempts and the new songs: on Instagram, whenever there\'s something worth saying.')}</p>
    <div class="actions" style="justify-content:center">
      <a class="btn primary" href="${L.ig}" ${ext}>Instagram &rarr;</a>
      <a class="btn" href="${L.spArtist}" ${ext}>Spotify &rarr;</a>
      <a class="btn" href="${L.yt}" ${ext}>YouTube &rarr;</a>
    </div>
  </div>
</section>

</main>`;

  const soon = T('In arrivo', 'Coming soon');
  pages.booking = () => `<main id="main">

<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">${T('Booking & Press · Per promoter, festival, etichette e stampa', 'Booking & Press · For promoters, festivals, labels and press')}</span>
      <h1>${T('Il suono di una band. L\'ingombro di un solista.', 'The sound of a band. The footprint of a solo act.')}</h1>
      <p class="lead">${T('One man band da Bologna, con strumenti costruiti a mano. Si monta in fretta e si adatta a festival, rassegne, contest e serate con più artisti: i dettagli tecnici sono qui sotto.', 'One man band from Bologna, with handmade instruments. Quick to set up, he fits festivals, concert series, contests and multi-artist nights: tech details below.')}</p>
      <div class="actions">
        <a class="btn primary" href="${L.epk}" ${ext}>${T('Scarica l\'EPK', 'Download the EPK')} &darr;</a>
        <a class="btn" href="#contatti">${T('Scrivi per booking', 'Booking enquiries')} &rarr;</a>
      </div>
      <ul class="chips" style="margin-top:28px">
        <li><a href="#prove">${T('Dal vivo', 'Live')}</a></li>
        <li><a href="#stampa">${T('Stampa', 'Press')}</a></li>
        <li><a href="#scheda-tecnica">${T('Scheda tecnica', 'Tech specs')}</a></li>
        <li><a href="#contatti">${T('Contatti', 'Contact')}</a></li>
      </ul>
    </div>
    <div>
      <span class="eyebrow">${T('Il live in 60-90 secondi', 'The show in 60-90 seconds')}</span>
      ${ph(archive(117), T('Fotogramma del video 117 con pulsante play, in attesa del montaggio da 60-90 secondi', 'Frame from video 117 with a play button, until the 60-90 second edit is ready'), 'r169')}
    </div>
  </div>
</section>

${zig('rust')}

<section id="in-breve">
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <span class="eyebrow">${T('In breve', 'In short')}</span>
      <h2>${T('Chi è Mocked Monkey', 'Who is Mocked Monkey')}</h2>
      <p>${T('Mocked Monkey è il progetto indipendente di Alessandro Falchi, cantautore di Bologna. Nato per strada, porta su ogni palco lo stesso spirito: canzoni che raccontano una storia e strumenti che si costruisce da solo, partendo da vecchie console e giocattoli. Nel 2025 ha pubblicato il concept album Marasma, sulla fuga e sull\'ascolto. Sta lavorando al nuovo singolo, con un videoclip girato in Game Boy Camera.', 'Mocked Monkey is the independent project of Alessandro Falchi, a songwriter from Bologna. Born on the street, it brings the same spirit to every stage: songs that tell a story and instruments he builds himself from old consoles and toys. In 2025 he released the concept album Marasma, about escape and listening. He\'s working on a new single, with a video shot on a Game Boy Camera.')}</p>
      <div class="actions"><a class="btn" href="${hrefTo('listening', '#chi')}">${T('La storia completa', 'The full story')} &rarr;</a></div>
    </div>
    <dl class="facts" style="grid-template-columns:1fr 1fr; margin:0">
      <div><dt>${T('Genere', 'Genre')}</dt><dd>Indie / alt rock</dd></div>
      <div><dt>${T('Formazione', 'Line-up')}</dt><dd>${T('One man band (solo)', 'One man band (solo)')}</dd></div>
      <div><dt>${T('Base', 'Based in')}</dt><dd>${T('Bologna, Italia', 'Bologna, Italy')}</dd></div>
      <div><dt>${T('Testi', 'Lyrics')}</dt><dd>${T('In inglese', 'In English')}</dd></div>
      <div><dt>${T('Ultima uscita', 'Latest release')}</dt><dd>Marasma (2025)</dd></div>
      <div><dt>${T('In arrivo', 'Coming next')}</dt><dd>${T('Nuovo singolo e videoclip', 'New single and video')}</dd></div>
    </dl>
  </div>
</section>

${zig('sage')}

<section class="alt" id="prove">
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <span class="eyebrow">${T('Dal vivo', 'Live')}</span>
      <h2>${T('Il live funziona', 'The live show works')}</h2>
      <ul class="past">
${T([['10.12.26', 'Echo Sound, semifinali', 'Casinalbo (MO)'], ['10.2026', 'Woofstock', 'Udine'], ['09.2026', 'Scena Futura Contest', ''], ['2026', 'Cinema Bar Open Mic', 'Los Angeles'], ['03.2026', 'Strabismi Festival', ''], ['03.2026', 'SONDA, selezione per incontri con produttori', 'Modena'], ['08.2025', 'Busking in Normandia', 'Étretat']],
   [['10.12.26', 'Echo Sound, semi-finals', 'Casinalbo (MO)'], ['10.2026', 'Woofstock', 'Udine'], ['09.2026', 'Scena Futura Contest', ''], ['2026', 'Cinema Bar Open Mic', 'Los Angeles'], ['03.2026', 'Strabismi Festival', ''], ['03.2026', 'SONDA, selected for producer sessions', 'Modena'], ['08.2025', 'Busking in Normandy', 'Étretat']])
  .map(([w, p, c]) => `        <li style="grid-template-columns:90px 1fr"><span class="when">${w}</span><span class="where">${p}${c ? ' <small>' + c + '</small>' : ''}</span></li>`).join('\n')}
      </ul>
      <div class="actions"><a class="btn" href="${hrefTo('live', '#storico')}">${T('Tutti i palchi', 'All past shows')} &rarr;</a></div>
    </div>
    ${quote()}
  </div>
</section>

${zig('rust')}

<section id="stampa">
  <div class="wrap">
    <span class="eyebrow">${T('Stampa', 'Press')}</span>
    <h2>${T('Cosa hanno scritto', 'What they wrote')}</h2>
    <div class="grid-2" style="margin-top:30px; align-items:start">
      <div class="pin tilt-l">
        <p class="pull-by" style="margin-bottom:8px">Rockit</p>
        <p style="margin:0 0 14px">«Un viaggio di fuga e ritorno, diviso tra busking, fragilità interiori e rumore urbano.»</p>
        <a class="link-arrow" href="${L.rockit}" ${ext}>${T('Leggi la recensione', 'Read the review')} &rarr;</a>
      </div>
      <div class="pin tilt-r">
        <p class="pull-by" style="margin-bottom:8px">De-Baser</p>
        <p style="margin:0 0 14px">${T('Recensione di Marasma con il voto massimo.', 'Review of Marasma with the top rating.')}</p>
        <a class="link-arrow" href="${L.debaser}" ${ext}>${T('Leggi la recensione', 'Read the review')} &rarr;</a>
      </div>
    </div>
  </div>
</section>

${zig('sage')}

<section class="alt" id="scheda-tecnica">
  <div class="wrap">
    <span class="eyebrow">${T('Scheda tecnica', 'Tech specs')}</span>
    <h2>${T('Setup compatto, pochi problemi', 'Compact setup, few problems')}</h2>
    <div class="grid-3" style="margin-top:34px">
      <div class="spec"><div class="num">L / R</div><h3>${T('Due canali al fonico', 'Two channels to the desk')}</h3><p class="dim">${T('La pedaliera ha un mixer interno: tutto quello che suona arriva in sala su due soli canali, left e right.', 'The pedalboard has a built-in mixer: everything he plays reaches front of house on just two channels, left and right.')}</p></div>
      <div class="spec"><div class="num">1</div><h3>${T('Un musicista, poco spazio', 'One musician, small footprint')}</h3><p class="dim">${T('Suona seduto, con la Wii Balance Board ai piedi. Entra anche nei palchi più piccoli e nelle line-up con più artisti.', 'He plays seated, with the Wii Balance Board at his feet. Fits even the smallest stages and multi-artist line-ups.')}</p></div>
      <div class="spec"><div class="num">30 · 45 · 90</div><h3>${T('Set su misura', 'Sets to fit')}</h3><p class="dim">${T('Set da 30, 45 o 90 minuti, dal contest alla serata intera.', 'Sets of 30, 45 or 90 minutes, from a contest slot to a full evening.')}</p></div>
    </div>
    <div class="downloads">
      <a class="btn" href="#" aria-disabled="true" title="${soon}">${T('Rider tecnico', 'Tech rider')} &darr; PDF</a>
      <a class="btn" href="#" aria-disabled="true" title="${soon}">Stage plot &darr; PDF</a>
      <a class="btn" href="${L.epk}" ${ext}>${T('EPK completo', 'Full EPK')} &darr; PDF</a>
    </div>
  </div>
</section>

${zig('rust')}

<section id="foto">
  <div class="wrap">
    <span class="eyebrow">${T('Foto stampa', 'Press photos')}</span>
    <h2>${T('In alta risoluzione', 'High resolution')}</h2>
    <div class="grid-4" style="margin-top:30px">
      <a href="${up}assets/images/press/press-03.jpg" target="_blank" rel="noopener"><img class="photo r34" src="${up}assets/images/press/press-03.jpg" alt="${T('Primo piano con porta-armonica', 'Close-up with the harmonica holder')}" loading="lazy"></a>
      <a href="${up}assets/images/gallery/03.jpg" target="_blank" rel="noopener"><img class="photo r34" src="${up}assets/images/gallery/03.jpg" alt="${T('Live con luci verdi e viola', 'Live with green and purple lights')}" loading="lazy"></a>
      <a href="${up}assets/images/press/press-01.jpg" target="_blank" rel="noopener"><img class="photo r34" src="${up}assets/images/press/press-01.jpg" alt="${T('Live con luce blu', 'Live under a blue light')}" loading="lazy"></a>
      <a href="${up}assets/images/press/press-02.jpg" target="_blank" rel="noopener"><img class="photo r34" src="${up}assets/images/press/press-02.jpg" alt="${T('Busking tra i passanti', 'Busking among the passers-by')}" loading="lazy"></a>
    </div>
    <div class="actions"><a class="btn" href="#" aria-disabled="true" title="${soon}">${T('Scarica tutte (.zip)', 'Download all (.zip)')} &darr;</a></div>
  </div>
</section>

<section class="alt" id="contatti">
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <span class="eyebrow">${T('Contatti', 'Contact')}</span>
      <h2>${T('Parliamone', 'Let\'s talk')}</h2>
      <p class="lead">${T('Per date, festival, collaborazioni e interviste. Risponde Alessandro in persona.', 'For dates, festivals, collaborations and interviews. Alessandro answers in person.')}</p>
      <ul class="contact-list" style="margin-top:26px">
        <li><a href="mailto:${L.email}">${L.email} <span class="arrow">&rarr;</span></a></li>
        <li><a href="tel:${L.tel}">${L.telShow} <span class="arrow">&rarr;</span></a></li>
        <li><a href="${L.ig}" ${ext}>Instagram <span class="arrow">&rarr;</span></a></li>
        <li><a href="${L.yt}" ${ext}>YouTube <span class="arrow">&rarr;</span></a></li>
        <li><a href="${L.spArtist}" ${ext}>Spotify <span class="arrow">&rarr;</span></a></li>
      </ul>
    </div>
    <div class="contact-box">
      <form id="contact-form" action="https://api.web3forms.com/submit" method="POST">
        <input type="hidden" name="access_key" value="feec83ab-25f4-4718-b59f-993d853bb2a2">
        <input type="text" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
        <div class="form-row"><label for="f-name">${T('Nome e locale / testata', 'Name and venue / outlet')}</label><input type="text" id="f-name" name="name" required></div>
        <div class="form-row"><label for="f-email">Email</label><input type="email" id="f-email" name="email" required></div>
        <div class="form-row"><label for="f-type">${T('Tipo di richiesta', 'Request type')}</label>
          <select id="f-type" name="request_type">${T(['Booking', 'Stampa', 'Altro'], ['Booking', 'Press', 'Other']).map(o => `<option>${o}</option>`).join('')}</select></div>
        <div class="form-row"><label for="f-date">${T('Data (se c\'è)', 'Date (if any)')}</label><input type="text" id="f-date" name="date" placeholder="${T('es. 20.03.27', 'e.g. 20.03.27')}"></div>
        <div class="form-row"><label for="f-msg">${T('Messaggio', 'Message')}</label><textarea id="f-msg" name="message" required></textarea></div>
        <div class="h-captcha" data-sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" style="margin-bottom:16px"></div>
        <button class="btn primary" type="submit">${T('Invia', 'Send')} &rarr;</button>
        <p id="form-status" class="form-status" role="status"></p>
      </form>
    </div>
  </div>
</section>

<div class="band-rust center">
  <div class="wrap"><p class="big">${T('Non è solo un concerto: è un\'esperienza completa per dare valore all\'ascolto.', 'Not just a show: a complete experience that gives value to listening.')}</p></div>
</div>

</main>
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>`;

  return head() + '\n' + header() + '\n' + pages[page]() + '\n' + footer();
}

// ------------------------------------------------------------ write
const write = (rel, content) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
for (const lang of ['it', 'en']) {
  for (const page of ['home', ...ORDER]) {
    const file = (lang === 'en' ? 'en/' : '') + (page === 'home' ? 'index' : SLUG[page][lang]) + '.html';
    write(file, build(lang, page));
  }
}

// Old pages become tiny redirects to their new homes (GitHub Pages has no server redirects).
const OLD = { about: 'listening-is-loving', shows: 'live', video: 'musica', epk: 'booking-press', press: 'booking-press', contact: 'booking-press', marasma: 'musica' };
for (const [from, to] of Object.entries(OLD)) {
  write(from + '.html', `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mocked Monkey</title>
<meta name="robots" content="noindex">
${VALID_COPY ? '' : `<link rel="canonical" href="${BASE}/${to}">`}
<meta http-equiv="refresh" content="0; url=${to}">
</head><body><p><a href="${to}">Mocked Monkey</a></p></body></html>
`);
}

// robots + sitemap
if (VALID_COPY) {
  write('robots.txt', 'User-agent: *\nDisallow: /\n');
  write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n');
} else {
  const urls = ['', ...ORDER.map(k => SLUG[k].it), 'en/', ...ORDER.map(k => 'en/' + SLUG[k].en)];
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
  write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => `  <url><loc>${BASE}/${u}</loc></url>`).join('\n') + '\n</urlset>\n');
}
console.log('built');

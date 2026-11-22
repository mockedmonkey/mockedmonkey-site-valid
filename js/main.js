(function () {
  'use strict';

  var LANG = document.documentElement.lang === 'en' ? 'en' : 'it';
  var TYPES = {
    live:    { it: 'Live',      en: 'Live' },
    contest: { it: 'Contest',   en: 'Contest' },
    studio:  { it: 'In studio', en: 'Studio' },
    video:   { it: 'Video',     en: 'Video' },
    open:    { it: 'Open mic',  en: 'Open mic' },
    festival:{ it: 'Festival',  en: 'Festival' },
    select:  { it: 'Selezione', en: 'Selection' },
    session: { it: 'Session',   en: 'Session' },
    busking: { it: 'Busking',   en: 'Busking' }
  };
  var STR = {
    info: { it: 'Info', en: 'Info' },
    map: { it: 'Apri in Google Maps', en: 'Open in Google Maps' },
    empty: { it: 'Nessun appuntamento di questo tipo, per ora. Segui Instagram per le prossime date.', en: 'Nothing of this kind on the calendar yet. Follow Instagram for the next dates.' },
    sending: { it: 'Invio in corso...', en: 'Sending...' },
    sent: { it: 'Messaggio inviato. Grazie, ti risponde Alessandro.', en: 'Message sent. Thanks, Alessandro will answer.' },
    fail: { it: 'Qualcosa non ha funzionato. Riprova o scrivi a mockedmonkey@proton.me.', en: 'Something went wrong. Please try again or email mockedmonkey@proton.me.' },
    net: { it: 'Errore di rete. Riprova o scrivi a mockedmonkey@proton.me.', en: 'Network error. Please try again or email mockedmonkey@proton.me.' }
  };
  function tr(v) { return (v && typeof v === 'object') ? (v[LANG] || v.it || v.en || '') : (v || ''); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayOf(ev) { return String(ev.date).slice(0, 10); }
  function isFuture(ev, today) { return (ev.expires || dayOf(ev)) >= today; }

  document.addEventListener('DOMContentLoaded', function () {
    // Remember the chosen language.
    try {
      localStorage.setItem('mm-lang', LANG);
    } catch (e) {}
    document.querySelectorAll('a[data-lang-switch]').forEach(function (a) {
      a.addEventListener('click', function () {
        try { localStorage.setItem('mm-lang', a.getAttribute('data-lang-switch')); } catch (e) {}
      });
    });
    // Mobile menu
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Back to top
    var top = document.querySelector('.to-top');
    if (top) {
      var onScroll = function () { top.classList.toggle('show', window.scrollY > 500); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      top.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
    }

    // YouTube: load the player only on click
    document.querySelectorAll('.yt[data-yt]').forEach(function (box) {
      var id = box.getAttribute('data-yt');
      var btn = box.querySelector('button');
      if (!btn) return;
      btn.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
      btn.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        f.title = box.getAttribute('data-title') || 'Video';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.setAttribute('allowfullscreen', '');
        box.innerHTML = '';
        box.appendChild(f);
      });
    });

    // Calendar data: next-date bar, home teaser, live calendar, past shows
    var jsonUrl = document.body.getAttribute('data-events');
    if (jsonUrl) {
      fetch(jsonUrl).then(function (r) { return r.ok ? r.json() : { events: [], past: [] }; }).then(function (data) {
        var today = todayISO();
        var all = (data.events || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
        var upcoming = all.filter(function (e) { return isFuture(e, today); });

        // 1. Next-date bar
        var bar = document.querySelector('.datebar');
        if (bar) {
          var next = upcoming.filter(function (e) { return e.bar !== false; })[0];
          if (next) {
            bar.querySelector('.when').textContent = next.displayDate;
            bar.querySelector('.what').textContent = tr(next.title) + ' →';
            bar.hidden = false;
          } else {
            bar.hidden = true;
          }
        }

        function row(e) {
          var mapQ = encodeURIComponent(tr(e.title));
          var map = e.mapUrl || ('https://www.google.com/maps/search/?api=1&query=' + mapQ);
          var links = '';
          if (e.link) links += '<a href="' + esc(e.link) + '" target="_blank" rel="noopener">' + esc(tr(e.linkLabel) || STR.info[LANG]) + ' →</a>';
          if (e.venue) links += '<a class="map" href="' + esc(map) + '" target="_blank" rel="noopener" aria-label="' + STR.map[LANG] + '" title="' + STR.map[LANG] + '">📍</a>';
          return '<li class="event" data-type="' + esc(e.type) + '">' +
            '<span class="date">' + esc(e.displayDate) + '</span>' +
            '<span class="type">' + esc(tr(TYPES[e.type])) + '</span>' +
            '<span class="title">' + esc(tr(e.title)) + '<span class="note">' + esc(tr(e.note)) + '</span></span>' +
            '<span class="links">' + links + '</span></li>';
        }

        // 2. Home: first three
        var home = document.getElementById('home-events');
        if (home) {
          home.innerHTML = upcoming.slice(0, 3).map(row).join('') || '<li class="events-empty">' + STR.empty[LANG] + '</li>';
        }

        // 3. Live page calendar + filter
        var cal = document.getElementById('calendar');
        if (cal) {
          var render = function (filter) {
            var list = upcoming.filter(function (e) { return filter === 'all' || e.type === filter; });
            cal.innerHTML = list.map(row).join('') || '<li class="events-empty">' + STR.empty[LANG] + '</li>';
          };
          render('all');
          document.querySelectorAll('.filters button').forEach(function (b) {
            b.addEventListener('click', function () {
              document.querySelectorAll('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
              b.setAttribute('aria-pressed', 'true');
              render(b.getAttribute('data-filter'));
            });
          });

          // Structured data for real, dated events
          var graph = upcoming.filter(function (e) { return e.venue && /^\d{4}-\d{2}-\d{2}$/.test(e.date); }).map(function (e) {
            return {
              '@type': 'MusicEvent',
              name: tr(e.title) + ', Mocked Monkey',
              startDate: e.date,
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: e.locality, addressCountry: 'IT' } },
              performer: { '@type': 'MusicGroup', name: 'Mocked Monkey' }
            };
          });
          if (graph.length) {
            var ld = document.createElement('script');
            ld.type = 'application/ld+json';
            ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
            document.head.appendChild(ld);
          }
        }

        // 4. Past shows (history), including events whose date has passed
        var pastEl = document.getElementById('past-list');
        if (pastEl) {
          var moved = all.filter(function (e) { return !isFuture(e, today) && (e.type === 'live' || e.type === 'contest'); })
            .reverse().map(function (e) {
              var p = e.date.slice(5, 7) + '.' + e.date.slice(0, 4);
              return { when: p, type: e.type, place: e.title, note: e.note };
            });
          var past = moved.concat(data.past || []);
          if (pastEl) {
            pastEl.innerHTML = past.map(function (p) {
              var city = tr(p.city);
              var note = tr(p.note);
              return '<li><span class="when">' + esc(p.when) + '</span><span class="kind">' + esc(tr(TYPES[p.type])) + '</span>' +
                '<span class="where">' + esc(tr(p.place)) + (city ? ' <small>' + esc(city) + '</small>' : '') + (note ? '<em>' + esc(note) + '</em>' : '') + '</span></li>';
            }).join('');
          }
        }
      }).catch(function () {
        var bar = document.querySelector('.datebar');
        if (bar) bar.hidden = true;
      });
    }

    // Contact form (Web3Forms)
    var form = document.getElementById('contact-form');
    if (form) {
      var status = document.getElementById('form-status');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var kind = form.querySelector('[name="request_type"]');
        var data = new FormData(form);
        data.set('subject', '[' + (kind ? kind.value : 'Contatto') + '] mockedmonkey.com');
        btn.disabled = true;
        status.textContent = STR.sending[LANG];
        fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' }, body: data })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.success) { status.textContent = STR.sent[LANG]; form.reset(); }
            else { status.textContent = STR.fail[LANG]; }
          })
          .catch(function () { status.textContent = STR.net[LANG]; })
          .then(function () { btn.disabled = false; });
      });
    }
  });
})();

/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'sm-calzature', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['09:30', '12:30'], ['15:30', '19:30']],
      2: [['09:15', '12:30'], ['15:30', '19:30']],
      3: [['09:15', '12:30'], ['15:30', '19:30']],
      4: [['09:15', '12:30'], ['15:30', '19:30']],
      5: [['09:15', '12:30'], ['15:30', '19:30']],
      6: [['09:15', '12:30'], ['15:30', '19:00']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 2700,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.fascia": "S&M Calzature · Viale Ca' Granda 2, Milan",
      "i.eti": "Boxes up to the ceiling",
      "i.t": "The right size.",
      "i.skip": "Skip",
      "m.top": "S&M Calzature, back to the top",
      "m.sub": "Sammataro Massimo & C. · Viale Ca' Granda 2, Milan",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.bambino": "Kids",
      "n.donna": "Women",
      "n.uomo": "Men",
      "n.famiglia": "The family",
      "n.recensioni": "Reviews",
      "n.orari": "Hours & where",
      "n.domande": "Questions",
      "n.chiama": "Call",
      "n.menu": "Open the menu",
      "h.eti": "S&M Calzature",
      "h.occhiello": "Shoes · men · women · kids · Viale Ca' Granda 2, Milan Niguarda",
      "h.t": "The right size.",
      "h.p": "Inside, the boxes go up to the ceiling. Your size is in one of them, and we go and get it: patiently, until the shoe fits the way it should. Men, women, kids.",
      "h.chiama": "Call 02 647 1580",
      "h.cell": "Mobile 347 3484414",
      "h.indicazioni": "Directions",
      "h.badge": "<b>4.7 on Google</b> with 13 reviews · professionalism and courtesy in four texts out of seven",
      "h.zoom": "Enlarge the photo of the interior",
      "h.alt": "Inside S&M Calzature: walls of shoe boxes up to the ceiling and the counter",
      "h.fig": "inside: boxes up to the ceiling (photo sphere from the Google listing)",
      "b.eti": "Kids",
      "b.t": "The first pair, and all the ones after.",
      "b.p1": "Children's feet change size fast. Here they get measured and fitted sitting down, calmly, until the shoe fits the way it should: no rush, no buying by eye.",
      "b.p2": "The kids' window is the first one you see from the avenue: school shoes, sneakers, boots for winter.",
      "b.mn": "In the kids' window",
      "b.c1t": "Measure, don't remember",
      "b.c1p": "Last year's size no longer counts: it gets measured every time.",
      "b.c2t": "Try them standing",
      "b.c2p": "With the right sock and walking: the shoe must hold the heel and leave room at the front.",
      "b.c3t": "Ask before you come",
      "b.c3p": "If you are after a precise model and size, a phone call saves a wasted trip.",
      "b.zoom": "Enlarge the photo of the entrance",
      "b.alt": "The shop entrance: the chairs for trying on and the wall of children's shoes",
      "b.fig": "the entrance, the chairs for trying on and the kids' wall (photo sphere from the Google listing)",
      "d.eti": "Women",
      "d.t": "Ankle boots, pumps, sneakers.",
      "d.p1": "The windows change with the season: leather boots and ankle boots, pumps, sneakers and comfortable shoes for every day. And the bags, on the shelf next to the counter.",
      "d.mn": "On our door and in the windows",
      "d.p2": "The right size is found together: tell us how you wear it and what you need it for, and you try until it's the one.",
      "d.zoom": "Enlarge the photo of the boots",
      "d.alt": "Leather boots on the displays and green shoe boxes on the shelves",
      "d.fig": "the boots and the green boxes, inside (photo sphere from the Google listing)",
      "u.eti": "Men",
      "u.t": "From the classic shoe to the boot.",
      "u.p1": "Classic leather shoes, sneakers, suede chukka boots, waterproof boots for winter.",
      "u.mn": "In our windows",
      "u.p2": "The same rule applies to men: first you try, then you buy. If you are after an unusual size, call first: we'll tell you if we have it.",
      "u.zoom": "Enlarge the photo of the boxes behind the window",
      "u.alt": "Shoe boxes stacked behind the shop window, with the ladder to reach them",
      "u.fig": "the boxes behind the window, with the ladder (photo sphere from the Google listing)",
      "f.eti": "The family",
      "f.t": "S&M stands for Sammataro Massimo, & C.",
      "f.p1": "The name on the door is the initials of the people who work here. The shop is a family one, father and son behind the counter, and the customers write it.",
      "f.cit": "«A very patient owner»",
      "f.cit2": "from a Google review",
      "f.p2": "Seven reviews with a text, counted: professionalism and courtesy in four, the family in three, patience in two. One customer, in 2023, also counted the years in business: fifty-six.",
      "f.k1": "mention professionalism and courtesy",
      "f.k2": "mention the family",
      "f.k3": "mention patience",
      "f.kn": "counted on the 7 Google reviews with a text, September 2026",
      "f.zoom": "Enlarge the photo of the sofas",
      "f.alt": "The black sofas for trying on shoes, in front of the wall of children's shoes",
      "f.fig": "the sofas for trying on, inside (photo from the Google listing)",
      "r.eti": "Reviews",
      "r.t": "In the customers' words.",
      "r.p": "Five Google reviews, as they were written.",
      "r.voto": "out of 5 · 13 Google reviews",
      "r.s5": "5 stars",
      "r.s4": "4 stars",
      "r.1": "Very patient owner and well-made items at reasonable prices. No wonder 56 years in business have forged experience and professionalism, my most heartfelt compliments.",
      "r.f1": "Vincenzo Russi · 3 years ago · 5 stars",
      "r.2": "Very good quality shoes at reasonable prices, the owners are good people, polite and patient, I'll be back, recommended",
      "r.f2": "Ramon Barni · a year ago · 5 stars",
      "r.3": "Great cobbler, I'm giving you this vote only because your son is great!!!",
      "r.f3": "Thomas Corbellari · 4 years ago · 5 stars",
      "r.4": "Shoes for men, women and children: in a family atmosphere, impeccable service and courtesy",
      "r.f4": "simon luca grassi · 6 years ago · 4 stars",
      "r.5": "Professionalism and excellent customer service!",
      "r.f5": "Carlo Cittadino · 3 years ago · 5 stars",
      "o.eti": "Hours & where",
      "o.t": "Mondays at 9:30.",
      "o.p": "Tuesday to Saturday we open at 9:15; on Mondays a quarter of an hour later, at 9:30. Afternoons from 15:30 to 19:30, Saturdays until 19:00. Closed on Sundays.",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso": "closed",
      "o.nota1": "from 9:30",
      "o.nota6": "until 19:00",
      "o.feste": "Around holidays and in summer, better to call first.",
      "o.ind": "Address",
      "o.indv": "Viale Ca' Granda 2, 20162 Milan (Niguarda), on the corner of the avenue",
      "o.tel": "Phone",
      "o.cell": "Mobile",
      "o.cellv": "call or send a message",
      "o.btn": "Directions",
      "o.zoom": "Enlarge the photo of the door",
      "o.alt": "The shop's red door, with the brand names on the glass",
      "o.fig": "our door, with the brands on the glass (photo sphere from the Google listing)",
      "o.mappa": "Map: S&M Calzature, Viale Ca' Granda 2, Milan",
      "q.eti": "Questions",
      "q.t": "Before you come.",
      "q.1t": "Do you have my size?",
      "q.1p": "Call us or message the mobile before dropping by: we'll tell you whether the model and size you want are in. The boxes are many, but not infinite.",
      "q.2t": "Do you sell children's shoes?",
      "q.2p": "Yes: the kids' window is the first one you see from the avenue. Primigi, Lelli Kelly, Bull Boys, Geox, and a calm fitting, sitting down.",
      "q.3t": "Which brands do you carry?",
      "q.3p": "The ones on our door and in the windows: Tamaris, Primigi, Melluso, Igi&Co, Geox, Lelli Kelly, Bull Boys, Lumberjack. They change with the seasons: ask.",
      "q.4t": "Are you open on Mondays?",
      "q.4p": "Yes. On Monday mornings we open at 9:30 instead of 9:15; the afternoon is as usual, from 15:30 to 19:30.",
      "q.5t": "And on Saturdays?",
      "q.5p": "All day: 9:15–12:30 and 15:30–19:00. On Sundays we are closed.",
      "q.6t": "How do I contact you?",
      "q.6p": "Phone 02 647 1580, mobile 347 3484414. We have no public email address.",
      "q.7t": "What does S&M mean?",
      "q.7p": "They are the initials of the person who put the name on the door: Sammataro Massimo, & C. The shop is a family one.",
      "p.1": "Sammataro Massimo & C. S.a.s. · shoes for men, women and children · Mon 9:30–12:30 and 15:30–19:30 · Tue–Fri 9:15–12:30 and 15:30–19:30 · Sat 9:15–12:30 and 15:30–19:00 · Sun closed",
      "p.3": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts and hours from the business's Google listing and Instagram profile, public reviews on Google (September 2026); photographs from the Google listing (photo spheres and owner's photos).",
      "a.nav": "Quick actions",
      "a.chiama": "Call",
      "a.cell": "Mobile",
      "a.orari": "Hours",
      "a.mappa": "Map"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «la scatola che si sfila» (#197 S&M Calzature) ──
  // Stato finale nel CSS: ogni [data-scatola] ha il fronte fuori dalla parete e il contenuto visibile.
  // Con GSAP il JS rimette le scatole nella parete (data-stato=nella-parete) e le sfila quando entrano (si-sfila → aperta).
  // L'intro e l'hero sono manuali (data-scatola-manuale): l'hero si sfila in bespokeHeroEntrance, dopo l'intro.
  var scatoleVive = hasGsap && hasST && !reducedMotion;
  var scatole = Array.prototype.slice.call(document.querySelectorAll('[data-scatola]'));
  var nellaParete = function (el) {
    var f = el.querySelector('.scatola__fronte'), d = el.querySelector('.scatola__dentro');
    if (!f || !d) return;
    gsap.set(f, { z: -320, rotateY: -14, x: -40, opacity: .55, transformOrigin: '0% 50%' });
    gsap.set(d, { opacity: 0, y: 28 });
    el.setAttribute('data-stato', 'nella-parete');
  };
  var sfila = function (el, subito) {
    var f = el.querySelector('.scatola__fronte'), d = el.querySelector('.scatola__dentro');
    if (!f || !d) { el.setAttribute('data-stato', 'aperta'); return; }
    if (subito || !hasGsap) { if (hasGsap) gsap.set([f, d], { clearProps: 'all' }); el.setAttribute('data-stato', 'aperta'); return; }
    if (el.getAttribute('data-stato') !== 'nella-parete') return;
    el.setAttribute('data-stato', 'si-sfila');
    var tl = gsap.timeline({ onComplete: function () { gsap.set([f, d], { clearProps: 'all' }); el.setAttribute('data-stato', 'aperta'); } });
    tl.to(f, { z: 0, rotateY: 0, x: 0, opacity: 1, duration: .8, ease: 'power3.out' }, 0);
    tl.to(d, { opacity: 1, y: 0, duration: .7, ease: 'power2.out' }, .35);
  };
  if (scatoleVive) {
    scatole.forEach(nellaParete);
    scatole.filter(function (el) { return !el.hasAttribute('data-scatola-manuale'); }).forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: function () { sfila(el); } });
    });
    setTimeout(function () { scatole.forEach(function (el) { if (el.getAttribute('data-stato') === 'nella-parete' && !el.hasAttribute('data-scatola-manuale')) sfila(el, true); }); }, 9000); // rete di sicurezza
  } else {
    scatole.forEach(function (el) { sfila(el, true); });
  }
  // l'intro: la parete si riempie di scatole e la scatola S&M si sfila
  var introEl = document.getElementById('intro');
  if (introEl && scatoleVive) {
    var boxes = introEl.querySelectorAll('.intro__box'), grande = introEl.querySelector('.intro__scatola');
    gsap.set(boxes, { opacity: 0, scale: .6 });
    gsap.set(grande, { z: -700, opacity: 0, rotateY: -18, transformOrigin: '0% 50%' });
    var it = gsap.timeline();
    it.to(boxes, { opacity: 1, scale: 1, duration: .45, stagger: { each: .03, from: 'random' }, ease: 'back.out(1.5)' }, 0);
    it.to(grande, { z: 0, opacity: 1, rotateY: 0, duration: .9, ease: 'power3.out' }, .7);
  }
  window.bespokeHeroEntrance = function () {
    var hero = document.getElementById('heroScatola');
    if (!hero) return;
    if (!scatoleVive) { sfila(hero, true); return; }
    sfila(hero);
    gsap.from(['.apertura__occhiello', '.apertura__p', '.apertura__stato', '.apertura__azioni', '.apertura__badge'], { opacity: 0, y: 16, duration: .6, stagger: .08, delay: .5, ease: 'power2.out', clearProps: 'all' });
  };
})();

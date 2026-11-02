/* Ce qui fait vivre les pages d'Elka Hypnose, en dehors de l'intro :
   statut « Joignable maintenant », statuts des ateliers, chemin du suivi et graines qui germent,
   images des étapes, frise du parcours, carte de l'Auxois, révélation et parallaxe des images,
   boutons magnétiques, images inclinées au survol, FAQ animée, filet de l'en-tête.
   Aucune lecture de mise en page pendant le défilement : tout est mesuré au chargement et au redimensionnement. */
import { etat, quand, rafraichir } from './socle/index.js?v=1';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const html = document.documentElement;
const anime = () => !etat.calme && !html.classList.contains('secours') && etat.arrivee !== 'retour';

/* ---------- Heure de Paris, jours fériés ---------- */
const JOURS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export function maintenantParis() {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour % 24) * 60 + +p.minute, jour: JOURS[p.weekday] };
}
const ajouterJours = (iso, n) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10); };
function paques(a) {
  const b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4, g = Math.floor((c + 8) / 25), h = Math.floor((c - g + 1) / 3);
  const i = (19 * b + c - e - h + 15) % 30, k = Math.floor(d / 4), l = d % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * i + 22 * m) / 451);
  const mois = Math.floor((i + m - 7 * n + 114) / 31), jour = ((i + m - 7 * n + 114) % 31) + 1;
  return `${a}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}
function feries(a) {
  const p = paques(a);
  return new Set([`${a}-01-01`, ajouterJours(p, 1), `${a}-05-01`, `${a}-05-08`, ajouterJours(p, 39), ajouterJours(p, 50), `${a}-07-14`, `${a}-08-15`, `${a}-11-01`, `${a}-11-11`, `${a}-12-25`]);
}
const enMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const heureTexte = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`; };

/* ---------- Statut « Joignable maintenant » ---------- */
function statuts() {
  document.querySelectorAll('[data-statut]').forEach((el) => {
    let H, T;
    try { H = JSON.parse(el.dataset.horairesJson); T = JSON.parse(el.dataset.textes); } catch { return; }
    const texte = el.querySelector('[data-statut-texte]');
    const maj = () => {
      const now = maintenantParis();
      const annee = +now.iso.slice(0, 4);
      const ferie = (iso) => feries(+iso.slice(0, 4)).has(iso) || feries(annee).has(iso);
      const fermeture = (iso) => (H.fermetures || []).some((f) => iso >= f.du && iso <= (f.au || f.du));
      const jour = (n) => H.jours.find((j) => j.j === n) || { plages: [] };
      /* Sans horaires fiables pour la journée (jour férié, fermeture), aucun statut n'est affiché. */
      if (ferie(now.iso)) { el.dataset.etat = 'inconnu'; texte.textContent = T.ferie; return; }
      if (fermeture(now.iso)) { el.dataset.etat = 'ferme'; texte.textContent = T.fermeture; return; }
      const ouvert = jour(now.jour).plages.some(([d, f]) => now.minutes >= enMinutes(d) && now.minutes < enMinutes(f));
      if (ouvert) { el.dataset.etat = 'ouvert'; texte.textContent = T.ouvert; return; }
      /* Prochaine ouverture : plus tard aujourd'hui, ou le prochain jour ouvert sans incertitude. */
      let quand = '';
      const plus = jour(now.jour).plages.find(([d]) => enMinutes(d) > now.minutes);
      if (plus) quand = T.aujourdhui.replace('{h}', heureTexte(plus[0]));
      else {
        for (let i = 1; i <= 14 && !quand; i++) {
          const iso = ajouterJours(now.iso, i), j = jour((now.jour + i) % 7);
          if (ferie(iso) || fermeture(iso)) break;
          if (!j.plages.length) continue;
          const h = heureTexte(j.plages[0][0]);
          quand = i === 1 ? T.demain.replace('{h}', h) : T.jour.replace('{jour}', j.nom.toLowerCase()).replace('{h}', h);
        }
      }
      el.dataset.etat = 'ferme';
      texte.textContent = quand ? `${T.ferme} · ${T.rouvre.replace('{quand}', quand)}` : T.ferme;
    };
    maj();
    setInterval(maj, 60000);
  });
  /* Ligne du jour dans les tableaux d'horaires. */
  document.querySelectorAll('[data-horaires]').forEach((t) => {
    const now = maintenantParis();
    const ligne = t.querySelector(`tr[data-jour="${now.jour}"]`);
    if (!ligne) return;
    ligne.classList.add('aujourdhui');
    const lib = document.createElement('span');
    lib.className = 'horaires-aujourdhui';
    lib.textContent = t.dataset.aujourdhui || '';
    ligne.querySelector('th').append(' ', lib);
  });
}

/* ---------- Ateliers : statuts recalculés à la date du jour, rangés (en cours, à venir, terminés) ---------- */
function ateliers() {
  const liste = document.querySelector('[data-ateliers]');
  if (!liste) return;
  let T;
  try { T = JSON.parse(liste.dataset.textes); } catch { return; }
  const now = maintenantParis();
  const rang = { encours: 0, avenir: 1, termine: 2 };
  const cartes = [...liste.querySelectorAll('[data-atelier]')].map((li) => {
    const a = JSON.parse(li.dataset.atelier);
    const passee = (j) => j < now.iso || (j === now.iso && now.minutes >= enMinutes(a.fin));
    const commencee = (j) => j < now.iso || (j === now.iso && now.minutes >= enMinutes(a.debut));
    const n = a.seances.filter(passee).length;
    let e = 'avenir', rel = '';
    if (n === a.seances.length) e = 'termine';
    else if (commencee(a.seances[0])) { e = 'encours'; rel = n === 1 ? T.passee1 : T.passees.replace('{n}', n); }
    else {
      const jours = Math.round((Date.parse(a.seances[0]) - Date.parse(now.iso)) / 864e5);
      rel = jours === 0 ? T.aujourdhui : jours === 1 ? T.demain : T.dans.replace('{n}', jours);
    }
    li.dataset.etat = e;
    li.querySelector('[data-atelier-etiquette]').textContent = e === 'avenir' ? T.aVenir : e === 'encours' ? T.enCours : T.termine;
    li.querySelector('[data-atelier-relatif]').textContent = rel;
    li.querySelectorAll('[data-seance]').forEach((s) => s.classList.toggle('passee', passee(s.dataset.seance)));
    return { li, e, debut: a.seances[0] };
  });
  /* Rangement : on déplace les cartes existantes, sans jamais les dupliquer. */
  cartes.sort((x, y) => rang[x.e] - rang[y.e] || x.debut.localeCompare(y.debut)).forEach(({ li }) => liste.appendChild(li));
  const autre = liste.querySelector('[data-atelier-autre]');
  if (autre) liste.appendChild(autre);
}

/* ---------- Chemin du suivi : sentier qui se trace au défilement, graines qui germent ---------- */
function chemins() {
  document.querySelectorAll('[data-chemin]').forEach((zone) => {
    const svg = zone.querySelector('.chemin-trace');
    const fond = svg && svg.querySelector('.chemin-fond');
    const ligne = svg && svg.querySelector('.chemin-ligne');
    const etapes = [...zone.querySelectorAll('.chemin-etape')];
    if (!ligne || !etapes.length) return;
    let seuils = [], longueur = 1, st = null;
    const germer = (p) => etapes.forEach((e, i) => { if (p >= seuils[i]) e.classList.add('germe'); });
    const mesurer = () => {
      const zr = zone.getBoundingClientRect();
      const pts = etapes.map((e) => { const g = e.querySelector('.graine').getBoundingClientRect(); return { x: g.left + g.width / 2 - zr.left, y: g.top + g.height / 2 - zr.top }; });
      const H = Math.max(1, zone.offsetHeight);
      svg.setAttribute('viewBox', `0 0 ${svg.clientWidth || 64} ${H}`);
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = b.y - a.y;
        d += ` C${(a.x + 18).toFixed(1)} ${(a.y + dy * 0.35).toFixed(1)} ${(b.x - 18).toFixed(1)} ${(a.y + dy * 0.65).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      fond.setAttribute('d', d); ligne.setAttribute('d', d);
      longueur = ligne.getTotalLength() || 1;
      const total = pts[pts.length - 1].y - pts[0].y || 1;
      seuils = pts.map((p) => (p.y - pts[0].y) / total - 0.02);
      ligne.style.strokeDasharray = `${longueur}`;
      if (!anime()) { ligne.style.strokeDashoffset = '0'; etapes.forEach((e) => e.classList.add('germe')); }
      else ligne.style.strokeDashoffset = `${longueur * (1 - (st ? st.progress : 0))}`;
    };
    mesurer();
    let rz = 0;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { mesurer(); rafraichir(); }, 150); });
    if (document.fonts) document.fonts.ready.then(mesurer);
    quand('rafraichi', mesurer);
    if (!anime() || !ST) return;
    st = ST.create({
      trigger: zone, start: 'top 72%', end: 'bottom 62%', scrub: 0.6,
      onUpdate: (s) => { ligne.style.strokeDashoffset = `${longueur * (1 - s.progress)}`; germer(s.progress); },
    });
  });

  /* Page du suivi : l'image de l'étape lue s'ouvre dans l'arche. */
  const images = document.querySelectorAll('[data-etape-image]');
  if (images.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = e.target.dataset.etape;
      images.forEach((im) => im.classList.toggle('active', im.dataset.etapeImage === i));
    }), { rootMargin: '-40% 0px -45% 0px' });
    document.querySelectorAll('.chemin-etapes--detail [data-etape]').forEach((e) => io.observe(e));
  }
}

/* ---------- Frise du parcours : la ligne se trace pendant la lecture ---------- */
function frise() {
  const zone = document.querySelector('[data-frise]');
  const ligne = zone && zone.querySelector('[data-frise-ligne]');
  if (!ligne || !anime() || !gsap || !ST) return;
  gsap.fromTo(ligne, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: zone, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });
}

/* ---------- Carte : villes, distances et cabinet apparaissent quand la carte arrive ---------- */
function cartes() {
  const liste = document.querySelectorAll('[data-carte]');
  if (!liste.length) return;
  if (!anime()) { liste.forEach((c) => c.classList.add('vue')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vue'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -15% 0px' });
  liste.forEach((c) => io.observe(c));
}

/* ---------- Images : révélées à l'arrivée, légère parallaxe ---------- */
export const IMAGES_REVELEES = '.rencontre-portrait, .chemin-media, .parcours-media, .ateliers-media, .article-media, .venir-media, .lieu-media, .enfants-media, .cadre-media, .faq-media, .fin-media, .tarifs-media, .conditions-media, .horaires-media, .acces-media, .rappel-media, .carte-accompagnement-media';
function images() {
  const figures = [...document.querySelectorAll(IMAGES_REVELEES)];
  if (!figures.length || !gsap) return;
  if (!anime()) { figures.forEach((f) => { f.style.clipPath = 'none'; }); return; }
  const reveler = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      gsap.fromTo(e.target, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out', onComplete: () => { e.target.style.clipPath = 'none'; } });
    }), { rootMargin: '0px 0px -8% 0px' });
    figures.forEach((f) => io.observe(f));
  };
  if (etat.pret) reveler(); else quand('pret', reveler);
  if (!ST) return;
  const petit = matchMedia('(max-width: 760px)').matches;
  figures.forEach((f) => {
    const img = f.querySelector('img');
    if (!img) return;
    const amp = petit ? 3 : 5;
    gsap.set(img, { scale: 1 + (amp * 2 + 2) / 100 });
    gsap.fromTo(img, { yPercent: -amp }, { yPercent: amp, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------- Micro-interactions (souris seulement) ---------- */
function interactions() {
  const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!gsap || etat.calme || !souris) return;
  /* Boutons magnétiques : ils suivent légèrement le pointeur. */
  document.querySelectorAll('[data-magnetique]').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.45, ease: 'power3.out' });
    const y = gsap.quickTo(b, 'y', { duration: 0.45, ease: 'power3.out' });
    let r = null;
    b.addEventListener('pointerenter', () => { r = b.getBoundingClientRect(); });
    b.addEventListener('pointermove', (e) => {
      if (!r) return;
      x(Math.max(-8, Math.min(8, (e.clientX - r.left - r.width / 2) * 0.2)));
      y(Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) * 0.3)));
    });
    b.addEventListener('pointerleave', () => { x(0); y(0); r = null; });
  });
  /* Images des accompagnements inclinées en 3D au survol. */
  document.querySelectorAll('[data-incline]').forEach((carte) => {
    const cible = carte.querySelector('.media');
    if (!cible) return;
    gsap.set(cible, { transformPerspective: 700 });
    const rx = gsap.quickTo(cible, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(cible, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    let r = null;
    carte.addEventListener('pointerenter', () => { r = cible.getBoundingClientRect(); });
    carte.addEventListener('pointermove', (e) => {
      if (!r) return;
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    carte.addEventListener('pointerleave', () => { rx(0); ry(0); r = null; });
  });
}

/* ---------- FAQ : ouverture et fermeture animées ---------- */
function faq() {
  if (!gsap) return;
  document.querySelectorAll('.faq-item').forEach((d) => {
    const s = d.querySelector('summary'), rep = d.querySelector('.faq-reponse');
    if (!s || !rep) return;
    s.addEventListener('click', (e) => {
      if (etat.calme) return;
      e.preventDefault();
      gsap.killTweensOf(rep);
      if (d.open) {
        gsap.fromTo(rep, { height: rep.offsetHeight }, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(rep, { clearProps: 'height' }); rafraichir(); } });
      } else {
        d.open = true;
        gsap.fromTo(rep, { height: 0 }, { height: 'auto', duration: 0.45, ease: 'power2.out', onComplete: () => { gsap.set(rep, { clearProps: 'height' }); rafraichir(); } });
      }
    });
  });
}

/* ---------- En-tête : filet dès que la page a défilé ; sommaire des pages légales remis à zéro en haut ---------- */
function filetEntete() {
  let raf = 0, actif = null;
  const sommaire = document.querySelector('[data-sommaire]');
  const maj = () => {
    raf = 0;
    const a = window.scrollY > 12;
    if (a !== actif) { actif = a; html.classList.toggle('defile-un-peu', a); }
    if (sommaire && window.scrollY < 120) sommaire.querySelectorAll('[aria-current]').forEach((x) => x.removeAttribute('aria-current'));
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(maj); }, { passive: true });
  maj();
}

export function initVivant() {
  [statuts, ateliers, chemins, frise, cartes, images, interactions, faq, filetEntete].forEach((f) => {
    try { f(); } catch (err) { console.error('[elka]', f.name, err); }
  });
}

/* État final : tout est en place (retour arrière, mode calme, secours). */
export function etatFinalVivant() {
  document.querySelectorAll('.chemin-etape').forEach((e) => e.classList.add('germe'));
  document.querySelectorAll('[data-carte]').forEach((c) => c.classList.add('vue'));
  document.querySelectorAll(IMAGES_REVELEES).forEach((f) => { f.style.clipPath = 'none'; });
}

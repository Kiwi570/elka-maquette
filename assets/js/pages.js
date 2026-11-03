/* Effets des pages Ateliers et Mon parcours (et du prochain atelier sur l'accueil).
   Ateliers : portes des thèmes qui s'ouvrent, calendrier (filtre gardé dans l'adresse, séance choisie et son atelier),
   sablier lié à la lecture, quatre places qui s'allument.
   Mon parcours : phrase qui s'écrit, chemin parcouru (galerie horizontale épinglée sur ordinateur, glissée au doigt
   sur téléphone, plantes qui poussent), années qui s'impriment en cachets, photos du cabinet en pile qui s'étalent, visionneuse.
   Aucune lecture de mise en page pendant le défilement : positions mesurées au chargement et au redimensionnement. */
import { etat, quand, rafraichir, allerAncre, bloquerDefilement, debloquerDefilement, suivre, lacher } from './socle/index.js?v=2';
import { maintenantParis } from './vivant.js?v=2';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const html = document.documentElement;
const anime = () => !etat.calme && !html.classList.contains('secours') && etat.arrivee !== 'retour';
const enMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const echapper = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lire = (el, attr) => { try { return JSON.parse(el.getAttribute(attr)); } catch { return null; } };
/* Observe une fois l'arrivée d'éléments à l'écran. */
function aLArrivee(els, fn, marge = '0px 0px -18% 0px') {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), { rootMargin: marge });
  els.forEach((el) => io.observe(el));
}

/* ---------- Prochain atelier (premier écran des Ateliers, aperçu de l'accueil) ---------- */
function prochains() {
  document.querySelectorAll('[data-prochain]').forEach((el) => {
    const liste = lire(el, 'data-ateliers-json'), T = lire(el, 'data-textes');
    if (!liste || !T) return;
    const now = maintenantParis();
    const ouverts = liste.filter((a) => a.d0 > now.iso || (a.d0 === now.iso && now.minutes < enMinutes(a.debut))).sort((x, y) => x.d0.localeCompare(y.d0));
    el.textContent = ouverts.length ? T.prochain.replace('{theme}', ouverts[0].theme).replace('{date}', ouverts[0].date) : T.aucun;
  });
}

/* ---------- Ateliers : les portes des thèmes s'ouvrent ensemble, l'une après l'autre, à l'arrivée de la rangée ---------- */
function portes() {
  const liste = [...document.querySelectorAll('[data-porte]')];
  if (!liste.length) return;
  if (!anime()) { liste.forEach((p) => p.classList.add('ouverte')); return; }
  const rangee = liste[0].parentElement;
  const ouvrir = () => aLArrivee([rangee], () => liste.forEach((p, i) => setTimeout(() => p.classList.add('ouverte'), i * 200)), '0px 0px -25% 0px');
  if (etat.pret) ouvrir(); else quand('pret', ouvrir);
}

/* ---------- Ateliers : calendrier ---------- */
function calendrier() {
  const racine = document.querySelector('[data-calendrier]');
  if (!racine) return;
  const T = lire(racine, 'data-textes'), A = lire(racine, 'data-ateliers-json');
  if (!T || !A) return;
  const fiche = racine.querySelector('[data-cal-fiche]');
  const contenu = fiche.querySelector('[data-cal-fiche-contenu]');
  const placeFiche = fiche.parentElement;
  const boutons = [...racine.querySelectorAll('.graine-seance')];
  const filtres = [...racine.querySelectorAll('[data-filtre]')];
  const parId = Object.fromEntries(A.map((a) => [a.id, a]));
  const now = maintenantParis();
  const passee = (a, j) => j < now.iso || (j === now.iso && now.minutes >= enMinutes(a.fin));
  const statut = (a) => {
    const n = a.seances.filter((j) => passee(a, j)).length;
    if (n === 4) return { e: 'termine' };
    if (a.seances[0] < now.iso || (a.seances[0] === now.iso && now.minutes >= enMinutes(a.debut))) return { e: 'encours' };
    return { e: 'avenir', jours: Math.round((Date.parse(a.seances[0]) - Date.parse(now.iso)) / 864e5) };
  };
  const etroit = matchMedia('(max-width: 900px)');

  /* Jours passés, jour présent et séances passées, recalculés à la date du jour. */
  racine.querySelectorAll('.jour').forEach((li) => {
    li.classList.toggle('jour--passe', li.dataset.date < now.iso);
    li.classList.toggle('jour--aujourdhui', li.dataset.date === now.iso);
  });
  boutons.forEach((b) => { const a = parId[b.dataset.session]; b.classList.toggle('passee', passee(a, a.seances[b.dataset.n - 1])); });

  const nomJour = (iso) => T.joursLongs[(new Date(iso + 'T12:00:00Z').getUTCDay() + 6) % 7];
  function rendre(a, n) {
    const s = statut(a);
    const j = a.seances[n - 1];
    const rel = s.e === 'avenir' ? (s.jours === 0 ? T.aujourdhui : s.jours === 1 ? T.demain : T.dans.replace('{n}', s.jours).replace(/(\d) /g, '$1\u00a0')) : '';
    const etiquette = s.e === 'avenir' ? T.aVenir : s.e === 'encours' ? T.enCours : T.termine;
    const lien = (href, classe, texte) => `<a class="${classe}" href="${echapper(href)}" data-libelle="${echapper(T.libelleRdv)}">${echapper(texte)}</a>`;
    const action = s.e === 'avenir'
      ? lien(T.lienInscrire.replace('{id}', a.id), 'bouton bouton--petit', T.inscrire)
      : `<span class="atelier-ferme">${echapper(s.e === 'encours' ? T.ferme : T.termine)}</span> ${lien(T.lienProchain, 'bouton bouton--petit bouton--contour', T.prochain)}`;
    contenu.innerHTML = `<p class="cal-fiche-theme"><span class="cal-point" aria-hidden="true"></span>${echapper(a.theme)}</p>
      <p class="cal-fiche-seance">${echapper(T.seance.replace('{n}', n))}</p>
      <p class="cal-fiche-date">${echapper(T.detailDate.replace('{jour}', nomJour(j)).replace('{date}', a.dates[n - 1]))}</p>
      <p class="cal-fiche-heure">${echapper(T.detailHoraire.replace('{debut}', a.debutTexte).replace('{fin}', a.finTexte))}</p>
      <ol class="cal-fiche-graines" aria-hidden="true">${a.seances.map((x, i) => `<li class="${i + 1 === n ? 'ici' : ''}${passee(a, x) ? ' passee' : ''}"></li>`).join('')}</ol>
      <p class="cal-fiche-periode">${echapper(T.detailPeriode.replace('{d1}', a.dates[0]).replace('{d2}', a.dates[3]).replace('{jour}', a.jour))}</p>
      <p class="cal-fiche-statut"><span class="atelier-etiquette">${echapper(etiquette)}</span> ${echapper(rel)}</p>
      <p class="cal-fiche-action">${action}</p>`;
    fiche.className = `cal-fiche cal-fiche--${a.themeId}`;
  }

  /* La fiche suit la séance choisie : à côté du calendrier, ou sous le jour choisi sur petit écran. */
  function placer(b) {
    const cible = etroit.matches && b ? b.closest('.jour') : placeFiche;
    if (fiche.parentElement !== cible) cible.appendChild(fiche);
  }
  let choisi = null;
  function choisir(b, { calme = false } = {}) {
    if (!b) return;
    choisi = b;
    boutons.forEach((x) => { x.setAttribute('aria-pressed', String(x === b)); x.classList.toggle('liee', x !== b && x.dataset.session === b.dataset.session); });
    rendre(parId[b.dataset.session], +b.dataset.n);
    placer(b);
    if (!calme) rafraichir();
  }
  const visible = (b) => getComputedStyle(b).display !== 'none';
  /* Première séance d'un atelier encore ouvert, sinon première séance à venir. */
  function parDefaut(theme) {
    const ok = (b) => !theme || theme === 'tous' || b.dataset.theme === theme;
    const tries = boutons.filter(ok).sort((x, y) => (parId[x.dataset.session].seances[x.dataset.n - 1] + parId[x.dataset.session].debut).localeCompare(parId[y.dataset.session].seances[y.dataset.n - 1] + parId[y.dataset.session].debut));
    return tries.find((b) => b.dataset.n === '1' && statut(parId[b.dataset.session]).e === 'avenir') || tries.find((b) => !b.classList.contains('passee')) || tries[0];
  }

  function filtrer(theme, { adresse = true, animer = true } = {}) {
    if (!filtres.some((f) => f.dataset.filtre === theme)) theme = 'tous';
    racine.dataset.filtre = theme;
    filtres.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.filtre === theme)));
    racine.querySelectorAll('.jour--seance').forEach((li) => li.classList.toggle('jour--vide', ![...li.querySelectorAll('.graine-seance')].some((b) => theme === 'tous' || b.dataset.theme === theme)));
    if (adresse) {
      const u = new URL(location.href);
      if (theme === 'tous') u.searchParams.delete('theme'); else u.searchParams.set('theme', theme);
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    }
    if (animer && anime()) { racine.classList.remove('filtre-change'); void racine.offsetWidth; racine.classList.add('filtre-change'); }
    if (!choisi || !visible(choisi)) choisir(parDefaut(theme), { calme: true });
    rafraichir();
  }

  boutons.forEach((b) => b.addEventListener('click', () => choisir(b)));
  filtres.forEach((f) => f.addEventListener('click', () => filtrer(f.dataset.filtre)));
  document.querySelectorAll('[data-filtre-lien]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    filtrer(a.dataset.filtreLien);
    /* Le calendrier change de hauteur : on y va une fois les positions recalculées (sinon le recalcul arrête le défilement). */
    let fait = false;
    const y = () => { if (!fait) { fait = true; allerAncre('#calendrier'); } };
    window.addEventListener('socle:rafraichi', y, { once: true });
    setTimeout(y, 400);
  }));
  etroit.addEventListener('change', () => placer(choisi));

  const depart = boutons.find((b) => b.getAttribute('aria-pressed') === 'true');
  choisi = null;
  const theme = new URLSearchParams(location.search).get('theme') || 'tous';
  choisir(theme === 'tous' ? parDefaut() || depart : parDefaut(theme), { calme: true });
  filtrer(theme, { adresse: false, animer: false });
}

/* ---------- Ateliers : le sablier se vide pendant la lecture des quatre temps ---------- */
function sablier() {
  const zone = document.querySelector('[data-sablier-zone]');
  if (!zone) return;
  const haut = zone.querySelector('[data-sable-haut]'), bas = zone.querySelector('[data-sable-bas]'), filet = zone.querySelector('[data-sable-filet]');
  const moments = [...zone.querySelectorAll('[data-moment]')];
  const regler = (p) => {
    haut.setAttribute('y', (34 + 84 * p).toFixed(1)); haut.setAttribute('height', (88 - 84 * p).toFixed(1));
    bas.setAttribute('y', (206 - 84 * p).toFixed(1)); bas.setAttribute('height', (84 * p).toFixed(1));
    filet.style.opacity = p > 0.01 && p < 0.99 ? '1' : '0';
    filet.style.strokeDashoffset = String(-p * 260);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    moments.forEach((m) => m.classList.toggle('actif', m === e.target));
  }), { rootMargin: '-42% 0px -46% 0px' });
  moments.forEach((m) => io.observe(m));
  if (!anime() || !ST) { regler(1); return; }
  regler(0);
  ST.create({ trigger: zone.querySelector('.moments'), start: 'top 70%', end: 'bottom 55%', scrub: 0.5, onUpdate: (s) => regler(s.progress) });
}

/* ---------- Ateliers : quatre places qui s'allument une à une ---------- */
function places() {
  const el = document.querySelectorAll('[data-places]');
  if (!el.length) return;
  if (!anime()) { el.forEach((p) => p.classList.add('allumees')); return; }
  aLArrivee([...el], (p) => p.classList.add('allumees'), '0px 0px -25% 0px');
}

/* ---------- Mon parcours : la phrase s'écrit lettre à lettre ---------- */
function citation() {
  const p = document.querySelector('[data-citation] p');
  if (!p || !anime() || !gsap || !window.SplitText) return;
  const decoupe = new window.SplitText(p, { type: 'words,chars', charsClass: 'lettre' });
  gsap.set(decoupe.chars, { opacity: 0 });
  const jouer = () => aLArrivee([p], () => {
    gsap.to(decoupe.chars, { opacity: 1, duration: 0.2, stagger: 0.018, ease: 'none', onComplete: () => decoupe.revert() });
  }, '0px 0px -4% 0px');
  if (etat.pret) jouer(); else quand('pret', jouer);
}

/* ---------- Mon parcours : le chemin parcouru ---------- */
function sentier() {
  const section = document.querySelector('[data-sentier]');
  if (!section) return;
  const piste = section.querySelector('[data-sentier-piste]');
  const liste = section.querySelector('[data-sentier-liste]');
  const etapes = [...liste.querySelectorAll('[data-sentier-etape]')];
  const plantes = etapes.map((e) => e.querySelector('[data-plante]'));
  const progres = section.querySelector('[data-sentier-progres]');
  const region = { tabindex: piste.getAttribute('tabindex'), role: piste.getAttribute('role'), label: piste.getAttribute('aria-label') };
  const pousser = (i) => plantes[i] && plantes[i].classList.add('pousse');
  if (!anime()) { plantes.forEach((p) => p.classList.add('pousse')); return; }

  /* Téléphone, écran bas ou sans GSAP : la piste se glisse au doigt, les plantes poussent à leur arrivée. */
  const libre = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { pousser(etapes.indexOf(e.target)); io.unobserve(e.target); } }), { threshold: 0.6 });
    etapes.forEach((e) => io.observe(e));
    const maj = () => { const max = piste.scrollWidth - piste.clientWidth; if (progres) progres.style.transform = `scaleX(${max > 0 ? piste.scrollLeft / max : 1})`; };
    piste.addEventListener('scroll', maj, { passive: true });
    maj();
    return () => { io.disconnect(); piste.removeEventListener('scroll', maj); };
  };
  if (!gsap || !ST || !gsap.matchMedia) { libre(); return; }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px) and (min-height: 500px)', () => {
    section.classList.add('sentier--epingle');
    ['tabindex', 'role', 'aria-label'].forEach((a) => piste.removeAttribute(a));
    let centres = [];
    const distance = () => Math.max(0, liste.scrollWidth - piste.clientWidth);
    const mesurer = () => { centres = etapes.map((e) => e.offsetLeft + e.offsetWidth / 2); };
    const tw = gsap.to(liste, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: mesurer,
        onUpdate: (s) => {
          if (progres) progres.style.transform = `scaleX(${s.progress})`;
          const x = -distance() * s.progress, seuil = piste.clientWidth * 0.72;
          centres.forEach((c, i) => { if (c + x < seuil || s.progress > 0.97) pousser(i); });
        },
      },
    });
    mesurer();
    pousser(0);
    return () => {
      tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(liste, { clearProps: 'transform' });
      section.classList.remove('sentier--epingle');
      if (region.tabindex) piste.setAttribute('tabindex', region.tabindex);
      if (region.role) piste.setAttribute('role', region.role);
      if (region.label) piste.setAttribute('aria-label', region.label);
    };
  });
  mm.add('(max-width: 760px), (max-height: 499px)', () => libre());
}

/* ---------- Mon parcours : les photos du cabinet, en pile, s'étalent pendant la lecture ---------- */
function pile() {
  const liste = document.querySelector('[data-pile-liste]');
  if (!liste || !anime() || !gsap || !ST) return;
  const photos = [...liste.querySelectorAll('[data-pile-photo]')];
  const angles = [-7, 5, -3, 8];
  const ecart = (i, axe) => {
    const p = photos[i];
    return axe === 'x' ? liste.offsetWidth / 2 - (p.offsetLeft + p.offsetWidth / 2) : liste.offsetHeight / 2 - (p.offsetTop + p.offsetHeight / 2);
  };
  photos.forEach((p, i) => {
    gsap.fromTo(p, { x: () => ecart(i, 'x') * 0.92, y: () => ecart(i, 'y') * 0.92, rotation: angles[i % 4] }, {
      x: 0, y: 0, rotation: 0, ease: 'none',
      scrollTrigger: { trigger: liste, start: 'top 96%', end: 'top 52%', scrub: 0.6, invalidateOnRefresh: true },
    });
  });
}

/* ---------- Mon parcours : visionneuse des photos du cabinet ---------- */
function visionneuse() {
  const d = document.querySelector('[data-visionneuse]');
  if (!d || typeof d.showModal !== 'function') return;
  const photos = lire(d, 'data-photos') || [];
  const img = d.querySelector('[data-visionneuse-image]');
  const legende = d.querySelector('[data-visionneuse-legende]');
  const compteur = d.querySelector('[data-visionneuse-compteur]');
  const liens = [...document.querySelectorAll('[data-visionneuse-index]')];
  let i = 0, ouverte = false;
  const montrer = async (k) => {
    i = (k + photos.length) % photos.length;
    img.src = photos[i].src; img.alt = photos[i].alt;
    legende.textContent = photos[i].alt;
    compteur.textContent = d.dataset.texteCompteur.replace('{n}', i + 1).replace('{total}', photos.length);
    try { await img.decode(); } catch {}
  };
  const vol = (de, vers) => {
    const a = de.getBoundingClientRect(), b = vers.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height };
  };
  async function ouvrir(k) {
    if (ouverte) return;
    ouverte = true;
    await montrer(k);
    bloquerDefilement('visionneuse');
    d.showModal();
    suivre(d);
    d.querySelector('[data-visionneuse-fermer]').focus();
    if (anime() && gsap) {
      const vignette = liens[i].querySelector('img');
      gsap.fromTo(d, { backgroundColor: 'rgba(30, 38, 28, 0)' }, { backgroundColor: 'rgba(30, 38, 28, .95)', duration: 0.35 });
      gsap.from(img, { ...vol(vignette, img), transformOrigin: '0 0', duration: 0.5, ease: 'power3.out', clearProps: 'transform' });
      gsap.from([legende, compteur, ...d.querySelectorAll('button')], { opacity: 0, duration: 0.3, delay: 0.25 });
    }
  }
  async function fermer() {
    if (!ouverte) return;
    const lien = liens[i];
    if (anime() && gsap) {
      const vignette = lien.querySelector('img');
      gsap.to([legende, compteur, ...d.querySelectorAll('button')], { opacity: 0, duration: 0.15 });
      gsap.to(d, { backgroundColor: 'rgba(30, 38, 28, 0)', duration: 0.35 });
      await gsap.to(img, { ...vol(vignette, img), transformOrigin: '0 0', duration: 0.4, ease: 'power3.inOut' }).then();
      gsap.set([img, legende, compteur, d, ...d.querySelectorAll('button')], { clearProps: 'all' });
    }
    d.close();
    lacher(d);
    debloquerDefilement('visionneuse');
    ouverte = false;
    lien.focus({ preventScroll: true });
  }
  const changer = async (pas) => {
    if (anime() && gsap) await gsap.to(img, { opacity: 0, x: -pas * 24, duration: 0.18 }).then();
    await montrer(i + pas);
    if (anime() && gsap) gsap.fromTo(img, { opacity: 0, x: pas * 24 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' });
  };
  liens.forEach((a, k) => a.addEventListener('click', (e) => { e.preventDefault(); ouvrir(k); }));
  d.querySelector('[data-visionneuse-fermer]').addEventListener('click', fermer);
  d.querySelector('[data-visionneuse-prec]').addEventListener('click', () => changer(-1));
  d.querySelector('[data-visionneuse-suiv]').addEventListener('click', () => changer(1));
  d.addEventListener('cancel', (e) => { e.preventDefault(); fermer(); });
  d.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') changer(-1); else if (e.key === 'ArrowRight') changer(1); });
  d.addEventListener('click', (e) => { if (e.target === d) fermer(); });
  let x0 = null;
  d.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  d.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) changer(dx < 0 ? 1 : -1); });
}

export function initPages() {
  [prochains, portes, calendrier, sablier, places, citation, sentier, pile, visionneuse].forEach((f) => {
    try { f(); } catch (err) { console.error('[elka]', f.name, err); }
  });
}

/* État final : portes ouvertes, places allumées, plantes poussées (retour arrière, mode calme, secours). */
export function etatFinalPages() {
  document.querySelectorAll('[data-porte]').forEach((p) => p.classList.add('ouverte'));
  document.querySelectorAll('[data-places]').forEach((p) => p.classList.add('allumees'));
  document.querySelectorAll('[data-plante]').forEach((p) => p.classList.add('pousse'));
}

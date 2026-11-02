/* « Le seuil » : intro et premier écran de chaque page.
   Intro (environ 2,4 s) : le cadre d'une petite porte se trace dans l'arche, une lueur passe entre les battants,
   ils s'ouvrent, la fenêtre s'agrandit jusqu'à l'arche du premier écran (même place, même image), la brume se lève,
   le panneau s'efface et le titre monte mot à mot. L'arche du panneau est calée sur celle de la page :
   à la fin, l'une remplace l'autre sans aucun saut. */

const gsap = window.gsap;

/* Arche ouverte en bas, sommet en demi-cercle, en coordonnées du SVG. */
export function cheminArche(x, y, l, h) {
  const r = l / 2;
  return `M${x.toFixed(2)} ${(y + h).toFixed(2)} L${x.toFixed(2)} ${(y + r).toFixed(2)} A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(x + l).toFixed(2)} ${(y + r).toFixed(2)} L${(x + l).toFixed(2)} ${(y + h).toFixed(2)}`;
}

/* Le SVG du cadre déborde de 24 px autour de l'arche ; le cadre est tracé 12 px à l'extérieur. */
const MARGE = 24, ECART = 12;
const cadreFinal = (l, h) => ({ x: MARGE - ECART, y: MARGE - ECART, l: l + 2 * ECART, h: h + ECART });

/* Cadre au trait de l'arche du premier écran : redessiné quand sa taille change. */
export function cadresArches() {
  document.querySelectorAll('[data-arche]').forEach((arche) => {
    const svg = arche.querySelector('.arche-cadre');
    const path = svg && svg.querySelector('path');
    if (!path) return;
    const dessiner = () => {
      const l = arche.clientWidth, h = arche.clientHeight;
      if (!l || !h) return;
      svg.setAttribute('viewBox', `0 0 ${l + 2 * MARGE} ${h + 2 * MARGE}`);
      const c = cadreFinal(l, h);
      path.setAttribute('d', cheminArche(c.x, c.y, c.l, c.h));
    };
    dessiner();
    new ResizeObserver(dessiner).observe(arche);
  });
}

const elementsTitre = () => ({
  surtitre: document.querySelectorAll('.seuil .surtitre'),
  mots: document.querySelectorAll('.seuil .mot'),
  suite: document.querySelectorAll('.seuil .seuil-intro, .seuil .seuil-prix, .seuil .seuil-actions, .seuil .seuil-statut, .seuil .seuil-info, .seuil .sommaire-legal'),
});

/* Titre et textes du premier écran : ajoutés à une timeline, à partir de la position donnée. */
function animerTitre(tl, debut) {
  const e = elementsTitre();
  if (e.surtitre.length) tl.fromTo(e.surtitre, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, debut);
  /* Les mots montent en se découvrant de haut en bas ; au repos, rien ne les rogne (clipPath retiré). */
  if (e.mots.length) tl.fromTo(e.mots, { yPercent: 55, opacity: 0, clipPath: 'inset(-20% -12% 100% -12%)' }, { yPercent: 0, opacity: 1, clipPath: 'inset(-20% -12% -40% -12%)', duration: 0.65, stagger: 0.04, ease: 'power3.out', clearProps: 'clipPath' }, debut + 0.05);
  if (e.suite.length) tl.fromTo(e.suite, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, debut + 0.22);
  return tl;
}

/* Cale l'arche du panneau sur l'arche du premier écran (même taille, même place).
   Si l'arche de la page dépasse le bas de l'écran (téléphone en portrait), l'intro la montre d'abord entière,
   centrée, puis la fait glisser jusqu'à sa place dans la page (decalage, en px). */
function caler() {
  const page = document.querySelector('.seuil [data-arche]');
  const intro = document.querySelector('[data-seuil-arche]');
  if (!page || !intro) return null;
  const r = page.getBoundingClientRect();
  const st = getComputedStyle(document.documentElement);
  const barres = parseFloat(st.getPropertyValue('--barres-h')) || 0;
  const entete = parseFloat(st.getPropertyValue('--entete-h')) || 0;
  let decalage = 0;
  if (r.bottom > window.innerHeight - barres - 8) {
    const centre = Math.max(entete + 16, (window.innerHeight - barres - r.height) / 2);
    decalage = r.top - centre;
  }
  Object.assign(intro.style, { left: r.left + 'px', top: (r.top - decalage) + 'px', right: 'auto', bottom: 'auto', width: r.width + 'px', height: r.height + 'px', marginLeft: '0px' });
  return { l: r.width, h: r.height, decalage };
}

/** Intro complète. Renvoie une timeline GSAP (pilotée par le socle : accélérée puis passée par le visiteur). */
export function jouerSeuil() {
  if (!gsap) return null;
  const dims = caler();
  const panneau = document.querySelector('[data-ouverture]');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (!dims) { tl.to(panneau, { opacity: 0, duration: 0.5 }, 0.4); return animerTitre(tl, 0.6); }

  const { l: W, h: H, decalage } = dims;
  const archeIntro = document.querySelector('[data-seuil-arche]');
  const vue = document.querySelector('[data-seuil-vue]');
  const battants = document.querySelector('[data-seuil-battants]');
  const [gauche, droite] = battants.querySelectorAll('.seuil-battant');
  const lueur = document.querySelector('[data-seuil-lueur]');
  const brume = document.querySelector('[data-seuil-brume]');
  const svg = document.querySelector('[data-seuil-cadre]');
  const trait = svg.querySelector('path');

  /* Petite porte : au centre, posée en bas de l'arche (mêmes proportions que l'état de départ en CSS). */
  const ol = W * 0.5, oh = Math.min(H * 0.66, W * 0.925), ox = (W - ol) / 2, oy = H - oh;
  Object.assign(battants.style, { left: ox + 'px', top: oy + 'px', width: ol + 'px', height: oh + 'px', borderRadius: `${ol / 2}px ${ol / 2}px 0 0` });
  svg.setAttribute('viewBox', `0 0 ${W + 2 * MARGE} ${H + 2 * MARGE}`);

  const depart = { x: MARGE + ox - 10, y: MARGE + oy - 10, l: ol + 20, h: oh + 10 };
  const fin = cadreFinal(W, H);
  const fen = { t: oy, r: W - ox - ol, b: 0, g: ox, rayon: ol / 2, p: 0 };
  const majFenetre = () => { vue.style.clipPath = `inset(${fen.t.toFixed(1)}px ${fen.r.toFixed(1)}px ${fen.b.toFixed(1)}px ${fen.g.toFixed(1)}px round ${fen.rayon.toFixed(1)}px ${fen.rayon.toFixed(1)}px 0px 0px)`; };
  const majCadre = () => {
    const p = fen.p;
    const c = { x: depart.x + (fin.x - depart.x) * p, y: depart.y + (fin.y - depart.y) * p, l: depart.l + (fin.l - depart.l) * p, h: depart.h + (fin.h - depart.h) * p };
    trait.setAttribute('d', cheminArche(c.x, c.y, c.l, c.h));
  };
  majCadre();
  const longueur = trait.getTotalLength();
  gsap.set(trait, { strokeDasharray: longueur, strokeDashoffset: longueur });

  tl
    /* 0 – 0,55 s : le cadre de la porte se trace, les battants apparaissent. */
    .to(trait, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
    /* La vue s'ouvre derrière les battants (visibles dès la première image) : l'image n'apparaît qu'à leur ouverture. */
    .call(majFenetre, null, 0.3)
    /* 0,4 s : une lueur passe entre les battants. */
    .fromTo(lueur, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.35)
    /* 0,6 – 1,15 s : les battants s'ouvrent. */
    .fromTo(gauche, { scaleX: 1 }, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, 0.6)
    .fromTo(droite, { scaleX: 1 }, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, 0.6)
    .to(lueur, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.75)
    .set(battants, { opacity: 0 }, 1.2)
    .to('.ouverture-ligne', { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.9)
    /* 0,95 – 1,7 s : on passe le seuil, la fenêtre s'agrandit jusqu'à l'arche de la page. */
    .to(fen, { t: 0, r: 0, b: 0, g: 0, rayon: W / 2, p: 1, duration: 0.75, ease: 'power3.inOut', onUpdate: () => { majFenetre(); majCadre(); }, onStart: () => gsap.set(trait, { strokeDasharray: 'none' }) }, 0.95)
    /* 1,3 – 1,95 s : la brume se lève. */
    .fromTo(brume, { yPercent: 0, opacity: 1 }, { yPercent: -28, opacity: 0, duration: 0.65, ease: 'power2.inOut' }, 1.3)
    /* 1,6 – 1,9 s : le panneau s'efface sur la page, identique dessous. */
    .to(panneau, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 1.6);
  /* Téléphone en portrait : l'arche, montrée entière, glisse jusqu'à sa place dans la page. */
  if (decalage) tl.fromTo(archeIntro, { y: 0 }, { y: decalage, duration: 0.6, ease: 'power3.inOut' }, 1.0);
  return animerTitre(tl, 1.55);
}

/* Arrivée par un lien interne : le titre monte pendant que le voile se retire. */
export function arriveeSeuil() {
  if (!gsap) return;
  animerTitre(gsap.timeline(), 0.12);
}

/* État final : tout en place, sans animation (retour, mode calme, secours). */
export function etatFinalSeuil() {
  if (!gsap) return;
  const e = elementsTitre();
  gsap.set([...e.surtitre, ...e.mots, ...e.suite], { clearProps: 'transform,opacity,clipPath' });
}

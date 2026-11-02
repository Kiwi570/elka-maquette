/* Gabarit commun : head, en-tête, menu, pied de page, barre fixe du téléphone, voile et panneau d'ouverture.
   Les conventions data-* sont celles que lisent le socle JavaScript et l'audit (voir le README du socle).
   Propre à Elka Hypnose : navigation avec ancres, intro « Le seuil » (arche, battants, brume),
   arche réutilisée dans le premier écran de chaque page. */
import { html, brut } from '../../outils/gabarit.mjs';

/* Entrées de navigation : 'cle' (page) ou { page, ancre, libelle } (section d'une page). */
const entrees = (c) => c.site.navigation
  .map((e) => (typeof e === 'string' ? { page: e } : e))
  .filter((e) => c.pages[e.page] && (c.pages[e.page].langues || c.langues).includes(c.l));

const lienNav = (c, e, classe = '') => (e.ancre
  ? c.lien(e.page, { ancre: e.ancre, texte: c.t(e.libelle), classe })
  : c.lien(e.page, { classe }));

/* Arche du premier écran : image dans une fenêtre en arche, brume (WebGL ou CSS), cadre au trait. */
export function arche(c, { nom, alt, cadrage = '50% 50%', cadrageMobile, classe = '' }) {
  return html`<div class="arche ${classe}" data-arche>
  ${c.media({ nom, alt, cadrage, cadrageMobile, priorite: true, classe: 'arche-media', sizes: '(max-width: 760px) 92vw, 600px' })}
  <canvas class="arche-brume" data-brume aria-hidden="true" data-audit-ignorer></canvas>
  <div class="arche-brume-css" aria-hidden="true"></div>
  <svg class="arche-cadre" aria-hidden="true" data-audit-ignorer><path data-cadre /></svg>
</div>`;
}

function tete(c) {
  const p = c.page, cle = p.cle;
  const titre = c.s(`pages.${cle}.titre`), description = c.s(`pages.${cle}.description`);
  const ici = c.abs(c.url(cle));
  const imagePartage = c.abs(`/assets/partage/${p.partage === false ? 'accueil' : cle}-${c.l}.jpg`);
  const structure = c.donnees.structure ? JSON.stringify(c.donnees.structure).replace(/</g, '\\u003c') : '';
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${ici}">
<style>${brut(c.critique.css)}</style>
<script>${brut(c.critique.js)}</script>
${(c.site.polices || []).map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>\n`)}<link rel="stylesheet" href="${c.asset('css/socle.css')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<link rel="modulepreload" href="${c.asset('js/site.js')}">
<link rel="modulepreload" href="${c.asset('js/socle/index.js')}">
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script type="module" src="${c.asset('js/site.js')}"></script>
<meta name="theme-color" content="${c.site.couleurs.theme || c.site.couleurs.fond}">
<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${c.site.nom}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ici}">
<meta property="og:image" content="${imagePartage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${c.s(`pages.${p.partage === false ? 'accueil' : cle}.partageAlt`)}">
<meta name="twitter:card" content="summary_large_image">
${structure ? html`<script type="application/ld+json">${brut(structure)}</script>` : ''}
</head>`;
}

function entete(c) {
  const a = c.site.actionEntete;
  return html`<header data-entete>
  <div class="entete-rangee">
    <a class="entete-logo" href="${c.url('accueil')}" aria-label="${c.s('commun.logoAlt')}" data-libelle="${c.libelle('accueil')}"${c.page.cle === 'accueil' ? brut(' aria-current="page"') : ''}>
      <img src="/assets/images/logo.svg" alt="" width="90" height="50">
    </a>
    <nav data-nav aria-label="${c.s('commun.navigation')}">
      <ul>${entrees(c).filter((e) => !(e.page === 'accueil' && !e.ancre)).map((e) => html`<li>${lienNav(c, e, 'lien-trace')}</li>`)}</ul>
    </nav>
    <div class="entete-actions">
      ${a ? html`<a class="bouton bouton--entete" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}" data-magnetique>${c.t('commun.actionEntete')}</a>` : ''}
      <button type="button" data-menu-bouton aria-controls="menu" aria-expanded="false" data-libelle-ouvrir="${c.s('commun.menu')}" data-libelle-fermer="${c.s('commun.fermer')}"><span class="menu-icone" aria-hidden="true"></span><span data-libelle-bouton>${c.t('commun.menu')}</span></button>
    </div>
  </div>
</header>
<div id="menu" data-menu role="dialog" aria-modal="true" aria-label="${c.s('commun.menu')}">
  <div class="menu-grille">
    <ul class="menu-liens">${entrees(c).map((e, i) => html`<li style="--i:${i}">${lienNav(c, e, 'menu-lien')}</li>`)}</ul>
    <div class="menu-contact">
      <p class="menu-titre">${c.t('commun.contact')}</p>
      <p><a class="bouton bouton--clair" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appelerNumero', { tel: c.site.contact.telephone })}</a></p>
      ${a ? html`<p><a class="bouton bouton--contour-clair" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}">${c.t('commun.actionEntete')}</a></p>` : ''}
      <p class="menu-adresse">${c.site.contact.rue}<br><span class="insecable">${c.site.contact.ville}</span></p>
      <p><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></p>
    </div>
  </div>
</div>`;
}

function pied(c) {
  const ext = (href, texte) => html`<a href="${href}" target="_blank" rel="noopener">${texte}<span class="visuellement-cache"> ${c.t('commun.nouvelOnglet')}</span></a>`;
  return html`<footer class="pied" id="pied">
  <div class="conteneur pied-grille">
    <div class="pied-marque">
      <img src="/assets/images/logo-pastille.svg" alt="" width="88" height="88" loading="lazy">
      <p>${c.t('commun.piedTexte')}</p>
    </div>
    <div>
      <p class="pied-titre">${c.t('commun.contact')}</p>
      <p>${c.site.contact.rue}<br><span class="insecable">${c.site.contact.ville}</span></p>
      <ul><li><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></li><li><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a></li><li>${ext(c.site.liens.resalib, c.t('commun.resalib'))}</li></ul>
    </div>
    <nav aria-label="${c.s('commun.sommaire')}">
      <p class="pied-titre">${c.t('commun.sommaire')}</p>
      <ul>${entrees(c).map((e) => html`<li>${lienNav(c, e)}</li>`)}</ul>
    </nav>
    <div>
      <p class="pied-titre">${c.t('commun.informations')}</p>
      <ul><li>${c.lien('mentions-legales')}</li><li>${c.lien('confidentialite')}</li><li>${c.lien('cgv')}</li></ul>
      <p class="pied-titre pied-titre--suite">${c.t('commun.suivre')}</p>
      <ul><li>${ext(c.site.liens.facebook, c.t('commun.facebook'))}</li><li>${ext(c.site.liens.instagram, c.t('commun.instagram'))}</li></ul>
    </div>
  </div>
  <div class="conteneur pied-bas">
    <p class="pied-avertissement">${c.t('commun.avertissement')}</p>
    <ul class="pied-confort">
      <li><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></li>
      <li><a href="#haut" data-sans-transition>${c.t('commun.retourHaut')}</a></li>
    </ul>
    <p>${c.t('commun.maquette')}</p>
    <p>© ${c.site.nom}</p>
  </div>
</footer>`;
}

function barre(c) {
  const a = c.site.actionEntete;
  return html`<div data-barre-fixe>
  <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')}</a>
  ${a ? html`<a class="bouton" href="${c.url(a.page, a.ancre || '')}" data-libelle="${c.libelle(a.page)}">${c.t('commun.rdvCourt')}</a>` : ''}
</div>`;
}

function voile(c) {
  return html`<div data-voile aria-hidden="true"><div class="voile-contenu">
  <svg class="voile-arche" viewBox="0 0 120 170" aria-hidden="true"><path d="M2 170 V60 A58 58 0 0 1 118 60 V170" /></svg>
  <img src="/assets/images/logo-clair.svg" alt="" width="108" height="60">
  <span data-voile-libelle>${c.libelle(c.page.cle)}</span>
</div></div>`;
}

/* Panneau d'ouverture : la même arche que le premier écran, d'abord fermée par deux battants,
   qui s'ouvrent puis s'agrandissent jusqu'à la taille de l'arche de la page. */
function ouverture(c) {
  const o = c.page.ouverture;
  return html`<div class="ouverture-panneau" data-ouverture aria-hidden="true">
  <div class="seuil-arche" data-seuil-arche>
    <div class="seuil-vue" data-seuil-vue>
      ${c.media({ nom: o.nom, alt: '', cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, priorite: true, classe: 'seuil-media', sizes: '(max-width: 760px) 92vw, 600px' })}
      <div class="seuil-brume" data-seuil-brume></div>
    </div>
    <div class="seuil-battants" data-seuil-battants><span class="seuil-battant seuil-battant--g"></span><span class="seuil-battant seuil-battant--d"></span><span class="seuil-lueur" data-seuil-lueur></span></div>
    <svg class="seuil-cadre" data-seuil-cadre><path /></svg>
  </div>
  <p class="ouverture-ligne">${c.t('commun.introLigne')}</p>
</div>`;
}

export function page(c, contenu) {
  return html`<!doctype html>
<html lang="${c.l}" data-v="${c.v}" data-gabarit="${c.page.gabarit || c.page.cle}"${c.site.curseur ? brut(' data-curseur') : ''}>
${tete(c)}
<body id="haut" class="page-${c.page.cle}">
${voile(c)}
${ouverture(c)}
<a class="evitement" href="#contenu">${c.t('commun.evitement')}</a>
${entete(c)}
<main id="contenu" tabindex="-1"${c.page.sansAction ? brut(' data-sans-action') : ''}>
${contenu}
</main>
${pied(c)}
${barre(c)}
</body>
</html>`;
}

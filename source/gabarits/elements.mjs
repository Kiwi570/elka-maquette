/* Éléments propres à Elka Hypnose, partagés entre les pages : horaires et statut, ateliers, carte de l'Auxois.
   Les calculs de date se font à l'heure de Paris, au moment de la génération ; le JavaScript du site
   les refait en direct à l'ouverture de la page (assets/js/horaires.js, assets/js/ateliers.js). */
import { html } from '../../outils/gabarit.mjs';

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
/* « 2026-11-02 » → « 2 nov. » (pastilles des séances). */
export const dateCourte = (iso) => { const [, m, j] = iso.split('-').map(Number); return `${j === 1 ? '1er' : j}\u00a0${MOIS_COURTS[m - 1]}`; };
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/* « 19:30 » → « 19 h 30 », « 09:00 » → « 9 h ». */
export const heure = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return m ? `${h}\u00a0h\u00a0${String(m).padStart(2, '0')}` : `${h}\u00a0h`;
};
/* « 2026-11-02 » → « 2 novembre » (avec l'année si demandé). */
export const date = (iso, annee = false) => {
  const [a, m, j] = iso.split('-').map(Number);
  return `${j === 1 ? '1er' : j}\u00a0${MOIS[m - 1]}${annee ? '\u00a0' + a : ''}`;
};

/* Heure de Paris maintenant, en minutes depuis minuit et en date ISO. */
export function maintenantParis(d = new Date()) {
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour % 24) * 60 + +p.minute };
}

/* Statut d'un atelier à une date donnée : avenir, encours ou termine, et nombre de séances passées. */
export function statutAtelier(a, now = maintenantParis()) {
  const min = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const passee = (jour) => jour < now.iso || (jour === now.iso && now.minutes >= min(a.fin));
  const commencee = (jour) => jour < now.iso || (jour === now.iso && now.minutes >= min(a.debut));
  const n = a.seances.filter(passee).length;
  if (n === a.seances.length) return { etat: 'termine', passees: n };
  if (commencee(a.seances[0])) return { etat: 'encours', passees: n };
  const jours = Math.round((Date.parse(a.seances[0]) - Date.parse(now.iso)) / 864e5);
  return { etat: 'avenir', passees: 0, jours };
}

export function ordreAteliers(liste, now = maintenantParis()) {
  const rang = { encours: 0, avenir: 1, termine: 2 };
  return liste.map((a) => ({ a, s: statutAtelier(a, now) }))
    .sort((x, y) => rang[x.s.etat] - rang[y.s.etat] || x.a.seances[0].localeCompare(y.a.seances[0]));
}

const plages = (j) => j.plages.map(([d, f]) => `${heure(d)} – ${heure(f)}`).join(' · ');

/* Tableau des horaires, ligne du jour repérée en direct par le JavaScript. */
export function tableHoraires(c) {
  const ordre = [1, 2, 3, 4, 5, 6, 0];
  const jours = ordre.map((n) => c.donnees.horaires.jours.find((j) => j.j === n));
  return html`<table class="horaires" data-horaires data-aujourdhui="${c.s('tarifs.horaires.aujourdhui')}">
  <caption class="visuellement-cache">${c.t('tarifs.horaires.titre')}</caption>
  <tbody>${jours.map((j) => html`<tr data-jour="${j.j}"><th scope="row">${j.nom}</th><td>${j.plages.length ? plages(j) : c.t('tarifs.horaires.ferme')}</td></tr>`)}</tbody>
</table>`;
}

/* Statut « Joignable maintenant » : le texte de la page donne les horaires (lisible sans JavaScript),
   le JavaScript le remplace par le statut calculé à l'heure de Paris. */
export function statut(c, { info = true } = {}) {
  return html`<p class="statut"${info ? html` data-info-cle` : ''} data-statut data-horaires-json="${JSON.stringify(c.donnees.horaires)}" data-textes="${JSON.stringify({ ouvert: c.s('statut.ouvert'), ferme: c.s('statut.ferme'), rouvre: c.s('statut.rouvre'), aujourdhui: c.s('statut.aujourdhui'), demain: c.s('statut.demain'), jour: c.s('statut.jour'), ferie: c.s('statut.ferie'), fermeture: c.s('statut.fermeture') })}">
  <span class="statut-point" aria-hidden="true"></span><span class="statut-texte" data-statut-texte>${c.t('statut.horaires')}</span>
  <a class="statut-tel" href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a>
</p>`;
}

/* Cartes des ateliers : statut au moment de la génération, recalculé en direct (assets/js/ateliers.js). */
export function cartesAteliers(c) {
  const T = (k, v) => c.s(`accueil.ateliers.${k}`, v);
  return html`<div class="ateliers-defile" data-galerie tabindex="0" role="region" aria-label="${c.s('accueil.ateliers.region')}"><ol class="ateliers-liste" data-ateliers data-textes="${JSON.stringify({ aVenir: T('aVenir'), enCours: T('enCours'), termine: T('termine'), dans: T('dans'), demain: T('demain'), aujourdhui: T('aujourdhui'), passee1: T('passee1'), passees: T('passees') })}">
  ${ordreAteliers(c.donnees.ateliers).map(({ a, s }) => {
    const relatif = s.etat === 'avenir' ? (s.jours === 0 ? T('aujourdhui') : s.jours === 1 ? T('demain') : T('dans', { n: s.jours })) : s.etat === 'encours' ? (s.passees === 1 ? T('passee1') : T('passees', { n: s.passees })) : '';
    const etiquette = s.etat === 'avenir' ? T('aVenir') : s.etat === 'encours' ? T('enCours') : T('termine');
    const ouvert = s.etat === 'avenir';
    return html`<li class="atelier" id="atelier-${a.id}" data-atelier="${JSON.stringify(a)}" data-etat="${s.etat}">
    <p class="atelier-statut"><span class="atelier-etiquette" data-atelier-etiquette>${etiquette}</span> <span class="atelier-relatif" data-atelier-relatif>${relatif}</span></p>
    <h3 class="atelier-titre">${a.theme}</h3>
    <p class="atelier-quand">${T('periode', { d1: date(a.seances[0]), d2: date(a.seances[3]) })}<br>${T('horaire', { jour: a.jour, debut: heure(a.debut), fin: heure(a.fin) })}</p>
    <ol class="atelier-seances" aria-label="${a.theme}">${a.seances.map((j, i) => html`<li class="atelier-seance${i < s.passees ? ' passee' : ''}" data-seance="${j}"><span class="pastille" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="pousse" d="M12 21 V11 M12 14 C9 13 7.5 11 7.5 8.5 C10 8.7 11.6 10.2 12 12.5 M12 12.5 C12.4 9.6 14.2 7.6 17 7.4 C17 10.2 15 12.2 12 12.8" /></svg></span><span class="seance-date">${dateCourte(j)}</span></li>`)}</ol>
    <p class="atelier-texte">${a.texte}</p>
    <p class="atelier-action" data-atelier-action>${ouvert
      ? c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: `sujet=atelier&atelier=${a.id}`, classe: 'bouton bouton--petit', texte: T('inscrire') })
      : html`<span class="atelier-ferme">${s.etat === 'encours' ? T('ferme') : T('termine')}</span> ${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=prochain', classe: 'bouton bouton--petit bouton--contour', texte: T('prochainCourt') })}`}</p>
  </li>`;
  })}
  <li class="atelier atelier--autre" data-atelier-autre>
    <span class="atelier-autre-arche" aria-hidden="true"></span>
    <h3 class="atelier-titre">${T('autreTitre')}</h3>
    <p class="atelier-texte">${T('autreTexte')}</p>
    <p class="atelier-action">${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=prochain', classe: 'bouton bouton--petit bouton--clair', texte: T('autreAction') })}</p>
  </li>
</ol></div>`;
}

/* Carte de l'Auxois : projection simple d'après les coordonnées, distances à vol d'oiseau calculées. */
export function carte(c) {
  const { cabinet, villes } = c.donnees.carte;
  const tous = [cabinet, ...villes];
  const lat0 = tous.reduce((s, v) => s + v.lat, 0) / tous.length;
  const kx = Math.cos(lat0 * Math.PI / 180);
  /* Marges autour des villes (en degrés) : de la place pour les étiquettes. */
  const margeLat = 0.08, margeLon = 0.1;
  const lons = tous.map((v) => v.lon), lats = tous.map((v) => v.lat);
  const x0 = Math.min(...lons) - margeLon / kx, x1 = Math.max(...lons) + margeLon / kx;
  const y0 = Math.max(...lats) + margeLat, y1 = Math.min(...lats) - margeLat;
  const L = 600, H = Math.round(L * (y0 - y1) / ((x1 - x0) * kx));
  const px = (v) => ({ x: (v.lon - x0) / (x1 - x0) * L, y: (y0 - v.lat) / (y0 - y1) * H });
  const km = (a, b) => {
    const r = Math.PI / 180, dla = (b.lat - a.lat) * r, dlo = (b.lon - a.lon) * r;
    const h = Math.sin(dla / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlo / 2) ** 2;
    return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
  };
  const C = px(cabinet);
  const pc = (p) => ({ x: (p.x / L * 100).toFixed(2), y: (p.y / H * 100).toFixed(2) });
  return html`<figure class="carte" data-carte data-visuel>
  <div class="carte-plan" style="--ratio:${L} / ${H}">
  <svg viewBox="0 0 ${L} ${H}" aria-hidden="true" preserveAspectRatio="none">
    <g class="carte-relief">${[0.18, 0.34, 0.5, 0.66, 0.82].map((t, i) => html`<path d="M0 ${(H * t).toFixed(0)} C ${L * 0.2} ${(H * t - 26 + i * 6).toFixed(0)}, ${L * 0.45} ${(H * t + 30).toFixed(0)}, ${L * 0.7} ${(H * t - 10).toFixed(0)} S ${L} ${(H * t + 14).toFixed(0)}, ${L + 20} ${(H * t).toFixed(0)}" />`)}</g>
    <g class="carte-traits">${villes.map((v) => { const p = px(v); return html`<path data-trait d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${C.x.toFixed(1)} ${C.y.toFixed(1)}" />`; })}</g>
    <g class="carte-villes">${villes.map((v) => { const p = px(v); return html`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" />`; })}</g>
    <g class="carte-cabinet"><circle class="carte-onde" cx="${C.x.toFixed(1)}" cy="${C.y.toFixed(1)}" r="10" /><circle cx="${C.x.toFixed(1)}" cy="${C.y.toFixed(1)}" r="8" /></g>
  </svg>
  <ul class="carte-etiquettes">
    <li class="carte-etiquette carte-etiquette--cabinet carte-etiquette--haut" style="--x:${pc(C).x}%;--y:${pc(C).y}%" data-repere><strong>${c.t('accueil.venir.titre')}</strong><span>${cabinet.nom}</span></li>
    ${villes.map((v) => { const p = pc(px(v)); return html`<li class="carte-etiquette carte-etiquette--${v.position}" style="--x:${p.x}%;--y:${p.y}%" data-repere><strong>${v.nom}</strong><span class="chiffres">${km(cabinet, v)} km</span></li>`; })}
  </ul>
  </div>
  <figcaption class="carte-note">${c.t('accueil.venir.carteNote')}</figcaption>
</figure>`;
}

/* Avis Résalib (accueil et Mon parcours). */
export function avis(c) {
  return html`<section class="avis" id="avis">
  ${c.media({ nom: 'grok/avis-papier', alt: '', classe: 'avis-fond', sizes: '100vw' })}
  <div class="conteneur avis-contenu">
    <div class="avis-tete">
      <h2 class="titre-section" data-anime>${c.t('accueil.avis.titre')}</h2>
      <p class="avis-note" data-anime><span class="etoiles" role="img" aria-label="${c.s('accueil.avis.etoiles')}">${[1, 2, 3, 4, 5].map(() => html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.9l-5.8 3.2 1.4-6.4L2.7 9.3l6.5-.7z" /></svg>`)}</span> <strong>${c.t('accueil.avis.note')}</strong> <span class="avis-nombre">${c.t('accueil.avis.nombre')}</span></p>
    </div>
    <ul class="avis-liste">
      ${c.donnees.avis.map((a) => html`<li class="avis-carte" data-anime><blockquote><p>« ${a.texte} »</p></blockquote><p class="avis-nom">${a.nom}</p></li>`)}
    </ul>
    <p class="avis-source" data-anime>${c.t('accueil.avis.source')} <a class="lien-trace" href="${c.site.liens.resalib}" target="_blank" rel="noopener">${c.t('accueil.avis.voir')}<span class="visuellement-cache"> ${c.t('commun.nouvelOnglet')}</span></a></p>
  </div>
</section>`;
}

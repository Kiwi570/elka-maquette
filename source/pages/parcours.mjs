/* Mon parcours : de l'école au cabinet. Rencontre (la phrase de Laurence s'écrit), le chemin parcouru
   (galerie horizontale épinglée sur ordinateur : une graine pousse sous chaque étape jusqu'au chêne),
   formations (cachets qui s'impriment), façon d'accompagner, le cabinet (photos en pile qui s'étalent,
   visionneuse), avis et premier pas. */
import { html, brut } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';
import { avis } from '../gabarits/elements.mjs';

export const page = {
  cle: 'parcours', fichier: 'mon-parcours', imagePartage: 'grok/parcours-ouverture-1280.webp',
  ouverture: { nom: 'grok/parcours-ouverture', cadrage: '57% 62%', cadrageMobile: '50% 60%' },
};

const mots = (texte) => texte.split(' ').map((m) => html`<span class="mot-masque"><span class="mot" data-anime="gsap">${m}</span></span> `);

/* Plante à l'étape s (0 : graine … 6 : chêne). Chaque partie pousse à son tour (--d : ordre). */
function plante(s) {
  const H = [0, 9, 16, 23, 30, 36, 40][s];
  const parts = [];
  parts.push(`<ellipse class="plante-sol" cx="40" cy="73" rx="${12 + s * 2}" ry="2.6" />`);
  if (s === 0) parts.push('<ellipse class="plante-graine plante-part" style="--d:0" cx="40" cy="69.5" rx="4.2" ry="3.2" />');
  else {
    const epais = s >= 4 ? 2.4 + (s - 4) * 1.1 : 2;
    parts.push(`<path class="plante-tige plante-part" style="--d:0;stroke-width:${epais}" d="M40 72 V${72 - H}" />`);
    if (s <= 3) {
      for (let k = 0; k < s; k++) {
        const y = 72 - H + 4 + k * 6, l = 7 - k;
        parts.push(`<path class="plante-feuille plante-part" style="--d:${k + 1}" d="M40 ${y} C${40 - l} ${y - 1} ${40 - l - 3} ${y - 6} ${40 - l - 3} ${y - 9} C${40 - 3} ${y - 8} 40 ${y - 5} 40 ${y}" />`);
        parts.push(`<path class="plante-feuille plante-part" style="--d:${k + 1}" d="M40 ${y - 2} C${40 + l} ${y - 3} ${40 + l + 3} ${y - 8} ${40 + l + 3} ${y - 11} C${40 + 3} ${y - 10} 40 ${y - 7} 40 ${y - 2}" />`);
      }
    } else {
      const top = 72 - H;
      const houppier = s === 4 ? [[40, top, 9]] : s === 5 ? [[34, top + 3, 8], [46, top + 3, 8], [40, top - 3, 9]] : [[30, top + 5, 9], [50, top + 5, 9], [36, top - 3, 10], [46, top - 4, 10], [40, top - 9, 9]];
      if (s === 6) parts.push(`<path class="plante-tige plante-part" style="--d:1;stroke-width:2.2" d="M40 ${top + 12} L31 ${top + 5} M40 ${top + 9} L50 ${top + 3}" />`);
      houppier.forEach(([x, y, r], k) => parts.push(`<circle class="plante-houppier plante-part" style="--d:${k + 2}" cx="${x}" cy="${y}" r="${r}" />`));
    }
  }
  return `<svg viewBox="0 0 80 80" aria-hidden="true">${parts.join('')}</svg>`;
}

export default (c) => {
  const o = page.ouverture;
  const etapes = c.donnees.parcours;
  const photos = [
    { nom: 'cabinet-salle', alt: c.s('accueil.venir.alt'), cadrage: '45% 60%' },
    { nom: 'cabinet-fauteuil', alt: c.s('suivi.lieux.cabinetAlt'), cadrage: '50% 55%' },
    { nom: 'visio-laurence', alt: c.s('parcours.cabinet.visioAlt'), cadrage: '52% 38%' },
  ];
  return html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <p class="surtitre" data-anime="gsap">${c.t('parcours.tete.surtitre')}</p>
    <h1 class="seuil-titre seuil-titre--page" data-superpose>${mots(c.s('parcours.tete.titre1'))}<span class="mot-masque mot-masque--cle"><em class="mot mot--cle" data-anime="gsap">${c.t('parcours.tete.titreMot')}</em></span></h1>
    <p class="seuil-intro" data-anime="gsap">${c.t('parcours.tete.texte')}</p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('parcours.tete.action'), attrs: 'data-action-principale data-magnetique' })}
    </p>
    <p class="seuil-info" data-info-cle data-anime="gsap">${c.t('parcours.tete.info')}</p>
  </div>
  ${arche(c, { nom: o.nom, alt: c.s('parcours.tete.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>

<section class="rencontre rencontre--parcours conteneur" id="rencontre">
  ${c.media({ nom: 'laurence-portrait', alt: c.s('accueil.rencontre.alt'), cadrage: '50% 30%', classe: 'rencontre-portrait', sizes: '(max-width: 760px) 80vw, 420px' })}
  <div class="rencontre-texte">
    <h2 class="titre-section" data-anime>${c.t('parcours.rencontre.titre')}</h2>
    <p class="texte-fort" data-anime>${c.t('parcours.rencontre.texte1')}</p>
    <p data-anime>${c.t('parcours.rencontre.texte2')}</p>
    <blockquote class="citation" data-citation><p>${c.t('parcours.rencontre.citation')}</p></blockquote>
  </div>
</section>

<section class="sentier" id="chemin" data-sentier>
  <div class="sentier-fond-zone" data-audit-ignorer>${c.media({ nom: 'grok/parcours-sentier', alt: '', cadrage: '50% 70%', classe: 'sentier-fond', sizes: '100vw' })}</div>
  <div class="conteneur sentier-tete">
    <h2 class="titre-section" data-anime>${c.t('parcours.chemin.titre')}</h2>
    <p data-anime>${c.t('parcours.chemin.texte')}</p>
  </div>
  <div class="conteneur"><p class="indication-glisser indication-glisser--sentier" aria-hidden="true">${c.t('commun.glisser')}</p></div>
  <div class="sentier-piste" data-sentier-piste data-galerie tabindex="0" role="region" aria-label="${c.s('parcours.chemin.region')}">
    <ol class="sentier-etapes" data-sentier-liste>
      ${etapes.map((e, i) => html`<li class="sentier-etape${e.image ? ' sentier-etape--image' : ''}" data-sentier-etape style="--i:${i}">
        <div class="sentier-carte">
          ${e.image
            ? html`${c.media({ nom: e.image, alt: e.alt, cadrage: e.cadrage, classe: 'sentier-media', sizes: '(max-width: 760px) 80vw, 340px' })}<p class="sentier-quand">${e.quand}</p>`
            : html`<p class="sentier-quand sentier-quand--grand">${e.quand}</p>`}
          <p class="sentier-quoi">${e.quoi}</p>
        </div>
        <span class="plante plante--${i}" data-plante>${brut(plante(Math.min(6, i)))}</span>
      </li>`)}
    </ol>
  </div>
  <div class="conteneur sentier-bas" aria-hidden="true"><span class="sentier-progres"><span data-sentier-progres></span></span></div>
</section>

<section class="formations conteneur" id="formations">
  <div class="formations-texte">
    <h2 class="titre-section" data-anime>${c.t('parcours.formations.titre')}</h2>
    <p data-anime>${c.t('parcours.formations.texte')}</p>
    <ol class="formations-liste">${[1, 2, 3].map((i) => html`<li data-anime><span class="annee-cachet" aria-hidden="true">${c.t(`parcours.formations.a${i}`)}</span><span class="visuellement-cache">${c.t(`parcours.formations.a${i}`)} : </span>${c.t(`parcours.formations.f${i}`)}</li>`)}</ol>
    <p class="porte-sous" data-anime>${c.t('parcours.formations.specialisations')}</p>
    <ul class="etiquettes" data-anime>${[1, 2, 3, 4].map((i) => html`<li>${c.t(`parcours.formations.s${i}`)}</li>`)}</ul>
    <p class="parcours-snh" data-anime><img src="/assets/images/logo-snh.png" alt="${c.s('accueil.parcours.snhAlt')}" width="240" height="72" loading="lazy"><span>${c.t('accueil.parcours.snh')}</span></p>
  </div>
  <div class="formations-visuel">
    ${c.media({ nom: 'grok/parcours-livres', alt: c.s('parcours.formations.alt'), cadrage: '40% 55%', classe: 'formations-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
  </div>
</section>

<section class="approche conteneur" id="approche">
  ${c.media({ nom: 'grok/parcours-approche', alt: c.s('parcours.approche.alt'), cadrage: '30% 60%', classe: 'approche-media', sizes: '(max-width: 760px) 92vw, 44vw' })}
  <div class="approche-texte">
    <h2 class="titre-section" data-anime>${c.t('parcours.approche.titre')}</h2>
    <ol class="approche-liste">${[1, 2, 3, 4].map((i) => html`<li data-anime>
      <svg class="approche-arche" viewBox="0 0 30 38" aria-hidden="true"><path d="M2 38 V15 A13 13 0 0 1 28 15 V38" /></svg>
      <div><h3>${c.t(`parcours.approche.a${i}Titre`)}</h3><p>${c.t(`parcours.approche.a${i}Texte`)}</p></div>
    </li>`)}</ol>
    <p data-anime>${c.lien('suivi', { ancre: 'charte', classe: 'lien-trace lien-seul', texte: c.t('parcours.approche.lien') })}</p>
  </div>
</section>

<section class="cabinet conteneur" id="cabinet" data-pile>
  <div class="cabinet-tete">
    <h2 class="titre-section" data-anime>${c.t('parcours.cabinet.titre')}</h2>
    <p data-anime>${c.t('parcours.cabinet.texte')}</p>
  </div>
  <ul class="pile" data-pile-liste data-superpose>
    ${photos.map((p, i) => html`<li class="pile-photo" data-pile-photo style="--i:${i}">
      <a class="pile-lien" href="/assets/images/${p.nom}-1280.webp" data-visionneuse-index="${i}" aria-label="${c.s('parcours.cabinet.agrandir')} : ${p.alt}">
        ${c.media({ nom: p.nom, alt: '', cadrage: p.cadrage, classe: 'pile-media', sizes: '(max-width: 760px) 46vw, 300px' })}
      </a>
    </li>`)}
  </ul>
  <dialog class="visionneuse" data-visionneuse data-recouvrement aria-label="${c.s('parcours.cabinet.visionneuse')}" data-photos="${JSON.stringify(photos.map((p) => ({ src: `/assets/images/${p.nom}-1280.webp`, alt: p.alt })))}" data-texte-compteur="${c.s('parcours.cabinet.compteur')}">
    <figure class="visionneuse-cadre"><img data-visionneuse-image src="/assets/images/${photos[0].nom}-1280.webp" alt="${photos[0].alt}" width="1280" height="960"><figcaption data-visionneuse-legende>${photos[0].alt}</figcaption></figure>
    <p class="visionneuse-compteur chiffres" data-visionneuse-compteur aria-live="polite">${c.s('parcours.cabinet.compteur', { n: 1, total: photos.length })}</p>
    <button type="button" class="visionneuse-bouton visionneuse-bouton--prec" data-visionneuse-prec aria-label="${c.s('parcours.cabinet.precedente')}"><span aria-hidden="true">←</span></button>
    <button type="button" class="visionneuse-bouton visionneuse-bouton--suiv" data-visionneuse-suiv aria-label="${c.s('parcours.cabinet.suivante')}"><span aria-hidden="true">→</span></button>
    <button type="button" class="visionneuse-fermer" data-visionneuse-fermer>${c.t('parcours.cabinet.fermer')}</button>
  </dialog>
</section>

${avis(c)}

<section class="fin conteneur" id="premier-pas">
  ${c.media({ nom: 'grok/tarifs-acces', alt: c.s('tarifs.acces.alt'), cadrage: '60% 60%', classe: 'fin-media fin-media--paysage', sizes: '(max-width: 760px) 92vw, 44vw' })}
  <div>
    <h2 class="titre-section" data-anime>${c.t('parcours.fin.titre')}</h2>
    <p data-anime>${c.t('parcours.fin.texte')}</p>
    <p class="fin-actions" data-anime>
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('parcours.fin.action'), attrs: 'data-magnetique' })}
      ${c.lien('suivi', { classe: 'bouton bouton--contour', texte: c.t('parcours.fin.suivi') })}
    </p>
  </div>
</section>
`;
};

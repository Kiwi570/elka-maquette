/* L'hypnose et le suivi : déroulé en trois étapes (images qui changent pendant la lecture),
   cabinet ou visio, enfants, cadre et limites, charte d'engagement, questions fréquentes. */
import { html } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';

export const page = {
  cle: 'suivi', fichier: 'hypnose-et-suivi', imagePartage: 'grok/suivi-ouverture-1280.webp',
  ouverture: { nom: 'grok/suivi-ouverture', cadrage: '69% 55%', cadrageMobile: '50% 52%' },
};

const mots = (texte) => texte.split(' ').map((m) => html`<span class="mot-masque"><span class="mot" data-anime="gsap">${m}</span></span> `);

export default (c) => {
  const o = page.ouverture;
  const etapes = c.donnees.etapes;
  return html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <p class="surtitre" data-anime="gsap">${c.t('suivi.tete.surtitre')}</p>
    <h1 class="seuil-titre seuil-titre--page" data-superpose>${mots(c.s('suivi.tete.titre'))}</h1>
    <p class="seuil-intro" data-anime="gsap">${c.t('suivi.tete.texte')}</p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('suivi.tete.action'), attrs: 'data-action-principale data-magnetique' })}
    </p>
    <p class="seuil-info" data-info-cle data-anime="gsap">${c.t('suivi.tete.info')}</p>
  </div>
  ${arche(c, { nom: o.nom, alt: c.s('suivi.tete.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>

<section class="etapes conteneur" id="etapes" data-etapes>
  <div class="etapes-tete">
    <h2 class="titre-section" data-anime>${c.t('suivi.chemin.titre')}</h2>
    <p data-anime>${c.t('suivi.chemin.texte')}</p>
  </div>
  <div class="etapes-grille">
    <div class="etapes-images" aria-hidden="true">
      ${etapes.map((e, i) => html`<div class="etapes-image${i === 0 ? ' active' : ''}" data-etape-image="${i}">${c.media({ nom: e.image, alt: '', cadrage: e.cadrage, classe: 'etapes-media', sizes: '(max-width: 760px) 92vw, 44vw' })}</div>`)}
    </div>
    <div class="chemin-zone chemin-zone--vertical" data-chemin>
      <svg class="chemin-trace" aria-hidden="true" data-audit-ignorer preserveAspectRatio="none"><path class="chemin-fond" /><path class="chemin-ligne" data-chemin-ligne /></svg>
      <ol class="chemin-etapes chemin-etapes--detail">
        ${etapes.map((e, i) => html`<li class="chemin-etape" id="etape-${e.id}" data-etape="${i}">
          <span class="graine" aria-hidden="true"><svg viewBox="0 0 48 48"><circle class="graine-sol" cx="24" cy="40" r="5" /><path class="graine-tige" d="M24 40 V22" /><path class="graine-feuille" d="M24 27 C18 26 14 22 14 16 C20 16.5 23.4 20.4 24 25" /><path class="graine-feuille graine-feuille--d" d="M24 25 C25 18.5 29 14.5 35 14 C35 20 31 24.4 24 25.6" /></svg></span>
          <p class="chemin-numero">${e.numero}</p>
          <h3>${e.titre}</h3>
          <p class="chemin-duree">${e.duree}</p>
          <p>${e.texte}</p>
          ${c.media({ nom: e.image, alt: e.alt, cadrage: e.cadrage, classe: 'etape-media-mobile', sizes: '92vw' })}
        </li>`)}
      </ol>
    </div>
  </div>
</section>

<section class="lieux conteneur" id="cabinet-ou-visio">
  <h2 class="titre-section" data-anime>${c.t('suivi.lieux.titre')}</h2>
  <div class="lieux-grille" data-battants>
    <article class="lieu" data-anime>
      ${c.media({ nom: 'cabinet-fauteuil', alt: c.s('suivi.lieux.cabinetAlt'), cadrage: '50% 55%', classe: 'lieu-media', sizes: '(max-width: 760px) 92vw, 46vw' })}
      <h3>${c.t('suivi.lieux.cabinetTitre')}</h3>
      <p>${c.t('suivi.lieux.cabinetTexte')}</p>
    </article>
    <article class="lieu" data-anime>
      ${c.media({ nom: 'visio-laurence', alt: c.s('suivi.lieux.visioAlt'), cadrage: '52% 38%', classe: 'lieu-media', sizes: '(max-width: 760px) 92vw, 46vw' })}
      <h3>${c.t('suivi.lieux.visioTitre')}</h3>
      <p>${c.t('suivi.lieux.visioTexte')}</p>
    </article>
  </div>
</section>

<section class="enfants conteneur" id="enfants">
  <div class="enfants-texte">
    <h2 class="titre-section" data-anime>${c.t('suivi.enfants.titre')}</h2>
    <p data-anime>${c.t('suivi.enfants.texte')}</p>
    <p data-anime><span class="etiquette-lieu">${c.t('suivi.enfants.lieu')}</span></p>
  </div>
  ${c.media({ nom: 'grok/suivi-enfants', alt: c.s('suivi.enfants.alt'), cadrage: '45% 55%', classe: 'enfants-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
</section>

<section class="cadre conteneur" id="cadre">
  ${c.media({ nom: 'grok/suivi-limites', alt: c.s('suivi.cadre.alt'), cadrage: '35% 55%', classe: 'cadre-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
  <div class="cadre-texte">
    <h2 class="titre-section" data-anime>${c.t('suivi.cadre.titre')}</h2>
    <ul class="cadre-liste">${[1, 2, 3, 4].map((i) => html`<li data-anime>${c.t(`suivi.cadre.l${i}`)}</li>`)}</ul>
    <aside class="urgence" data-anime>
      <h3>${c.t('suivi.cadre.urgenceTitre')}</h3>
      <p>${c.t('suivi.cadre.urgence')}</p>
    </aside>
  </div>
</section>

<section class="charte" id="charte">
  ${c.media({ nom: 'grok/suivi-charte', alt: c.s('suivi.charte.alt'), cadrage: '70% 50%', classe: 'charte-fond', sizes: '100vw' })}
  <div class="conteneur charte-contenu">
    <h2 class="titre-section" data-anime>${c.t('suivi.charte.titre')}</h2>
    <p data-anime>${c.t('suivi.charte.texte')}</p>
    <div class="charte-colonnes">
      <div>
        <h3 data-anime>${c.t('suivi.charte.praticienne')}</h3>
        <ol class="charte-liste">${c.donnees.charte.praticienne.map((e) => html`<li data-anime><strong>${e.titre}</strong> ${e.texte}</li>`)}</ol>
      </div>
      <div>
        <h3 data-anime>${c.t('suivi.charte.patient')}</h3>
        <ol class="charte-liste">${c.donnees.charte.patient.map((e) => html`<li data-anime><strong>${e.titre}</strong> ${e.texte}</li>`)}</ol>
        <p class="note-demo" data-anime>${c.t('suivi.charte.note')}</p>
      </div>
    </div>
  </div>
</section>

<section class="faq conteneur" id="questions">
  <div class="faq-colonne">
    <h2 class="titre-section" data-anime>${c.t('suivi.faq.titre')}</h2>
    ${c.donnees.faq.map((f) => html`<details class="faq-item" id="question-${f.id}" data-anime><summary>${f.q}</summary><div class="faq-reponse"><p>${f.r}</p></div></details>`)}
  </div>
  ${c.media({ nom: 'grok/suivi-faq', alt: c.s('suivi.faq.alt'), cadrage: '35% 40%', classe: 'faq-media', sizes: '(max-width: 760px) 92vw, 36vw' })}
</section>

<section class="fin conteneur" id="premier-pas">
  ${c.media({ nom: 'cabinet-salle', alt: c.s('suivi.fin.alt'), cadrage: '45% 60%', classe: 'fin-media', sizes: '(max-width: 760px) 92vw, 44vw' })}
  <div>
    <h2 class="titre-section" data-anime>${c.t('suivi.fin.titre')}</h2>
    <p data-anime>${c.t('suivi.fin.texte')}</p>
    <p class="fin-actions" data-anime>
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('suivi.fin.action'), attrs: 'data-magnetique' })}
      ${c.lien('tarifs-rendez-vous', { ancre: 'tarifs', classe: 'bouton bouton--contour', texte: c.t('suivi.fin.tarifs') })}
    </p>
  </div>
</section>
`;
};

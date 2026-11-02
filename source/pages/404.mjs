/* Page 404 « Vous avez fait un détour » : un chemin qui se perd dans la brume. */
import { html } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';

export const page = {
  cle: '404', fichier: '404', partage: false,
  ouverture: { nom: 'grok/404', cadrage: '42% 55%', cadrageMobile: '45% 50%' },
};

export default (c) => html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <h1 class="seuil-titre seuil-titre--page" data-superpose>${c.s('introuvable.titre').split(' ').map((m) => html`<span class="mot-masque"><span class="mot" data-anime="gsap">${m}</span></span> `)}</h1>
    <p class="seuil-intro" data-anime="gsap">${c.t('introuvable.texte')}</p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('accueil', { classe: 'bouton', texte: c.t('introuvable.retour'), attrs: 'data-action-principale data-magnetique' })}
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton bouton--contour', texte: c.t('introuvable.rdv') })}
    </p>
  </div>
  ${arche(c, { nom: page.ouverture.nom, alt: c.s('introuvable.alt'), cadrage: page.ouverture.cadrage, cadrageMobile: page.ouverture.cadrageMobile, classe: 'seuil-arche-page' })}
</section>
`;

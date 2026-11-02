/* Pages légales : en-tête court avec l'arche, sommaire qui suit la lecture, barre de lecture,
   sections de texte tirées de donnees/legal.json (dispensées d'image : data-sans-visuel). */
import { html } from '../../outils/gabarit.mjs';
import { arche } from './commun.mjs';

export const ouvertureLegale = { nom: 'grok/legal', cadrage: '50% 62%', cadrageMobile: '62% 55%' };

export function pageLegale(c, cle) {
  const L = c.donnees.legal[cle];
  const o = ouvertureLegale;
  return html`
<div data-barre-lecture aria-hidden="true"></div>
<section class="seuil seuil--court" id="debut">
  <div class="seuil-texte">
    <h1 class="seuil-titre seuil-titre--legal" data-superpose><span class="mot-masque"><span class="mot" data-anime="gsap">${L.titre}</span></span></h1>
    <p class="seuil-intro" data-anime="gsap">${L.intro}</p>
    <nav class="sommaire-legal" data-sommaire data-anime="gsap" aria-label="${c.s('commun.sommaire')}"><ul>${L.sections.map((s) => html`<li><a href="#${s.id}">${s.titre}</a></li>`)}</ul></nav>
  </div>
  ${arche(c, { nom: o.nom, alt: c.s('legal.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>
<div class="texte-long conteneur" data-sans-visuel>
  ${L.sections.map((s) => html`<section id="${s.id}" data-sans-visuel${s.aCompleter ? html` class="bloc-a-completer"` : ''}>
    <h2>${s.titre}</h2>
    ${s.paragraphes ? s.paragraphes.map((p) => html`<p>${p}</p>`) : ''}
    ${s.liste ? html`<ul>${s.liste.map((p) => html`<li>${p}</li>`)}</ul>` : ''}
  </section>`)}
</div>
`;
}

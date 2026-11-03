/* Accueil d'Elka Hypnose,
   Titre : interlignage serré voulu ; les boîtes de texte de l'italique « potentiel » (police plus haute) se touchent
   sans que les lettres se chevauchent (vérifié sur les captures) : data-superpose.
   dans l'ordre où le visiteur cherche : qui, pour quoi, comment, combien et où.
   Premier écran « Le seuil » : titre à gauche, arche à droite (sous le titre sur téléphone). */
import { html, typo } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';
import { statut, carte, tableHoraires, avis, ordreAteliers, date } from '../gabarits/elements.mjs';

export const page = {
  cle: 'accueil', fichier: 'index', imagePartage: 'grok/accueil-ouverture-1280.webp',
  ouverture: { nom: 'grok/accueil-ouverture', cadrage: '50% 52%', cadrageMobile: '50% 56%' },
};

const mots = (texte, classe = '') => texte.split(' ').map((m) => html`<span class="mot-masque"><span class="mot${classe}" data-anime="gsap">${m}</span></span> `);

export default (c) => {
  const o = page.ouverture;
  const etapes = c.donnees.etapes;
  const prochain = ordreAteliers(c.donnees.ateliers).find(({ s }) => s.etat === 'avenir');
  return html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <p class="surtitre" data-anime="gsap">${c.t('accueil.rencontre.surtitre')}</p>
    <h1 class="seuil-titre" data-superpose>${mots(c.s('accueil.hero.titre1'))}<span class="mot-masque mot-masque--cle"><em class="mot mot--cle" data-anime="gsap">${c.t('accueil.hero.titreMot')}</em></span> ${mots(c.s('accueil.hero.titre2'))}</h1>
    <p class="seuil-intro" data-anime="gsap">${c.t('accueil.hero.texte')}</p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('accueil.hero.action'), attrs: 'data-action-principale data-magnetique' })}
    </p>
    <div class="seuil-statut" data-anime="gsap">${statut(c)}</div>
  </div>
  ${arche(c, { nom: o.nom, alt: c.s('accueil.hero.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>

<section class="rencontre conteneur" id="rencontre">
  ${c.media({ nom: 'laurence-portrait', alt: c.s('accueil.rencontre.alt'), cadrage: '50% 30%', classe: 'rencontre-portrait', sizes: '(max-width: 760px) 80vw, 420px' })}
  <div class="rencontre-texte">
    <h2 class="titre-section" data-anime>${c.t('accueil.rencontre.titre')}</h2>
    <p class="texte-fort" data-anime>${c.t('accueil.rencontre.texte1')}</p>
    <p data-anime>${c.t('accueil.rencontre.texte2')}</p>
    <ul class="reperes">
      ${[1, 2, 3].map((i) => html`<li data-anime><strong class="repere-chiffre">${c.t(`accueil.rencontre.r${i}Chiffre`)}</strong><span>${c.t(`accueil.rencontre.r${i}Texte`)}</span></li>`)}
    </ul>
  </div>
  <ul class="piliers">
    ${[1, 2, 3].map((i) => html`<li class="pilier" data-anime><span class="pilier-arche" aria-hidden="true"></span><h3>${c.t(`accueil.rencontre.p${i}Titre`)}</h3><p>${c.t(`accueil.rencontre.p${i}Texte`)}</p></li>`)}
  </ul>
</section>

<section class="accompagnements" id="accompagnements">
  <div class="conteneur entete-section">
    <h2 class="titre-section" data-anime>${c.t('accueil.accompagnements.titre')}</h2>
    <p data-anime>${c.t('accueil.accompagnements.intro')}</p>
  </div>
  <ul class="conteneur cartes-accompagnement">
    ${c.donnees.accompagnements.map((a) => html`<li class="carte-accompagnement" id="accompagnement-${a.id}" data-anime data-incline>
      ${c.media({ nom: a.image, alt: a.alt, cadrage: a.cadrage, classe: 'carte-accompagnement-media', sizes: '(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 300px' })}
      <div class="carte-accompagnement-texte">
        <h3>${a.titre}</h3>
        <ul>${a.liste.map((l) => html`<li>${l}</li>`)}</ul>
      </div>
    </li>`)}
  </ul>
  <div class="ruban-section" aria-label="${c.s('accueil.accompagnements.rubanTitre')}" role="group">
    <p class="ruban-titre">${c.t('accueil.accompagnements.rubanTitre')}</p>
    <div class="ruban" id="ruban-themes" data-boucle-css data-ruban><p><span>${c.t('accueil.accompagnements.ruban')}</span> <span aria-hidden="true">${c.t('accueil.accompagnements.ruban')}</span></p></div>
    <button type="button" class="ruban-pause" data-pause-pour="ruban-themes" data-libelle-pause="${c.s('commun.pause')}" data-libelle-lecture="${c.s('commun.lecture')}"><span data-libelle-bouton>${c.t('commun.pause')}</span></button>
  </div>
</section>

<section class="chemin chemin--apercu" id="chemin">
  <div class="conteneur chemin-grille">
    <div class="chemin-tete">
      <h2 class="titre-section" data-anime>${c.t('accueil.chemin.titre')}</h2>
      <p data-anime>${c.t('accueil.chemin.texte')}</p>
      ${c.media({ nom: 'grok/accueil-chemin', alt: c.s('accueil.chemin.alt'), cadrage: '38% 60%', classe: 'chemin-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
      <p data-anime>${c.lien('suivi', { ancre: 'etapes', classe: 'bouton bouton--contour', texte: c.t('accueil.chemin.lien') })}</p>
    </div>
    <div class="chemin-zone" data-chemin>
    <svg class="chemin-trace" aria-hidden="true" data-audit-ignorer preserveAspectRatio="none"><path class="chemin-fond" /><path class="chemin-ligne" data-chemin-ligne /></svg>
    <ol class="chemin-etapes">
      ${etapes.map((e) => html`<li class="chemin-etape" data-etape>
        <span class="graine" aria-hidden="true"><svg viewBox="0 0 48 48"><circle class="graine-sol" cx="24" cy="40" r="5" /><path class="graine-tige" d="M24 40 V22" /><path class="graine-feuille" d="M24 27 C18 26 14 22 14 16 C20 16.5 23.4 20.4 24 25" /><path class="graine-feuille graine-feuille--d" d="M24 25 C25 18.5 29 14.5 35 14 C35 20 31 24.4 24 25.6" /></svg></span>
        <p class="chemin-numero">${e.numero}</p>
        <h3>${e.titre}</h3>
        <p class="chemin-duree">${e.duree}</p>
        <p>${e.texte}</p>
      </li>`)}
    </ol>
    </div>
  </div>
</section>

<section class="respirer" id="respirer" data-respirer data-textes="${JSON.stringify({ inspirez: c.s('accueil.respirer.inspirez'), expirez: c.s('accueil.respirer.expirez'), fini: c.s('accueil.respirer.fini'), pret: c.s('accueil.respirer.pret'), demarrer: c.s('accueil.respirer.demarrer'), arreter: c.s('accueil.respirer.arreter'), restant: c.s('accueil.respirer.restant') })}">
  ${c.media({ nom: 'grok/respirer-aube', alt: c.s('accueil.respirer.alt'), cadrage: '50% 70%', cadrageMobile: '50% 70%', classe: 'respirer-fond', sizes: '100vw' })}
  <div class="respirer-carte conteneur">
    <div class="respirer-texte">
      <h2 class="titre-section" data-anime>${c.t('accueil.respirer.titre')}</h2>
      <p data-anime>${c.t('accueil.respirer.texte')}</p>
      <p class="respirer-rythme" data-anime>${c.t('accueil.respirer.rythme')}</p>
      <p data-anime><button type="button" class="bouton" data-respirer-bouton aria-pressed="false"><span data-libelle-bouton>${c.t('accueil.respirer.demarrer')}</span></button></p>
      <p class="note-demo" data-anime>${c.t('accueil.respirer.note')}</p>
    </div>
    <div class="respirer-arche" aria-hidden="true">
      <svg viewBox="0 0 200 280"><path class="respirer-contour" d="M10 280 V100 A90 90 0 0 1 190 100 V280" /></svg>
      <span class="respirer-lumiere" data-respirer-lumiere></span>
    </div>
    <p class="respirer-consigne" aria-live="polite"><strong data-respirer-consigne>${c.t('accueil.respirer.pret')}</strong> <span class="chiffres" data-respirer-restant></span></p>
  </div>
</section>

<section class="parcours conteneur" id="parcours">
  <div class="parcours-tete">
    <h2 class="titre-section" data-anime>${c.t('accueil.parcours.titre')}</h2>
    <p data-anime>${c.t('accueil.parcours.texte')}</p>
    <p class="parcours-snh" data-anime><img src="/assets/images/logo-snh.png" alt="${c.s('accueil.parcours.snhAlt')}" width="240" height="72" loading="lazy"><span>${c.t('accueil.parcours.snh')}</span></p>
    <p data-anime>${c.lien('parcours', { classe: 'bouton bouton--contour', texte: c.t('accueil.parcours.lien') })}</p>
  </div>
  ${c.media({ nom: 'grok/parcours-ouverture', alt: c.s('accueil.parcours.alt'), cadrage: '57% 62%', classe: 'parcours-media', sizes: '(max-width: 760px) 92vw, 45vw' })}
</section>

<section class="ateliers" id="ateliers">
  <div class="conteneur ateliers-tete">
    <div>
      <h2 class="titre-section" data-anime>${c.t('accueil.ateliers.titre')}</h2>
      <p data-anime>${c.t('accueil.ateliers.texte')}</p>
      <p class="ateliers-contenu" data-anime>${c.t('accueil.ateliers.contenu')}</p>
      <ul class="ateliers-infos" data-anime>
        <li><strong data-prix>${c.t('accueil.ateliers.prix')}</strong> ${c.t('accueil.ateliers.prixUnite')}</li>
        <li>${c.t('accueil.ateliers.places')}</li>
        <li>${c.t('accueil.ateliers.zoom')}</li>
      </ul>
      <div class="ateliers-apercu">
        <p class="ateliers-apercu-titre" data-anime>${c.t('accueil.ateliers.themesTitre')}</p>
        <ul class="ateliers-themes" data-anime>${c.donnees.themes.map((t) => html`<li>${c.lien('ateliers', { ancre: `theme-${t.id}`, classe: `theme-pastille theme-pastille--${t.id}`, texte: html`<span class="cal-point" aria-hidden="true"></span>${t.nom}` })}</li>`)}</ul>
        ${prochain ? html`<p class="ateliers-prochain" data-anime data-prochain data-textes="${JSON.stringify({ prochain: typo(c.s('ateliers.tete.prochain')), aucun: typo(c.s('ateliers.tete.aucun')) })}" data-ateliers-json="${JSON.stringify(c.donnees.ateliers.map((a) => ({ theme: a.theme, debut: a.debut, d0: a.seances[0], date: date(a.seances[0]) })))}">${c.t('ateliers.tete.prochain', { theme: prochain.a.theme, date: date(prochain.a.seances[0]) })}</p>` : ''}
        <p class="ateliers-apercu-actions" data-anime>${c.lien('ateliers', { classe: 'bouton bouton--clair', texte: c.t('accueil.ateliers.voir'), attrs: 'data-magnetique' })} ${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=atelier', classe: 'bouton bouton--contour-clair', texte: c.t('accueil.ateliers.inscrire') })}</p>
      </div>
    </div>
    ${c.media({ nom: 'grok/ateliers-visio', alt: c.s('accueil.ateliers.alt'), cadrage: '50% 55%', classe: 'ateliers-media', sizes: '(max-width: 760px) 92vw, 44vw' })}
  </div>
</section>

${avis(c)}

<section class="carnet conteneur" id="carnet">
  <h2 class="titre-section" data-anime>${c.t('accueil.carnet.titre')}</h2>
  <p data-anime>${c.t('accueil.carnet.texte')}</p>
  <ul class="carnet-liste">
    ${[['a1', 'grok/carnet-responsable'], ['a2', 'grok/carnet-commandes']].map(([k, img]) => html`<li class="article-carte" data-anime>
      ${c.media({ nom: img, alt: c.s(`accueil.carnet.${k}Alt`), classe: 'article-media', sizes: '(max-width: 760px) 92vw, 46vw' })}
      <p class="article-meta"><span>${c.t(`accueil.carnet.${k}Date`)}</span> · <span>${c.t(`accueil.carnet.${k}Duree`)}</span></p>
      <h3>${c.t(`accueil.carnet.${k}Titre`)}</h3>
      <p>${c.t(`accueil.carnet.${k}Resume`)}</p>
      <p class="article-bientot">${c.t('accueil.carnet.bientot')}</p>
    </li>`)}
  </ul>
</section>

<section class="venir conteneur" id="venir">
  <div class="venir-tete">
    <h2 class="titre-section" data-anime>${c.t('accueil.venir.titre')}</h2>
    <p data-anime>${c.t('accueil.venir.texte')}</p>
  </div>
  <div class="venir-gauche">
    ${carte(c)}
    <h3 data-anime>${c.t('accueil.venir.horairesTitre')}</h3>
    ${statut(c, { info: false })}
    ${tableHoraires(c)}
    <p class="petite-note">${c.t('accueil.venir.horairesNote')}</p>
  </div>
  <div class="venir-infos">
    ${c.media({ nom: 'cabinet-salle', alt: c.s('accueil.venir.alt'), cadrage: '45% 60%', classe: 'venir-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
    <address class="venir-adresse" data-anime>${c.site.contact.rue}<br><span class="insecable">${c.site.contact.ville}</span><br><span class="venir-stationnement">${c.site.contact.stationnement}</span></address>
    <p class="venir-actions">${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('accueil.venir.action'), attrs: 'data-magnetique' })} <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')}</a></p>
  </div>
</section>
`;
};

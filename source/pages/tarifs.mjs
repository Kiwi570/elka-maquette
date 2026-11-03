/* Tarifs et rendez-vous : grille des tarifs, trois façons de réserver (Résalib, téléphone, rappel simulé
   en deux étapes avec récapitulatif), conditions, horaires et statut, accès. */
import { html } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';
import { statut, tableHoraires, carte, ordreAteliers, date } from '../gabarits/elements.mjs';

export const page = {
  cle: 'tarifs-rendez-vous', fichier: 'tarifs-et-rendez-vous', imagePartage: 'grok/tarifs-ouverture-1280.webp',
  ouverture: { nom: 'grok/tarifs-ouverture', cadrage: '47% 50%', cadrageMobile: '58% 55%' },
};

const mots = (texte) => texte.split(' ').map((m) => html`<span class="mot-masque"><span class="mot" data-anime="gsap">${m}</span></span> `);

export default (c) => {
  const o = page.ouverture;
  const F = (k) => c.t(`tarifs.form.${k}`);
  const lignes = ['seance', 'etudiant', 'atelier', 'regressive'];
  const sujets = [['premiere', 'sujetPremiere'], ['suivi', 'sujetSuivi'], ['enfant', 'sujetEnfant'], ['atelier', 'sujetAtelier'], ['prochain', 'sujetProchain'], ['autre', 'sujetAutre']];
  const ateliersOuverts = ordreAteliers(c.donnees.ateliers).filter(({ s }) => s.etat === 'avenir');
  return html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <p class="surtitre" data-anime="gsap">${c.t('tarifs.tete.surtitre')}</p>
    <h1 class="seuil-titre seuil-titre--page" data-superpose>${mots(c.s('tarifs.tete.titre'))}</h1>
    <p class="seuil-prix" data-anime="gsap">${c.t('tarifs.tete.texte')} <strong class="prix-appel" data-prix data-info-cle>${c.t('tarifs.tete.prix')}</strong></p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('tarifs-rendez-vous', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('tarifs.tete.action'), attrs: 'data-action-principale data-magnetique' })}
      <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')}</a>
    </p>
    <div class="seuil-statut" data-anime="gsap">${statut(c, { info: false })}</div>
  </div>
  ${arche(c, { nom: o.nom, alt: c.s('tarifs.tete.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>

<section class="grille-tarifs conteneur" id="tarifs">
  <div class="tarifs-texte">
    <h2 class="titre-section" data-anime>${c.t('tarifs.grille.titre')}</h2>
    <ul class="tarifs-liste">
      ${lignes.map((l) => html`<li class="tarif tarif--${l}" data-anime>
        <div><h3>${c.t(`tarifs.grille.${l}Nom`)}</h3><p>${c.t(`tarifs.grille.${l}Detail`)}${l === 'atelier' ? html` ${c.lien('ateliers', { ancre: 'calendrier', classe: 'lien-trace', texte: c.t('tarifs.grille.atelierLien') })}` : ''}</p></div>
        <p class="tarif-prix"><strong class="chiffres" data-prix>${c.t(`tarifs.grille.${l}Prix`)}</strong><span>${c.t(`tarifs.grille.${l}Unite`)}</span></p>
      </li>`)}
    </ul>
    <p class="a-completer" data-anime>${c.t('tarifs.grille.mutuelles')}</p>
    <p class="petite-note" data-anime>${c.t('tarifs.grille.tva')}</p>
  </div>
  <div class="tarifs-cote">
    ${c.media({ nom: 'grok/tarifs-tisane', alt: c.s('tarifs.grille.alt'), cadrage: '45% 60%', classe: 'tarifs-media', sizes: '(max-width: 760px) 92vw, 36vw' })}
    <div class="paiement" data-anime>
      <h3>${c.t('tarifs.grille.paiementTitre')}</h3>
      <ul>${[1, 2, 3, 4].map((i) => html`<li>${c.t(`tarifs.grille.paiement${i}`)}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="rdv" id="rendez-vous">
  <div class="conteneur">
    <div class="rdv-tete">
      <h2 class="titre-section" data-anime>${c.t('tarifs.rdv.titre')}</h2>
      <p data-anime>${c.t('tarifs.rdv.texte')}</p>
    </div>
    <ul class="rdv-voies">
      <li class="voie" data-anime>
        <span class="voie-numero" aria-hidden="true">1</span>
        <h3>${c.t('tarifs.rdv.enLigneTitre')}</h3>
        <p>${c.t('tarifs.rdv.enLigneTexte')}</p>
        <p><a class="bouton" href="${c.site.liens.resalib}" target="_blank" rel="noopener" data-magnetique>${c.t('tarifs.rdv.enLigneAction')}<span class="visuellement-cache"> ${c.t('commun.nouvelOnglet')}</span></a></p>
      </li>
      <li class="voie" data-anime>
        <span class="voie-numero" aria-hidden="true">2</span>
        <h3>${c.t('tarifs.rdv.telTitre')}</h3>
        <p>${c.t('tarifs.rdv.telTexte')}</p>
        <p><a class="bouton bouton--contour voie-tel chiffres" href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
      </li>
      <li class="voie" data-anime>
        <span class="voie-numero" aria-hidden="true">3</span>
        <h3>${c.t('tarifs.rdv.rappelTitre')}</h3>
        <p>${c.t('tarifs.rdv.rappelTexte')}</p>
        <p>${c.lien('tarifs-rendez-vous', { ancre: 'rappel', classe: 'bouton bouton--contour', texte: c.t('tarifs.rdv.rappelAction') })}</p>
      </li>
    </ul>
    <div class="rappel" id="rappel">
      <div class="rappel-formulaire">
        <h3 class="rappel-titre">${F('titre')}</h3>
        <p class="rappel-deroule">${F('deroule')}</p>
        <form data-formulaire data-etapes-form novalidate>
          <ol class="rappel-progres" aria-hidden="true"><li class="actif" data-progres="1">${F('etape1')}</li><li data-progres="2">${F('etape2')}</li></ol>
          <div class="rappel-pas" data-pas="1">
            <fieldset class="champ">
              <legend>${F('sujet')}</legend>
              <div class="choix">${sujets.map(([v, k]) => html`<label class="choix-option"><input type="radio" name="sujet" value="${v}" required${v === 'premiere' ? html` checked` : ''}><span>${F(k)}</span></label>`)}</div>
            </fieldset>
            <div class="champ" data-si-sujet="atelier">
              <label for="atelier">${F('atelier')}</label>
              <select id="atelier" name="atelier" aria-describedby="erreur-atelier-choix">
                <option value="">${F('atelierChoisir')}</option>
                ${ateliersOuverts.map(({ a }) => html`<option value="${a.id}">${c.s('tarifs.form.atelierOption', { theme: a.theme, jour: a.jour, date: date(a.seances[0]) })}</option>`)}
              </select>
              <p class="champ-erreur" id="erreur-atelier-choix" data-erreur-atelier aria-live="polite" hidden>${F('atelierErreur')}</p>
            </div>
            <fieldset class="champ" data-si-sujet="premiere,suivi,enfant,autre">
              <legend>${F('lieu')}</legend>
              <div class="choix choix--ligne">${[['cabinet', 'lieuCabinet'], ['visio', 'lieuVisio'], ['indifferent', 'lieuIndifferent']].map(([v, k]) => html`<label class="choix-option"><input type="radio" name="lieu" value="${v}"${v === 'indifferent' ? html` checked` : ''}><span>${F(k)}</span></label>`)}</div>
            </fieldset>
            <div class="champ">
              <label for="message">${F('message')}</label>
              <textarea id="message" name="message" rows="3"></textarea>
            </div>
            <p class="rappel-boutons"><button type="button" class="bouton" data-pas-suivant>${F('suivant')}</button></p>
          </div>
          <div class="rappel-pas" data-pas="2">
            <div class="champ"><label for="nom">${F('nom')}</label><input id="nom" name="nom" type="text" autocomplete="name" required></div>
            <div class="champ"><label for="tel">${F('tel')}</label><input id="tel" name="tel" type="tel" autocomplete="tel" inputmode="tel" required></div>
            <div class="champ"><label for="email">${F('email')}</label><input id="email" name="email" type="email" autocomplete="email"></div>
            <div class="champ"><label for="moment">${F('moment')}</label><input id="moment" name="moment" type="text"></div>
            <div class="champ champ--case"><label class="case"><input type="checkbox" name="consentement" value="oui" required><span>${F('consentement')}</span></label></div>
            <p class="mention-donnees">${F('donnees')} ${c.lien('confidentialite', { classe: 'lien-trace', texte: F('confidentialite') })}</p>
            <p class="rappel-boutons"><button type="button" class="bouton bouton--contour" data-pas-precedent>${F('precedent')}</button> <button type="submit" class="bouton">${F('envoyer')}</button></p>
          </div>
          <p data-message-envoi hidden tabindex="-1" data-texte="${c.s('tarifs.form.simule')}"></p>
        </form>
      </div>
      <aside class="rappel-recap" aria-live="polite" data-recap data-libelles="${JSON.stringify({ sujet: c.s('tarifs.form.recapSujet'), atelier: c.s('tarifs.form.recapAtelier'), lieu: c.s('tarifs.form.recapLieu'), nom: c.s('tarifs.form.recapNom'), tel: c.s('tarifs.form.recapTel') })}">
        ${c.media({ nom: 'seance-debout', alt: c.s('tarifs.rdv.alt'), cadrage: '45% 30%', classe: 'rappel-media', sizes: '(max-width: 760px) 92vw, 30vw' })}
        <h3>${F('recap')}</h3>
        <dl data-recap-liste><div><dt>${F('recapSujet')}</dt><dd>${F('sujetPremiere')}</dd></div></dl>
        <p class="petite-note">${F('recapVide')}</p>
      </aside>
    </div>
  </div>
</section>

<section class="conditions conteneur" id="conditions">
  <div>
    <h2 class="titre-section" data-anime>${c.t('tarifs.conditions.titre')}</h2>
    <dl class="conditions-liste">${[1, 2, 3, 4].map((i) => html`<div data-anime><dt>${c.t(`tarifs.conditions.c${i}Titre`)}</dt><dd>${c.t(`tarifs.conditions.c${i}`)}</dd></div>`)}</dl>
    <p class="a-completer" data-anime>${c.t('tarifs.conditions.note')}</p>
    <p data-anime>${c.lien('cgv', { classe: 'lien-trace lien-seul', texte: c.t('tarifs.conditions.cgv') })}</p>
  </div>
  ${c.media({ nom: 'cabinet-fauteuil', alt: c.s('tarifs.conditions.alt'), cadrage: '50% 50%', classe: 'conditions-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
</section>

<section class="horaires-section conteneur" id="horaires">
  ${c.media({ nom: 'grok/tarifs-horaires', alt: c.s('tarifs.horaires.alt'), cadrage: '55% 50%', classe: 'horaires-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
  <div>
    <h2 class="titre-section" data-anime>${c.t('tarifs.horaires.titre')}</h2>
    <p data-anime>${c.t('tarifs.horaires.texte')}</p>
    ${statut(c, { info: false })}
    ${tableHoraires(c)}
    <p class="a-completer">${c.t('tarifs.horaires.fermetures')}</p>
  </div>
</section>

<section class="acces conteneur" id="acces">
  <div class="acces-texte">
    <h2 class="titre-section" data-anime>${c.t('tarifs.acces.titre')}</h2>
    <address data-anime>${c.site.contact.rue}<br><span class="insecable">${c.site.contact.ville}</span></address>
    <p data-anime>${c.site.contact.stationnement}</p>
    ${c.media({ nom: 'grok/tarifs-acces', alt: c.s('tarifs.acces.alt'), cadrage: '60% 60%', classe: 'acces-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
  </div>
  ${carte(c)}
  <div class="acces-fin" data-anime>
    <h3>${c.t('tarifs.fin.titre')}</h3>
    <p>${c.t('tarifs.fin.texte')}</p>
    <p class="fin-actions">
      <a class="bouton" href="tel:${c.site.contact.telephoneLien}" data-magnetique>${c.t('commun.appelerNumero', { tel: c.site.contact.telephone })}</a>
      ${c.lien('suivi', { classe: 'bouton bouton--contour', texte: c.t('tarifs.fin.suivi') })}
    </p>
  </div>
</section>
`;
};

/* Ateliers d'autohypnose : les trois thèmes derrière des portes qui s'ouvrent, le calendrier des séances
   (graines de la couleur du thème, filtre gardé dans l'adresse, séance choisie et son atelier),
   le déroulé d'une séance (sablier lié à la lecture), la visio, les ateliers avec leur statut en direct,
   les conditions et les questions fréquentes.
   Premier écran « Le seuil » : titre à gauche, arche à droite (sous le titre sur téléphone). */
import { html, typo } from '../../outils/gabarit.mjs';
import { arche } from '../gabarits/commun.mjs';
import { cartesAteliers, ordreAteliers, statutAtelier, date, heure, maintenantParis } from '../gabarits/elements.mjs';

export const page = {
  cle: 'ateliers', fichier: 'ateliers', imagePartage: 'grok/ateliers-ouverture-1280.webp',
  ouverture: { nom: 'grok/ateliers-ouverture', cadrage: '50% 62%', cadrageMobile: '50% 56%' },
};

const mots = (texte) => texte.split(' ').map((m) => html`<span class="mot-masque"><span class="mot" data-anime="gsap">${m}</span></span> `);

/* Tasse de tisane dessinée : quatre tasses, une par place ; la vapeur monte trois fois puis s'arrête. */
const tasse = html`<svg viewBox="0 0 40 44" aria-hidden="true"><path class="tasse-vapeur" d="M15 15 C12 11 18 9 15 4" /><path class="tasse-vapeur tasse-vapeur--2" d="M23 15 C20 11 26 9 23 4" /><path class="tasse-corps" d="M7 19 H31 V26 C31 33 26 37 19 37 C12 37 7 33 7 26 Z" /><path class="tasse-anse" d="M31 22 C37 22 37 30 31 30" /><path class="tasse-soucoupe" d="M3 40 H35" /></svg>`;

/* Graine d'une séance (pastille du calendrier). */
const graine = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path class="graine-coque" d="M12 4 C17 8 18 14 12 20 C6 14 7 8 12 4 Z" /><path class="graine-ligne" d="M12 7 V17" /></svg>`;

/* Jours d'un mois, lundi en premier : { iso, jour, col } */
function joursDuMois(annee, mois) {
  const n = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(annee, mois - 1, i + 1));
    return { iso: d.toISOString().slice(0, 10), jour: i + 1, col: ((d.getUTCDay() + 6) % 7) + 1 };
  });
}

export default (c) => {
  const o = page.ouverture;
  const A = c.donnees.ateliers;
  const themes = c.donnees.themes;
  const theme = (id) => themes.find((t) => t.id === id);
  const T = (k, v) => c.s(`ateliers.${k}`, v);
  const joursCourts = T('calendrier.jours').split(' ');
  const joursLongs = T('calendrier.joursLongs').split(' ');
  const nomJour = (iso) => joursLongs[(new Date(iso + 'T12:00:00Z').getUTCDay() + 6) % 7];
  const now = maintenantParis();
  const ordre = ordreAteliers(A, now);
  const prochain = ordre.find(({ s }) => s.etat === 'avenir');
  /* Séance choisie au départ : la première séance du prochain atelier ouvert. */
  const depart = prochain ? prochain.a : ordre[0].a;
  const seances = A.flatMap((a) => a.seances.map((j, i) => ({ a, j, n: i + 1 })));
  const mois = [[2026, 11], [2026, 12]];
  /* Textes repris par le JavaScript : typographie française appliquée ici (les attributs data-* n'y passent pas). */
  const typoTout = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' && !k.startsWith('lien') ? typo(v) : v]));
  const textesCalendrier = typoTout({
    seance: T('calendrier.seance'), detailDate: T('calendrier.detailDate'), detailHoraire: T('calendrier.detailHoraire'), detailPeriode: T('calendrier.detailPeriode'),
    joursLongs, aVenir: c.s('accueil.ateliers.aVenir'), enCours: c.s('accueil.ateliers.enCours'), termine: c.s('accueil.ateliers.termine'),
    dans: c.s('accueil.ateliers.dans'), demain: c.s('accueil.ateliers.demain'), aujourdhui: c.s('accueil.ateliers.aujourdhui'),
    inscrire: c.s('accueil.ateliers.inscrire'), ferme: c.s('accueil.ateliers.ferme'), prochain: c.s('accueil.ateliers.prochainCourt'),
    lienInscrire: c.url('tarifs-rendez-vous', 'rappel', 'sujet=atelier&atelier={id}'), lienProchain: c.url('tarifs-rendez-vous', 'rappel', 'sujet=prochain'),
    libelleRdv: c.libelle('tarifs-rendez-vous'),
  });
  const fiche = (a, n) => {
    const s = statutAtelier(a, now);
    const j = a.seances[n - 1];
    const relatif = s.etat === 'avenir' ? (s.jours === 0 ? textesCalendrier.aujourdhui : s.jours === 1 ? textesCalendrier.demain : textesCalendrier.dans.replace('{n}', s.jours)) : '';
    return html`<p class="cal-fiche-theme"><span class="cal-point" aria-hidden="true"></span>${a.theme}</p>
      <p class="cal-fiche-seance">${T('calendrier.seance', { n })}</p>
      <p class="cal-fiche-date">${T('calendrier.detailDate', { jour: nomJour(j), date: date(j) })}</p>
      <p class="cal-fiche-heure">${T('calendrier.detailHoraire', { debut: heure(a.debut), fin: heure(a.fin) })}</p>
      <ol class="cal-fiche-graines" aria-hidden="true">${a.seances.map((x, i) => html`<li class="${i + 1 === n ? 'ici' : ''}${x < now.iso ? ' passee' : ''}"></li>`)}</ol>
      <p class="cal-fiche-periode">${T('calendrier.detailPeriode', { d1: date(a.seances[0]), d2: date(a.seances[3]), jour: a.jour })}</p>
      <p class="cal-fiche-statut"><span class="atelier-etiquette">${s.etat === 'avenir' ? textesCalendrier.aVenir : s.etat === 'encours' ? textesCalendrier.enCours : textesCalendrier.termine}</span> ${relatif}</p>
      <p class="cal-fiche-action">${s.etat === 'avenir'
        ? c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: `sujet=atelier&atelier=${a.id}`, classe: 'bouton bouton--petit', texte: textesCalendrier.inscrire })
        : html`<span class="atelier-ferme">${s.etat === 'encours' ? textesCalendrier.ferme : textesCalendrier.termine}</span> ${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=prochain', classe: 'bouton bouton--petit bouton--contour', texte: textesCalendrier.prochain })}`}</p>`;
  };

  return html`
<section class="seuil ecran" id="debut">
  <div class="seuil-texte">
    <p class="surtitre" data-anime="gsap">${c.t('ateliers.tete.surtitre')}</p>
    <h1 class="seuil-titre seuil-titre--page" data-superpose>${mots(T('tete.titre1'))}<span class="mot-masque mot-masque--cle"><em class="mot mot--cle" data-anime="gsap">${c.t('ateliers.tete.titreMot')}</em></span> ${mots(T('tete.titre2'))}</h1>
    <p class="seuil-prix" data-info-cle data-anime="gsap"><strong class="prix-appel" data-prix>${c.t('ateliers.tete.prix')}</strong> ${c.t('ateliers.tete.prixUnite')}</p>
    <p class="seuil-intro" data-anime="gsap">${c.t('ateliers.tete.texte')}</p>
    <p class="seuil-actions" data-anime="gsap">
      ${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=atelier', classe: 'bouton', texte: c.t('ateliers.tete.action'), attrs: 'data-action-principale data-magnetique' })}
      <a class="bouton bouton--contour" href="#calendrier">${c.t('ateliers.tete.calendrier')}</a>
    </p>
    <div class="seuil-info places-tasses" data-anime="gsap">
      <span class="tasses" aria-hidden="true">${[1, 2, 3, 4].map(() => tasse)}</span>
      <p><strong>${c.t('ateliers.tete.places')}</strong><br><span data-prochain data-textes="${JSON.stringify({ prochain: typo(T('tete.prochain')), aucun: typo(T('tete.aucun')) })}" data-ateliers-json="${JSON.stringify(A.map((a) => ({ theme: a.theme, debut: a.debut, d0: a.seances[0], date: date(a.seances[0]) })))}">${prochain ? T('tete.prochain', { theme: prochain.a.theme, date: date(prochain.a.seances[0]) }) : T('tete.aucun')}</span></p>
    </div>
  </div>
  ${arche(c, { nom: o.nom, alt: T('tete.alt'), cadrage: o.cadrage, cadrageMobile: o.cadrageMobile, classe: 'seuil-arche-page' })}
</section>

<section class="themes conteneur" id="themes">
  <div class="entete-section">
    <h2 class="titre-section" data-anime>${c.t('ateliers.themes.titre')}</h2>
    <p data-anime>${c.t('ateliers.themes.texte')}</p>
  </div>
  <ul class="portes">
    ${themes.map((t) => html`<li class="porte porte--${t.id}" id="theme-${t.id}" data-porte>
      <div class="porte-arche">
        ${c.media({ nom: t.image, alt: t.alt, cadrage: t.cadrage, classe: 'porte-media', sizes: '(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 380px' })}
        <span class="porte-battants" aria-hidden="true"><span class="porte-battant porte-battant--g"></span><span class="porte-battant porte-battant--d"></span></span>
        <svg class="porte-cadre" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><path d="M1 125 V50 A49 49 0 0 1 99 50 V125" /></svg>
      </div>
      <div class="porte-texte">
        <p class="porte-accroche">${t.accroche}</p>
        <h3 class="porte-titre">${t.nom}</h3>
        <ul class="porte-objectifs">${t.objectifs.map((x) => html`<li>${x}</li>`)}</ul>
        <p class="porte-pourqui">${t.pourQui}</p>

        <p class="porte-action"><a class="bouton bouton--petit bouton--contour" href="?theme=${t.id}#calendrier" data-filtre-lien="${t.id}" data-sans-transition>${c.t('ateliers.themes.voir')}</a></p>
      </div>
    </li>`)}
  </ul>
  <p class="themes-commun" data-anime>${c.t('ateliers.themes.commun')}</p>
</section>

<section class="calendrier" id="calendrier" data-calendrier data-textes="${JSON.stringify(textesCalendrier)}" data-ateliers-json="${JSON.stringify(A.map((a) => ({ id: a.id, theme: a.theme, themeId: a.themeId, jour: a.jour, debut: a.debut, fin: a.fin, seances: a.seances, debutTexte: heure(a.debut), finTexte: heure(a.fin), dates: a.seances.map((j) => date(j)) })))}">
  <div class="conteneur">
    <div class="calendrier-tete">
      <h2 class="titre-section" data-anime>${c.t('ateliers.calendrier.titre')}</h2>
      <p data-anime>${c.t('ateliers.calendrier.texte')}</p>
    </div>
    <div class="cal-filtres" role="group" aria-label="${T('calendrier.filtres')}" data-anime>
      <button type="button" class="cal-filtre" data-filtre="tous" aria-pressed="true">${c.t('ateliers.calendrier.tous')}</button>
      ${themes.map((t) => html`<button type="button" class="cal-filtre cal-filtre--${t.id}" data-filtre="${t.id}" aria-pressed="false"><span class="cal-point" aria-hidden="true"></span>${t.nom}</button>`)}
    </div>
    <div class="cal-grille">
      <div class="cal-mois-liste" data-visuel>
        ${mois.map(([an, m]) => html`<div class="mois">
          <h3 class="mois-titre">${T('calendrier.mois').split(' ')[m - 1]} ${an}</h3>
          <ol class="mois-entete" aria-hidden="true">${joursCourts.map((j) => html`<li>${j}</li>`)}</ol>
          <ol class="mois-jours">
            ${joursDuMois(an, m).map((d) => {
              const ici = seances.filter((s) => s.j === d.iso).sort((x, y) => x.a.debut.localeCompare(y.a.debut));
              return html`<li class="jour${ici.length ? ' jour--seance' : ''}${d.iso < now.iso ? ' jour--passe' : ''}${d.iso === now.iso ? ' jour--aujourdhui' : ''}" data-date="${d.iso}" style="--col:${d.col}">
                <p class="jour-tete"><span class="jour-nom">${joursCourts[d.col - 1]}</span> <span class="jour-num">${d.jour}</span></p>
                ${ici.length ? html`<ul class="jour-seances">${ici.map((s) => html`<li><button type="button" class="graine-seance graine-seance--${s.a.themeId}" data-theme="${s.a.themeId}" data-session="${s.a.id}" data-n="${s.n}" aria-pressed="${s.a.id === depart.id && s.n === 1 ? 'true' : 'false'}">${graine}<span class="graine-heure">${heure(s.a.debut)}</span> <span class="graine-theme">${s.a.theme}</span><span class="visuellement-cache">, ${T('calendrier.seanceSuite', { n: s.n, date: `${nomJour(s.j)} ${date(s.j)}` })}</span></button></li>`)}</ul>` : ''}
              </li>`;
            })}
          </ol>
        </div>`)}
      </div>
      <aside class="cal-fiche cal-fiche--${depart.themeId}" aria-live="polite" data-cal-fiche>
        <p class="cal-fiche-titre">${c.t('ateliers.calendrier.choisie')}</p>
        <div data-cal-fiche-contenu>${fiche(depart, 1)}</div>
      </aside>
    </div>
  </div>
</section>

<section class="seance-section conteneur" id="seance" data-sablier-zone>
  <div class="seance-tete">
    <div>
      <h2 class="titre-section" data-anime>${c.t('ateliers.seance.titre')}</h2>
      <p data-anime>${c.t('ateliers.seance.texte')}</p>
    </div>
    ${c.media({ nom: 'grok/ateliers-visio', alt: T('seance.alt'), cadrage: '50% 55%', classe: 'seance-media', sizes: '(max-width: 760px) 92vw, 44vw' })}
  </div>
  <div class="seance-grille">
    <div class="sablier-colonne">
      <figure class="sablier" data-sablier data-visuel>
        <svg viewBox="0 0 160 240" aria-hidden="true">
          <defs>
            <clipPath id="sablier-haut"><path d="M34 34 H126 C126 78 92 96 82 118 H78 C68 96 34 78 34 34 Z" /></clipPath>
            <clipPath id="sablier-bas"><path d="M78 122 H82 C92 144 126 162 126 206 H34 C34 162 68 144 78 122 Z" /></clipPath>
          </defs>
          <path class="sablier-arche" d="M8 236 V80 A72 72 0 0 1 152 80 V236" />
          <g clip-path="url(#sablier-haut)"><rect class="sablier-sable" data-sable-haut x="20" y="34" width="120" height="88" /></g>
          <g clip-path="url(#sablier-bas)"><rect class="sablier-sable" data-sable-bas x="20" y="206" width="120" height="0" /></g>
          <path class="sablier-filet" data-sable-filet d="M80 118 V206" />
          <path class="sablier-verre" d="M34 34 H126 C126 78 92 96 82 118 H78 C68 96 34 78 34 34 Z M78 122 H82 C92 144 126 162 126 206 H34 C34 162 68 144 78 122 Z" />
          <path class="sablier-bois" d="M24 26 H136 M24 214 H136" />
        </svg>
        <figcaption class="sablier-total"><span class="chiffres">${c.t('ateliers.seance.total')}</span></figcaption>
      </figure>
    </div>
    <ol class="moments">
      ${[1, 2, 3, 4].map((i) => html`<li class="moment${i === 1 ? ' actif' : ''}" data-moment="${i - 1}">
        <span class="moment-num" aria-hidden="true">${i}</span>
        <h3>${c.t(`ateliers.seance.m${i}Titre`)}</h3>
        <p>${c.t(`ateliers.seance.m${i}Texte`)}</p>
        ${i === 4 ? html`<p class="moment-duree"><span class="chiffres">${c.t('ateliers.seance.m4Duree')}</span></p>` : ''}
      </li>`)}
    </ol>
  </div>
</section>

<section class="visio conteneur" id="visio">
  ${c.media({ nom: 'visio-laurence', alt: c.s('suivi.lieux.visioAlt'), cadrage: '52% 38%', classe: 'visio-media', sizes: '(max-width: 760px) 92vw, 46vw' })}
  <div class="visio-texte">
    <h2 class="titre-section" data-anime>${c.t('ateliers.visio.titre')}</h2>
    <p class="texte-fort" data-anime>${c.t('ateliers.visio.texte')}</p>
    <ul class="visio-liste">${[1, 2, 3].map((i) => html`<li data-anime>${c.t(`ateliers.visio.l${i}`)}</li>`)}</ul>
    <div class="places" data-places data-visuel>
      <span class="tasses tasses--places" aria-hidden="true">${[1, 2, 3, 4].map(() => tasse)}</span>
      <p class="places-legende">${c.t('ateliers.visio.places')}</p>
    </div>
    <p class="visio-anime" data-anime>${c.t('ateliers.visio.anime')} ${c.lien('parcours', { classe: 'lien-trace', texte: c.t('ateliers.visio.animeLien') })}</p>
  </div>
</section>

<section class="ateliers ateliers--page" id="sessions">
  <div class="conteneur ateliers-tete">
    <div>
      <h2 class="titre-section" data-anime>${c.t('ateliers.sessions.titre')}</h2>
      <p data-anime>${c.t('ateliers.sessions.texte')}</p>
    </div>
    ${c.media({ nom: 'grok/atelier-seance', alt: T('sessions.alt'), cadrage: '50% 55%', classe: 'ateliers-media', sizes: '(max-width: 760px) 92vw, 44vw' })}
  </div>
  <div class="conteneur">
    <p class="indication-glisser" aria-hidden="true">${c.t('commun.glisser')}</p>
    ${cartesAteliers(c)}
  </div>
</section>

<section class="savoir conteneur" id="conditions">
  <div class="savoir-colonne">
    <h2 class="titre-section" data-anime>${c.t('ateliers.conditions.titre')}</h2>
    <ol class="savoir-etapes">${[1, 2, 3].map((i) => html`<li data-anime><span class="savoir-arche" aria-hidden="true">${i}</span><div><h3>${c.t(`ateliers.conditions.c${i}Titre`)}</h3><p>${c.t(`ateliers.conditions.c${i}Texte`)}</p></div></li>`)}</ol>
    <h2 class="titre-section titre-section--suite" id="questions" data-anime>${c.t('ateliers.faq.titre')}</h2>
    ${[1, 2, 4, 5].map((i) => html`<details class="faq-item" data-anime><summary>${c.t(`ateliers.faq.q${i}`)}</summary><div class="faq-reponse"><p>${c.t(`ateliers.faq.r${i}`)}</p></div></details>`)}
  </div>
  ${c.media({ nom: 'grok/suivi-faq', alt: c.s('suivi.faq.alt'), cadrage: '35% 40%', classe: 'savoir-media', sizes: '(max-width: 760px) 92vw, 36vw' })}
</section>

<section class="grand-final" id="inscription">
  ${c.media({ nom: 'grok/respirer-aube', alt: c.s('accueil.respirer.alt'), cadrage: '50% 70%', cadrageMobile: '50% 70%', classe: 'grand-final-fond', sizes: '100vw' })}
  <div class="conteneur">
    <div class="grand-final-carte">
      <span class="tasses tasses--final" aria-hidden="true">${[1, 2, 3, 4].map(() => tasse)}</span>
      <h2 class="titre-section" data-anime>${c.t('ateliers.fin.titre')}</h2>
      <p data-anime>${c.t('ateliers.fin.texte')}</p>
      <p class="fin-actions" data-anime>
        ${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=atelier', classe: 'bouton', texte: c.t('ateliers.fin.action'), attrs: 'data-magnetique' })}
        <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appelerNumero', { tel: c.site.contact.telephone })}</a>
      </p>
      <p class="grand-final-lien" data-anime>${c.lien('tarifs-rendez-vous', { ancre: 'rappel', params: 'sujet=prochain', classe: 'lien-trace lien-seul', texte: c.t('ateliers.fin.prochain') })}</p>
    </div>
  </div>
</section>
`;
};

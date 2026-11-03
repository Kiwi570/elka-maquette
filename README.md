# Elka Hypnose : maquette

Maquette du site de Laurence Katchavenda (EI Elka Hypnose), hypnothérapeute à Bard-lès-Époisses.
Direction artistique « Le seuil » : l'Auxois au petit matin, pierre calcaire, sauge, mousse, terre cuite ;
Fraunces pour les titres, Manrope pour le texte.

Adresse prévue : https://elka-maquette.vercel.app

## Pages

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Le seuil, rencontre, accompagnements, chemin d'un suivi, respirer un instant, aperçus du parcours et des ateliers, avis, carnet, venir au cabinet |
| L'hypnose et le suivi | `hypnose-et-suivi.html` | Trois étapes, cabinet ou visio, enfants, cadre et limites, charte, questions fréquentes |
| Ateliers | `ateliers.html` | Trois thèmes derrière des portes, calendrier des séances (filtre `?theme=stress`, `dialogue` ou `confiance`), une séance de 1 h 30 (sablier), visio et 4 places, les ateliers avec leur statut, bon à savoir, questions |
| Mon parcours | `mon-parcours.html` | Rencontre, le chemin parcouru (galerie horizontale épinglée, plantes qui poussent), formations et cachets, façon d'accompagner, le cabinet (visionneuse), avis |
| Tarifs et rendez-vous | `tarifs-et-rendez-vous.html` | Tarifs, trois façons de réserver, demande de rappel simulée, conditions, horaires, accès |
| Pages légales | `mentions-legales.html`, `confidentialite.html`, `conditions-generales-de-vente.html` | Avec la fiche des informations à fournir |
| Page introuvable | `404.html` | « Vous avez fait un détour » |

## Travailler sur la maquette

Ne jamais modifier les pages `.html` à la main : elles sont générées.

```
node outils/generer.mjs          pages, à partir de donnees/ et source/
node outils/images-partage.mjs   images de partage 1200×630
node _audit/audit.mjs            audit complet (avant chaque livraison)
```

- Textes : `donnees/textes/fr.json` ; ateliers : `donnees/ateliers.json` (dates des 4 séances, horaires, thème `themeId`) ;
  thèmes des ateliers : `donnees/themes.json` ; étapes du parcours : `donnees/parcours.json` ;
  horaires et fermetures du cabinet : `donnees/horaires.json` (liste `fermetures` : `{ "du": "2026-12-24", "au": "2027-01-02" }`) ;
  pages légales : `donnees/legal.json`.
- Les statuts « Joignable maintenant » et ceux des ateliers sont calculés à l'heure de Paris, jours fériés compris.
- Numéro de version `?v=N` : champ `version` de `donnees/site.json`, à changer à chaque livraison.

## Images

- Vraies photos (portrait, cabinet, séances, capture Zoom recadrée), légèrement étalonnées toutes de la même façon.
- Illustrations générées par Grok (dossier `assets/images/grok/`) : chacune porte la mention « Illustration générée ».
  **À garder sur le site final.**
- Logo redessiné en vectoriel d'après le logo actuel (`assets/images/logo.svg`, `logo-clair.svg`, `logo-pastille.svg`).

## À la mise en ligne définitive

Retirer :
- la consigne `noindex` : balise robots dans `source/gabarits/commun.mjs` et en-tête `X-Robots-Tag` dans `vercel.json` ;
- le caractère simulé de la demande de rappel (brancher un vrai envoi) et la phrase « Maquette » du pied de page ;
- l'exercice de respiration s'il n'est pas validé par Laurence, ou la mention « exercice de démonstration » s'il l'est ;
- les mentions « à compléter », une fois les informations fournies (voir la fiche dans les mentions légales).

Garder : la mention « Illustration générée » sur chaque image créée par IA.

## Points à faire valider par la cliente

- Accord écrit de la personne accompagnée visible (de dos) sur les photos de séance.
- Logo au trait sans la pastille (en-tête) et logo vectoriel d'origine s'il existe.
- Mutuelles qui prennent en charge les séances, médiateur de la consommation, congés du cabinet.
- Conditions de paiement et d'annulation à harmoniser entre les CGV et les fiches de réservation.
- Mention de TVA : « TVA non applicable, art. 293 B du CGI » jusqu'au 31 décembre 2026 (le site actuel cite déjà le CIBS).
- IBAN affiché sur la page de réservation visio du site actuel : à retirer.
- Ateliers : afficher ou non le nombre de places restantes par atelier ; extraits d'avis plus complets si Laurence le souhaite.

## Images reçues (non livrées dans le zip)

Les originaux (photos du site actuel, images Grok) ne sont pas dans l'archive, pour la garder légère.
Pour reconvertir : placer les originaux dans `recu/grok/` (noms du document Grok) et `recu/site/`, puis
`python3 outils/etalonner.py <photos>` (étalonnage commun), `python3 outils/images.py outils/lot-photos.json`
et `python3 outils/convertir-grok.py`.

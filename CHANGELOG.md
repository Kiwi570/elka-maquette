# Ce qui a changé

Chaque version ajoute sa partie en tête de ce fichier, construite en comparant l'archive précédente et la nouvelle, jamais de mémoire.

## v2 : une page par onglet

**Nouvelles pages**
- **Ateliers** (`ateliers.html`) :
  - premier écran avec 4 tasses de tisane, une par place, et le prochain atelier ouvert ;
  - trois thèmes derrière des portes qui s'ouvrent ;
  - calendrier de novembre et décembre 2026 : une graine par séance, un filtre par thème gardé dans l'adresse (`?theme=…`), et la fiche de la séance choisie avec son atelier, son statut et le bouton « Demander une place » déjà rempli. Sur téléphone, le calendrier devient un agenda et la fiche s'ouvre sous le jour choisi ;
  - une séance de 1 h 30 en 4 temps, avec un sablier qui se vide pendant la lecture ;
  - la visio, avec 4 tasses qui se remplissent ;
  - les 5 ateliers avec leur statut en direct, puis « Bon à savoir », les questions et l'appel final.
- **Mon parcours** (`mon-parcours.html`) :
  - la phrase de Laurence qui s'écrit lettre à lettre ;
  - le chemin parcouru en 7 étapes : une galerie horizontale qui reste fixe pendant le défilement sur ordinateur et se glisse au doigt sur téléphone, avec une plante qui pousse sous chaque étape jusqu'au chêne ;
  - les formations, avec les années qui s'impriment comme des cachets ;
  - la façon d'accompagner ;
  - le cabinet en photos empilées qui s'étalent, avec une visionneuse (flèches, glissement au doigt, Échap) ;
  - les avis et le premier pas.
- 12 nouvelles illustrations Grok (ouvertures ordinateur et téléphone, thèmes, séance, école, livres, sentier, banc) et 2 images de partage.

**Accueil et menu**
- Le menu, le pied de page et le menu plein écran mènent maintenant aux pages Ateliers et Mon parcours, au lieu des sections de l'accueil.
- Accueil :
  - la section Mon parcours devient un aperçu avec un lien, et l'image de séance est remplacée par le pupitre dans le pré ;
  - la section Ateliers devient un aperçu avec les trois thèmes, le prochain atelier et un lien vers la page.
- Tarifs : la ligne de l'atelier renvoie vers les thèmes et les dates.

**Textes et données**
- Nouveau fichier `donnees/themes.json` : les trois thèmes, avec leurs objectifs tirés des fiches de réservation.
- `donnees/ateliers.json` : chaque atelier indique son thème (`themeId`).
- `donnees/parcours.json` : septième étape « Aujourd'hui », et image de l'école pour la première.
- Avis : « œuvre » écrit avec son e dans l'o, et « […] » devant un extrait qui commence en cours de phrase.
- Le parcours de l'accueil dit maintenant « reconversion amorcée en 2023 » (les formations datent de 2024 et 2025).
- Dates courtes : « 1er déc. » au lieu de « 1 déc. ».

**Réglages communs**
- Sur téléphone, les sections sont plus resserrées et il reste moins de vide sous le premier écran.
- Audit : 3 nouveaux parcours du projet (calendrier, visionneuse, chemin), et le contrôle des statuts d'ateliers porte maintenant sur la page Ateliers.

## v1 — la base

**Pages**
- Accueil, L'hypnose et le suivi, Tarifs et rendez-vous, mentions légales, confidentialité, conditions générales de vente et page 404.
- Les ateliers et le parcours sont des sections de l'accueil, accessibles depuis le menu.

**Direction artistique « Le seuil »**
- L'Auxois au petit matin : pierre calcaire, sauge, mousse et terre cuite, titres en Fraunces et texte en Manrope (polices hébergées avec le site).
- Logo d'Elka Hypn'ose redessiné en vectoriel, en trois versions : au trait, clair et pastille.
- Fenêtres en arche partout : premier écran, portrait, cartes et étapes.

**Mouvement**
- Intro « Le seuil » à chaque arrivée et chaque rechargement :
  - une porte se trace, une lueur passe entre ses battants, ils s'ouvrent ;
  - la fenêtre s'agrandit jusqu'à l'arche de la page, la brume se lève et le titre monte mot à mot ;
  - sur téléphone, l'arche est d'abord montrée entière puis glisse à sa place.
- Voile de transition en forme d'arche entre les pages.
- Brume vivante en WebGL sur l'arche, qui s'écarte autour de la souris ou du doigt, avec une brume fixe à la place si WebGL est absent.
- Chemin du suivi qui se trace au défilement, avec des graines qui germent à chaque étape.
- Sur la page du suivi, l'image de chaque étape s'ouvre dans l'arche pendant la lecture.
- Trait de lumière sous chaque titre, frise du parcours qui se dessine, images révélées avec une légère parallaxe.
- Boutons magnétiques, cartes inclinées au survol, ruban des thèmes avec bouton pause.
- Lien « Réduire les animations » dans le menu et le pied de page.

**Fonctionnalités**
- Statut « Joignable maintenant » calculé à l'heure de Paris, jours fériés compris, avec la prochaine ouverture.
- Ateliers d'autohypnose :
  - statuts automatiques (à venir dans N jours, en cours et séances passées, terminé) et rangement automatique ;
  - bouton « Demander une place » qui ouvre la demande de rappel avec l'atelier déjà choisi ;
  - une carte « Un autre thème, un autre horaire ? » pour être prévenu de la prochaine session.
- Demande de rappel simulée en deux étapes, avec récapitulatif en direct, vérification des champs et mention RGPD.
- Exercice « Respirer un instant » d'une minute, lancé par le visiteur.
- Carte de l'Auxois dessinée avec les distances à vol d'oiseau.
- Tableau des horaires avec le jour en cours repéré, placé sous la carte.

**Contenus**
- Tous les textes, prix, dates et avis viennent du site actuel, des fiches de réservation, du parcours en PDF, de la charte et du profil Résalib.
- Ce qui manque est marqué « à compléter », et les mentions légales contiennent la fiche des informations à fournir.

**Mise en ligne**
- Consigne noindex, en-têtes de sécurité, images de partage 1200 × 630 et données structurées LocalBusiness.
- Audit automatique fourni dans `_audit/`, avec les parcours propres au projet.

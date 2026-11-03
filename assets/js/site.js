/* Effets d'Elka Hypnose. Le socle gère l'ouverture, les transitions, l'en-tête, le menu, le mode calme,
   les boucles et les mesures : ce fichier branche ce qui est propre au client. */
import { demarrer } from './socle/index.js?v=2';
import { jouerSeuil, arriveeSeuil, etatFinalSeuil, cadresArches } from './seuil.js?v=2';
import { initBrume } from './brume.js?v=2';
import { initVivant, etatFinalVivant } from './vivant.js?v=2';
import { initRespirer } from './respirer.js?v=2';
import { initRappel } from './rappel.js?v=2';
import { initPages, etatFinalPages } from './pages.js?v=2';

const etapes = [cadresArches, initBrume, initVivant, initRespirer, initRappel, initPages];

demarrer({
  preparer() {
    etapes.forEach((f) => { try { f(); } catch (err) { console.error('[elka]', f.name, err); } });
  },
  /* Intro complète « Le seuil », environ 2,5 s. */
  jouer: jouerSeuil,
  /* Arrivée par un lien interne : le titre monte pendant que le voile se retire. */
  arrivee: arriveeSeuil,
  /* Retour arrière, mode calme, secours : tout est en place, sans animation. */
  etatFinal() { etatFinalSeuil(); etatFinalVivant(); etatFinalPages(); },
});

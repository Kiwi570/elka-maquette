/* « Respirer un instant » : exercice guidé d'une minute, lancé par le visiteur.
   L'arche de lumière s'ouvre en 5 s à l'inspiration et se referme en 5 s à l'expiration, six fois.
   La boucle ne tourne que pendant l'exercice et seulement si la section est à l'écran (boucle du socle).
   En mode calme, rien ne bouge : seules la consigne et le temps restant changent. */
import { boucle, etat } from './socle/index.js?v=1';

const CYCLE = 10, DUREE = 60;

export function initRespirer() {
  const section = document.querySelector('[data-respirer]');
  if (!section) return;
  let T;
  try { T = JSON.parse(section.dataset.textes); } catch { return; }
  const bouton = section.querySelector('[data-respirer-bouton]');
  const libelle = bouton.querySelector('[data-libelle-bouton]');
  const lumiere = section.querySelector('[data-respirer-lumiere]');
  const consigne = section.querySelector('[data-respirer-consigne]');
  const restant = section.querySelector('[data-respirer-restant]');
  let en = false, t = 0, ctrl = null, minuterie = 0, derniere = '';
  const MIN = 0.32;

  const afficher = () => {
    const phase = (t % CYCLE) / CYCLE;
    const inspire = phase < 0.5;
    const texte = t >= DUREE ? T.fini : inspire ? T.inspirez : T.expirez;
    if (texte !== derniere) { consigne.textContent = texte; derniere = texte; }
    restant.textContent = t >= DUREE ? '' : T.restant.replace('{n}', Math.ceil(DUREE - t));
    if (!etat.calme) {
      const p = inspire ? phase * 2 : 2 - phase * 2;
      const doux = 0.5 - 0.5 * Math.cos(Math.PI * p);
      lumiere.style.transform = `scaleY(${(MIN + (1 - MIN) * doux).toFixed(4)})`;
    }
  };
  const arreter = (fini = false) => {
    en = false;
    if (ctrl) { ctrl.arreter(); ctrl = null; }
    clearInterval(minuterie);
    bouton.setAttribute('aria-pressed', 'false');
    libelle.textContent = T.demarrer;
    lumiere.style.transform = '';
    consigne.textContent = fini ? T.fini : T.pret;
    derniere = '';
    restant.textContent = '';
  };
  const demarrer = () => {
    en = true; t = 0;
    bouton.setAttribute('aria-pressed', 'true');
    libelle.textContent = T.arreter;
    afficher();
    if (etat.calme) {
      minuterie = setInterval(() => { t += 1; if (t >= DUREE) arreter(true); else afficher(); }, 1000);
      return;
    }
    ctrl = boucle(lumiere, (dt) => {
      if (!en) return;
      t += dt;
      if (t >= DUREE) { arreter(true); return; }
      afficher();
    });
  };
  bouton.addEventListener('click', () => (en ? arreter() : demarrer()));
  /* La section quitte l'écran : l'exercice s'arrête. */
  new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && en) arreter(); })).observe(section);
}

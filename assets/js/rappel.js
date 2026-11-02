/* Demande de rappel en deux étapes (simulée) : votre demande, puis vos coordonnées.
   Le choix arrive déjà fait selon le bouton d'origine (?sujet=atelier&atelier=… : le socle remplit les champs).
   Champs qui dépendent du sujet, hauteur animée entre les étapes, récapitulatif en direct.
   L'envoi lui-même (vérification, pas de double envoi, message « rien n'a été envoyé ») est fait par le socle. */
import { etat, rafraichir } from './socle/index.js?v=1';

const gsap = window.gsap;

export function initRappel() {
  const form = document.querySelector('[data-etapes-form]');
  if (!form) return;
  const pas = [...form.querySelectorAll('[data-pas]')];
  const progres = [...form.querySelectorAll('[data-progres]')];
  const recap = document.querySelector('[data-recap]');
  const liste = recap && recap.querySelector('[data-recap-liste]');
  let L = {};
  try { L = JSON.parse(recap.dataset.libelles); } catch {}
  const atelier = form.querySelector('select[name="atelier"]');
  const valeur = (nom) => { const c = form.querySelector(`[name="${nom}"]:checked`) || form.querySelector(`[name="${nom}"]:not([type="radio"])`); return c ? c.value : ''; };
  const libelleChoix = (nom) => { const c = form.querySelector(`[name="${nom}"]:checked`); return c ? c.closest('label').textContent.trim() : ''; };

  /* Champs propres au sujet choisi. */
  const sujetChange = () => {
    const s = valeur('sujet');
    form.querySelectorAll('[data-si-sujet]').forEach((el) => {
      const montre = el.dataset.siSujet.split(',').includes(s);
      el.hidden = !montre;
      el.querySelectorAll('select, input').forEach((c) => { if (c.name === 'atelier') c.required = montre; });
    });
  };

  const majRecap = () => {
    if (!liste) return;
    const lignes = [[L.sujet, libelleChoix('sujet')]];
    if (valeur('sujet') === 'atelier' && atelier && atelier.value) lignes.push([L.atelier, atelier.options[atelier.selectedIndex].textContent.trim()]);
    if (!form.querySelector('[data-si-sujet*="premiere"]').hidden) lignes.push([L.lieu, libelleChoix('lieu')]);
    const nom = valeur('nom'), tel = valeur('tel');
    if (nom) lignes.push([L.nom, nom]);
    if (tel) lignes.push([L.tel, tel]);
    /* Rendu relancé : le contenu est remplacé, jamais ajouté. */
    liste.replaceChildren(...lignes.filter(([, v]) => v).map(([k, v]) => {
      const div = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = k; dd.textContent = v; div.append(dt, dd); return div;
    }));
  };

  const aller = (n) => {
    const avant = form.offsetHeight;
    pas.forEach((p) => p.classList.toggle('pas-cache', p.dataset.pas !== String(n)));
    progres.forEach((p) => p.classList.toggle('actif', +p.dataset.progres <= n));
    const cible = pas.find((p) => p.dataset.pas === String(n));
    if (gsap && !etat.calme) {
      const apres = form.offsetHeight;
      gsap.fromTo(form, { height: avant }, { height: apres, duration: 0.45, ease: 'power2.inOut', onComplete: () => { gsap.set(form, { clearProps: 'height' }); rafraichir(); } });
      gsap.fromTo(cible, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' });
    } else rafraichir();
    const premier = cible.querySelector('input:not([type="hidden"]), select, textarea, button');
    if (premier) premier.focus({ preventScroll: true });
  };

  form.querySelector('[data-pas-suivant]').addEventListener('click', () => {
    const erreur = form.querySelector('[data-erreur-atelier]');
    if (atelier && atelier.required && !atelier.value) {
      atelier.setAttribute('aria-invalid', 'true');
      if (erreur) erreur.hidden = false;
      atelier.focus();
      return;
    }
    if (atelier) atelier.removeAttribute('aria-invalid');
    if (erreur) erreur.hidden = true;
    aller(2);
  });
  form.querySelector('[data-pas-precedent]').addEventListener('click', () => aller(1));
  form.addEventListener('change', () => { sujetChange(); majRecap(); });
  form.addEventListener('input', majRecap);

  /* Départ : étape 1 (sans JavaScript, les deux étapes restent affichées l'une sous l'autre). */
  pas.forEach((p) => p.classList.toggle('pas-cache', p.dataset.pas !== '1'));
  sujetChange();
  majRecap();
}

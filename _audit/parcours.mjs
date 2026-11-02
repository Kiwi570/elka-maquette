/* Parcours propres à Elka Hypnose : demande de rappel en deux étapes (préremplie par l'adresse, double clic,
   récapitulatif), statuts des ateliers recalculés à la date du jour, statut « Joignable maintenant »,
   exercice de respiration (boucle arrêtée en sortie d'écran, mode calme), carte (étiquettes qui ne se touchent pas). */
export default async function ({ contexte, attendrePret, attendre, BASE, R, T }) {
  const page_ = '/tarifs-et-rendez-vous';

  /* 1. Rappel prérempli depuis la carte d'un atelier, deux étapes, erreurs, double clic. */
  {
    const { ctx, page } = await contexte({ taille: T('390×844') });
    try {
      await page.goto(BASE + page_ + '?sujet=atelier&atelier=confiance-en-soi-mardis#rappel', { waitUntil: 'load' });
      await attendrePret(page);
      const e = await page.evaluate(() => ({
        sujet: document.querySelector('input[name="sujet"]:checked')?.value,
        atelier: document.querySelector('select[name="atelier"]')?.value,
        visible: !document.querySelector('[data-si-sujet="atelier"]').hidden,
        recap: document.querySelector('[data-recap-liste]')?.textContent || '',
      }));
      if (e.sujet !== 'atelier' || e.atelier !== 'confiance-en-soi-mardis') R.echec('rappel', `choix non prérempli par l'adresse (sujet ${e.sujet}, atelier ${e.atelier})`, { page: page_, taille: '390×844' });
      if (!e.visible) R.echec('rappel', 'le choix de l’atelier n’est pas affiché pour un atelier', { page: page_, taille: '390×844' });
      if (!/Confiance en soi/.test(e.recap)) R.echec('rappel', 'le récapitulatif ne reprend pas l’atelier choisi', { page: page_, taille: '390×844' });
      await page.click('[data-pas-suivant]');
      await attendre(600);
      const pas2 = await page.evaluate(() => !document.querySelector('[data-pas="2"]').classList.contains('pas-cache'));
      if (!pas2) R.echec('rappel', 'le bouton Continuer ne mène pas à l’étape 2', { page: page_, taille: '390×844' });
      /* Envoi vide : erreurs à côté des champs, rien d'envoyé. */
      await page.click('[data-formulaire] [type="submit"]');
      await attendre(300);
      const erreurs = await page.evaluate(() => [...document.querySelectorAll('.champ-erreur')].filter((p) => p.textContent.trim() && !p.hidden).length);
      if (erreurs < 2) R.echec('rappel', `envoi vide : ${erreurs} erreur(s) affichée(s), au moins 2 attendues (nom, téléphone)`, { page: page_, taille: '390×844' });
      await page.fill('#nom', 'Test Maquette');
      await page.fill('#tel', '06 12 34 56 78');
      await page.check('input[name="consentement"]');
      await page.dblclick('[data-formulaire] [type="submit"]');
      await attendre(400);
      const fin = await page.evaluate(() => ({ msg: document.querySelector('[data-message-envoi]')?.textContent || '', off: document.querySelector('[data-formulaire] [type="submit"]').disabled, recap: document.querySelector('[data-recap-liste]').textContent }));
      if (!/rien n.a été envoyé/i.test(fin.msg)) R.echec('rappel', 'le message « demande simulée » n’apparaît pas', { page: page_, taille: '390×844' });
      if (!fin.off) R.echec('rappel', 'le bouton d’envoi reste actif après l’envoi (double envoi possible)', { page: page_, taille: '390×844' });
      if (!/Test Maquette/.test(fin.recap)) R.echec('rappel', 'le récapitulatif ne reprend pas le nom saisi', { page: page_, taille: '390×844' });
      /* Atelier non choisi : l'étape 2 est refusée avec un message. */
      await page.goto(BASE + page_ + '?sujet=atelier#rappel', { waitUntil: 'load' });
      await attendrePret(page);
      await page.click('[data-pas-suivant]');
      await attendre(300);
      const bloque = await page.evaluate(() => ({ reste: document.querySelector('[data-pas="2"]').classList.contains('pas-cache'), msg: !document.querySelector('[data-erreur-atelier]').hidden }));
      if (!bloque.reste || !bloque.msg) R.echec('rappel', 'sans atelier choisi, l’étape 2 s’ouvre ou aucun message n’est affiché', { page: page_, taille: '390×844' });
    } finally { await ctx.close(); }
  }

  /* 2. Statuts : ateliers recalculés, rangés, sans doublon ; statut du cabinet calculé à l'heure de Paris. */
  {
    const { ctx, page } = await contexte({ taille: T('1440×900') });
    try {
      await page.goto(BASE + '/', { waitUntil: 'load' });
      await attendrePret(page);
      const r = await page.evaluate(() => {
        const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
        const auj = f.format(new Date());
        const cartes = [...document.querySelectorAll('[data-atelier]')].map((li) => { const a = JSON.parse(li.dataset.atelier); return { id: a.id, etat: li.dataset.etat, debut: a.seances[0], fin: a.seances[3], passees: li.querySelectorAll('.atelier-seance.passee').length, bouton: !!li.querySelector('a.bouton:not(.bouton--contour)') }; });
        const statut = document.querySelector('[data-statut]');
        return { auj, cartes, ids: new Set(cartes.map((c) => c.id)).size, statut: statut?.dataset.etat, texte: statut?.querySelector('[data-statut-texte]').textContent };
      });
      if (r.ids !== r.cartes.length) R.echec('ateliers', 'atelier affiché en double', { page: '/' });
      const rang = { encours: 0, avenir: 1, termine: 2 };
      for (let i = 1; i < r.cartes.length; i++) if (rang[r.cartes[i].etat] < rang[r.cartes[i - 1].etat]) R.echec('ateliers', 'ateliers mal rangés (en cours, à venir, terminés)', { page: '/' });
      for (const c of r.cartes) {
        const attendu = c.fin < r.auj ? 'termine' : c.debut <= r.auj ? 'encours' : 'avenir';
        if (attendu !== c.etat && !(c.debut === r.auj)) R.echec('ateliers', `statut de ${c.id} : ${c.etat} au lieu de ${attendu}`, { page: '/' });
        if (c.etat === 'avenir' && !c.bouton) R.echec('ateliers', `${c.id} à venir sans bouton pour demander une place`, { page: '/' });
        if (c.etat !== 'avenir' && c.bouton) R.echec('ateliers', `${c.id} commencé ou terminé mais encore ouvert aux inscriptions`, { page: '/' });
      }
      if (!['ouvert', 'ferme', 'inconnu'].includes(r.statut)) R.echec('statut', 'statut du cabinet non calculé', { page: '/' });
      R.info(`Statut du cabinet au moment de l'audit : ${r.texte}. Ateliers : ${r.cartes.map((c) => c.etat).join(', ')}.`);
    } finally { await ctx.close(); }
  }

  /* 3. Respiration : l'exercice tourne, s'arrête quand la section sort de l'écran, et ne bouge pas en mode calme. */
  {
    const { ctx, page } = await contexte({ taille: T('1440×900') });
    try {
      await page.goto(BASE + '/#respirer', { waitUntil: 'load' });
      await attendrePret(page);
      await page.evaluate(() => document.querySelector('#respirer').scrollIntoView({ block: 'center' }));
      await attendre(400);
      await page.click('[data-respirer-bouton]');
      await attendre(2600);
      const a = await page.evaluate(() => ({ t: document.querySelector('[data-respirer-lumiere]').style.transform, c: document.querySelector('[data-respirer-consigne]').textContent, b: window.__socle.bouclesActives() }));
      if (!/scaleY/.test(a.t) || a.b < 1) R.echec('respirer', 'l’arche de lumière ne bouge pas pendant l’exercice', { page: '/' });
      if (!/Inspirez|Expirez/.test(a.c)) R.echec('respirer', 'la consigne ne change pas pendant l’exercice', { page: '/' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await attendre(800);
      const b = await page.evaluate(() => ({ presse: document.querySelector('[data-respirer-bouton]').getAttribute('aria-pressed') }));
      if (b.presse !== 'false') R.echec('respirer', 'l’exercice continue quand la section n’est plus à l’écran', { page: '/' });
    } finally { await ctx.close(); }
  }

  /* 4. Carte : aucune étiquette ne touche une autre, aucune ne sort de la carte. */
  {
    for (const taille of ['390×844', '1440×900']) {
      const { ctx, page } = await contexte({ taille: T(taille) });
      try {
        for (const chemin of ['/', page_]) {
          await page.goto(BASE + chemin + '#' + (chemin === '/' ? 'venir' : 'acces'), { waitUntil: 'load' });
          await attendrePret(page);
          await attendre(1600);
          const r = await page.evaluate(() => {
            const c = document.querySelector('[data-carte]').getBoundingClientRect();
            const e = [...document.querySelectorAll('.carte-etiquette')].map((x) => x.getBoundingClientRect());
            let touche = 0, sort = 0;
            e.forEach((a, i) => { if (a.left < c.left - 1 || a.right > c.right + 1 || a.top < c.top - 1 || a.bottom > c.bottom + 1) sort++; e.slice(i + 1).forEach((b) => { if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) touche++; }); });
            return { touche, sort };
          });
          if (r.touche) R.echec('carte', `${r.touche} étiquette(s) de la carte se touchent`, { page: chemin, taille });
          if (r.sort) R.echec('carte', `${r.sort} étiquette(s) sortent de la carte`, { page: chemin, taille });
        }
      } finally { await ctx.close(); }
    }
  }
}

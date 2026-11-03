/* Parcours propres à Elka Hypnose : demande de rappel en deux étapes (préremplie par l'adresse, double clic,
   récapitulatif), statuts des ateliers recalculés à la date du jour, statut « Joignable maintenant »,
   exercice de respiration (boucle arrêtée en sortie d'écran, mode calme), carte (étiquettes qui ne se touchent pas),
   calendrier des ateliers (filtre dans l'adresse, séance choisie, fiche sous le jour sur téléphone),
   visionneuse des photos du cabinet (flèches, Échap, focus rendu), chemin parcouru (épinglé, plantes poussées). */
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
      await page.goto(BASE + '/ateliers', { waitUntil: 'load' });
      await attendrePret(page);
      const r = await page.evaluate(() => {
        const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
        const auj = f.format(new Date());
        const cartes = [...document.querySelectorAll('[data-atelier]')].map((li) => { const a = JSON.parse(li.dataset.atelier); return { id: a.id, etat: li.dataset.etat, debut: a.seances[0], fin: a.seances[3], passees: li.querySelectorAll('.atelier-seance.passee').length, bouton: !!li.querySelector('a.bouton:not(.bouton--contour)') }; });
        return { auj, cartes, ids: new Set(cartes.map((c) => c.id)).size };
      });
      await page.goto(BASE + '/', { waitUntil: 'load' });
      await attendrePret(page);
      Object.assign(r, await page.evaluate(() => { const statut = document.querySelector('[data-statut]'); return { statut: statut?.dataset.etat, texte: statut?.querySelector('[data-statut-texte]').textContent }; }));
      if (r.ids !== r.cartes.length) R.echec('ateliers', 'atelier affiché en double', { page: '/ateliers' });
      const rang = { encours: 0, avenir: 1, termine: 2 };
      for (let i = 1; i < r.cartes.length; i++) if (rang[r.cartes[i].etat] < rang[r.cartes[i - 1].etat]) R.echec('ateliers', 'ateliers mal rangés (en cours, à venir, terminés)', { page: '/ateliers' });
      for (const c of r.cartes) {
        const attendu = c.fin < r.auj ? 'termine' : c.debut <= r.auj ? 'encours' : 'avenir';
        if (attendu !== c.etat && !(c.debut === r.auj)) R.echec('ateliers', `statut de ${c.id} : ${c.etat} au lieu de ${attendu}`, { page: '/ateliers' });
        if (c.etat === 'avenir' && !c.bouton) R.echec('ateliers', `${c.id} à venir sans bouton pour demander une place`, { page: '/ateliers' });
        if (c.etat !== 'avenir' && c.bouton) R.echec('ateliers', `${c.id} commencé ou terminé mais encore ouvert aux inscriptions`, { page: '/ateliers' });
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

  /* 5. Calendrier des ateliers : filtre lu dans l'adresse, boutons de filtre, séance choisie et son atelier. */
  {
    const P = '/ateliers';
    for (const taille of ['1440×900', '390×844']) {
      const { ctx, page } = await contexte({ taille: T(taille) });
      try {
        await page.goto(BASE + P + '?theme=confiance#calendrier', { waitUntil: 'load' });
        await attendrePret(page);
        const a = await page.evaluate(() => {
          const vis = [...document.querySelectorAll('.graine-seance')].filter((b) => getComputedStyle(b).display !== 'none');
          return { presse: document.querySelector('.cal-filtre[aria-pressed="true"]')?.dataset.filtre, themes: [...new Set(vis.map((b) => b.dataset.theme))], n: vis.length, fiche: document.querySelector('[data-cal-fiche]').textContent };
        });
        if (a.presse !== 'confiance' || a.themes.join() !== 'confiance' || a.n !== 4) R.echec('calendrier', `filtre de l'adresse non appliqué (bouton ${a.presse}, thèmes ${a.themes.join(', ')}, ${a.n} séances)`, { page: P, taille });
        if (!/Confiance en soi/.test(a.fiche)) R.echec('calendrier', 'la fiche ne montre pas une séance du thème filtré', { page: P, taille });
        await page.click('.cal-filtre[data-filtre="tous"]');
        await attendre(300);
        const b = await page.evaluate(() => ({ url: location.search, n: [...document.querySelectorAll('.graine-seance')].filter((x) => getComputedStyle(x).display !== 'none').length }));
        if (b.url !== '' || b.n !== 20) R.echec('calendrier', `« Tous les thèmes » : adresse ${b.url || 'vide'}, ${b.n} séances visibles sur 20`, { page: P, taille });
        const cible = '.graine-seance[data-session="stress-sommeil-mercredis"][data-n="2"]';
        await page.locator(cible).scrollIntoViewIfNeeded();
        await page.click(cible);
        await attendre(300);
        const c = await page.evaluate((sel) => {
          const btn = document.querySelector(sel), f = document.querySelector('[data-cal-fiche]');
          return { presse: btn.getAttribute('aria-pressed'), liees: document.querySelectorAll('.graine-seance.liee').length, fiche: f.textContent, dansJour: !!f.closest('.jour'), memeJour: f.closest('.jour') === btn.closest('.jour'), uns: document.querySelectorAll('.graine-seance[aria-pressed="true"]').length, fiches: document.querySelectorAll('[data-cal-fiche]').length };
        }, cible);
        if (c.presse !== 'true' || c.uns !== 1) R.echec('calendrier', 'la séance touchée n’est pas la seule choisie', { page: P, taille });
        if (c.liees !== 3) R.echec('calendrier', `${c.liees} autres séances de l’atelier repérées au lieu de 3`, { page: P, taille });
        if (!/Séance 2 sur 4/.test(c.fiche) || !/Stress et sommeil/.test(c.fiche) || !/25\s?novembre/.test(c.fiche)) R.echec('calendrier', 'la fiche ne reprend pas la séance choisie', { page: P, taille });
        if (c.fiches !== 1) R.echec('calendrier', 'fiche affichée en double', { page: P, taille });
        if (taille === '390×844' && !c.memeJour) R.echec('calendrier', 'sur téléphone, la fiche ne s’ouvre pas sous le jour choisi', { page: P, taille });
        if (taille === '1440×900' && c.dansJour) R.echec('calendrier', 'sur ordinateur, la fiche quitte sa colonne', { page: P, taille });
        /* Lien « Voir ses dates » d'une porte : filtre posé, adresse mise à jour, calendrier atteint. */
        await page.locator('[data-filtre-lien="dialogue"]').scrollIntoViewIfNeeded();
        await page.click('[data-filtre-lien="dialogue"]');
        await attendre(1400);
        const d = await page.evaluate(() => ({ url: location.search, presse: document.querySelector('.cal-filtre[aria-pressed="true"]')?.dataset.filtre, haut: document.querySelector('#calendrier').getBoundingClientRect().top }));
        if (d.url !== '?theme=dialogue' || d.presse !== 'dialogue') R.echec('calendrier', `« Voir ses dates » : filtre ${d.presse}, adresse ${d.url}`, { page: P, taille });
        if (Math.abs(d.haut) > 200) R.echec('calendrier', `« Voir ses dates » n’amène pas au calendrier (${Math.round(d.haut)} px)`, { page: P, taille });
      } finally { await ctx.close(); }
    }
  }

  /* 6. Visionneuse du cabinet : ouverture depuis la vignette, flèches, Échap, focus rendu, défilement rendu. */
  {
    const P = '/mon-parcours';
    for (const taille of ['1366×768', '390×844']) {
      const { ctx, page } = await contexte({ taille: T(taille) });
      try {
        await page.goto(BASE + P + '#cabinet', { waitUntil: 'load' });
        await attendrePret(page);
        await attendre(800);
        await page.click('[data-visionneuse-index="1"]');
        await attendre(900);
        const a = await page.evaluate(() => { const d = document.querySelector('[data-visionneuse]'); const i = d.querySelector('img'); const r = i.getBoundingClientRect(); return { ouverte: d.open, src: i.getAttribute('src'), compteur: d.querySelector('[data-visionneuse-compteur]').textContent, focus: d.contains(document.activeElement), dans: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, larg: r.width }; });
        if (!a.ouverte) R.echec('visionneuse', 'la visionneuse ne s’ouvre pas', { page: P, taille });
        if (!/cabinet-fauteuil/.test(a.src) || !/2 sur 3/.test(a.compteur)) R.echec('visionneuse', `mauvaise photo à l’ouverture (${a.src}, ${a.compteur})`, { page: P, taille });
        if (!a.focus) R.echec('visionneuse', 'le focus n’est pas dans la visionneuse', { page: P, taille });
        if (!a.dans || a.larg < 100) R.echec('visionneuse', 'la photo dépasse de l’écran ou reste minuscule', { page: P, taille });
        await page.keyboard.press('ArrowRight');
        await attendre(700);
        const b = await page.evaluate(() => document.querySelector('[data-visionneuse-compteur]').textContent);
        if (!/3 sur 3/.test(b)) R.echec('visionneuse', 'la flèche droite ne passe pas à la photo suivante', { page: P, taille });
        await page.keyboard.press('Escape');
        await attendre(900);
        const c = await page.evaluate(() => ({ ouverte: document.querySelector('[data-visionneuse]').open, focus: document.activeElement?.dataset?.visionneuseIndex, bloque: document.documentElement.classList.contains('defilement-bloque') }));
        if (c.ouverte) R.echec('visionneuse', 'Échap ne ferme pas la visionneuse', { page: P, taille });
        if (c.focus !== '2') R.echec('visionneuse', `focus rendu à la vignette ${c.focus} au lieu de la photo affichée (la 3e)`, { page: P, taille });
        if (c.bloque) R.echec('visionneuse', 'le défilement reste bloqué après la fermeture', { page: P, taille });
      } finally { await ctx.close(); }
    }
  }

  /* 7. Chemin parcouru : épinglé sur ordinateur (toutes les plantes poussées à la fin), glissé au doigt sur téléphone. */
  {
    const P = '/mon-parcours';
    for (const taille of ['1440×900', '390×844']) {
      const { ctx, page } = await contexte({ taille: T(taille) });
      try {
        await page.goto(BASE + P, { waitUntil: 'load' });
        await attendrePret(page);
        const info = await page.evaluate(() => { const st = window.ScrollTrigger && ScrollTrigger.getAll().find((t) => t.pin && t.trigger.matches('[data-sentier]')); const piste = document.querySelector('[data-sentier-piste]'); return { epingle: !!st, fin: st ? st.end : 0, debut: st ? st.start : 0, defile: piste.scrollWidth > piste.clientWidth + 10, tab: piste.getAttribute('tabindex') }; });
        if (taille === '1440×900') {
          if (!info.epingle) { R.echec('chemin', 'la galerie du chemin n’est pas épinglée sur ordinateur', { page: P, taille }); continue; }
          for (let y = info.debut - 200; y <= info.fin + 300; y += 160) { await page.evaluate((y) => window.scrollTo(0, y), y); await attendre(60); }
          await attendre(1200);
          const n = await page.evaluate(() => [...document.querySelectorAll('[data-plante]')].filter((p) => !p.classList.contains('pousse')).length);
          if (n) R.echec('chemin', `${n} plante(s) n’ont pas poussé à la fin du chemin`, { page: P, taille });
        } else {
          if (info.epingle) R.echec('chemin', 'la galerie est épinglée sur téléphone (elle doit se glisser au doigt)', { page: P, taille });
          if (!info.defile || info.tab !== '0') R.echec('chemin', 'sur téléphone, la piste ne défile pas à l’horizontale ou n’est pas atteignable au clavier', { page: P, taille });
        }
      } finally { await ctx.close(); }
    }
  }
}

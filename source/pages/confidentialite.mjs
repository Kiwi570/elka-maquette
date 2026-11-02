/* Page légale : confidentialite (contenu dans donnees/legal.json). */
import { pageLegale, ouvertureLegale } from '../gabarits/legal.mjs';

export const page = { cle: 'confidentialite', fichier: 'confidentialite', imagePartage: 'grok/legal-1280.webp', sansAction: true, ouverture: ouvertureLegale };

export default (c) => pageLegale(c, 'confidentialite');

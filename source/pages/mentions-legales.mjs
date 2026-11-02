/* Page légale : mentions-legales (contenu dans donnees/legal.json). */
import { pageLegale, ouvertureLegale } from '../gabarits/legal.mjs';

export const page = { cle: 'mentions-legales', fichier: 'mentions-legales', imagePartage: 'grok/legal-1280.webp', sansAction: true, ouverture: ouvertureLegale };

export default (c) => pageLegale(c, 'mentions');

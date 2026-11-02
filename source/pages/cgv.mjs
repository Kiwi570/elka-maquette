/* Page légale : cgv (contenu dans donnees/legal.json). */
import { pageLegale, ouvertureLegale } from '../gabarits/legal.mjs';

export const page = { cle: 'cgv', fichier: 'conditions-generales-de-vente', imagePartage: 'grok/legal-1280.webp', sansAction: true, ouverture: ouvertureLegale };

export default (c) => pageLegale(c, 'cgv');

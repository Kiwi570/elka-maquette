/* Image de partage 1200×630 de chaque page, aux couleurs d'Elka Hypnose :
   logo, accroche en Fraunces sur le fond calcaire, et l'image de la page dans une arche.
   outils/images-partage.mjs photographie ces pages et écrit assets/partage/<page>-<langue>.jpg. */
import { html, brut } from '../../outils/gabarit.mjs';

export function page(c) {
  const cle = c.page.cle;
  const image = c.page.imagePartage || c.site.imagePartage;
  return html`<!doctype html>
<html lang="${c.l}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/socle.css"><link rel="stylesheet" href="/assets/css/site.css">
<style>${brut(`:root{--fond:${c.site.couleurs.fond};--texte:${c.site.couleurs.texte}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--fond);color:var(--texte)}
.p{position:relative;display:grid;grid-template-columns:640px 1fr;width:1200px;height:630px}
.p-texte{display:flex;flex-direction:column;justify-content:space-between;padding:64px 40px 56px 72px}
.p-texte img{width:150px;height:auto}
.p-titre{font-family:var(--police-titres);font-weight:500;font-size:62px;line-height:1.04;letter-spacing:-.01em;margin:0;text-wrap:balance}
.p-nom{font-size:22px;font-weight:600;margin:0;color:#6b5a4a;letter-spacing:.06em;text-transform:uppercase}
.p-zone{position:relative;margin:56px 80px 0 40px}
.p-arche{position:absolute;inset:0;border-radius:999px 999px 0 0;overflow:hidden;background:#d8cfc0 center/cover no-repeat}
.p-cadre{position:absolute;inset:-14px -14px 0 -14px;border:2px solid #B9785A;border-bottom:0;border-radius:999px 999px 0 0}`)}</style>
</head><body>
<div class="p">
  <div class="p-texte">
    <img src="/assets/images/logo.svg" alt="">
    <p class="p-titre">${c.t(`pages.${cle}.accroche`)}</p>
    <p class="p-nom">${c.site.nom} · ${c.site.contact.ville}</p>
  </div>
  <div class="p-zone"><div class="p-arche" style="background-image:url('/assets/images/${image}')"></div><span class="p-cadre"></span></div>
</div>
</body></html>`;
}

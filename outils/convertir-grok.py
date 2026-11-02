"""Conversion des images Grok : WebP en plusieurs tailles (640, 1280, 1920 et largeur d'origine), sans agrandir.
Les versions telephone dediees (fichiers *-mobile) donnent <nom>-mobile-<largeur>.webp, lu par c.media()."""
import sys
from pathlib import Path
from PIL import Image, ImageOps
R = Path(__file__).resolve().parent.parent  # racine du projet ; images reçues dans recu/grok
def tailles(w, liste=(640, 1280, 1920)):
    t = [x for x in liste if x <= w]
    if not t or w - t[-1] > 120: t.append(w)
    return sorted(set(t))
def sortir(img, nom, ws):
    for w in ws:
        im = img if img.width <= w else img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
        p = R / 'assets/images' / f'{nom}-{w}.webp'; p.parent.mkdir(parents=True, exist_ok=True)
        im.save(p, 'WEBP', quality=78, method=6)
        k = p.stat().st_size // 1024
        print(f'OK {p.relative_to(R)} {k} Ko' + ('  (plus de 300 Ko)' if k > 300 else ''))
for f in sorted((R / 'recu/grok').iterdir()):
    if f.suffix.lower() not in ('.png', '.jpg', '.jpeg'): continue
    img = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    base = f.stem
    if base.endswith('-ordi'): nom = 'grok/' + base[:-5]
    else: nom = 'grok/' + base
    sortir(img, nom, tailles(img.width))

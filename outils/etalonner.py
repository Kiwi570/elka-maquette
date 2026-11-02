"""Etalonnage commun et leger des vraies photos : un peu plus chaud, noirs adoucis, saturation legerement reduite."""
import sys
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np

def etalonner(src, dst):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255
    gris = a.mean(axis=2, keepdims=True)
    a = gris + (a - gris) * 0.9                     # saturation -10 %
    a = 0.035 + a * 0.955                            # noirs adoucis
    a[..., 0] *= 1.025; a[..., 2] *= 0.965           # un peu plus chaud
    a = np.clip(a, 0, 1)
    Image.fromarray((a * 255).round().astype(np.uint8)).save(dst, quality=95)

if __name__ == '__main__':
    for s in sys.argv[1:]:
        p = Path(s); d = p.with_name(p.stem + '-etalonne.jpg'); etalonner(p, d); print('OK', d)

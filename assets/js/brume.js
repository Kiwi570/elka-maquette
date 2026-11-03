/* Brume vivante (WebGL) sur l'image de l'arche : des voiles de brume dérivent lentement dans les vallons
   et s'écartent autour de la souris ou du doigt. Sans WebGL, une brume fixe en CSS la remplace.
   - Démarre après l'ouverture, s'arrête hors écran et onglet caché (boucle du socle), une image fixe en mode calme.
   - Densité de pixels limitée (1,25 sur ordinateur, 1 sur téléphone), 60 images par seconde au plus,
     résolution réduite d'elle-même si les images prennent trop de temps.
   - Le shader sort tout de suite là où il n'y a pas de brume (haut de l'image). */
import { boucle, etat, quand } from './socle/index.js?v=2';

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float mf;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float base=smoothstep(.66,.05,uv.y)*.62+smoothstep(.2,.42,uv.y)*(1.-smoothstep(.42,.7,uv.y))*.3;
  if(base<.015){gl_FragColor=vec4(0.);return;}
  float asp=r.x/r.y;vec2 q=vec2(uv.x*asp,uv.y);
  float f=fbm(q*2.1+vec2(t*.028,t*.008));
  float g=fbm(q*4.3-vec2(t*.045,-t*.01)+f);
  float d=base*(.45+.75*f)*(.72+.38*g);
  float dm=distance(q,vec2(m.x*asp,m.y));
  d*=mix(1.,smoothstep(.04,.3,dm),mf);
  d=clamp(d,0.,.66);
  gl_FragColor=vec4(vec3(.965,.94,.9)*d,d);
}`;

function creer(canvas) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'low-power' }); } catch {}
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!v || !f) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return { gl, u: { r: gl.getUniformLocation(prog, 'r'), t: gl.getUniformLocation(prog, 't'), m: gl.getUniformLocation(prog, 'm'), mf: gl.getUniformLocation(prog, 'mf') } };
}

export function initBrume() {
  const canvases = [...document.querySelectorAll('[data-brume]')];
  if (!canvases.length) return;
  const mobile = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
  const dprMax = mobile ? 1 : 1.25;
  canvases.forEach((canvas) => {
    const ctx = creer(canvas);
    if (!ctx) return;
    document.documentElement.classList.add('webgl');
    const { gl, u } = ctx;
    const arche = canvas.closest('[data-arche]');
    let qualite = 1, temps = 0, lent = 0;
    const souris = { x: 0.5, y: 0.3, cx: 0.5, cy: 0.3, f: 0, cible: 0 };
    let l = 0, h = 0;
    const mesurer = () => {
      l = arche.clientWidth; h = arche.clientHeight;
      const d = Math.min(window.devicePixelRatio || 1, dprMax) * qualite;
      canvas.width = Math.max(1, Math.round(l * d)); canvas.height = Math.max(1, Math.round(h * d));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    mesurer();
    new ResizeObserver(mesurer).observe(arche);
    /* Les positions sont lues au mouvement du pointeur, jamais pendant le défilement. */
    const suivre = (e) => {
      const r = arche.getBoundingClientRect();
      souris.x = (e.clientX - r.left) / r.width; souris.y = 1 - (e.clientY - r.top) / r.height;
      souris.cible = 1;
    };
    arche.addEventListener('pointermove', suivre, { passive: true });
    arche.addEventListener('pointerdown', suivre, { passive: true });
    arche.addEventListener('pointerleave', () => { souris.cible = 0; });
    arche.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') souris.cible = 0; });

    const dessiner = (dt) => {
      /* Lissage selon le temps écoulé : même vitesse partout. */
      const k = 1 - Math.exp(-dt * 6);
      souris.cx += (souris.x - souris.cx) * k; souris.cy += (souris.y - souris.cy) * k;
      souris.f += (souris.cible - souris.f) * (1 - Math.exp(-dt * 3));
      gl.uniform2f(u.r, canvas.width, canvas.height);
      gl.uniform1f(u.t, temps);
      gl.uniform2f(u.m, souris.cx, souris.cy);
      gl.uniform1f(u.mf, souris.f);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    let accu = 0;
    const tick = (dt) => {
      if (!etat.pret && !etat.calme) return;
      /* 60 images par seconde au plus. */
      accu += dt;
      if (accu < 1 / 61) return;
      const pas = accu; accu = 0;
      temps += pas;
      /* Qualité qui baisse d'elle-même si les images sont trop lentes. */
      if (pas > 0.03) { lent++; if (lent > 20 && qualite > 0.5) { qualite = Math.max(0.5, qualite - 0.25); lent = 0; mesurer(); } } else lent = Math.max(0, lent - 1);
      dessiner(pas);
    };
    if (etat.calme) { temps = 12; dessiner(0); canvas.classList.add('pret'); return; }
    boucle(canvas, tick, { lourde: true });
    const montrer = () => { canvas.classList.add('pret'); };
    if (etat.pret) montrer(); else quand('pret', montrer);
  });
}

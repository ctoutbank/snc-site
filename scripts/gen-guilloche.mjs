/**
 * Guilloche SVG Generator — SNC Security Pattern (Optimized)
 * Banknote-style rosette with modulated circular waves + hypotrochoids.
 */
import { writeFileSync } from 'fs';

const W = 960, H = 220;
const CX = W / 2, CY = H / 2;

function modulatedCircle(R, amp, lobes, phase, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + amp * Math.sin(lobes * t + phase);
    pts.push([CX + r * Math.cos(t), CY + r * Math.sin(t)]);
  }
  return pts;
}

function hypotrochoid(R, r, d, steps) {
  const pts = [];
  function gcd(a,b){return b===0?a:gcd(b,a%b)}
  const totalT = Math.PI * 2 * (r / gcd(R, r));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalT;
    pts.push([
      CX + (R-r)*Math.cos(t) + d*Math.cos((R-r)/r*t),
      CY + (R-r)*Math.sin(t) - d*Math.sin((R-r)/r*t)
    ]);
  }
  return pts;
}

// Compact path: integer coords to save bytes
function toPath(pts) {
  let d = `M${Math.round(pts[0][0])},${Math.round(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    d += `L${Math.round(pts[i][0])},${Math.round(pts[i][1])}`;
  }
  return d;
}

let paths = '';
const S = 1800; // reduced step count
const brass = (op) => `rgba(200,162,90,${op})`;
const green = (op) => `rgba(43,168,74,${op})`;

// ── Concentric modulated rings (the interlocking mesh) ──
for (let ring = 0; ring < 22; ring++) {
  const R = 12 + ring * 4.5;
  const lobes = 20 + ring * 3;
  const amp = 2 + ring * 0.35;
  for (let phase = 0; phase < 2; phase++) {
    const phi = phase * (Math.PI / lobes);
    const pts = modulatedCircle(R, amp, lobes, phi, S);
    const op = (0.05 + Math.sin(ring * 0.4) * 0.015).toFixed(3);
    const col = ring % 6 === 0 ? green(op) : brass(op);
    paths += `<path d="${toPath(pts)}" fill="none" stroke="${col}" stroke-width=".35"/>\n`;
  }
}

// ── Central rosette hypotrochoids ──
const rosettes = [
  [60,7,30,.07,'b'], [48,5,25,.06,'b'], [36,4,18,.06,'g'],
  [75,8,40,.05,'b'], [90,11,50,.04,'b'], [55,6,28,.05,'g'],
  [42,3,20,.055,'b'], [68,9,35,.045,'g'],
];
for (const [R,r,d,op,c] of rosettes) {
  const pts = hypotrochoid(R,r,d,S);
  paths += `<path d="${toPath(pts)}" fill="none" stroke="${c==='b'?brass(op):green(op)}" stroke-width=".35"/>\n`;
}

// ── Radial spokes ──
for (let i = 0; i < 60; i++) {
  const a = (i/60)*Math.PI*2;
  const r1=6, r2=105;
  paths += `<line x1="${Math.round(CX+r1*Math.cos(a))}" y1="${Math.round(CY+r1*Math.sin(a))}" x2="${Math.round(CX+r2*Math.cos(a))}" y2="${Math.round(CY+r2*Math.sin(a))}" stroke="${brass(.025)}" stroke-width=".25"/>\n`;
}

// ── Horizontal wave bands ──
for (let b = 0; b < 16; b++) {
  const by = 6 + (H-12)*(b/15);
  let d = `M0,${Math.round(by)}`;
  for (let x = 3; x <= W; x += 3) {
    const y = by + Math.sin(x*.015+b*.8)*2.5 + Math.sin(x*.04+b*1.5)*1.2;
    d += `L${x},${Math.round(y)}`;
  }
  paths += `<path d="${d}" fill="none" stroke="${brass(.025)}" stroke-width=".4"/>\n`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">\n${paths}</svg>`;
writeFileSync('/Users/denisonzimmerdaluz/Documents/snc-site/public/guilloche-sig.svg', svg);
console.log(`Size: ${(svg.length/1024).toFixed(0)} KB`);

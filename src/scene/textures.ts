import * as THREE from 'three';

export interface ProceduralTextures {
  marbleFloor: THREE.CanvasTexture;
  marbleFloorRoughness: THREE.CanvasTexture;
  marbleFloorBump: THREE.CanvasTexture;
  marbleTable: THREE.CanvasTexture;
  woodGrain: THREE.CanvasTexture;
  flutedWood: THREE.CanvasTexture;
  flutedWoodNormal: THREE.CanvasTexture;
  fabricBump: THREE.CanvasTexture;
  coastalRug: THREE.CanvasTexture;
  bedLinen: THREE.CanvasTexture;
  travertine: THREE.CanvasTexture;
  travertineBump: THREE.CanvasTexture;
  rattanWeave: THREE.CanvasTexture;
  tvArt: THREE.CanvasTexture;
  warmLightPool: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  wallAo: THREE.CanvasTexture;
  wallArt1: THREE.CanvasTexture;
  wallArt2: THREE.CanvasTexture;
  curtainLinen: THREE.CanvasTexture;
  dispose: () => void;
}

function configureTexture(
  tex: THREE.CanvasTexture,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Convert a grayscale height canvas into a tangent-space Normal Map
function heightCanvasToNormalTexture(
  heightCanvas: HTMLCanvasElement,
  strength: number,
  maxAniso: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const ctx = heightCanvas.getContext('2d')!;
  const src = ctx.getImageData(0, 0, w, h).data;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = w;
  normalCanvas.height = h;
  const nctx = normalCanvas.getContext('2d')!;
  const dst = nctx.createImageData(w, h);

  const sample = (x: number, y: number) => {
    const sx = ((x % w) + w) % w;
    const sy = ((y % h) + h) % h;
    return src[(sy * w + sx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hL = sample(x - 1, y);
      const hR = sample(x + 1, y);
      const hU = sample(x, y - 1);
      const hD = sample(x, y + 1);

      const dx = (hL - hR) * strength;
      const dy = (hU - hD) * strength;
      const dz = 1.0;
      const len = Math.hypot(dx, dy, dz);

      const idx = (y * w + x) * 4;
      dst.data[idx] = Math.round(((dx / len) * 0.5 + 0.5) * 255);
      dst.data[idx + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      dst.data[idx + 2] = Math.round(((dz / len) * 0.5 + 0.5) * 255);
      dst.data[idx + 3] = 255;
    }
  }
  nctx.putImageData(dst, 0, 0);
  return configureTexture(new THREE.CanvasTexture(normalCanvas), maxAniso, repeatX, repeatY, false);
}

export function createProceduralTextures(renderer: THREE.WebGLRenderer): ProceduralTextures {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // 1. High-Res Crema Marfil / Calacatta Marble Tile Floor (Albedo + Roughness + Grout Bump)
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = 1024;
  marbleCanvas.height = 1024;
  const mctx = marbleCanvas.getContext('2d')!;
  mctx.fillStyle = '#efe5d6';
  mctx.fillRect(0, 0, 1024, 1024);

  // Per-tile subtle tonal shift (4x4 tiles)
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const shade = ((tx * 7 + ty * 13) % 5) - 2;
      mctx.fillStyle = `rgba(${238 + shade * 2}, ${228 + shade * 2}, ${212 + shade * 2}, 0.35)`;
      mctx.fillRect(tx * 256, ty * 256, 256, 256);
    }
  }

  for (let i = 0; i < 85; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 60 + Math.random() * 150;
    const grad = mctx.createRadialGradient(x, y, 6, x, y, r);
    grad.addColorStop(0, i % 2 === 0 ? 'rgba(220, 200, 174, 0.24)' : 'rgba(255, 251, 245, 0.28)');
    grad.addColorStop(1, 'rgba(239, 229, 214, 0)');
    mctx.fillStyle = grad;
    mctx.fillRect(0, 0, 1024, 1024);
  }

  // Organic layered marble veins (rich Crema Marfil contrast)
  for (let v = 0; v < 34; v++) {
    mctx.strokeStyle =
      v % 4 === 0 ? 'rgba(164, 134, 98, 0.42)' : 'rgba(196, 176, 148, 0.30)';
    mctx.lineWidth = v % 3 === 0 ? 2.4 : 1.15;
    mctx.beginPath();
    let vx = Math.random() * 1024;
    let vy = Math.random() * 1024;
    mctx.moveTo(vx, vy);
    for (let s = 0; s < 10; s++) {
      vx += (Math.random() - 0.32) * 90;
      vy += (Math.random() - 0.5) * 70;
      mctx.lineTo(vx, vy);
    }
    mctx.stroke();
  }

  // Grout grid (256px tiles) with subtle chamfer highlight
  mctx.strokeStyle = 'rgba(255, 250, 242, 0.35)';
  mctx.lineWidth = 4.5;
  for (let g = 0; g <= 1024; g += 256) {
    mctx.beginPath();
    mctx.moveTo(g + 2, 0);
    mctx.lineTo(g + 2, 1024);
    mctx.stroke();
    mctx.beginPath();
    mctx.moveTo(0, g + 2);
    mctx.lineTo(1024, g + 2);
    mctx.stroke();
  }
  mctx.strokeStyle = 'rgba(154, 138, 118, 0.62)';
  mctx.lineWidth = 2.4;
  for (let g = 0; g <= 1024; g += 256) {
    mctx.beginPath();
    mctx.moveTo(g, 0);
    mctx.lineTo(g, 1024);
    mctx.stroke();
    mctx.beginPath();
    mctx.moveTo(0, g);
    mctx.lineTo(1024, g);
    mctx.stroke();
  }
  const marbleFloor = configureTexture(new THREE.CanvasTexture(marbleCanvas), maxAniso, 3.5, 2.2, true);

  // Marble Floor Roughness & Bump (glossy polished stone, matte grout)
  const marbleRoughCanvas = document.createElement('canvas');
  marbleRoughCanvas.width = 512;
  marbleRoughCanvas.height = 512;
  const mrctx = marbleRoughCanvas.getContext('2d')!;
  mrctx.fillStyle = '#262626'; // very low roughness (~0.15) for crisp light reflections
  mrctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    mrctx.fillStyle = i % 2 === 0 ? 'rgba(55,55,55,0.22)' : 'rgba(18,18,18,0.22)';
    mrctx.beginPath();
    mrctx.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 60, 0, Math.PI * 2);
    mrctx.fill();
  }
  mrctx.strokeStyle = '#d8d8d8'; // matte grout lines
  mrctx.lineWidth = 3;
  for (let g = 0; g <= 512; g += 128) {
    mrctx.beginPath();
    mrctx.moveTo(g, 0);
    mrctx.lineTo(g, 512);
    mrctx.stroke();
    mrctx.beginPath();
    mrctx.moveTo(0, g);
    mrctx.lineTo(512, g);
    mrctx.stroke();
  }
  const marbleFloorRoughness = configureTexture(
    new THREE.CanvasTexture(marbleRoughCanvas),
    maxAniso,
    3.5,
    2.2,
    false
  );

  const marbleBumpCanvas = document.createElement('canvas');
  marbleBumpCanvas.width = 512;
  marbleBumpCanvas.height = 512;
  const mbctx = marbleBumpCanvas.getContext('2d')!;
  mbctx.fillStyle = '#ffffff';
  mbctx.fillRect(0, 0, 512, 512);
  mbctx.strokeStyle = '#333333';
  mbctx.lineWidth = 3;
  for (let g = 0; g <= 512; g += 128) {
    mbctx.beginPath();
    mbctx.moveTo(g, 0);
    mbctx.lineTo(g, 512);
    mbctx.stroke();
    mbctx.beginPath();
    mbctx.moveTo(0, g);
    mbctx.lineTo(512, g);
    mbctx.stroke();
  }
  const marbleFloorBump = configureTexture(
    new THREE.CanvasTexture(marbleBumpCanvas),
    maxAniso,
    3.5,
    2.2,
    false
  );

  // 2. Seamless Slab Marble (Countertops & Tables)
  const slabCanvas = document.createElement('canvas');
  slabCanvas.width = 512;
  slabCanvas.height = 512;
  const sctx = slabCanvas.getContext('2d')!;
  sctx.fillStyle = '#f5eee4';
  sctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24; i++) {
    sctx.strokeStyle = i % 2 === 0 ? 'rgba(182, 152, 114, 0.38)' : 'rgba(212, 198, 178, 0.28)';
    sctx.lineWidth = 1 + Math.random() * 2.4;
    sctx.beginPath();
    let x = 0;
    let y = Math.random() * 512;
    sctx.moveTo(x, y);
    for (let k = 0; k < 10; k++) {
      x += 58;
      y += (Math.random() - 0.5) * 48;
      sctx.lineTo(x, y);
    }
    sctx.stroke();
  }
  const marbleTable = configureTexture(new THREE.CanvasTexture(slabCanvas), maxAniso, 1, 1, true);

  // 3. Warm Honey Oak Wood Grain
  const woodCanvas = document.createElement('canvas');
  woodCanvas.width = 512;
  woodCanvas.height = 512;
  const wctx = woodCanvas.getContext('2d')!;
  wctx.fillStyle = '#aa7e54';
  wctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const w = 1 + Math.random() * 3.5;
    wctx.fillStyle = i % 2 === 0 ? 'rgba(122, 82, 46, 0.24)' : 'rgba(202, 160, 114, 0.18)';
    wctx.fillRect(x, 0, w, 512);
  }
  const woodGrain = configureTexture(new THREE.CanvasTexture(woodCanvas), maxAniso, 1, 1, true);

  // 4. Fluted Wood Slat Panel + Real Height-Derived Normal Map
  const fluteCanvas = document.createElement('canvas');
  fluteCanvas.width = 512;
  fluteCanvas.height = 512;
  const fctx = fluteCanvas.getContext('2d')!;

  const fluteHeightCanvas = document.createElement('canvas');
  fluteHeightCanvas.width = 512;
  fluteHeightCanvas.height = 512;
  const fhctx = fluteHeightCanvas.getContext('2d')!;

  const slats = 24;
  const slatW = 512 / slats;
  for (let i = 0; i < slats; i++) {
    const x = i * slatW;
    const grad = fctx.createLinearGradient(x, 0, x + slatW, 0);
    grad.addColorStop(0, '#3e2918');
    grad.addColorStop(0.14, '#9b7048');
    grad.addColorStop(0.45, '#cb9e70');
    grad.addColorStop(0.75, '#a87a4f');
    grad.addColorStop(0.88, '#4a321d');
    grad.addColorStop(1, '#26180d');
    fctx.fillStyle = grad;
    fctx.fillRect(x, 0, slatW, 512);

    const hgrad = fhctx.createLinearGradient(x, 0, x + slatW, 0);
    hgrad.addColorStop(0, '#181818');
    hgrad.addColorStop(0.18, '#dcdcdc');
    hgrad.addColorStop(0.75, '#e8e8e8');
    hgrad.addColorStop(0.88, '#282828');
    hgrad.addColorStop(1, '#101010');
    fhctx.fillStyle = hgrad;
    fhctx.fillRect(x, 0, slatW, 512);
  }
  const flutedWood = configureTexture(new THREE.CanvasTexture(fluteCanvas), maxAniso, 2, 1, true);
  const flutedWoodNormal = heightCanvasToNormalTexture(fluteHeightCanvas, 4.5, maxAniso, 2, 1);

  // 5. Woven Boucle / Linen Fabric Bump Map
  const fabCanvas = document.createElement('canvas');
  fabCanvas.width = 256;
  fabCanvas.height = 256;
  const fbctx = fabCanvas.getContext('2d')!;
  fbctx.fillStyle = '#808080';
  fbctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    for (let x = 0; x < 256; x += 3) {
      const v = 100 + Math.floor(Math.random() * 90);
      fbctx.fillStyle = `rgb(${v},${v},${v})`;
      fbctx.fillRect(x, y, 2, 2);
    }
  }
  const fabricBump = configureTexture(new THREE.CanvasTexture(fabCanvas), maxAniso, 6, 6, false);

  // 6. Ornate Coastal Blue & Cream Medallion Area Rug (1024x1024)
  const rugCanvas = document.createElement('canvas');
  rugCanvas.width = 1024;
  rugCanvas.height = 1024;
  const rctx = rugCanvas.getContext('2d')!;
  rctx.fillStyle = '#e2d7c7';
  rctx.fillRect(0, 0, 1024, 1024);

  // Subtle woven tuft texture
  for (let y = 0; y < 1024; y += 4) {
    for (let x = 0; x < 1024; x += 4) {
      const n = Math.random();
      if (n > 0.68) {
        rctx.fillStyle = 'rgba(72, 102, 126, 0.20)';
        rctx.fillRect(x, y, 3, 3);
      } else if (n < 0.25) {
        rctx.fillStyle = 'rgba(255, 250, 240, 0.28)';
        rctx.fillRect(x, y, 3, 3);
      }
    }
  }

  // Classic double border frame
  rctx.strokeStyle = '#476882';
  rctx.lineWidth = 28;
  rctx.strokeRect(42, 42, 940, 940);
  rctx.strokeStyle = '#7391a8';
  rctx.lineWidth = 6;
  rctx.strokeRect(76, 76, 872, 872);

  // Distressed coastal damask watercolor clouds
  for (let i = 0; i < 65; i++) {
    const cx = 110 + Math.random() * 804;
    const cy = 110 + Math.random() * 804;
    const rad = 24 + Math.random() * 68;
    const grad = rctx.createRadialGradient(cx, cy, 4, cx, cy, rad);
    grad.addColorStop(0, 'rgba(67, 99, 125, 0.45)');
    grad.addColorStop(0.55, 'rgba(110, 140, 165, 0.22)');
    grad.addColorStop(1, 'rgba(226, 215, 199, 0)');
    rctx.fillStyle = grad;
    rctx.beginPath();
    rctx.arc(cx, cy, rad, 0, Math.PI * 2);
    rctx.fill();
  }

  // Center coastal medallion
  const medGrad = rctx.createRadialGradient(512, 512, 16, 512, 512, 175);
  medGrad.addColorStop(0, 'rgba(59, 89, 114, 0.68)');
  medGrad.addColorStop(0.55, 'rgba(97, 127, 151, 0.32)');
  medGrad.addColorStop(1, 'rgba(226, 215, 199, 0)');
  rctx.fillStyle = medGrad;
  rctx.beginPath();
  rctx.arc(512, 512, 175, 0, Math.PI * 2);
  rctx.fill();

  const coastalRug = configureTexture(new THREE.CanvasTexture(rugCanvas), maxAniso, 1, 1, true);

  // 7. Quilted Cream Bedding + Slate-Blue Runner
  const bedCanvas = document.createElement('canvas');
  bedCanvas.width = 512;
  bedCanvas.height = 512;
  const bctx = bedCanvas.getContext('2d')!;
  bctx.fillStyle = '#f4ece0';
  bctx.fillRect(0, 0, 512, 512);
  bctx.strokeStyle = 'rgba(202, 190, 172, 0.55)';
  bctx.lineWidth = 1.8;
  for (let i = 32; i < 512; i += 32) {
    bctx.beginPath();
    bctx.moveTo(i, 0);
    bctx.lineTo(i, 512);
    bctx.stroke();
    bctx.beginPath();
    bctx.moveTo(0, i);
    bctx.lineTo(512, i);
    bctx.stroke();
  }
  const bandGrad = bctx.createLinearGradient(0, 310, 0, 442);
  bandGrad.addColorStop(0, '#55738a');
  bandGrad.addColorStop(0.5, '#6a89a0');
  bandGrad.addColorStop(1, '#4b667a');
  bctx.fillStyle = bandGrad;
  bctx.fillRect(0, 310, 512, 132);
  const bedLinen = configureTexture(new THREE.CanvasTexture(bedCanvas), maxAniso, 1, 1, true);

  // 8. Balcony Travertine Stone Paver + Bump
  const travCanvas = document.createElement('canvas');
  travCanvas.width = 512;
  travCanvas.height = 512;
  const tctx = travCanvas.getContext('2d')!;
  tctx.fillStyle = '#dfd2bf';
  tctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 650; i++) {
    tctx.fillStyle = i % 2 === 0 ? 'rgba(182, 166, 145, 0.25)' : 'rgba(248, 240, 228, 0.24)';
    tctx.fillRect(Math.random() * 512, Math.random() * 512, 14 + Math.random() * 24, 3);
  }
  tctx.strokeStyle = 'rgba(148, 132, 114, 0.55)';
  tctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 128) {
    tctx.beginPath();
    tctx.moveTo(x, 0);
    tctx.lineTo(x, 512);
    tctx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.lineTo(512, y);
    tctx.stroke();
  }
  const travertine = configureTexture(new THREE.CanvasTexture(travCanvas), maxAniso, 4, 2, true);

  const travBumpCanvas = document.createElement('canvas');
  travBumpCanvas.width = 512;
  travBumpCanvas.height = 512;
  const tbctx = travBumpCanvas.getContext('2d')!;
  tbctx.fillStyle = '#d4d4d4';
  tbctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 320; i++) {
    tbctx.fillStyle = 'rgba(110,110,110,0.35)';
    tbctx.fillRect(Math.random() * 512, Math.random() * 512, 10 + Math.random() * 18, 2);
  }
  tbctx.strokeStyle = '#333333';
  tbctx.lineWidth = 2.5;
  for (let g = 0; g <= 512; g += 128) {
    tbctx.beginPath();
    tbctx.moveTo(g, 0);
    tbctx.lineTo(g, 512);
    tbctx.stroke();
    tbctx.beginPath();
    tbctx.moveTo(0, g);
    tbctx.lineTo(512, g);
    tbctx.stroke();
  }
  const travertineBump = configureTexture(new THREE.CanvasTexture(travBumpCanvas), maxAniso, 4, 2, false);

  // 9. Rattan Weave
  const ratCanvas = document.createElement('canvas');
  ratCanvas.width = 256;
  ratCanvas.height = 256;
  const rtctx = ratCanvas.getContext('2d')!;
  rtctx.fillStyle = '#bc9668';
  rtctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    rtctx.fillStyle = y % 16 === 0 ? '#9c7549' : '#d2ac7e';
    rtctx.fillRect(0, y, 256, 4);
  }
  for (let x = 0; x < 256; x += 8) {
    rtctx.fillStyle = 'rgba(110, 78, 42, 0.35)';
    rtctx.fillRect(x, 0, 3, 256);
  }
  const rattanWeave = configureTexture(new THREE.CanvasTexture(ratCanvas), maxAniso, 3, 3, true);

  // 10. TV Screen Coastal Artwork (subtle ambient sunset seascape on OLED screen)
  const tvCanvas = document.createElement('canvas');
  tvCanvas.width = 512;
  tvCanvas.height = 288;
  const tvctx = tvCanvas.getContext('2d')!;
  const skyGrad = tvctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0, '#3a6285');
  skyGrad.addColorStop(0.65, '#9ab7cc');
  skyGrad.addColorStop(1, '#f3c98d');
  tvctx.fillStyle = skyGrad;
  tvctx.fillRect(0, 0, 512, 175);
  const seaGrad = tvctx.createLinearGradient(0, 175, 0, 288);
  seaGrad.addColorStop(0, '#2a5a7b');
  seaGrad.addColorStop(1, '#123149');
  tvctx.fillStyle = seaGrad;
  tvctx.fillRect(0, 175, 512, 113);
  const tvArt = configureTexture(new THREE.CanvasTexture(tvCanvas), maxAniso, 1, 1, true);

  // 11. Warm Radial Floor / Cove Light Pool Decal (baked GI glow aesthetic!)
  const poolCanvas = document.createElement('canvas');
  poolCanvas.width = 256;
  poolCanvas.height = 256;
  const pctx = poolCanvas.getContext('2d')!;
  const pgrad = pctx.createRadialGradient(128, 128, 6, 128, 128, 126);
  pgrad.addColorStop(0, 'rgba(255, 224, 170, 0.55)');
  pgrad.addColorStop(0.45, 'rgba(255, 200, 130, 0.22)');
  pgrad.addColorStop(1, 'rgba(255, 190, 120, 0)');
  pctx.fillStyle = pgrad;
  pctx.fillRect(0, 0, 256, 256);
  const warmLightPool = configureTexture(new THREE.CanvasTexture(poolCanvas), maxAniso, 1, 1, true);
  warmLightPool.wrapS = THREE.ClampToEdgeWrapping;
  warmLightPool.wrapT = THREE.ClampToEdgeWrapping;

  // 12. Soft Radial Contact Shadow (grounds furniture to marble floor like V-Ray AO)
  const csCanvas = document.createElement('canvas');
  csCanvas.width = 256;
  csCanvas.height = 256;
  const csctx = csCanvas.getContext('2d')!;
  const csgrad = csctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  csgrad.addColorStop(0, 'rgba(38, 28, 18, 0.52)');
  csgrad.addColorStop(0.55, 'rgba(42, 32, 22, 0.24)');
  csgrad.addColorStop(1, 'rgba(42, 32, 22, 0)');
  csctx.fillStyle = csgrad;
  csctx.fillRect(0, 0, 256, 256);
  const contactShadow = configureTexture(new THREE.CanvasTexture(csCanvas), maxAniso, 1, 1, true);
  contactShadow.wrapS = THREE.ClampToEdgeWrapping;
  contactShadow.wrapT = THREE.ClampToEdgeWrapping;

  // 13. Linear Wall-to-Floor Ambient Occlusion Gradient
  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = 64;
  aoCanvas.height = 128;
  const aoctx = aoCanvas.getContext('2d')!;
  const aograd = aoctx.createLinearGradient(0, 0, 0, 128);
  aograd.addColorStop(0, 'rgba(38, 30, 22, 0)');
  aograd.addColorStop(1, 'rgba(38, 30, 22, 0.38)');
  aoctx.fillStyle = aograd;
  aoctx.fillRect(0, 0, 64, 128);
  const wallAo = configureTexture(new THREE.CanvasTexture(aoCanvas), maxAniso, 1, 1, true);
  wallAo.wrapS = THREE.ClampToEdgeWrapping;
  wallAo.wrapT = THREE.ClampToEdgeWrapping;

  // 14. Coastal Abstract Artwork 1 (Horizon Gold & Deep Aegean Blue)
  const art1Canvas = document.createElement('canvas');
  art1Canvas.width = 512;
  art1Canvas.height = 512;
  const a1 = art1Canvas.getContext('2d')!;
  const a1Bg = a1.createLinearGradient(0, 0, 0, 512);
  a1Bg.addColorStop(0, '#f3ede3');
  a1Bg.addColorStop(0.54, '#e5d4bc');
  a1Bg.addColorStop(0.55, '#5b7e99');
  a1Bg.addColorStop(1, '#2d4b63');
  a1.fillStyle = a1Bg;
  a1.fillRect(0, 0, 512, 512);
  a1.fillStyle = 'rgba(206, 158, 92, 0.65)';
  a1.beginPath();
  a1.arc(256, 225, 68, 0, Math.PI * 2);
  a1.fill();
  for (let i = 0; i < 40; i++) {
    a1.fillStyle = i % 2 === 0 ? 'rgba(255,250,242,0.12)' : 'rgba(35,62,84,0.14)';
    a1.fillRect(Math.random() * 440, 280 + Math.random() * 200, 40 + Math.random() * 80, 5);
  }
  const wallArt1 = configureTexture(new THREE.CanvasTexture(art1Canvas), maxAniso, 1, 1, true);

  // 15. Coastal Abstract Artwork 2 (Warm Travertine Arch & Sand Brushstrokes)
  const art2Canvas = document.createElement('canvas');
  art2Canvas.width = 512;
  art2Canvas.height = 512;
  const a2 = art2Canvas.getContext('2d')!;
  a2.fillStyle = '#efe7da';
  a2.fillRect(0, 0, 512, 512);
  a2.fillStyle = '#d3b896';
  a2.beginPath();
  a2.arc(256, 260, 145, Math.PI, 0);
  a2.lineTo(401, 450);
  a2.lineTo(111, 450);
  a2.closePath();
  a2.fill();
  a2.fillStyle = '#486b85';
  a2.beginPath();
  a2.arc(310, 320, 74, 0, Math.PI * 2);
  a2.fill();
  const wallArt2 = configureTexture(new THREE.CanvasTexture(art2Canvas), maxAniso, 1, 1, true);

  // 16. Sheer Pleated Linen Curtain Texture
  const curCanvas = document.createElement('canvas');
  curCanvas.width = 256;
  curCanvas.height = 256;
  const cctx = curCanvas.getContext('2d')!;
  cctx.fillStyle = '#f8f3eb';
  cctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 2) {
    const shade = Math.sin((x / 256) * Math.PI * 12) * 14;
    const base = Math.round(240 + shade);
    cctx.fillStyle = `rgb(${base}, ${base - 4}, ${base - 11})`;
    cctx.fillRect(x, 0, 2, 256);
  }
  const curtainLinen = configureTexture(new THREE.CanvasTexture(curCanvas), maxAniso, 2, 1, true);

  return {
    marbleFloor,
    marbleFloorRoughness,
    marbleFloorBump,
    marbleTable,
    woodGrain,
    flutedWood,
    flutedWoodNormal,
    fabricBump,
    coastalRug,
    bedLinen,
    travertine,
    travertineBump,
    rattanWeave,
    tvArt,
    warmLightPool,
    contactShadow,
    wallAo,
    wallArt1,
    wallArt2,
    curtainLinen,
    dispose: () => {
      marbleFloor.dispose();
      marbleFloorRoughness.dispose();
      marbleFloorBump.dispose();
      marbleTable.dispose();
      woodGrain.dispose();
      flutedWood.dispose();
      flutedWoodNormal.dispose();
      fabricBump.dispose();
      coastalRug.dispose();
      bedLinen.dispose();
      travertine.dispose();
      travertineBump.dispose();
      rattanWeave.dispose();
      tvArt.dispose();
      warmLightPool.dispose();
      contactShadow.dispose();
      wallAo.dispose();
      wallArt1.dispose();
      wallArt2.dispose();
      curtainLinen.dispose();
    },
  };
}

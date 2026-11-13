import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { ProceduralTextures } from './textures';

export interface MaterialLibrary {
  isSoftwareGl: boolean;
  registerDisposable: (item: { dispose: () => void }) => void;
  plasterWall: THREE.MeshStandardMaterial;
  wallTopCap: THREE.MeshStandardMaterial;
  marbleFloor: THREE.MeshPhysicalMaterial;
  marbleSlab: THREE.MeshPhysicalMaterial;
  travertine: THREE.MeshStandardMaterial;
  woodOak: THREE.MeshStandardMaterial;
  flutedWood: THREE.MeshStandardMaterial;
  creamFabric: THREE.MeshPhysicalMaterial;
  tealAccent: THREE.MeshPhysicalMaterial;
  bedLinen: THREE.MeshPhysicalMaterial;
  coastalRug: THREE.MeshStandardMaterial;
  rattan: THREE.MeshStandardMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshPhysicalMaterial;
  stainless: THREE.MeshPhysicalMaterial;
  darkGlass: THREE.MeshStandardMaterial;
  clearGlass: THREE.MeshPhysicalMaterial;
  ceramicWhite: THREE.MeshPhysicalMaterial;
  warmLed: THREE.MeshStandardMaterial;
  lampBulb: THREE.MeshStandardMaterial;
  palmLeaf: THREE.MeshStandardMaterial;
  ceramicPot: THREE.MeshStandardMaterial;
  tvScreen: THREE.MeshStandardMaterial;
  sheerCurtain: THREE.MeshPhysicalMaterial;
  wallArt1Mat: THREE.MeshStandardMaterial;
  wallArt2Mat: THREE.MeshStandardMaterial;
  lightPoolMat: THREE.MeshBasicMaterial;
  contactShadowMat: THREE.MeshBasicMaterial;
  wallAoMat: THREE.MeshBasicMaterial;
  dispose: () => void;
}

export function createMaterialLibrary(
  textures: ProceduralTextures,
  isSoftwareGl: boolean
): MaterialLibrary {
  const extraDisposables: { dispose: () => void }[] = [];
  const registerDisposable = (item: { dispose: () => void }) => {
    extraDisposables.push(item);
  };

  const plasterWall = new THREE.MeshStandardMaterial({
    color: 0xe0d6c8,
    roughness: 0.9,
    metalness: 0.01,
    bumpMap: textures.fabricBump,
    bumpScale: 0.002,
  });

  const wallTopCap = new THREE.MeshStandardMaterial({
    color: 0x3b4046,
    roughness: 0.68,
    metalness: 0.1,
  });

  const marbleFloor = new THREE.MeshPhysicalMaterial({
    color: 0xebe3d7,
    map: textures.marbleFloor,
    roughnessMap: textures.marbleFloorRoughness,
    bumpMap: textures.marbleFloorBump,
    bumpScale: 0.007,
    roughness: 0.88,
    metalness: 0.02,
    clearcoat: 0.34,
    clearcoatRoughness: 0.26,
    envMapIntensity: 0.5,
    transparent: !isSoftwareGl,
    opacity: isSoftwareGl ? 1.0 : 0.87,
    depthWrite: true,
  });

  const marbleSlab = new THREE.MeshPhysicalMaterial({
    color: 0xf0e9de,
    map: textures.marbleTable,
    roughness: 0.24,
    metalness: 0.02,
    clearcoat: 0.42,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.6,
  });

  const travertine = new THREE.MeshStandardMaterial({
    map: textures.travertine,
    bumpMap: textures.travertineBump,
    bumpScale: 0.012,
    roughness: 0.72,
    metalness: 0.01,
  });

  const woodOak = new THREE.MeshStandardMaterial({
    map: textures.woodGrain,
    roughness: 0.5,
    metalness: 0.03,
  });

  const flutedWood = new THREE.MeshStandardMaterial({
    map: textures.flutedWood,
    normalMap: textures.flutedWoodNormal,
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughness: 0.54,
    metalness: 0.04,
  });

  const creamFabric = new THREE.MeshPhysicalMaterial({
    color: 0xe3d9ca,
    bumpMap: textures.fabricBump,
    bumpScale: 0.005,
    roughness: 0.92,
    metalness: 0.0,
    sheen: 0.35,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(0xf5eadb),
  });

  const tealAccent = new THREE.MeshPhysicalMaterial({
    color: 0x456f85,
    bumpMap: textures.fabricBump,
    bumpScale: 0.005,
    roughness: 0.8,
    metalness: 0.01,
    sheen: 0.3,
    sheenRoughness: 0.78,
    sheenColor: new THREE.Color(0x7caac2),
  });

  const bedLinen = new THREE.MeshPhysicalMaterial({
    color: 0xede6dc,
    map: textures.bedLinen,
    bumpMap: textures.fabricBump,
    bumpScale: 0.004,
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.28,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(0xf7efe4),
  });

  const coastalRug = new THREE.MeshStandardMaterial({
    map: textures.coastalRug,
    bumpMap: textures.fabricBump,
    bumpScale: 0.008,
    roughness: 0.96,
    metalness: 0.0,
  });

  const rattan = new THREE.MeshStandardMaterial({
    map: textures.rattanWeave,
    bumpMap: textures.rattanWeave,
    bumpScale: 0.015,
    roughness: 0.78,
    metalness: 0.02,
  });

  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xd8dfe6,
    roughness: 0.18,
    metalness: 0.92,
    anisotropy: 0.55,
    envMapIntensity: 0.9,
  });

  const brass = new THREE.MeshPhysicalMaterial({
    color: 0xc59f5e,
    roughness: 0.28,
    metalness: 0.88,
    anisotropy: 0.65,
    envMapIntensity: 0.85,
  });

  const stainless = new THREE.MeshPhysicalMaterial({
    color: 0xb0b8c0,
    roughness: 0.3,
    metalness: 0.86,
    anisotropy: 0.7,
  });

  const darkGlass = new THREE.MeshStandardMaterial({
    color: 0x161b21,
    roughness: 0.14,
    metalness: 0.22,
  });

  const clearGlass = new THREE.MeshPhysicalMaterial({
    color: 0xd2e7f2,
    roughness: 0.08,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.84,
    transparent: true,
    opacity: isSoftwareGl ? 0.32 : 0.96,
    ior: 1.5,
    thickness: 0.06,
    depthWrite: false,
  });

  const ceramicWhite = new THREE.MeshPhysicalMaterial({
    color: 0xeeece7,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.55,
    clearcoatRoughness: 0.12,
  });

  const warmLed = new THREE.MeshStandardMaterial({
    color: 0xffd79e,
    emissive: 0xffb357,
    emissiveIntensity: 1.25,
    roughness: 0.3,
  });

  const lampBulb = new THREE.MeshStandardMaterial({
    color: 0xffeacc,
    emissive: 0xffbf70,
    emissiveIntensity: 1.35,
    roughness: 0.25,
  });

  const palmLeaf = new THREE.MeshStandardMaterial({
    color: 0x487635,
    roughness: 0.58,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const ceramicPot = new THREE.MeshStandardMaterial({
    color: 0xc9beae,
    roughness: 0.66,
    metalness: 0.03,
  });

  const tvScreen = new THREE.MeshStandardMaterial({
    map: textures.tvArt,
    emissiveMap: textures.tvArt,
    emissive: 0xffffff,
    emissiveIntensity: 0.45,
    roughness: 0.14,
    metalness: 0.1,
  });

  const sheerCurtain = new THREE.MeshPhysicalMaterial({
    color: 0xf7f1e7,
    map: textures.curtainLinen,
    roughness: 0.9,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(0xfff7eb),
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const wallArt1Mat = new THREE.MeshStandardMaterial({
    map: textures.wallArt1,
    roughness: 0.62,
    metalness: 0.02,
  });

  const wallArt2Mat = new THREE.MeshStandardMaterial({
    map: textures.wallArt2,
    roughness: 0.62,
    metalness: 0.02,
  });

  const lightPoolMat = new THREE.MeshBasicMaterial({
    color: 0xffe4b8,
    map: textures.warmLightPool,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });

  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });

  const wallAoMat = new THREE.MeshBasicMaterial({
    map: textures.wallAo,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const all = [
    plasterWall,
    wallTopCap,
    marbleFloor,
    marbleSlab,
    travertine,
    woodOak,
    flutedWood,
    creamFabric,
    tealAccent,
    bedLinen,
    coastalRug,
    rattan,
    chrome,
    brass,
    stainless,
    darkGlass,
    clearGlass,
    ceramicWhite,
    warmLed,
    lampBulb,
    palmLeaf,
    ceramicPot,
    tvScreen,
    sheerCurtain,
    wallArt1Mat,
    wallArt2Mat,
    lightPoolMat,
    contactShadowMat,
    wallAoMat,
  ];

  return {
    isSoftwareGl,
    registerDisposable,
    plasterWall,
    wallTopCap,
    marbleFloor,
    marbleSlab,
    travertine,
    woodOak,
    flutedWood,
    creamFabric,
    tealAccent,
    bedLinen,
    coastalRug,
    rattan,
    chrome,
    brass,
    stainless,
    darkGlass,
    clearGlass,
    ceramicWhite,
    warmLed,
    lampBulb,
    palmLeaf,
    ceramicPot,
    tvScreen,
    sheerCurtain,
    wallArt1Mat,
    wallArt2Mat,
    lightPoolMat,
    contactShadowMat,
    wallAoMat,
    dispose: () => {
      all.forEach((m) => m.dispose());
      extraDisposables.forEach((d) => d.dispose());
    },
  };
}

function addContactShadow(
  group: THREE.Group,
  mats: MaterialLibrary,
  w: number,
  d: number,
  x = 0,
  z = 0,
  y = 0.022
) {
  const geo = new THREE.PlaneGeometry(w, d);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mats.contactShadowMat);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function setShadow(obj: THREE.Object3D, cast = true, receive = true) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

// King Bed with backlit headboard, 2 nightstands, spherical lamps & coastal rug
export function createKingBed(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Area Rug beneath bed (offset Y = 0.012 to avoid Z-fighting)
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.016, 2.9), mats.coastalRug);
  rug.position.set(1.12, 0.008, 0);
  group.add(rug);

  // Wooden Bed Frame Base
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.24, 1.88), mats.woodOak);
  frame.position.set(1.06, 0.14, 0);
  group.add(frame);

  // Mattress + folded textured duvet runner
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.22, 1.80), mats.bedLinen);
  mattress.position.set(1.07, 0.36, 0);
  group.add(mattress);

  const foldedThrow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 1.84), mats.tealAccent);
  foldedThrow.position.set(1.72, 0.46, 0);
  group.add(foldedThrow);

  // Backlit Headboard Panel (against -X wall)
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.25, 2.86), mats.woodOak);
  headboard.position.set(0.05, 0.72, 0);
  group.add(headboard);

  const headboardCushion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 1.84), mats.creamFabric);
  headboardCushion.position.set(0.12, 0.76, 0);
  group.add(headboardCushion);

  // Warm LED cove strip behind headboard
  const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.22, 2.82), mats.warmLed);
  ledStrip.position.set(0.01, 0.72, 0);
  group.add(ledStrip);

  // 4 Sleeping Pillows + 1 Teal Lumbar Cushion
  const pillowGeo = new THREE.BoxGeometry(0.36, 0.14, 0.68);
  [-0.46, 0.46].forEach((zOff) => {
    const pBack = new THREE.Mesh(pillowGeo, mats.creamFabric);
    pBack.position.set(0.34, 0.54, zOff);
    pBack.rotation.z = -0.35;
    group.add(pBack);

    const pFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.58), mats.creamFabric);
    pFront.position.set(0.5, 0.52, zOff);
    pFront.rotation.z = -0.25;
    group.add(pFront);
  });

  const accentPillow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.46), mats.tealAccent);
  accentPillow.position.set(0.64, 0.53, 0);
  accentPillow.rotation.z = -0.22;
  group.add(accentPillow);

  // Twin Nightstands + Spherical Warm Lamps + Bedside Book
  [-1.22, 1.22].forEach((zPos, idx) => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.46), mats.woodOak);
    stand.position.set(0.28, 0.225, zPos);
    group.add(stand);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.04, 16), mats.brass);
    lampBase.position.set(0.28, 0.47, zPos);
    group.add(lampBase);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), mats.lampBulb);
    globe.position.set(0.28, 0.59, zPos);
    group.add(globe);

    if (idx === 0) {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.22), mats.creamFabric);
      book.position.set(0.31, 0.465, zPos - 0.12);
      book.rotation.y = 0.2;
      group.add(book);
    }
  });

  addContactShadow(group, mats, 2.35, 2.85, 1.02, 0, 0.021);
  setShadow(group, true, true);
  return group;
}

// Curved Cream Modular Sofa (Living Room Signature Piece with Segmented Plush Cushions)
export function createCurvedSofa(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const outerR = 1.62;
  const innerR = 0.84;
  const startAng = -Math.PI * 0.58;
  const endAng = Math.PI * 0.58;

  // Recessed warm wood plinth base
  const plinthShape = new THREE.Shape();
  plinthShape.absarc(0, 0, outerR - 0.05, startAng + 0.03, endAng - 0.03, false);
  plinthShape.absarc(0, 0, innerR + 0.06, endAng - 0.03, startAng + 0.03, true);
  plinthShape.closePath();

  const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
    depth: 0.08,
    bevelEnabled: false,
    curveSegments: 28,
  });
  plinthGeo.rotateX(-Math.PI / 2);
  const plinth = new THREE.Mesh(plinthGeo, mats.woodOak);
  group.add(plinth);

  // Individual sculpted plush seat & backrest segments along arc
  const segCount = 9;
  const segSpan = (endAng - startAng) / segCount;
  const midR = (outerR + innerR) * 0.5;
  const seatDepth = outerR - innerR;

  for (let i = 0; i < segCount; i++) {
    const a = startAng + (i + 0.5) * segSpan;
    const segW = midR * segSpan * 0.96;

    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(seatDepth, 0.30, segW),
      mats.creamFabric
    );
    cushion.position.set(Math.cos(a) * midR, 0.23, Math.sin(a) * midR);
    cushion.rotation.y = -a;
    group.add(cushion);

    // Rounded bolster top seam
    const topPad = new THREE.Mesh(
      new THREE.CylinderGeometry(seatDepth * 0.46, seatDepth * 0.48, segW * 0.92, 14),
      mats.creamFabric
    );
    topPad.rotation.x = Math.PI / 2;
    topPad.scale.set(1.0, 1.0, 0.28);
    topPad.position.set(Math.cos(a) * midR, 0.36, Math.sin(a) * midR);
    topPad.rotation.y = -a;
    group.add(topPad);
  }

  // Smooth Curved Backrest
  const backShape = new THREE.Shape();
  backShape.absarc(0, 0, outerR, startAng, endAng, false);
  backShape.absarc(0, 0, outerR - 0.24, endAng, startAng, true);
  backShape.closePath();

  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.40,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 3,
    curveSegments: 32,
  });
  backGeo.rotateX(-Math.PI / 2);
  const back = new THREE.Mesh(backGeo, mats.creamFabric);
  back.position.y = 0.40;
  group.add(back);

  // Accent Teal & Cream Throw Pillows along arc
  [-0.82, -0.2, 0.78].forEach((ang, idx) => {
    const r = outerR - 0.36;
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.32, 0.36),
      idx === 1 ? mats.creamFabric : mats.tealAccent
    );
    cushion.position.set(Math.cos(ang) * r, 0.56, Math.sin(ang) * r);
    cushion.rotation.y = -ang;
    cushion.rotation.z = 0.2;
    group.add(cushion);
  });

  addContactShadow(group, mats, 2.3, 3.3, 0.95, 0, 0.024);
  setShadow(group, true, true);
  return group;
}

// Round Marble Coffee Table with Decorative Bowl
export function createRoundCoffeeTable(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.36, 28), mats.travertine);
  base.position.y = 0.18;
  group.add(base);

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.05, 36), mats.marbleSlab);
  top.position.y = 0.385;
  group.add(top);

  // Ceramic tray, greenery vase, tea set & stacked art books
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.028, 24), mats.ceramicWhite);
  tray.position.set(-0.08, 0.424, -0.05);
  group.add(tray);

  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.072, 0.14, 16), mats.ceramicWhite);
  vase.position.set(-0.10, 0.50, -0.04);
  group.add(vase);

  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), mats.palmLeaf);
    leaf.scale.set(1.25, 0.62, 1.0);
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(-0.10 + Math.cos(a) * 0.06, 0.59 + (i % 2) * 0.03, -0.04 + Math.sin(a) * 0.06);
    group.add(leaf);
  }

  // Stacked hardcover design books + espresso cups
  const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.028, 0.18), mats.tealAccent);
  book1.position.set(0.18, 0.424, 0.16);
  book1.rotation.y = 0.35;
  group.add(book1);

  const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.022, 0.15), mats.creamFabric);
  book2.position.set(0.18, 0.449, 0.16);
  book2.rotation.y = 0.22;
  group.add(book2);

  const cupGeo = new THREE.CylinderGeometry(0.026, 0.022, 0.045, 12);
  const cup1 = new THREE.Mesh(cupGeo, mats.ceramicWhite);
  cup1.position.set(0.02, 0.46, -0.11);
  group.add(cup1);
  const cup2 = new THREE.Mesh(cupGeo, mats.ceramicWhite);
  cup2.position.set(-0.02, 0.46, 0.06);
  group.add(cup2);

  addContactShadow(group, mats, 1.35, 1.35, 0, 0, 0.024);
  setShadow(group, true, true);
  return group;
}

// Accent Armchair with Teal Cushion
export function createAccentArmchair(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const legGeo = new THREE.CylinderGeometry(0.02, 0.014, 0.18, 10);
  [
    [-0.26, -0.24],
    [0.26, -0.24],
    [-0.26, 0.24],
    [0.26, 0.24],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, mats.woodOak);
    leg.position.set(lx, 0.09, lz);
    group.add(leg);
  });

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.34, 0.22, 24), mats.creamFabric);
  seat.position.y = 0.28;
  group.add(seat);

  // Curved wrap backrest
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.42, 24, 1, false, Math.PI * 0.65, Math.PI * 1.3),
    mats.creamFabric
  );
  back.position.y = 0.52;
  group.add(back);

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.11), mats.tealAccent);
  pillow.position.set(0, 0.48, -0.15);
  pillow.rotation.x = 0.18;
  group.add(pillow);

  setShadow(group, true, true);
  return group;
}

// 6-Seat Marble Dining Table + Upholstered Chairs
export function createDiningSet(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Twin pedestal bases
  [-0.58, 0.58].forEach((x) => {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.72, 20), mats.travertine);
    ped.position.set(x, 0.36, 0);
    group.add(ped);
  });

  // Marble table top (1.95m x 0.96m)
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.05, 0.96), mats.marbleSlab);
  top.position.y = 0.745;
  group.add(top);

  // Fruit bowl + floral vase on table
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.09, 0.07, 20), mats.ceramicWhite);
  bowl.position.set(-0.26, 0.805, 0);
  group.add(bowl);

  const appleGeo = new THREE.SphereGeometry(0.036, 10, 10);
  const appleMat = new THREE.MeshStandardMaterial({ color: 0x7da640, roughness: 0.45 });
  [
    [-0.31, 0.84, 0.02],
    [-0.22, 0.84, -0.03],
    [-0.26, 0.85, 0.04],
  ].forEach(([ax, ay, az]) => {
    const fruit = new THREE.Mesh(appleGeo, appleMat);
    fruit.position.set(ax, ay, az);
    group.add(fruit);
  });

  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.16, 16), mats.ceramicWhite);
  vase.position.set(0.28, 0.85, 0);
  group.add(vase);
  const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), mats.palmLeaf);
  foliage.position.set(0.28, 0.98, 0);
  group.add(foliage);

  // 6 Curved Barrel-Back Upholstered Cream Chairs (3 North, 3 South)
  const makeChair = (x: number, z: number, rotY: number) => {
    const chair = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.015, 0.011, 0.42, 8);
    [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, mats.woodOak);
      leg.position.set(lx, 0.21, lz);
      chair.add(leg);
    });
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.22, 0.08, 20), mats.creamFabric);
    seat.position.y = 0.44;
    chair.add(seat);

    const backrest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.34, 20, 1, false, Math.PI * 0.55, Math.PI * 0.9),
      mats.creamFabric
    );
    backrest.position.set(0, 0.63, 0);
    backrest.rotation.y = Math.PI;
    chair.add(backrest);

    addContactShadow(chair, mats, 0.58, 0.58, 0, 0, 0.021);
    chair.position.set(x, 0, z);
    chair.rotation.y = rotY;
    group.add(chair);
  };

  [-0.58, 0, 0.58].forEach((x) => {
    makeChair(x, -0.58, 0);
    makeChair(x, 0.58, Math.PI);
  });

  addContactShadow(group, mats, 2.2, 1.4, 0, 0, 0.020);
  setShadow(group, true, true);
  return group;
}

// Kitchen Counter, Refrigerator, Induction Cooktop & Sink
export function createKitchenCounter(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Stainless Refrigerator on left end (local x = -2.45)
  const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.92, 0.68), mats.stainless);
  fridgeBody.position.set(-2.45, 0.96, 0);
  group.add(fridgeBody);

  const fridgeSeam = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.012, 0.02), mats.darkGlass);
  fridgeSeam.position.set(-2.45, 0.76, -0.34);
  group.add(fridgeSeam);

  // Main Base Cabinet (length 4.45m)
  const baseCab = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.84, 0.62), mats.creamFabric);
  baseCab.position.set(0.22, 0.42, 0.02);
  group.add(baseCab);

  // Marble Countertop
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(4.50, 0.05, 0.66), mats.marbleSlab);
  counterTop.position.set(0.22, 0.865, 0.02);
  group.add(counterTop);

  // Backsplash + Warm LED strip
  const backsplash = new THREE.Mesh(new THREE.BoxGeometry(4.48, 0.62, 0.03), mats.marbleSlab);
  backsplash.position.set(0.22, 1.18, 0.33);
  group.add(backsplash);

  const ledLine = new THREE.Mesh(new THREE.BoxGeometry(4.40, 0.025, 0.025), mats.warmLed);
  ledLine.position.set(0.22, 1.49, 0.28);
  group.add(ledLine);

  // Upper Floating Shelf/Cabinets with vertical door seam grooves
  const upperCab = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.72, 0.34), mats.woodOak);
  upperCab.position.set(0.22, 2.08, 0.16);
  group.add(upperCab);

  for (let i = -3; i <= 3; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.70, 0.015), mats.darkGlass);
    seam.position.set(0.22 + i * 0.56, 2.08, -0.015);
    group.add(seam);

    const lowSeam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.80, 0.015), mats.wallTopCap);
    lowSeam.position.set(0.22 + i * 0.56, 0.42, -0.295);
    group.add(lowSeam);
  }

  // 2-Zone Black Induction Cooktop
  const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.015, 0.44), mats.darkGlass);
  cooktop.position.set(-0.62, 0.896, 0.0);
  group.add(cooktop);

  // Stainless Espresso Machine & Wooden Cutting Board
  const espresso = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 0.24), mats.stainless);
  espresso.position.set(1.92, 1.04, 0.08);
  group.add(espresso);

  const cuttingBoard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.24), mats.woodOak);
  cuttingBoard.position.set(0.18, 0.90, -0.02);
  group.add(cuttingBoard);

  // Stainless Sink & Gooseneck Faucet
  const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.02, 0.42), mats.stainless);
  sinkBasin.position.set(1.05, 0.892, 0.0);
  group.add(sinkBasin);

  const faucetPost = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.24, 12), mats.chrome);
  faucetPost.position.set(1.05, 1.01, 0.18);
  group.add(faucetPost);

  const faucetSpout = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.013, 8, 16, Math.PI), mats.chrome);
  faucetSpout.position.set(1.05, 1.13, 0.10);
  faucetSpout.rotation.y = Math.PI / 2;
  group.add(faucetSpout);

  // Decorative citrus bowl on counter
  const fruitBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.06, 18), mats.ceramicWhite);
  fruitBowl.position.set(-1.55, 0.92, -0.02);
  group.add(fruitBowl);

  setShadow(group, true, true);
  return group;
}

// Full-Length Living-to-Foyer Backlit Wood Slat Showcase Wall + 65" OLED TV
export function createTvFeatureWall(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Main fluted wood panel spanning Living Room + Foyer wall (length 5.1m)
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.75, 5.15), mats.flutedWood);
  panel.position.set(0, 1.38, 1.05);
  group.add(panel);

  // Full-length warm backlit LED wash strips (top & vertical accents)
  const topLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 5.10), mats.warmLed);
  topLed.position.set(-0.04, 2.68, 1.05);
  group.add(topLed);

  [-1.48, 1.48, 3.55].forEach((zOff) => {
    const vLed = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.68, 0.03), mats.warmLed);
    vLed.position.set(-0.03, 1.36, zOff);
    group.add(vLed);
  });

  // Floating Oak Media Console (Living Room) + Entry Console (Foyer)
  const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 2.75), mats.woodOak);
  consoleBox.position.set(-0.22, 0.38, 0);
  group.add(consoleBox);

  const foyerConsole = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 1.65), mats.woodOak);
  foyerConsole.position.set(-0.20, 0.38, 2.65);
  group.add(foyerConsole);

  const consoleLed = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 4.90), mats.warmLed);
  consoleLed.position.set(-0.08, 0.20, 1.0);
  group.add(consoleLed);

  // 65" OLED TV
  const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.92, 1.62), mats.darkGlass);
  tvFrame.position.set(-0.06, 1.32, 0);
  group.add(tvFrame);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.86, 1.56), mats.tvScreen);
  screen.position.set(-0.08, 1.32, 0);
  group.add(screen);

  setShadow(group, true, true);
  return group;
}

// Built-in Louvered Wood Wardrobe with real 3D vertical slats
export function createWardrobe(mats: MaterialLibrary, width = 1.85): THREE.Group {
  const group = new THREE.Group();

  const recess = new THREE.Mesh(new THREE.BoxGeometry(width, 2.55, 0.52), mats.darkGlass);
  recess.position.y = 1.275;
  group.add(recess);

  const louverCount = Math.floor(width / 0.06);
  const louverGeo = new THREE.BoxGeometry(0.028, 2.48, 0.05);
  for (let i = 0; i < louverCount; i++) {
    const lx = -width / 2 + 0.04 + (i / (louverCount - 1)) * (width - 0.08);
    const bar = new THREE.Mesh(louverGeo, mats.woodOak);
    bar.position.set(lx, 1.275, -0.26);
    group.add(bar);
  }

  const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.05, 0.58), mats.woodOak);
  trim.position.y = 2.56;
  group.add(trim);

  setShadow(group, true, true);
  return group;
}

// Bedroom 2 Vanity / Study Desk & Curved Teal Chair
export function createVanityDesk(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 1.35), mats.woodOak);
  deskTop.position.set(0, 0.74, 0);
  group.add(deskTop);

  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 1.30), mats.woodOak);
  drawer.position.set(0.02, 0.64, 0);
  group.add(drawer);

  // Wall Mirror / Backlit Panel (real Reflector on GPU)
  const mirrorFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 28), mats.warmLed);
  mirrorFrame.rotation.z = Math.PI / 2;
  mirrorFrame.position.set(0.21, 1.36, -0.15);
  group.add(mirrorFrame);

  if (!mats.isSoftwareGl) {
    const mirrorRefl = new Reflector(new THREE.CircleGeometry(0.325, 28), {
      color: 0xc8c0b6,
      textureWidth: 256,
      textureHeight: 256,
      clipBias: 0.003,
      multisample: 0,
    });
    mirrorRefl.rotation.y = -Math.PI / 2;
    mirrorRefl.position.set(0.19, 1.36, -0.15);
    mats.registerDisposable(mirrorRefl);
    group.add(mirrorRefl);
  } else {
    const mirrorGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.036, 28), mats.chrome);
    mirrorGlass.rotation.z = Math.PI / 2;
    mirrorGlass.position.set(0.205, 1.36, -0.15);
    group.add(mirrorGlass);
  }

  // Perfume bottle & ceramic tray on desk
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.24), mats.ceramicWhite);
  tray.position.set(0.05, 0.77, 0.28);
  group.add(tray);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.09, 12), mats.brass);
  bottle.position.set(0.05, 0.82, 0.26);
  group.add(bottle);

  // Curved Teal Vanity Chair
  const chair = new THREE.Group();
  const baseStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.22, 0.42, 16), mats.brass);
  baseStem.position.y = 0.21;
  chair.add(baseStem);

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.24, 0.1, 20), mats.tealAccent);
  seat.position.y = 0.45;
  chair.add(seat);

  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.28, 20, 1, false, Math.PI * 0.65, Math.PI * 1.15),
    mats.tealAccent
  );
  back.position.y = 0.62;
  back.rotation.y = Math.PI * 0.5;
  chair.add(back);

  chair.position.set(-0.46, 0, -0.10);
  group.add(chair);

  setShadow(group, true, true);
  return group;
}

// Master Bath Built-In Soaking Bathtub
export function createBathtub(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Marble deck surround
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.48, 1.96), mats.marbleSlab);
  deck.position.y = 0.24;
  group.add(deck);

  // Warm LED under-lip strip
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 1.90), mats.warmLed);
  led.position.set(0.535, 0.05, 0);
  group.add(led);

  // Sculpted Oval White Tub Rim & Basin
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.40, 0.08, 28), mats.ceramicWhite);
  rim.scale.set(1.0, 1.0, 1.95);
  rim.position.y = 0.50;
  group.add(rim);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xb7dce8,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72,
    })
  );
  water.scale.set(1.0, 1.0, 1.95);
  water.position.y = 0.535;
  group.add(water);

  // Rolled spa towels on marble tub corner
  const towelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12);
  towelGeo.rotateZ(Math.PI / 2);
  const towel1 = new THREE.Mesh(towelGeo, mats.ceramicWhite);
  towel1.position.set(0.34, 0.53, 0.80);
  group.add(towel1);
  const towel2 = new THREE.Mesh(towelGeo, mats.ceramicWhite);
  towel2.position.set(0.23, 0.53, 0.80);
  group.add(towel2);

  // Chrome filler spout
  const spout = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), mats.chrome);
  spout.position.set(-0.36, 0.58, 0);
  group.add(spout);

  setShadow(group, true, true);
  return group;
}

// Floating Vanity Sink + Backlit Mirror (Real Planar Reflector on GPU)
export function createVanitySink(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.86), mats.woodOak);
  cab.position.y = 0.62;
  group.add(cab);

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.04, 0.88), mats.marbleSlab);
  top.position.y = 0.83;
  group.add(top);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.11, 20), mats.ceramicWhite);
  basin.position.set(-0.02, 0.90, 0);
  group.add(basin);

  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.16, 10), mats.chrome);
  tap.position.set(0.17, 0.93, 0);
  group.add(tap);

  const soap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.032, 0.11, 10), mats.ceramicWhite);
  soap.position.set(0.12, 0.90, 0.25);
  group.add(soap);

  // Glowing backlit mirror
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.92, 0.78), mats.warmLed);
  led.position.set(0.25, 1.54, 0);
  group.add(led);

  if (!mats.isSoftwareGl) {
    const mirrorRefl = new Reflector(new THREE.PlaneGeometry(0.70, 0.84), {
      color: 0xc8c0b6,
      textureWidth: 256,
      textureHeight: 256,
      clipBias: 0.003,
      multisample: 0,
    });
    mirrorRefl.rotation.y = -Math.PI / 2;
    mirrorRefl.position.set(0.222, 1.54, 0);
    mats.registerDisposable(mirrorRefl);
    group.add(mirrorRefl);
  } else {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.86, 0.72), mats.chrome);
    mirror.position.set(0.24, 1.54, 0);
    group.add(mirror);
  }

  setShadow(group, true, true);
  return group;
}

// Modern Ceramic Toilet
export function createToilet(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.36, 18), mats.ceramicWhite);
  pedestal.position.set(0, 0.18, 0.08);
  group.add(pedestal);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.17, 0.14, 20), mats.ceramicWhite);
  bowl.scale.set(0.95, 1, 1.18);
  bowl.position.set(0, 0.37, 0.10);
  group.add(bowl);

  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.18), mats.ceramicWhite);
  tank.position.set(0, 0.56, -0.14);
  group.add(tank);

  const flush = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.02), mats.chrome);
  flush.position.set(0, 0.755, -0.14);
  group.add(flush);

  setShadow(group, true, true);
  return group;
}

// Walk-in Glass Shower Column
export function createShowerColumn(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.45, 10), mats.chrome);
  pipe.position.set(0, 1.45, 0);
  group.add(pipe);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.34), mats.chrome);
  arm.position.set(0, 2.16, 0.16);
  group.add(arm);

  const rainHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 20), mats.chrome);
  rainHead.position.set(0, 2.14, 0.32);
  group.add(rainHead);

  setShadow(group, false, true);
  return group;
}

// Balcony Woven Rattan Lounge Set (2 Round Chairs + Tea Table)
export function createRattanLoungeSet(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const makeRattanChair = (x: number, z: number, rotY: number) => {
    const chair = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.32, 0.42, 22), mats.rattan);
    shell.position.y = 0.25;
    chair.add(shell);

    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 22), mats.creamFabric);
    cushion.position.y = 0.47;
    chair.add(cushion);

    const back = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41, 0.39, 0.36, 22, 1, false, Math.PI * 0.65, Math.PI * 1.25),
      mats.rattan
    );
    back.position.y = 0.62;
    chair.add(back);

    chair.position.set(x, 0, z);
    chair.rotation.y = rotY;
    group.add(chair);
  };

  makeRattanChair(-0.62, 0, 0.35);
  makeRattanChair(0.62, 0, -0.35);

  // Small travertine tea table
  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.40, 18), mats.travertine);
  tableBase.position.set(0, 0.20, 0.04);
  group.add(tableBase);

  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24), mats.marbleSlab);
  tableTop.position.set(0, 0.42, 0.04);
  group.add(tableTop);

  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 12), mats.ceramicWhite);
  vase.position.set(0, 0.50, 0.04);
  group.add(vase);

  const blooms = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mats.palmLeaf);
  blooms.position.set(0, 0.59, 0.04);
  group.add(blooms);

  setShadow(group, true, true);
  return group;
}

// Composite Tropical Potted Palm Plant with Multi-Tiered Arched Fronds & Contact Shadow
export function createPottedPalm(mats: MaterialLibrary, scale = 1.0): THREE.Group {
  const group = new THREE.Group();

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.38, 18), mats.ceramicPot);
  pot.position.y = 0.19;
  group.add(pot);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.20, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x3b2c20, roughness: 0.95 })
  );
  soil.position.y = 0.37;
  group.add(soil);

  // Two tiers of arching pinnate palm fronds
  const frondCount = 13;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 + (i % 2) * 0.22;
    const isOuter = i % 2 === 0;
    const tilt = isOuter ? 0.68 + (i % 3) * 0.14 : 0.32 + (i % 3) * 0.1;

    const stemGroup = new THREE.Group();
    stemGroup.position.set(0, 0.36, 0);
    stemGroup.rotation.y = angle;

    const leafLen = (isOuter ? 0.62 : 0.48) + (i % 3) * 0.06;
    const leafGeo = new THREE.ConeGeometry(0.12, leafLen, 5);
    leafGeo.scale(1.25, 1.0, 0.16);
    leafGeo.translate(0, leafLen * 0.5, 0);
    const frond = new THREE.Mesh(leafGeo, mats.palmLeaf);
    frond.rotation.x = tilt;
    stemGroup.add(frond);

    group.add(stemGroup);
  }

  addContactShadow(group, mats, 0.7, 0.7, 0, 0, 0.02);
  group.scale.setScalar(scale);
  setShadow(group, true, true);
  return group;
}

// Hinged Oak Wooden Door (open at natural angle for clear POV passage)
export function createWoodenDoor(
  mats: MaterialLibrary,
  width = 0.82,
  height = 2.25,
  openAngle = Math.PI * 0.42
): THREE.Group {
  const frameGroup = new THREE.Group();

  // Door frame jambs
  const jambGeo = new THREE.BoxGeometry(0.05, height, 0.16);
  const leftJamb = new THREE.Mesh(jambGeo, mats.woodOak);
  leftJamb.position.set(-width / 2, height / 2, 0);
  frameGroup.add(leftJamb);

  const rightJamb = new THREE.Mesh(jambGeo, mats.woodOak);
  rightJamb.position.set(width / 2, height / 2, 0);
  frameGroup.add(rightJamb);

  const topJamb = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.06, 0.16), mats.woodOak);
  topJamb.position.set(0, height + 0.03, 0);
  frameGroup.add(topJamb);

  // Swinging door leaf pivoted at hinge (-width/2)
  const pivot = new THREE.Group();
  pivot.position.set(-width / 2 + 0.02, 0, 0);
  pivot.rotation.y = openAngle;

  const leaf = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.02, 0.045), mats.woodOak);
  leaf.position.set((width - 0.04) / 2, (height - 0.02) / 2, 0);
  pivot.add(leaf);

  const handleFront = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.09), mats.brass);
  handleFront.position.set(width - 0.14, 1.02, 0);
  pivot.add(handleFront);

  frameGroup.add(pivot);
  setShadow(frameGroup, true, true);
  return frameGroup;
}

// Pleated Sheer Linen Curtain Panel (Frames Balcony Glass Doors)
export function createSheerCurtain(
  mats: MaterialLibrary,
  width = 0.72,
  height = 2.62
): THREE.Group {
  const group = new THREE.Group();
  const pleats = 10;
  const pleatW = width / pleats;
  const pleatGeo = new THREE.CylinderGeometry(pleatW * 0.62, pleatW * 0.72, height, 10);
  pleatGeo.scale(1.0, 1.0, 0.45);

  for (let i = 0; i < pleats; i++) {
    const px = -width / 2 + pleatW * (i + 0.5);
    const fold = new THREE.Mesh(pleatGeo, mats.sheerCurtain);
    fold.position.set(px, height / 2, (i % 2 === 0 ? 1 : -1) * 0.018);
    group.add(fold);
  }

  const track = new THREE.Mesh(new THREE.BoxGeometry(width + 0.06, 0.03, 0.04), mats.chrome);
  track.position.y = height + 0.015;
  group.add(track);

  return group;
}

// Framed Coastal Wall Artwork
export function createFramedArt(
  mats: MaterialLibrary,
  w = 0.95,
  h = 0.75,
  variant: 1 | 2 = 1
): THREE.Group {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.03), mats.brass);
  group.add(frame);

  const canvas = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.036),
    variant === 1 ? mats.wallArt1Mat : mats.wallArt2Mat
  );
  group.add(canvas);

  return group;
}

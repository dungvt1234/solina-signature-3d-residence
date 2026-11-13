import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { WALL_HEIGHT, WALL_SEGMENTS, LightingPreset } from './apartmentData';
import {
  MaterialLibrary,
  createKingBed,
  createCurvedSofa,
  createRoundCoffeeTable,
  createAccentArmchair,
  createDiningSet,
  createKitchenCounter,
  createTvFeatureWall,
  createWardrobe,
  createVanityDesk,
  createBathtub,
  createVanitySink,
  createToilet,
  createShowerColumn,
  createRattanLoungeSet,
  createPottedPalm,
  createWoodenDoor,
  createSheerCurtain,
  createFramedArt,
} from './furniture';

export interface BuiltApartment {
  root: THREE.Group;
  ceilingGroup: THREE.Group;
  oceanUniforms: { uTime: { value: number } };
  applyLighting: (preset: LightingPreset, scene: THREE.Scene) => void;
  dispose: () => void;
}

function makeWallMesh(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  thickness: number,
  height: number,
  mats: MaterialLibrary,
  type: 'plaster' | 'darkCap' | 'glass' | 'wood' | 'railing'
): THREE.Group {
  const g = new THREE.Group();
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;

  if (type === 'railing') {
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(length, height - 0.06, 0.02),
      mats.clearGlass
    );
    glass.position.y = (height - 0.06) / 2 + 0.04;
    g.add(glass);

    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(length + 0.04, 0.04, 0.05),
      mats.chrome
    );
    rail.position.y = height;
    g.add(rail);

    const postCount = Math.max(2, Math.floor(length / 1.45) + 1);
    for (let i = 0; i < postCount; i++) {
      const px = -length / 2 + (i / (postCount - 1)) * length;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, height, 0.045),
        mats.chrome
      );
      post.position.set(px, height / 2, 0);
      g.add(post);
    }
  } else if (type === 'glass') {
    const pane = new THREE.Mesh(
      new THREE.BoxGeometry(length, height - 0.08, 0.025),
      mats.clearGlass
    );
    pane.position.y = height / 2;
    g.add(pane);

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.05, thickness),
      mats.darkGlass
    );
    topFrame.position.y = height - 0.025;
    g.add(topFrame);

    const botFrame = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.04, thickness),
      mats.darkGlass
    );
    botFrame.position.y = 0.02;
    g.add(botFrame);
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(length, height - 0.03, thickness),
      mats.plasterWall
    );
    body.position.y = (height - 0.03) / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // Architectural cutaway dark cap on top of walls
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(length + 0.004, 0.032, thickness + 0.004),
      mats.wallTopCap
    );
    cap.position.y = height - 0.015;
    g.add(cap);

    // Wall-to-floor Ambient Occlusion contact shading strips on both sides
    const aoGeo = new THREE.PlaneGeometry(length, 0.16);
    const aoFront = new THREE.Mesh(aoGeo, mats.wallAoMat);
    aoFront.position.set(0, 0.09, thickness * 0.5 + 0.003);
    g.add(aoFront);

    const aoBack = new THREE.Mesh(aoGeo, mats.wallAoMat);
    aoBack.position.set(0, 0.09, -thickness * 0.5 - 0.003);
    aoBack.rotation.y = Math.PI;
    g.add(aoBack);
  }

  g.position.set(mx, 0, mz);
  g.rotation.y = -angle;
  return g;
}

export function buildSolinaApartment(
  scene: THREE.Scene,
  mats: MaterialLibrary,
  isSoftwareGl: boolean
): BuiltApartment {
  const root = new THREE.Group();
  const ceilingGroup = new THREE.Group();
  const oceanUniforms = { uTime: { value: 0 } };

  // 1. Exterior Architectural Concrete Plinth & Rounded Balcony Floor Slab
  // Shape in X-Z (extruded upward on Y)
  const slabShape = new THREE.Shape();
  // Start bottom-left (-6.2, +3.7) -> note rotateX(Math.PI/2) flips Y to Z
  slabShape.moveTo(-6.2, 3.7);
  slabShape.lineTo(6.2, 3.7);
  slabShape.lineTo(6.2, -3.8);
  slabShape.lineTo(-4.0, -3.8);
  slabShape.quadraticCurveTo(-6.2, -3.8, -6.2, -1.6);
  slabShape.closePath();

  const plinthGeo = new THREE.ExtrudeGeometry(slabShape, {
    depth: 0.36,
    bevelEnabled: false,
    curveSegments: 28,
  });
  plinthGeo.rotateX(Math.PI / 2);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xd8cfc2,
    roughness: 0.78,
    metalness: 0.04,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = -0.01;
  plinth.receiveShadow = true;
  root.add(plinth);

  // Outer Wraparound Architectural Promenade Ledge (matches reference outer white/sand rim)
  const podiumShape = new THREE.Shape();
  podiumShape.moveTo(-6.72, 4.42);
  podiumShape.lineTo(6.34, 4.42);
  podiumShape.lineTo(6.34, -3.92);
  podiumShape.lineTo(-4.05, -3.92);
  podiumShape.quadraticCurveTo(-6.62, -3.92, -6.62, -1.5);
  podiumShape.closePath();

  const podiumGeo = new THREE.ExtrudeGeometry(podiumShape, {
    depth: 0.34,
    bevelEnabled: false,
    curveSegments: 28,
  });
  podiumGeo.rotateX(Math.PI / 2);
  const podiumMat = new THREE.MeshStandardMaterial({
    color: 0xe6dfd4,
    roughness: 0.72,
    metalness: 0.04,
  });
  const podium = new THREE.Mesh(podiumGeo, podiumMat);
  podium.position.y = -0.04;
  podium.receiveShadow = true;
  root.add(podium);

  // GPU-Only Planar Floor Reflector directly under translucent marbleFloor
  let floorReflector: Reflector | null = null;
  if (!isSoftwareGl) {
    const reflShape = new THREE.Shape();
    reflShape.moveTo(-6.12, -3.62);
    reflShape.lineTo(6.12, -3.62);
    reflShape.lineTo(6.12, 2.2);
    reflShape.lineTo(-4.2, 2.2);
    reflShape.quadraticCurveTo(-6.12, 2.2, -6.12, 0.8);
    reflShape.closePath();

    const reflGeo = new THREE.ShapeGeometry(reflShape, 24);
    floorReflector = new Reflector(reflGeo, {
      color: 0xd6d6d6,
      textureWidth: 512,
      textureHeight: 512,
      clipBias: 0.003,
      multisample: 0,
    });
    floorReflector.rotation.x = -Math.PI / 2;
    floorReflector.position.y = 0.006;
    root.add(floorReflector);
  }

  // Interior procedural fallback group (replaced seamlessly when Blender GLB model loads)
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Procedural_Apartment_Fallback';
  root.add(interiorGroup);

  // Load Photorealistic Blender-Exported glTF Model (apartment.glb)
  const gltfLoader = new GLTFLoader();
  const blenderModelGroup = new THREE.Group();
  blenderModelGroup.name = 'Blender_Apartment_GLB';
  root.add(blenderModelGroup);

  gltfLoader.load(
    './models/apartment.glb',
    (gltf) => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if (m && 'envMapIntensity' in m) {
                (m as any).envMapIntensity = 1.0;
                m.needsUpdate = true;
              }
            });
          }
        }
      });
      blenderModelGroup.add(gltf.scene);
      // Once authentic Blender model is ready, hide procedural geometry to prevent overlap
      interiorGroup.visible = false;
      console.log('✅ [Blender 3D] Loaded authentic photorealistic apartment.glb successfully!');
    },
    undefined,
    (err) => {
      console.warn('⚠️ [Blender 3D] Could not load apartment.glb, keeping procedural fallback:', err);
    }
  );

  // Interior Marble Floor Slab (z from -2.2 to +3.65, x from -6.15 to +6.15, clipped curve top-left)
  const intShape = new THREE.Shape();
  intShape.moveTo(-6.12, 3.62);
  intShape.lineTo(6.12, 3.62);
  intShape.lineTo(6.12, -2.2);
  intShape.lineTo(-4.2, -2.2);
  intShape.quadraticCurveTo(-6.12, -2.2, -6.12, -0.8);
  intShape.closePath();

  const intFloorGeo = new THREE.ExtrudeGeometry(intShape, {
    depth: 0.015,
    bevelEnabled: false,
    curveSegments: 24,
  });
  intFloorGeo.rotateX(Math.PI / 2);
  const intFloor = new THREE.Mesh(intFloorGeo, mats.marbleFloor);
  intFloor.position.y = 0.008;
  intFloor.receiveShadow = true;
  interiorGroup.add(intFloor);

  // 1a-2. Sàn Gỗ Laminate Phòng Ngủ (đè lên Marble, theo tiêu chuẩn Beacon)
  // Master bedroom: x[-6.12..-2.42], z[-2.2..1.15]
  const masterFloorShape = new THREE.Shape();
  masterFloorShape.moveTo(-6.12, -2.2);
  masterFloorShape.lineTo(-2.42, -2.2);
  masterFloorShape.lineTo(-2.42, 1.15);
  masterFloorShape.lineTo(-6.12, 1.15);
  masterFloorShape.quadraticCurveTo(-6.12, -0.8, -6.12, -0.8);
  masterFloorShape.closePath();
  const masterFloorGeo = new THREE.ExtrudeGeometry(masterFloorShape, { depth: 0.012, bevelEnabled: false });
  masterFloorGeo.rotateX(Math.PI / 2);
  const masterFloorMesh = new THREE.Mesh(masterFloorGeo, mats.woodLaminate);
  masterFloorMesh.position.y = 0.009;
  masterFloorMesh.receiveShadow = true;
  interiorGroup.add(masterFloorMesh);

  // Bedroom 2: x[-2.42..1.15], z[-2.2..1.15]
  const bed2FloorShape = new THREE.Shape();
  bed2FloorShape.moveTo(-2.42, -2.2);
  bed2FloorShape.lineTo(1.15, -2.2);
  bed2FloorShape.lineTo(1.15, 1.15);
  bed2FloorShape.lineTo(-2.42, 1.15);
  bed2FloorShape.closePath();
  const bed2FloorGeo = new THREE.ExtrudeGeometry(bed2FloorShape, { depth: 0.012, bevelEnabled: false });
  bed2FloorGeo.rotateX(Math.PI / 2);
  const bed2FloorMesh = new THREE.Mesh(bed2FloorGeo, mats.woodLaminate);
  bed2FloorMesh.position.y = 0.009;
  bed2FloorMesh.receiveShadow = true;
  interiorGroup.add(bed2FloorMesh);

  // 1a-3. Len chân tường trắng sứ (Skirting boards) dọc theo toàn bộ tường
  function addSkirting(x1: number, z1: number, x2: number, z2: number) {
    const dx = x2 - x1; const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);
    const geo = new THREE.BoxGeometry(len, 0.08, 0.012);
    const mesh = new THREE.Mesh(geo, mats.skirtingBoard);
    mesh.position.set((x1+x2)/2, 0.04, (z1+z2)/2);
    mesh.rotation.y = -angle;
    mesh.castShadow = true;
    interiorGroup.add(mesh);
  }
  // Tường ngoài căn hộ
  addSkirting(-6.12, 3.62, 6.12, 3.62);   // Tường sau
  addSkirting(6.12, 3.62, 6.12, -2.2);    // Tường phải
  addSkirting(-6.12, 3.62, -6.12, -0.8);  // Tường trái trên
  // Vách phòng ngủ
  addSkirting(-2.42, -2.2, -2.42, 1.15);  // Vách master/bed2
  addSkirting(1.15, -2.2, 1.15, 1.15);    // Vách bed2/living
  addSkirting(-6.12, 1.15, 1.15, 1.15);   // Tường trên bedroom
  // Phòng tắm / bếp / foyer
  addSkirting(1.15, 1.15, 6.12, 1.15);
  addSkirting(-2.42, 1.15, -2.42, 3.62);
  addSkirting(1.15, 3.62, 6.12, 3.62);

  // 1b. Balcony Flooring: Waterproof Sub-Base + Lush Green Resort Grass Turf (Thảm cỏ xanh sân vườn ban công)
  const balcShape = new THREE.Shape();
  balcShape.moveTo(-6.15, -1.4);
  balcShape.quadraticCurveTo(-6.15, -3.76, -4.0, -3.76);
  balcShape.lineTo(6.15, -3.76);
  balcShape.lineTo(6.15, -2.2);
  balcShape.lineTo(-4.2, -2.2);
  balcShape.quadraticCurveTo(-5.85, -2.2, -5.85, -1.4);
  balcShape.closePath();

  const balcBaseGeo = new THREE.ExtrudeGeometry(balcShape, {
    depth: 0.016,
    bevelEnabled: false,
    curveSegments: 24,
  });
  balcBaseGeo.rotateX(Math.PI / 2);
  const balcBase = new THREE.Mesh(balcBaseGeo, mats.travertine);
  balcBase.position.y = 0.003;
  balcBase.receiveShadow = true;
  interiorGroup.add(balcBase);

  const balcGrassGeo = new THREE.ExtrudeGeometry(balcShape, {
    depth: 0.018,
    bevelEnabled: false,
    curveSegments: 24,
  });
  balcGrassGeo.rotateX(Math.PI / 2);
  const balcFloor = new THREE.Mesh(balcGrassGeo, mats.grassTurf);
  balcFloor.position.y = 0.009;
  balcFloor.receiveShadow = true;
  interiorGroup.add(balcFloor);

  // 2. Curved Balcony Outer Glass Railing + Master Bedroom Curved Glass Corner
  const curveSteps = 14;
  for (let i = 0; i < curveSteps; i++) {
    const t0 = i / curveSteps;
    const t1 = (i + 1) / curveSteps;
    // Outer railing arc from (-6.15, -1.5) to (-4.05, -3.76)
    const a0 = Math.PI + t0 * (Math.PI / 2);
    const a1 = Math.PI + t1 * (Math.PI / 2);
    const rx = 2.1;
    const rz = 2.26;
    const cx = -4.05;
    const cz = -1.5;

    const x1 = cx + Math.cos(a0) * rx;
    const z1 = cz + Math.sin(a0) * rz;
    const x2 = cx + Math.cos(a1) * rx;
    const z2 = cz + Math.sin(a1) * rz;

    interiorGroup.add(makeWallMesh(x1, z1, x2, z2, 0.05, 1.12, mats, 'railing'));

    // Master bedroom inner curved glass facade from (-6.12, -1.5) to (-4.25, -2.2)
    if (i < curveSteps - 1) {
      const mrx = 1.85;
      const mrz = 0.78;
      const mcx = -4.27;
      const mcz = -1.42;
      const mx1 = mcx + Math.cos(a0) * mrx;
      const mz1 = mcz + Math.sin(a0) * mrz;
      const mx2 = mcx + Math.cos(a1) * mrx;
      const mz2 = mcz + Math.sin(a1) * mrz;
      interiorGroup.add(makeWallMesh(mx1, mz1, mx2, mz2, 0.06, 2.65, mats, 'glass'));
    }
  }

  // Straight Wall Segments
  for (const seg of WALL_SEGMENTS) {
    interiorGroup.add(
      makeWallMesh(
        seg.x1,
        seg.z1,
        seg.x2,
        seg.z2,
        seg.thickness,
        seg.height,
        mats,
        seg.material || 'plaster'
      )
    );
  }

  // Header lintels above doorways so POV looks enclosed & architectural
  const addDoorLintel = (x1: number, z1: number, x2: number, z2: number, doorH = 2.25) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);
    const h = WALL_HEIGHT - doorH;
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(len, h, 0.14),
      mats.plasterWall
    );
    lintel.position.set((x1 + x2) / 2, doorH + h / 2, (z1 + z2) / 2);
    lintel.rotation.y = -angle;
    interiorGroup.add(lintel);
  };
  addDoorLintel(4.95, 3.62, 5.9, 3.62, 2.28); // Main entrance
  addDoorLintel(-3.38, 1.5, -2.55, 1.5, 2.22); // Master bath door
  addDoorLintel(-1.58, 1.5, -0.78, 1.5, 2.22); // Common bath door
  addDoorLintel(0.42, 1.15, 1.38, 1.15, 2.22); // Bedroom 2 door
  addDoorLintel(-2.42, 0.58, -2.42, 1.5, 2.22); // Master bedroom door

  // 3. Hinged Wooden Doors (swung open for effortless POV walkthrough)
  const mainDoor = createWoodenDoor(mats, 0.92, 2.26, -Math.PI * 0.44);
  mainDoor.position.set(5.42, 0, 3.60);
  interiorGroup.add(mainDoor);

  const bed2Door = createWoodenDoor(mats, 0.84, 2.20, Math.PI * 0.44);
  bed2Door.position.set(0.88, 0, 1.15);
  interiorGroup.add(bed2Door);

  const masterDoor = createWoodenDoor(mats, 0.84, 2.20, Math.PI * 0.44);
  masterDoor.position.set(-2.42, 0, 1.04);
  masterDoor.rotation.y = Math.PI / 2;
  interiorGroup.add(masterDoor);

  const mbathDoor = createWoodenDoor(mats, 0.74, 2.18, -Math.PI * 0.42);
  mbathDoor.position.set(-2.98, 0, 1.50);
  interiorGroup.add(mbathDoor);

  const cbathDoor = createWoodenDoor(mats, 0.74, 2.18, -Math.PI * 0.42);
  cbathDoor.position.set(-1.18, 0, 1.50);
  interiorGroup.add(cbathDoor);

  // 4. Populate Rooms with Exact Floorplan Furniture

  // --- MASTER BEDROOM (Top-Left) ---
  const masterBed = createKingBed(mats);
  masterBed.position.set(-6.02, 0, -0.45);
  interiorGroup.add(masterBed);

  const masterWardrobe = createWardrobe(mats, 1.85);
  masterWardrobe.position.set(-5.0, 0, 1.16);
  interiorGroup.add(masterWardrobe);

  // --- MASTER BATHROOM (Bottom-Left) ---
  const tub = createBathtub(mats);
  tub.position.set(-5.50, 0, 2.60);
  interiorGroup.add(tub);

  const mToilet = createToilet(mats);
  mToilet.position.set(-4.38, 0, 2.45);
  interiorGroup.add(mToilet);

  const mShower = createShowerColumn(mats);
  mShower.position.set(-3.55, 0, 3.45);
  mShower.rotation.y = Math.PI;
  interiorGroup.add(mShower);

  const mVanity = createVanitySink(mats);
  mVanity.position.set(-2.85, 0, 3.05);
  interiorGroup.add(mVanity);

  const mBathPlant = createPottedPalm(mats, 0.58);
  mBathPlant.position.set(-3.55, 0, 2.85);
  interiorGroup.add(mBathPlant);

  // Master Bath frameless glass shower & WC front enclosures
  interiorGroup.add(makeWallMesh(-4.88, 1.58, -4.46, 1.58, 0.03, 2.25, mats, 'glass'));
  interiorGroup.add(makeWallMesh(-3.92, 1.58, -3.55, 1.58, 0.03, 2.25, mats, 'glass'));

  // --- COMMON BATHROOM (Bottom-Center) ---
  const cToilet = createToilet(mats);
  cToilet.position.set(-1.92, 0, 3.20);
  cToilet.rotation.y = Math.PI;
  interiorGroup.add(cToilet);

  const cShower = createShowerColumn(mats);
  cShower.position.set(-2.22, 0, 2.10);
  cShower.rotation.y = Math.PI / 2;
  interiorGroup.add(cShower);

  // Common Bath glass shower screen
  interiorGroup.add(makeWallMesh(-2.30, 2.52, -1.68, 2.52, 0.03, 2.20, mats, 'glass'));

  const cVanity = createVanitySink(mats);
  cVanity.position.set(-1.08, 0, 3.05);
  interiorGroup.add(cVanity);

  const cBathPlant = createPottedPalm(mats, 0.52);
  cBathPlant.position.set(-1.98, 0, 1.80);
  interiorGroup.add(cBathPlant);

  // --- BEDROOM 2 (Center) ---
  const bed2 = createKingBed(mats);
  bed2.position.set(-2.12, 0, -0.52);
  interiorGroup.add(bed2);

  const bed2Wardrobe = createWardrobe(mats, 1.75);
  bed2Wardrobe.position.set(-0.85, 0, 0.80);
  interiorGroup.add(bed2Wardrobe);

  const bed2Desk = createVanityDesk(mats);
  bed2Desk.position.set(1.06, 0, -0.75);
  interiorGroup.add(bed2Desk);

  // Sheer Flowing Curtains framing Balcony Glass Facades
  const curtainMbed = createSheerCurtain(mats, 0.62, 2.60);
  curtainMbed.position.set(-2.72, 0, -2.08);
  interiorGroup.add(curtainMbed);

  const curtainBed2L = createSheerCurtain(mats, 0.68, 2.60);
  curtainBed2L.position.set(-1.80, 0, -2.08);
  interiorGroup.add(curtainBed2L);

  const curtainBed2R = createSheerCurtain(mats, 0.55, 2.60);
  curtainBed2R.position.set(1.05, 0, -2.08);
  interiorGroup.add(curtainBed2R);

  const curtainLivL = createSheerCurtain(mats, 0.72, 2.60);
  curtainLivL.position.set(1.82, 0, -2.08);
  interiorGroup.add(curtainLivL);

  const curtainLivR = createSheerCurtain(mats, 0.78, 2.60);
  curtainLivR.position.set(5.55, 0, -2.08);
  interiorGroup.add(curtainLivR);

  // Framed Coastal Wall Artworks
  const diningArt = createFramedArt(mats, 1.15, 0.82, 1);
  diningArt.position.set(5.96, 1.58, 2.25);
  diningArt.rotation.y = -Math.PI / 2;
  interiorGroup.add(diningArt);

  const bed2Art = createFramedArt(mats, 0.85, 0.65, 2);
  bed2Art.position.set(-0.45, 1.65, 1.06);
  bed2Art.rotation.y = Math.PI;
  interiorGroup.add(bed2Art);

  // --- LIVING ROOM (Top-Right) ---
  const livingRug = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.015, 2.85), mats.coastalRug);
  livingRug.position.set(3.85, 0.015, -0.45);
  livingRug.receiveShadow = true;
  interiorGroup.add(livingRug);

  const curvedSofa = createCurvedSofa(mats);
  curvedSofa.position.set(3.80, 0, -0.45);
  interiorGroup.add(curvedSofa);

  const coffeeTable = createRoundCoffeeTable(mats);
  coffeeTable.position.set(3.80, 0, -0.45);
  interiorGroup.add(coffeeTable);

  const armchair = createAccentArmchair(mats);
  armchair.position.set(2.48, 0, -1.35);
  armchair.rotation.y = Math.PI * 0.25;
  interiorGroup.add(armchair);

  const tvWall = createTvFeatureWall(mats);
  tvWall.position.set(6.0, 0, -0.45);
  interiorGroup.add(tvWall);

  // Living Room & Foyer Tropical Palms
  const palmLiving1 = createPottedPalm(mats, 0.95);
  palmLiving1.position.set(2.05, 0, 0.72);
  interiorGroup.add(palmLiving1);

  const palmLiving2 = createPottedPalm(mats, 1.05);
  palmLiving2.position.set(5.48, 0, 0.85);
  interiorGroup.add(palmLiving2);

  const palmFoyer = createPottedPalm(mats, 0.78);
  palmFoyer.position.set(4.65, 0, 3.22);
  interiorGroup.add(palmFoyer);

  // --- DINING & KITCHEN (Bottom-Right) ---
  const diningSet = createDiningSet(mats);
  diningSet.position.set(3.65, 0, 1.85);
  interiorGroup.add(diningSet);

  const kitchen = createKitchenCounter(mats);
  kitchen.position.set(1.98, 0, 3.22);
  interiorGroup.add(kitchen);

  // Mặt đá Quartz bàn bếp (đè lên top tủ bếp — theo tiêu chuẩn Beacon: Đá Quartz)
  const quartzCounterTop = new THREE.Mesh(
    new THREE.BoxGeometry(4.55, 0.025, 0.72),
    mats.quartzTop
  );
  quartzCounterTop.position.set(1.98, 0.925, 3.22);
  quartzCounterTop.castShadow = true;
  quartzCounterTop.receiveShadow = true;
  interiorGroup.add(quartzCounterTop);

  // Mặt đảo bếp Quartz
  const quartzIsland = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.025, 0.95),
    mats.quartzTop
  );
  quartzIsland.position.set(1.98, 0.945, 2.28);
  quartzIsland.castShadow = true;
  interiorGroup.add(quartzIsland);

  // Điều hòa âm trần phòng khách — Daikin/Mitsubishi (theo tiêu chuẩn Beacon)
  function addCeilingAC(x: number, z: number) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.065, 0.28),
      mats.acUnit
    );
    body.position.set(x, WALL_HEIGHT - 0.035, z);
    interiorGroup.add(body);
    // Louver grill
    for (let i = 0; i < 5; i++) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.008, 0.04),
        mats.acUnit
      );
      louver.position.set(x, WALL_HEIGHT - 0.068, z - 0.08 + i * 0.04);
      louver.rotation.x = 0.2;
      interiorGroup.add(louver);
    }
  }
  addCeilingAC(3.85, -0.80);   // Phòng khách trái
  addCeilingAC(5.20, -0.80);   // Phòng khách phải

  // --- BALCONY LOUNGE & PALMS ---
  const rattanLounge = createRattanLoungeSet(mats);
  rattanLounge.position.set(-0.55, 0, -3.05);
  interiorGroup.add(rattanLounge);

  const balcPalm1 = createPottedPalm(mats, 1.15);
  balcPalm1.position.set(-5.05, 0, -2.95);
  interiorGroup.add(balcPalm1);

  const balcPalm2 = createPottedPalm(mats, 1.2);
  balcPalm2.position.set(-2.95, 0, -3.35);
  interiorGroup.add(balcPalm2);

  const balcPalm3 = createPottedPalm(mats, 1.05);
  balcPalm3.position.set(1.85, 0, -3.35);
  interiorGroup.add(balcPalm3);

  const balcPalm4 = createPottedPalm(mats, 1.25);
  balcPalm4.position.set(5.55, 0, -3.15);
  interiorGroup.add(balcPalm4);

  // 5. Recessed Ceiling & Architectural Cove Downlights (Shown in POV Mode, Hidden in Dollhouse)
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0xf4eee6,
    roughness: 0.88,
    side: THREE.DoubleSide,
  });
  const ceilSlab = new THREE.Mesh(intFloorGeo, ceilMat);
  ceilSlab.position.y = WALL_HEIGHT;
  ceilingGroup.add(ceilSlab);

  // Recessed warm downlight pucks in every room
  const downlightPositions: [number, number][] = [
    [3.85, -0.45],
    [3.65, 1.85],
    [1.8, 2.3],
    [-0.45, -0.55],
    [-4.35, -0.45],
    [-3.9, 2.55],
    [-1.55, 2.55],
  ];
  const puckGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
  downlightPositions.forEach(([lx, lz]) => {
    const puck = new THREE.Mesh(puckGeo, mats.lampBulb);
    puck.position.set(lx, WALL_HEIGHT - 0.02, lz);
    ceilingGroup.add(puck);
  });
  root.add(ceilingGroup);

  // 6. Animated Ocean Panorama with Golden Sunrise Reflection Path
  const oceanGeo = new THREE.PlaneGeometry(240, 180, 72, 48);
  oceanGeo.rotateX(-Math.PI / 2);

  const oceanMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e6088,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
  });
  const oceanSunGlint = { value: 1.0 };
  oceanMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = oceanUniforms.uTime;
    shader.uniforms.uSunGlint = oceanSunGlint;
    shader.vertexShader =
      `uniform float uTime;\nvarying vec3 vOceanPos;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float wave = sin(position.x * 0.28 + uTime * 1.15) * 0.14
                    + cos(position.z * 0.35 + uTime * 0.95) * 0.11;
         transformed.y += wave;
         vOceanPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader =
      `uniform float uTime;\nuniform float uSunGlint;\nvarying vec3 vOceanPos;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         // Golden sun reflection column aligned with horizon sun at (-28, -135)
         float sunAxis = vOceanPos.x + 28.0 * clamp((-vOceanPos.z) / 135.0, 0.0, 1.2);
         float shimmer = sin(vOceanPos.x * 1.9 + uTime * 1.7) * cos(vOceanPos.z * 2.4 - uTime * 1.3);
         float column = exp(-abs(sunAxis) * 0.065) * smoothstep(-6.0, -85.0, vOceanPos.z);
         float sparkle = smoothstep(0.35, 0.95, shimmer) * column;
         vec3 goldGlow = vec3(1.0, 0.78, 0.42) * (column * 0.55 + sparkle * 1.1) * uSunGlint;
         diffuseColor.rgb += goldGlow;`
      );
  };
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.position.set(0, -1.65, -75);
  ocean.receiveShadow = true;
  root.add(ocean);

  // Sunrise Sun Disc & Atmospheric Coastal Sky Dome
  const sunDiscGeo = new THREE.SphereGeometry(5.5, 24, 24);
  const sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });
  const sunDisc = new THREE.Mesh(sunDiscGeo, sunDiscMat);
  sunDisc.position.set(-28, 12, -135);
  root.add(sunDisc);

  const skyUniforms = {
    uTopColor: { value: new THREE.Color(0x5289b8) },
    uHorizonColor: { value: new THREE.Color(0xf7d7a8) },
    uBottomColor: { value: new THREE.Color(0x1f5578) },
  };
  const skyDomeGeo = new THREE.SphereGeometry(180, 32, 20);
  const skyDomeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uBottomColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col = mix(uHorizonColor, uTopColor, smoothstep(0.0, 0.55, max(h, 0.0)));
        col = mix(col, uBottomColor, smoothstep(0.0, -0.25, min(h, 0.0)));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
  root.add(skyDome);

  // Warm Baked-Style Architectural Floor Light Pools (creates rich GI warmth on marble)
  const poolGeo = new THREE.PlaneGeometry(2.6, 2.6);
  poolGeo.rotateX(-Math.PI / 2);
  const lightPoolCoords: [number, number, number][] = [
    [3.85, -0.45, 1.3], // Living room center
    [5.65, -0.45, 0.9], // TV feature wall cove bounce
    [3.65, 1.85, 1.15], // Dining table glow
    [5.35, 3.05, 0.9],  // Foyer entrance glow
    [1.8, 2.75, 1.1],   // Kitchen counter LED glow
    [-0.45, -0.52, 1.2],// Bedroom 2 center
    [-4.35, -0.45, 1.25],// Master bedroom center
    [-5.45, 2.55, 0.85],// Master tub glow
    [-2.95, 2.95, 0.7], // Master vanity glow
    [-1.18, 2.95, 0.65],// Common bath vanity glow
  ];
  lightPoolCoords.forEach(([px, pz, scale]) => {
    const pool = new THREE.Mesh(poolGeo, mats.lightPoolMat);
    pool.position.set(px, 0.026, pz);
    pool.scale.setScalar(scale);
    root.add(pool);
  });

  // 7. Three-Point + Architectural Softbox Lighting Rig
  const hemiLight = new THREE.HemisphereLight(0x9bd0f5, 0xc7aa88, 0.48);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffdfb0, 1.15);
  sunLight.position.set(-14, 15, -24);
  sunLight.castShadow = !isSoftwareGl;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 55;
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);

  // GPU-only RectAreaLight studio softboxes for subtle architectural fill
  const rectLights: THREE.RectAreaLight[] = [];
  if (!isSoftwareGl) {
    RectAreaLightUniformsLib.init();

    // Living Room Ocean Window Daylight Softbox
    const oceanWinLight = new THREE.RectAreaLight(0xfff0d4, 0.9, 4.2, 2.3);
    oceanWinLight.position.set(3.6, 1.4, -2.15);
    oceanWinLight.lookAt(3.6, 0.9, 1.5);
    scene.add(oceanWinLight);
    rectLights.push(oceanWinLight);

    // Living Room TV Cove Warm Wash
    const tvCoveLight = new THREE.RectAreaLight(0xffc985, 1.05, 2.9, 2.1);
    tvCoveLight.position.set(5.88, 1.35, -0.45);
    tvCoveLight.lookAt(3.2, 1.1, -0.45);
    scene.add(tvCoveLight);
    rectLights.push(tvCoveLight);

    // Master Bedroom Curved Window Daylight
    const masterWinLight = new THREE.RectAreaLight(0xffe8c2, 0.85, 2.8, 2.2);
    masterWinLight.position.set(-4.3, 1.4, -2.15);
    masterWinLight.lookAt(-4.3, 0.9, 1.2);
    scene.add(masterWinLight);
    rectLights.push(masterWinLight);
  }

  // Interior warm architectural bounce lights
  const livingFill = new THREE.PointLight(0xffdcb0, 0.65, 10, 1.6);
  livingFill.position.set(3.8, 2.55, 0.3);
  scene.add(livingFill);

  const bedroomFill = new THREE.PointLight(0xffd5a3, 0.6, 8.5, 1.6);
  bedroomFill.position.set(-0.4, 2.55, -0.2);
  scene.add(bedroomFill);

  const masterFill = new THREE.PointLight(0xffd5a3, 0.6, 8.5, 1.6);
  masterFill.position.set(-4.3, 2.55, -0.2);
  scene.add(masterFill);

  const bathFill = new THREE.PointLight(0xffe4c2, 0.55, 6.5, 1.6);
  bathFill.position.set(-3.2, 2.5, 2.5);
  scene.add(bathFill);

  scene.add(root);

  const applyLighting = (preset: LightingPreset, targetScene: THREE.Scene) => {
    if (preset === 'sunrise') {
      const bg = new THREE.Color(0xc9dceb);
      targetScene.background = bg;
      targetScene.fog = new THREE.FogExp2(0xe6d3ba, 0.0052);
      skyUniforms.uTopColor.value.setHex(0x5289b8);
      skyUniforms.uHorizonColor.value.setHex(0xf7d7a8);
      skyUniforms.uBottomColor.value.setHex(0x1f5578);
      sunLight.color.setHex(0xffd39a);
      sunLight.intensity = 1.15;
      sunLight.position.set(-14, 13, -24);
      hemiLight.color.setHex(0x9bd0f5);
      hemiLight.groundColor.setHex(0xd4b692);
      hemiLight.intensity = 0.48;
      livingFill.intensity = 0.65;
      bedroomFill.intensity = 0.6;
      masterFill.intensity = 0.6;
      bathFill.intensity = 0.55;
      oceanMat.color.setHex(0x1f628c);
      oceanSunGlint.value = 1.0;
      sunDisc.visible = true;
      mats.warmLed.emissiveIntensity = 1.25;
      mats.lampBulb.emissiveIntensity = 1.35;
      mats.lightPoolMat.opacity = 0.16;
      rectLights.forEach((rl, i) => (rl.intensity = i === 1 ? 1.05 : 0.85));
    } else if (preset === 'daylight') {
      const bg = new THREE.Color(0x9fd0ee);
      targetScene.background = bg;
      targetScene.fog = new THREE.FogExp2(0xb6dcf2, 0.0045);
      skyUniforms.uTopColor.value.setHex(0x2f78b5);
      skyUniforms.uHorizonColor.value.setHex(0xd8eefc);
      skyUniforms.uBottomColor.value.setHex(0x1970a3);
      sunLight.color.setHex(0xfff7eb);
      sunLight.intensity = 1.28;
      sunLight.position.set(8, 22, -16);
      hemiLight.color.setHex(0xbde2ff);
      hemiLight.groundColor.setHex(0xd4c6b2);
      hemiLight.intensity = 0.56;
      livingFill.intensity = 0.45;
      bedroomFill.intensity = 0.45;
      masterFill.intensity = 0.45;
      bathFill.intensity = 0.45;
      oceanMat.color.setHex(0x1970a3);
      oceanSunGlint.value = 0.12;
      sunDisc.visible = false;
      mats.warmLed.emissiveIntensity = 0.75;
      mats.lampBulb.emissiveIntensity = 0.85;
      mats.lightPoolMat.opacity = 0.1;
      rectLights.forEach((rl, i) => (rl.intensity = i === 1 ? 0.65 : 1.0));
    } else {
      // Warm Coastal Evening
      const bg = new THREE.Color(0x142236);
      targetScene.background = bg;
      targetScene.fog = new THREE.FogExp2(0x142236, 0.0075);
      skyUniforms.uTopColor.value.setHex(0x0b1526);
      skyUniforms.uHorizonColor.value.setHex(0x233c5e);
      skyUniforms.uBottomColor.value.setHex(0x0c2c44);
      sunLight.color.setHex(0x7aa0d6);
      sunLight.intensity = 0.35;
      sunLight.position.set(-12, 16, -20);
      hemiLight.color.setHex(0x304c75);
      hemiLight.groundColor.setHex(0x3a2d22);
      hemiLight.intensity = 0.28;
      livingFill.intensity = 1.15;
      bedroomFill.intensity = 1.05;
      masterFill.intensity = 1.05;
      bathFill.intensity = 0.9;
      oceanMat.color.setHex(0x0c2c44);
      oceanSunGlint.value = 0.0;
      sunDisc.visible = false;
      mats.warmLed.emissiveIntensity = 1.6;
      mats.lampBulb.emissiveIntensity = 1.75;
      mats.lightPoolMat.opacity = 0.24;
      rectLights.forEach((rl, i) => (rl.intensity = i === 1 ? 1.25 : 0.4));
    }
  };

  applyLighting('sunrise', scene);

  return {
    root,
    ceilingGroup,
    oceanUniforms,
    applyLighting,
    dispose: () => {
      floorReflector?.dispose();
      podiumMat.dispose();
      plinthMat.dispose();
      ceilMat.dispose();
      oceanMat.dispose();
      sunDiscMat.dispose();
      skyDomeMat.dispose();
      poolGeo.dispose();
      root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry.dispose();
        }
      });
    },
  };
}

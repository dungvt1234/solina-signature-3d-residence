import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  CameraMode,
  EYE_HEIGHT,
  LightingPreset,
  ROOM_ZONES,
  RoomZone,
  detectRoomAt,
} from '../scene/apartmentData';
import { createProceduralTextures } from '../scene/textures';
import { createMaterialLibrary } from '../scene/furniture';
import { buildSolinaApartment } from '../scene/buildApartment';
import { resolvePlayerCollision } from '../scene/collision';

export interface PlayerTelemetry {
  x: number;
  z: number;
  yaw: number;
  currentRoom: RoomZone;
}

export interface MoveInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface ApartmentCanvasProps {
  cameraMode: CameraMode;
  lightingPreset: LightingPreset;
  showCeilingInDollhouse: boolean;
  teleportTarget: { room: RoomZone; nonce: number } | null;
  moveInputRef: React.MutableRefObject<MoveInputState>;
  onRoomChange: (room: RoomZone) => void;
  onTelemetry: (t: PlayerTelemetry) => void;
  onRequestPovFromDollhouse: (room: RoomZone) => void;
}

// Pre-allocated math helpers (Zero GC in tick loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _orbitTargetGoal = new THREE.Vector3(0, 0.3, 0);
const _orbitCamGoal = new THREE.Vector3(0, 11.2, 10.6);

export default function ApartmentCanvas({
  cameraMode,
  lightingPreset,
  showCeilingInDollhouse,
  teleportTarget,
  moveInputRef,
  onRoomChange,
  onTelemetry,
  onRequestPovFromDollhouse,
}: ApartmentCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Store latest props in refs so WebGL scene never tears down on UI updates
  const modeRef = useRef<CameraMode>(cameraMode);
  const lightingRef = useRef<LightingPreset>(lightingPreset);
  const ceilingDollhouseRef = useRef<boolean>(showCeilingInDollhouse);
  const callbacksRef = useRef({
    onRoomChange,
    onTelemetry,
    onRequestPovFromDollhouse,
  });

  modeRef.current = cameraMode;
  lightingRef.current = lightingPreset;
  ceilingDollhouseRef.current = showCeilingInDollhouse;
  callbacksRef.current = {
    onRoomChange,
    onTelemetry,
    onRequestPovFromDollhouse,
  };

  // Camera transition & POV state shared with teleport effect
  const povStateRef = useRef({
    x: ROOM_ZONES[0].povSpawn.x,
    y: EYE_HEIGHT,
    z: ROOM_ZONES[0].povSpawn.z,
    yaw: ROOM_ZONES[0].povSpawn.yaw,
    pitch: ROOM_ZONES[0].povSpawn.pitch,
    targetYaw: ROOM_ZONES[0].povSpawn.yaw,
    targetPitch: ROOM_ZONES[0].povSpawn.pitch,
    glideActive: false,
    glideToX: ROOM_ZONES[0].povSpawn.x,
    glideToY: EYE_HEIGHT,
    glideToZ: ROOM_ZONES[0].povSpawn.z,
    walkBobPhase: 0,
    lastRoomId: ROOM_ZONES[0].id,
  });

  const applyLightingFnRef = useRef<((p: LightingPreset) => void) | null>(null);
  const syncModeFnRef = useRef<((m: CameraMode, showCeil: boolean) => void) | null>(null);

  // Trigger smooth camera glide when user picks a room from dock or minimap
  useEffect(() => {
    if (!teleportTarget) return;
    const { room } = teleportTarget;
    const s = povStateRef.current;

    if (modeRef.current === 'pov') {
      s.glideActive = true;
      s.glideToX = room.povSpawn.x;
      s.glideToY = room.povSpawn.y;
      s.glideToZ = room.povSpawn.z;
      s.targetYaw = room.povSpawn.yaw;
      s.targetPitch = room.povSpawn.pitch;
    } else {
      _orbitTargetGoal.set(
        room.dollhouseFocus.x,
        room.dollhouseFocus.y,
        room.dollhouseFocus.z
      );
      _orbitCamGoal.set(
        room.dollhouseFocus.x + 2.8,
        6.8,
        room.dollhouseFocus.z + 6.8
      );
      s.glideActive = true;
    }
  }, [teleportTarget]);

  // Apply lighting preset dynamically without rebuilding geometry
  useEffect(() => {
    applyLightingFnRef.current?.(lightingPreset);
  }, [lightingPreset]);

  // Toggle ceiling cutaway & OrbitControls dynamically when switching mode
  useEffect(() => {
    syncModeFnRef.current?.(cameraMode, showCeilingInDollhouse);
  }, [cameraMode, showCeilingInDollhouse]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // 2. Scene, Camera & Studio Environment Reflection
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(64, width / height, 0.08, 280);
    camera.rotation.order = 'YXZ';

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.45;
    pmremGenerator.dispose();

    // Load authentic coastal resort sunrise HDRI for realistic PBR reflections
    let loadedHdrTex: THREE.DataTexture | null = null;
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./textures/hdr/coastal_sunrise.hdr', (hdrTex) => {
      hdrTex.mapping = THREE.EquirectangularReflectionMapping;
      loadedHdrTex = hdrTex as unknown as THREE.DataTexture;
      scene.environment = hdrTex;
      scene.environmentIntensity = 1.05;
    });

    // 3. Build Solina Signature B.11.17 Residence
    const textures = createProceduralTextures(renderer);
    const mats = createMaterialLibrary(textures, isSoftwareGl);
    const apartment = buildSolinaApartment(scene, mats, isSoftwareGl);

    applyLightingFnRef.current = (preset: LightingPreset) => {
      apartment.applyLighting(preset, scene);
    };
    apartment.applyLighting(lightingRef.current, scene);

    // GPU-only GTAO ambient occlusion, subtle bloom, SMAA anti-aliasing & tone-mapped output
    let composer: EffectComposer | null = null;
    let gtaoPass: GTAOPass | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let smaaPass: SMAAPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      gtaoPass = new GTAOPass(scene, camera, width, height);
      gtaoPass.output = GTAOPass.OUTPUT.Default;
      gtaoPass.blendIntensity = 1.15;
      gtaoPass.updateGtaoMaterial({
        radius: 0.55,
        distanceExponent: 1.6,
        thickness: 1.2,
        distanceFallOff: 0.9,
        scale: 1.0,
        samples: 32,
      });
      gtaoPass.updatePdMaterial({
        lumaPhi: 10,
        depthPhi: 2,
        normalPhi: 3,
        radius: 4,
        radiusExponent: 2,
        rings: 2,
        samples: 16,
      });
      composer.addPass(gtaoPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.14,
        0.52,
        0.96
      );
      composer.addPass(bloomPass);

      smaaPass = new SMAAPass();
      composer.addPass(smaaPass);

      composer.addPass(new OutputPass());
    }

    // 4. OrbitControls for 3D Dollhouse View
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = !isSoftwareGl;
    orbit.dampingFactor = 0.06;
    orbit.maxPolarAngle = Math.PI * 0.47;
    orbit.minDistance = 4.2;
    orbit.maxDistance = 24;
    orbit.target.set(0, 0.3, 0);

    orbit.addEventListener('start', () => {
      // Cancel scripted transition if user manually grabs OrbitControls
      if (modeRef.current === 'dollhouse') {
        povStateRef.current.glideActive = false;
      }
    });

    const syncMode = (mode: CameraMode, showCeil: boolean) => {
      const s = povStateRef.current;
      if (mode === 'pov') {
        orbit.enabled = false;
        apartment.ceilingGroup.visible = true;
        camera.fov = 66;
        camera.updateProjectionMatrix();
        // Smooth glide into current POV spot
        s.glideActive = true;
        s.glideToX = s.x;
        s.glideToY = EYE_HEIGHT;
        s.glideToZ = s.z;
      } else {
        orbit.enabled = true;
        apartment.ceilingGroup.visible = showCeil;
        camera.fov = 44;
        camera.updateProjectionMatrix();
        _orbitTargetGoal.set(0, 0.25, -0.6);
        _orbitCamGoal.set(0, 10.6, 11.4);
        s.glideActive = true;
      }
    };
    syncModeFnRef.current = syncMode;
    syncMode(modeRef.current, ceilingDollhouseRef.current);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Initialize camera immediately at spawn
    camera.position.set(
      povStateRef.current.x,
      povStateRef.current.y,
      povStateRef.current.z
    );
    camera.rotation.set(
      povStateRef.current.pitch,
      povStateRef.current.yaw,
      0,
      'YXZ'
    );

    // 5. POV Mouse Drag-Look + Touch Look + Raycast Click in Dollhouse
    let isDragging = false;
    let dragDistance = 0;
    let lastPtrX = 0;
    let lastPtrY = 0;
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (modeRef.current !== 'pov') return;
      if (document.pointerLockElement === renderer.domElement) {
        const s = povStateRef.current;
        s.targetYaw -= e.movementX * 0.0024;
        s.targetPitch = THREE.MathUtils.clamp(
          s.targetPitch - e.movementY * 0.0022,
          -Math.PI * 0.42,
          Math.PI * 0.42
        );
        return;
      }
      if (!isDragging) return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      dragDistance += Math.hypot(dx, dy);
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;

      const s = povStateRef.current;
      s.targetYaw += dx * 0.0042;
      s.targetPitch = THREE.MathUtils.clamp(
        s.targetPitch + dy * 0.0036,
        -Math.PI * 0.42,
        Math.PI * 0.42
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasClick = dragDistance < 6;
      isDragging = false;

      // In Dollhouse view, clicking directly inside any room teleports POV into that room
      if (wasClick && modeRef.current === 'dollhouse') {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);
        if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
          if (
            hitPoint.x >= -6.2 &&
            hitPoint.x <= 6.2 &&
            hitPoint.z >= -3.8 &&
            hitPoint.z <= 3.7
          ) {
            const room = detectRoomAt(hitPoint.x, hitPoint.z);
            callbacksRef.current.onRequestPovFromDollhouse(room);
          }
        }
      }
    };

    // Keyboard WASD / Arrow Keys
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        keys[e.code] = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
      if (gtaoPass) {
        gtaoPass.setSize(w, h);
      }
      if (bloomPass) {
        bloomPass.resolution.set(w, h);
      }
      if (smaaPass) {
        smaaPass.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Loop (GPU rAF vs Software WebGL afterDraw pacing)
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let telemetryTimer = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      apartment.oceanUniforms.uTime.value = elapsed;

      const s = povStateRef.current;

      if (modeRef.current === 'pov') {
        if (s.glideActive) {
          const factor = prefersReducedMotion ? 1 : 9;
          s.x = THREE.MathUtils.damp(s.x, s.glideToX, factor, delta);
          s.y = THREE.MathUtils.damp(s.y, s.glideToY, factor, delta);
          s.z = THREE.MathUtils.damp(s.z, s.glideToZ, factor, delta);
          s.yaw = THREE.MathUtils.damp(s.yaw, s.targetYaw, factor, delta);
          s.pitch = THREE.MathUtils.damp(s.pitch, s.targetPitch, factor, delta);

          camera.position.set(s.x, s.y, s.z);
          camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ');

          if (
            Math.hypot(s.x - s.glideToX, s.z - s.glideToZ) < 0.02 &&
            Math.abs(s.yaw - s.targetYaw) < 0.015
          ) {
            s.x = s.glideToX;
            s.y = s.glideToY;
            s.z = s.glideToZ;
            s.glideActive = false;
          }
        } else {
          // Smooth look damping
          const lookDamp = prefersReducedMotion ? 40 : 18;
          s.yaw = THREE.MathUtils.damp(s.yaw, s.targetYaw, lookDamp, delta);
          s.pitch = THREE.MathUtils.damp(s.pitch, s.targetPitch, lookDamp, delta);

          // WASD / Touch D-pad movement
          const pad = moveInputRef.current;
          const moveZ =
            Number(keys['KeyW'] || keys['ArrowUp'] || pad.forward) -
            Number(keys['KeyS'] || keys['ArrowDown'] || pad.backward);
          const moveX =
            Number(keys['KeyD'] || keys['ArrowRight'] || pad.right) -
            Number(keys['KeyA'] || keys['ArrowLeft'] || pad.left);

          const isMoving = moveZ !== 0 || moveX !== 0;

          if (isMoving) {
            _forward.set(-Math.sin(s.yaw), 0, -Math.cos(s.yaw)).normalize();
            _right.set(Math.cos(s.yaw), 0, -Math.sin(s.yaw)).normalize();

            const speed = 2.55;
            const len = Math.hypot(moveX, moveZ);
            const nx = moveX / len;
            const nz = moveZ / len;

            s.x += (_forward.x * nz + _right.x * nx) * speed * delta;
            s.z += (_forward.z * nz + _right.z * nx) * speed * delta;

            resolvePlayerCollision(s);

            if (!prefersReducedMotion) {
              s.walkBobPhase += delta * 9.5;
            }
          }

          const bobOffset =
            isMoving && !prefersReducedMotion ? Math.sin(s.walkBobPhase) * 0.022 : 0;
          s.y = THREE.MathUtils.damp(s.y, EYE_HEIGHT + bobOffset, 14, delta);

          camera.position.set(s.x, s.y, s.z);
          camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ');
        }
      } else {
        // Dollhouse Orbit mode
        if (s.glideActive) {
          const factor = prefersReducedMotion ? 1 : 6.5;
          camera.position.lerp(_orbitCamGoal, 1 - Math.exp(-factor * delta));
          orbit.target.lerp(_orbitTargetGoal, 1 - Math.exp(-factor * delta));
          if (
            camera.position.distanceTo(_orbitCamGoal) < 0.08 &&
            orbit.target.distanceTo(_orbitTargetGoal) < 0.05
          ) {
            s.glideActive = false;
          }
        }
        orbit.update();
      }

      // Room detection & minimap telemetry (~12 Hz)
      telemetryTimer += delta;
      if (telemetryTimer >= 0.08) {
        telemetryTimer = 0;
        const room = detectRoomAt(s.x, s.z);
        if (room.id !== s.lastRoomId) {
          s.lastRoomId = room.id;
          callbacksRef.current.onRoomChange(room);
        }
        callbacksRef.current.onTelemetry({
          x: s.x,
          z: s.z,
          yaw: s.yaw,
          currentRoom: room,
        });
      }

      if (isSoftwareGl || !composer) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      gtaoPass?.dispose();
      smaaPass?.dispose();
      bloomPass?.dispose();
      composer?.dispose();
      orbit.dispose();
      apartment.dispose();
      mats.dispose();
      textures.dispose();
      envTex.dispose();
      loadedHdrTex?.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [moveInputRef]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Không gian 3D căn hộ Solina Signature B.11.17"
      />
      {webglError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a] p-6 text-center z-20">
          <img
            src="/assets/aistudio/image_7ba17adc.png"
            alt="Bản đồ mặt bằng 3D căn hộ Solina Signature B.11.17"
            className="max-w-2xl w-full rounded-xl border border-white/15 mb-5"
          />
          <p className="text-base font-medium text-slate-100">
            Trình duyệt hiện chưa bật tăng tốc WebGL 3D.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Vui lòng bật tăng tốc phần cứng để khám phá mô hình 3D POV.
          </p>
        </div>
      )}
    </div>
  );
}

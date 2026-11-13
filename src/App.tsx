import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Layers,
  Map as MapIcon,
  Moon,
  Sun,
  Sunrise,
} from 'lucide-react';
import ApartmentCanvas, {
  MoveInputState,
  PlayerTelemetry,
} from './components/ApartmentCanvas';
import FloorMinimapModal from './components/FloorMinimapModal';
import {
  CameraMode,
  LightingPreset,
  ROOM_ZONES,
  RoomZone,
} from './scene/apartmentData';

export default function App() {
  const [cameraMode, setCameraMode] = useState<CameraMode>('pov');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('sunrise');
  const [showCeilingInDollhouse, setShowCeilingInDollhouse] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomZone>(ROOM_ZONES[0]);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [showWalkPad, setShowWalkPad] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<{
    room: RoomZone;
    nonce: number;
  } | null>(null);

  const [telemetry, setTelemetry] = useState<PlayerTelemetry>({
    x: ROOM_ZONES[0].povSpawn.x,
    z: ROOM_ZONES[0].povSpawn.z,
    yaw: ROOM_ZONES[0].povSpawn.yaw,
    currentRoom: ROOM_ZONES[0],
  });

  const moveInputRef = useRef<MoveInputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const handleSelectRoom = useCallback((room: RoomZone) => {
    setCurrentRoom(room);
    setTeleportTarget((prev) => ({
      room,
      nonce: (prev?.nonce ?? 0) + 1,
    }));
  }, []);

  const handleRequestPovFromDollhouse = useCallback((room: RoomZone) => {
    setCameraMode('pov');
    setCurrentRoom(room);
    setTeleportTarget((prev) => ({
      room,
      nonce: (prev?.nonce ?? 0) + 1,
    }));
  }, []);

  // Global keyboard shortcuts (H: hide dock, M: map, V: toggle POV/3D)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'KeyH') {
        setDockCollapsed((v) => !v);
      } else if (e.code === 'KeyM') {
        setMapOpen((v) => !v);
      } else if (e.code === 'KeyV') {
        setCameraMode((m) => (m === 'pov' ? 'dollhouse' : 'pov'));
      } else if (e.code === 'Escape') {
        setMapOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const setMoveFlag = (dir: keyof MoveInputState, active: boolean) => {
    moveInputRef.current[dir] = active;
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0b131e]">
      {/* Full-viewport 3D Scene */}
      <ApartmentCanvas
        cameraMode={cameraMode}
        lightingPreset={lightingPreset}
        showCeilingInDollhouse={showCeilingInDollhouse}
        teleportTarget={teleportTarget}
        moveInputRef={moveInputRef}
        onRoomChange={setCurrentRoom}
        onTelemetry={setTelemetry}
        onRequestPovFromDollhouse={handleRequestPovFromDollhouse}
      />

      {/* Minimal Top-Left Residence & Room Readout */}
      <header className="pointer-events-none fixed top-5 left-5 z-10 max-w-md">
        <div
          className="pointer-events-auto inline-flex flex-col rounded-xl border border-white/15 px-4 py-3 shadow-lg"
          style={{ backgroundColor: 'rgba(11, 18, 30, 0.86)' }}
        >
          <div className="flex items-center gap-2 text-xs text-amber-200/90">
            <span className="font-medium tracking-wide">Solina Signature</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">B.11.17</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">92,36 m²</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-white leading-tight">
              {currentRoom.name}
            </h1>
            <span className="font-mono-tabular text-xs text-slate-400">
              {currentRoom.areaLabel}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 truncate max-w-[320px]">
            {currentRoom.subtitle}
          </p>
        </div>
      </header>

      {/* Optional On-Screen Walk Pad (when toggled in POV mode for mouse/touch navigation) */}
      {cameraMode === 'pov' && showWalkPad && !dockCollapsed && (
        <div
          className="fixed bottom-40 right-5 z-10 rounded-xl border border-white/15 p-2.5 shadow-lg"
          style={{ backgroundColor: 'rgba(11, 18, 30, 0.88)' }}
        >
          <div className="grid grid-cols-3 gap-1.5 w-32">
            <div />
            <button
              type="button"
              aria-label="Đi tới"
              onPointerDown={() => setMoveFlag('forward', true)}
              onPointerUp={() => setMoveFlag('forward', false)}
              onPointerLeave={() => setMoveFlag('forward', false)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 text-white flex items-center justify-center active:bg-amber-500/30 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Sang trái"
              onPointerDown={() => setMoveFlag('left', true)}
              onPointerUp={() => setMoveFlag('left', false)}
              onPointerLeave={() => setMoveFlag('left', false)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 text-white flex items-center justify-center active:bg-amber-500/30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Lùi lại"
              onPointerDown={() => setMoveFlag('backward', true)}
              onPointerUp={() => setMoveFlag('backward', false)}
              onPointerLeave={() => setMoveFlag('backward', false)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 text-white flex items-center justify-center active:bg-amber-500/30 cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Sang phải"
              onPointerDown={() => setMoveFlag('right', true)}
              onPointerUp={() => setMoveFlag('right', false)}
              onPointerLeave={() => setMoveFlag('right', false)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 text-white flex items-center justify-center active:bg-amber-500/30 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <div
        className="fixed bottom-5 left-1/2 z-20 transition-transform duration-200"
        style={{
          width: 'min(940px, 94vw)',
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 20px))'
            : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Expand Handle */}
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/15 px-3.5 py-1 text-xs font-medium text-slate-200 hover:text-white cursor-pointer transition-colors"
            style={{ backgroundColor: 'rgba(11, 18, 30, 0.9)' }}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hiện điều khiển (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Ẩn điều khiển (H)</span>
              </>
            )}
          </button>
        </div>

        <div
          className="rounded-2xl border border-white/15 p-3 shadow-2xl"
          style={{ backgroundColor: 'rgba(11, 18, 30, 0.92)' }}
        >
          {/* Row 1: Room Teleport Pills / Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 border-b border-white/10">
            {ROOM_ZONES.map((room) => {
              const active = currentRoom.id === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500/90 text-slate-950 font-semibold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {room.name}
                </button>
              );
            })}
          </div>

          {/* Row 2: View Mode, Lighting Mood, Minimap & Controls Hint */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setCameraMode('pov')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  cameraMode === 'pov'
                    ? 'bg-amber-500/90 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>POV Đi bộ</span>
              </button>
              <button
                type="button"
                onClick={() => setCameraMode('dollhouse')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  cameraMode === 'dollhouse'
                    ? 'bg-amber-500/90 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tổng quan 3D</span>
              </button>
            </div>

            {/* Lighting Moods */}
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setLightingPreset('sunrise')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  lightingPreset === 'sunrise'
                    ? 'bg-white/15 text-amber-200'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sunrise className="w-3.5 h-3.5" />
                <span>Bình minh</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('daylight')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  lightingPreset === 'daylight'
                    ? 'bg-white/15 text-sky-200'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Ban ngày</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('evening')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  lightingPreset === 'evening'
                    ? 'bg-white/15 text-amber-200'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Buổi tối</span>
              </button>
            </div>

            {/* Utility Actions + Hint */}
            <div className="flex items-center gap-2">
              {cameraMode === 'dollhouse' ? (
                <button
                  type="button"
                  onClick={() => setShowCeilingInDollhouse((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    showCeilingInDollhouse
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {showCeilingInDollhouse ? 'Ẩn trần nhà' : 'Hiện trần nhà'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWalkPad((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    showWalkPad
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Phím bước</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/10 text-xs font-medium text-white hover:bg-white/15 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Sơ đồ 2D (M)</span>
              </button>
            </div>
          </div>

          {/* Subtle one-line interaction hint */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {cameraMode === 'pov'
                ? 'Kéo chuột để xoay góc nhìn · Nhấn WASD hoặc phím mũi tên để đi bộ qua các phòng'
                : 'Kéo chuột để xoay mô hình 3D · Cuộn để phóng to/thu nhỏ · Nhấn trực tiếp vào phòng để vào góc nhìn POV'}
            </span>
            <span className="hidden sm:inline font-mono-tabular">
              V: Đổi góc nhìn · M: Sơ đồ
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 2D Floorplan & Original Map Modal */}
      <FloorMinimapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        telemetry={telemetry}
        onSelectRoom={handleSelectRoom}
      />
    </main>
  );
}

import { X } from 'lucide-react';
import {
  APARTMENT_BOUNDS,
  ROOM_ZONES,
  RoomZone,
  WALL_SEGMENTS,
} from '../scene/apartmentData';
import { PlayerTelemetry } from './ApartmentCanvas';

interface FloorMinimapModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: PlayerTelemetry;
  onSelectRoom: (room: RoomZone) => void;
}

const SVG_W = 540;
const SVG_H = 330;
const PAD = 24;

function toSvgX(worldX: number): number {
  const norm =
    (worldX - APARTMENT_BOUNDS.minX) /
    (APARTMENT_BOUNDS.maxX - APARTMENT_BOUNDS.minX);
  return PAD + norm * (SVG_W - PAD * 2);
}

function toSvgY(worldZ: number): number {
  const norm =
    (worldZ - APARTMENT_BOUNDS.minZ) /
    (APARTMENT_BOUNDS.maxZ - APARTMENT_BOUNDS.minZ);
  return PAD + norm * (SVG_H - PAD * 2);
}

export default function FloorMinimapModal({
  isOpen,
  onClose,
  telemetry,
  onSelectRoom,
}: FloorMinimapModalProps) {
  if (!isOpen) return null;

  const px = toSvgX(telemetry.x);
  const py = toSvgY(telemetry.z);
  // Camera yaw=0 looks along -Z (upward in SVG). Positive yaw turns left (-X).
  const lookAngleDeg = (-telemetry.yaw * 180) / Math.PI;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(6, 10, 18, 0.78)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0f1726] p-5 md:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-2xl font-semibold text-amber-50">
              Sơ đồ mặt bằng &amp; Định vị POV
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Solina Signature B.11.17</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">92,36 m²</span>
              <span aria-hidden="true">·</span>
              <span>Nhấn vào từng phòng để di chuyển tới ngay</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sơ đồ"
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 items-stretch">
          {/* Interactive 2D Blueprint with Live Player Cone */}
          <div className="rounded-xl border border-white/10 bg-[#0a111d] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
              <span>Bản đồ tương tác 2D</span>
              <span className="text-amber-300 font-medium">
                Vị trí hiện tại: {telemetry.currentRoom.name}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-auto rounded-lg bg-[#101a2b]"
              role="img"
              aria-label="Sơ đồ 2D các phòng căn hộ Solina Signature B.11.17"
            >
              {/* Ocean horizon strip at top */}
              <rect x={0} y={0} width={SVG_W} height={22} fill="#143a59" />
              <text
                x={SVG_W / 2}
                y={15}
                textAnchor="middle"
                fill="#9ecae8"
                fontSize="10"
                letterSpacing="1.5"
              >
                HƯỚNG BIỂN · ĐÓN BÌNH MINH
              </text>

              {/* Clickable Room Zones */}
              {ROOM_ZONES.map((room) => {
                const x = toSvgX(room.bounds.minX);
                const y = toSvgY(room.bounds.minZ);
                const w = toSvgX(room.bounds.maxX) - x;
                const h = toSvgY(room.bounds.maxZ) - y;
                const isActive = telemetry.currentRoom.id === room.id;

                return (
                  <g
                    key={room.id}
                    onClick={() => {
                      onSelectRoom(room);
                      onClose();
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={isActive ? 'rgba(217, 169, 98, 0.22)' : 'rgba(255,255,255,0.03)'}
                      stroke={isActive ? '#e3b368' : 'rgba(255,255,255,0.08)'}
                      strokeWidth={isActive ? 1.5 : 1}
                    />
                    <text
                      x={toSvgX(room.minimapCenter.x)}
                      y={toSvgY(room.minimapCenter.z) - 2}
                      textAnchor="middle"
                      fill={isActive ? '#fde6ba' : '#cbd5e1'}
                      fontSize="10.5"
                      fontWeight={isActive ? '600' : '500'}
                    >
                      {room.name}
                    </text>
                    <text
                      x={toSvgX(room.minimapCenter.x)}
                      y={toSvgY(room.minimapCenter.z) + 11}
                      textAnchor="middle"
                      fill="#7f8fa6"
                      fontSize="8.5"
                    >
                      {room.areaLabel}
                    </text>
                  </g>
                );
              })}

              {/* Architectural Walls */}
              {WALL_SEGMENTS.map((w) => (
                <line
                  key={w.id}
                  x1={toSvgX(w.x1)}
                  y1={toSvgY(w.z1)}
                  x2={toSvgX(w.x2)}
                  y2={toSvgY(w.z2)}
                  stroke={
                    w.material === 'glass' || w.material === 'railing'
                      ? '#60a5fa'
                      : '#e2d9cb'
                  }
                  strokeWidth={w.material === 'glass' || w.material === 'railing' ? 2 : 3.5}
                  strokeLinecap="round"
                />
              ))}

              {/* Curved Top-Left Balcony Corner */}
              <path
                d={`M ${toSvgX(-6.15)} ${toSvgY(-1.5)} Q ${toSvgX(-6.15)} ${toSvgY(-3.76)} ${toSvgX(-4.05)} ${toSvgY(-3.76)}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
              />

              {/* Live Player Position & POV Field-of-View Cone */}
              <g transform={`translate(${px}, ${py}) rotate(${lookAngleDeg})`}>
                <path
                  d="M 0 0 L -22 -42 A 48 48 0 0 1 22 -42 Z"
                  fill="rgba(245, 189, 96, 0.35)"
                />
                <circle cx={0} cy={0} r={5.5} fill="#f5bd60" stroke="#0f1726" strokeWidth={2} />
              </g>
            </svg>
          </div>

          {/* Original 3D Reference Floorplan Image */}
          <div className="rounded-xl border border-white/10 bg-[#0a111d] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
              <span>Phối cảnh bản đồ gốc</span>
              <span>B.11.17</span>
            </div>
            <img
              src="/assets/aistudio/image_7ba17adc.png"
              alt="Phối cảnh mặt bằng gốc Solina Signature B.11.17"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg border border-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

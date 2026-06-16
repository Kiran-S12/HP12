/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';

interface GateSimulationProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
}

export const GateSimulation: React.FC<GateSimulationProps> = ({ inputs, outputs }) => {
  const { gate_thickness, gate_area } = inputs;
  const { metal_speed_gate, gate_width, j_actual, j_required, j_passed } = outputs;

  const width = 600;
  const height = 180;

  // Let's draw:
  // Left: Cross-section schematic of the runner tapering down to the narrow gate of thickness t_gate.
  // Right: Orifice face view representing Gate Thickness and Gate Width.
  // Spray: If J >= required, draw dense fine mist. If J < required, draw wavy solid jets of liquid.

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none" id="gate-simulation">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-100 uppercase">Gating Orifice & Flow Regime</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Jet classification and physical dimensions at the die gating entry.
          </p>
        </div>
        <div className={`px-3 py-1.5 text-xs rounded-none border flex items-center gap-1.5 font-semibold font-mono ${
          j_passed 
            ? 'text-emerald-400 bg-slate-950/40 border-emerald-800/80' 
            : 'text-rose-450 bg-slate-950/40 border-rose-850'
        }`}>
          <span>Atomization Rate:</span>
          <span className="font-mono font-bold">J = {Math.round(j_actual)}</span>
          <span>(Req: {j_required})</span>
          <span className="font-bold underline">{j_passed ? 'ATOMIZED' : 'STREAM/SOLID'}</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg className="mx-auto min-w-[550px]" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="runnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="mistGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
            </linearGradient>
            <pattern id="sprayPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#f43f5e" />
              <circle cx="6" cy="7" r="1.5" fill="#e11d48" />
              <circle cx="8" cy="3" r="0.8" fill="#fda4af" />
            </pattern>
          </defs>

          {/* BACKGROUND SPLIT GUIDE PANEL */}
          <rect x="10" y="10" width="260" height="160" fill="#020617" rx="0" stroke="#1e293b" />
          <rect x="290" y="10" width="300" height="160" fill="#020617" rx="0" stroke="#1e293b" />

          {/* SECTION 1: RUNNER & GATE CROSS SECTION */}
          <text x="25" y="28" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">SIDE-VIEW: RUNNER TO DIE ENTRY</text>
          
          {/* Runner Body tapering */}
          <path d="M 25 45 L 140 70 L 140 100 L 25 125 Z" fill="url(#runnerGrad)" />
          {/* Gate land Area */}
          <rect x="140" y="70" width="25" height="30" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          
          {/* Die cavity walls (above and below gate) */}
          <rect x="165" y="20" width="12" height="50" fill="#334155" />
          <rect x="165" y="100" width="12" height="60" fill="#334155" />
          
          {/* Gate Thickness dimension lead */}
          <line x1="165" y1="70" x2="200" y2="70" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="165" y1="100" x2="200" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 195 70 V 100" stroke="#e11d48" strokeWidth="1.5" />
          <polygon points="195,70 192,75 198,75" fill="#e11d48" />
          <polygon points="195,100 192,95 198,95" fill="#e11d48" />
          <text x="204" y="90" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">
            t: {gate_thickness.toFixed(2)} mm
          </text>

          {/* Metal Filling flowing from Runner */}
          <path d="M 25 55 L 135 73 L 135 97 L 25 115 Z" fill="#fda4af" opacity="0.15" />
          
          {/* Spray Visualization from Gate */}
          {j_passed ? (
            // ATOMIZED MIST SPRAY
            <g>
              {/* Soft Gradient spray background */}
              <path d="M 165 70 L 255 35 L 255 135 L 165 100 Z" fill="url(#mistGrad)" opacity="0.4" />
              {/* Tiny spray particles */}
              <circle cx="180" cy="80" r="1.5" fill="#f43f5e" />
              <circle cx="190" cy="72" r="1" fill="#f43f5e" />
              <circle cx="205" cy="62" r="1.2" fill="#e11d48" />
              <circle cx="210" cy="88" r="1.5" fill="#be123c" />
              <circle cx="225" cy="50" r="1.1" fill="#f43f5e" opacity="0.8" />
              <circle cx="230" cy="115" r="1.3" fill="#f43f5e" opacity="0.8" />
              <circle cx="245" cy="40" r="0.8" fill="#fda4af" opacity="0.9" />
              <circle cx="250" cy="95" r="1" fill="#f43f5e" opacity="0.7" />
              <circle cx="215" cy="100" r="1" fill="#e11d48" />
              <circle cx="172" cy="92" r="1.2" fill="#be123c" />
              <circle cx="195" cy="105" r="0.9" fill="#fda4af" />
              <circle cx="240" cy="130" r="1" fill="#be123c" opacity="0.6" />
              <text x="210" y="148" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                ✔ ATOMIZED ATOMIZATION
              </text>
            </g>
          ) : (
            // SOLID FLOW / DEFECT INSTABILITY (Wavy Jet lines)
            <g>
              <path d="M 165 72 Q 220 62 250 82" stroke="#be123c" strokeWidth="4" fill="none" opacity="0.8" />
              <path d="M 165 98 Q 210 108 250 88" stroke="#be123c" strokeWidth="4" fill="none" opacity="0.8" />
              <path d="M 165 85 Q 230 75 250 98" stroke="#be123c" strokeWidth="3" fill="none" opacity="0.6" />
              <text x="210" y="148" fill="#f87171" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                ⚠️ SOLID JET / AIR TRAP
              </text>
            </g>
          )}

          {/* Velocity Vector Arrow */}
          <g>
            <path d="M 65 85 h 60" stroke="#06b6d4" strokeWidth="2.5" />
            <polygon points="125,85 118,81 118,89" fill="#06b6d4" />
            <text x="95" y="78" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="extrabold" textAnchor="middle">
              Vg: {metal_speed_gate.toFixed(1)} m/s
            </text>
          </g>

          {/* SECTION 2: FRONT-VIEW ORIFICE FACE (TRUE SHAPE) */}
          <text x="305" y="28" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">DIE FACE: GATE LAND PROFILE</text>

          {/* Standard Plate for Orifice representation */}
          <rect x="315" y="45" width="250" height="90" fill="#1e293b" rx="0" stroke="#334155" strokeWidth="1" />
          {/* Cut Orifice slot */}
          <rect x="340" y="80" width="200" height="20" fill="#020617" rx="0" stroke="#06b6d4" strokeWidth="1" />
          <rect x="340" y="80" width="200" height="20" fill="url(#mistGrad)" opacity="0.15" />

          {/* Width labels on the Orifice slot */}
          <line x1="340" y1="75" x2="340" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="540" y1="75" x2="540" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 340 45 H 540" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="340,45 345,42 345,48" fill="#06b6d4" />
          <polygon points="540,45 535,42 535,48" fill="#06b6d4" />
          <text x="440" y="38" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            Width W: {gate_width.toFixed(1)} mm
          </text>

          {/* Height label on the Orifice slot */}
          <line x1="545" y1="80" x2="575" y2="80" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="545" y1="100" x2="575" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 570 80 V 100" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="570,80 567,85 573,85" fill="#06b6d4" />
          <polygon points="570,100 567,95 573,95" fill="#06b6d4" />
          <text x="580" y="94" fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="medium" textAnchor="start">
            {gate_thickness.toFixed(2)} mm
          </text>

          <text x="440" y="118" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            Gate Area Ag: {gate_area.toFixed(2)} cm²
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs text-slate-400 bg-slate-950 p-3 rounded-none border border-slate-850">
        <div>
          <span className="font-semibold text-slate-300">📏 Recalculated Width:</span>{' '}
          <span className="font-mono font-bold text-cyan-400">{gate_width.toFixed(1)} mm</span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">⚡ Fluid Velocity (Vg):</span>{' '}
          <span className={`font-mono font-bold ${metal_speed_gate < 30 || metal_speed_gate > 50 ? 'text-amber-450' : 'text-emerald-400'}`}>
            {metal_speed_gate.toFixed(2)} m/sec
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">📊 Flow Class:</span>{' '}
          <span className={`font-mono font-bold ${j_passed ? 'text-emerald-400' : 'text-rose-450'}`}>
            {j_passed ? 'Perfect Atomization' : 'Coarse Stream/Solid'}
          </span>
        </div>
      </div>
    </div>
  );
};

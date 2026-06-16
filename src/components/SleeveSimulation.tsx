/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';

interface SleeveSimulationProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
}

export const SleeveSimulation: React.FC<SleeveSimulationProps> = ({ inputs, outputs }) => {
  const { sleeve_length, plunger_dia, biscuit_thickness } = inputs;
  const { filling_ratio, slow_shot_length, fast_shot_length } = outputs;

  // Let's calculate aspect ratios for rendering inside a bounding box of 600x220
  const width = 600;
  const height = 180;
  
  const paddingX = 40;
  const paddingY = 35;
  const innerWidth = width - 2 * paddingX;
  const innerHeight = height - 2 * paddingY;

  // We map the physical length (sleeve_length, cm) to the SVG's innerWidth
  // biscuit_thickness, fast_shot_length, slow_shot_length must sum to sleeve_length
  const totalLength = sleeve_length;
  
  const scaleX = (val: number) => (val / totalLength) * innerWidth;
  
  // Plunger dia relative to sleeve length for standard proportions (keep it clean)
  const maxPlungerHeight = innerHeight * 0.9;
  const plungerHeightRatio = Math.min(1.0, (plunger_dia / 8.0)); // relative to ideal max 8cm
  const currentPlungerHeight = maxPlungerHeight * plungerHeightRatio;
  const plungerTop = paddingY + (innerHeight - currentPlungerHeight) / 2;

  // Key visual markers (starting from right to left)
  // Right wall of sleeve is at paddingX + innerWidth
  const rightWallX = paddingX + innerWidth;
  
  // Biscuit starts at right wall and goes left
  const biscuitWidth = scaleX(biscuit_thickness);
  const biscuitX = rightWallX - biscuitWidth;

  // Fast shot (S2 stroke) starts at biscuit and goes left
  const fastWidth = scaleX(fast_shot_length);
  const fastX = biscuitX - fastWidth;

  // Slow shot (S1 stroke) goes from biscuit-left towards plunger tip start
  const slowWidth = scaleX(slow_shot_length);
  const slowX = fastX - slowWidth;

  // Plunger tip position
  const plungerTipX = slowX;

  // Fill Ratio height visualization (fill level inside the sleeve)
  const fillPct = Math.min(100, Math.max(0, filling_ratio));
  const metalFillHeight = (fillPct / 100) * currentPlungerHeight;
  const metalFillY = plungerTop + currentPlungerHeight - metalFillHeight;

  // Helper styles for optimal fill bounds
  const getFillRatioColor = (ratio: number) => {
    if (ratio >= 30 && ratio <= 55) return 'text-emerald-400 bg-slate-950/40 border-emerald-800/80';
    return 'text-amber-400 bg-slate-950/40 border-amber-850';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none" id="sleeve-simulation">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-100 uppercase">Sleeve & Plunger Profile Simulation</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal volumetric visualization of liquid metal distribution and injection stroke phases.
          </p>
        </div>
        <div className={`px-3 py-1.5 text-xs rounded-none border ${getFillRatioColor(filling_ratio)} flex items-center gap-1.5 font-semibold font-mono`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filling_ratio >= 30 && filling_ratio <= 55 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${filling_ratio >= 30 && filling_ratio <= 55 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          Fill Ratio: {filling_ratio.toFixed(1)}% {filling_ratio >= 30 && filling_ratio <= 55 ? '(Optimal 30-55%)' : '(Outside Guidelines)'}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg className="mx-auto min-w-[550px]" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          {/* Gradients */}
          <defs>
            <linearGradient id="sleeveMetallic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="liquidMetal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="40%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="biscuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="plungerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Liquid Metal Pool (renders inside shot sleeve bounds) */}
          <rect
            x={plungerTipX}
            y={metalFillY}
            width={rightWallX - plungerTipX}
            height={metalFillHeight}
            fill="url(#liquidMetal)"
            className="transition-all duration-300"
          />

          {/* Shot Sleeve Cylinder Outer Body */}
          <rect
            x={paddingX}
            y={plungerTop - 5}
            width={innerWidth}
            height={currentPlungerHeight + 10}
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="none"
          />
          
          {/* Inner liner helper */}
          <line
            x1={paddingX}
            y1={plungerTop}
            x2={rightWallX}
            y2={plungerTop}
            stroke="#334155"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={plungerTop + currentPlungerHeight}
            x2={rightWallX}
            y2={plungerTop + currentPlungerHeight}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Biscuit on right */}
          <rect
            x={biscuitX}
            y={plungerTop}
            width={biscuitWidth}
            height={currentPlungerHeight}
            fill="url(#biscuitGrad)"
            opacity="0.85"
            className="transition-all duration-300"
          />
          
          {/* Fast Stroke (S2) overlay label */}
          <rect
            x={fastX}
            y={plungerTop}
            width={fastWidth}
            height={currentPlungerHeight}
            fill="#06b6d4"
            opacity="0.15"
            className="transition-all duration-300"
          />

          {/* Plunger Tip (Injection Face) */}
          <rect
            x={plungerTipX - 12}
            y={plungerTop}
            width="12"
            height={currentPlungerHeight}
            fill="url(#plungerGrad)"
            rx="0"
            className="transition-all duration-300"
          />
          {/* Plunger Shaft */}
          <rect
            x={paddingX - 10}
            y={plungerTop + currentPlungerHeight/2 - 12}
            width={plungerTipX - paddingX - 2}
            height="24"
            fill="#1e293b"
            rx="0"
            stroke="#334155"
            strokeWidth="1"
            className="transition-all duration-300"
          />

          {/* Dimension guidelines and text */}
          <line x1={rightWallX} y1={plungerTop - 12} x2={rightWallX} y2={plungerTop + currentPlungerHeight + 12} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={biscuitX} y1={plungerTop - 12} x2={biscuitX} y2={plungerTop + currentPlungerHeight + 12} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={fastX} y1={plungerTop - 12} x2={fastX} y2={plungerTop + currentPlungerHeight + 12} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={plungerTop - 12} x2={paddingX} y2={plungerTop + currentPlungerHeight + 12} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />

          {/* Sleeve Length Labels */}
          {/* Biscuit Width Label */}
          {biscuitWidth > 20 && (
            <text x={biscuitX + biscuitWidth / 2} y={plungerTop + currentPlungerHeight / 2} fill="#ffffff" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace">
              BISCUIT
            </text>
          )}

          {/* Biscuit bottom extension rule */}
          {biscuitWidth > 8 && (
            <g>
              <path d={`M ${biscuitX} ${plungerTop + currentPlungerHeight + 15} H ${rightWallX}`} stroke="#f43f5e" strokeWidth="1" />
              <text x={biscuitX + biscuitWidth / 2} y={plungerTop + currentPlungerHeight + 28} fill="#fda4af" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="semibold">
                {biscuit_thickness.toFixed(1)} cm
              </text>
            </g>
          )}

          {/* Fast Stroke (S2) Dimension Rule */}
          {fastWidth > 8 && (
            <g>
              <path d={`M ${fastX} ${plungerTop + currentPlungerHeight + 15} H ${biscuitX}`} stroke="#06b6d4" strokeWidth="1" />
              <text x={fastX + fastWidth / 2} y={plungerTop + currentPlungerHeight + 28} fill="#22d3ee" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="semibold">
                S2: {fast_shot_length.toFixed(1)} cm
              </text>
            </g>
          )}

          {/* Slow Stroke (S1) Dimension Rule */}
          {slowWidth > 8 && (
            <g>
              <path d={`M ${slowX} ${plungerTop + currentPlungerHeight + 15} H ${fastX}`} stroke="#64748b" strokeWidth="1" />
              <text x={slowX + slowWidth / 2} y={plungerTop + currentPlungerHeight + 28} fill="#94a3b8" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="semibold">
                S1: {slow_shot_length.toFixed(1)} cm
              </text>
            </g>
          )}

          {/* Total Length Rule (Top) */}
          <path d={`M ${paddingX} ${plungerTop - 18} H ${rightWallX}`} stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx={paddingX} cy={plungerTop - 18} r="3" fill="#06b6d4" />
          <circle cx={rightWallX} cy={plungerTop - 18} r="3" fill="#06b6d4" />
          <text x={paddingX + innerWidth / 2} y={plungerTop - 25} fill="#e2e8f0" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SLEEVE CORE L: {sleeve_length.toFixed(1)} cm
          </text>

          {/* Plunger Dia Indicator (Left) */}
          <g>
            <path d={`M ${paddingX - 18} ${plungerTop} V ${plungerTop + currentPlungerHeight}`} stroke="#94a3b8" strokeWidth="1" />
            <line x1={paddingX - 22} y1={plungerTop} x2={paddingX - 14} y2={plungerTop} stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={paddingX - 22} y1={plungerTop + currentPlungerHeight} x2={paddingX - 14} y2={plungerTop + currentPlungerHeight} stroke="#94a3b8" strokeWidth="1.5" />
            <text x={paddingX - 26} y={plungerTop + currentPlungerHeight / 2 + 3} fill="#e2e8f0" textAnchor="end" fontSize="9" fontFamily="monospace" fontWeight="bold">
              ø {plunger_dia.toFixed(1)} cm
            </text>
          </g>

          {/* Phase labels inside cylinder */}
          {slowWidth > 35 && (
            <text x={slowX + slowWidth / 2} y={plungerTop + currentPlungerHeight - 12} fill="#94a3b8" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.6">
              SLOW PHASE S1
            </text>
          )}
          {fastWidth > 35 && (
            <text x={fastX + fastWidth / 2} y={plungerTop + currentPlungerHeight - 12} fill="#22d3ee" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.6">
              FAST CAVITY S2
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs text-slate-400 bg-slate-950 p-3 rounded-none border border-slate-850">
        <div>
          <span className="font-semibold text-slate-300">📋 Biscuit Thickness:</span>{' '}
          <span className="font-mono text-cyan-400">{biscuit_thickness.toFixed(2)} cm</span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">⚡ S1 (Slow Shot Stroke):</span>{' '}
          <span className="font-mono text-cyan-400">{slow_shot_length.toFixed(2)} cm</span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">🚀 S2 (Fast Shot Stroke):</span>{' '}
          <span className="font-mono text-cyan-400">{fast_shot_length.toFixed(2)} cm</span>
        </div>
      </div>
    </div>
  );
};

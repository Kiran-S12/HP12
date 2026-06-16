/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HPDCInputs, 
  HPDCOutputs 
} from '../types';
import { ALLOYS } from '../constants';
import { 
  Sliders, 
  HelpCircle, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Info,
  Maximize2,
  RefreshCw,
  Gauge,
  Zap
} from 'lucide-react';

interface PQ2DiagramProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
  onChange: (field: keyof HPDCInputs, value: any) => void;
}

export const PQ2Diagram: React.FC<PQ2DiagramProps> = ({ inputs, outputs, onChange }) => {
  const { 
    density, 
    plunger_dia, 
    gate_area, 
    fast_shot_speed, 
    projected_area, 
    casting_pressure,
    selected_clamping,
    casting_thickness,
    alloy
  } = inputs;

  // 1. PQ2 Calibration Parameters (Local tuning parameters to form machine and process limits)
  const [maxStaticPressure, setMaxStaticPressure] = useState<number>(100); // MPa (P_max)
  const [maxDryVelocity, setMaxDryVelocity] = useState<number>(6.5); // m/s (v_dry)
  const [dischargeCoeff, setDischargeCoeff] = useState<number>(0.55); // Cd (dimensionless)
  
  // Custom Override Bounds
  const [minVelocityLimit, setMinVelocityLimit] = useState<number>(25); // m/s
  const [maxVelocityLimit, setMaxVelocityLimit] = useState<number>(50); // m/s
  const [minCompactionPressure, setMinCompactionPressure] = useState<number>(35); // MPa
  const [customFillTime, setCustomFillTime] = useState<number>(0); // ms (0 means auto-derived)

  // Sync parameters on alloy change to use standard industry norms
  useEffect(() => {
    const optAlloy = ALLOYS.find(a => a.name === alloy);
    if (optAlloy) {
      if (optAlloy.type === 'Al') {
        setMinVelocityLimit(25);
        setMaxVelocityLimit(50);
        setMinCompactionPressure(40);
      } else if (optAlloy.type === 'Mg') {
        setMinVelocityLimit(35);
        setMaxVelocityLimit(55);
        setMinCompactionPressure(45);
      } else if (optAlloy.type === 'Zn') {
        setMinVelocityLimit(20);
        setMaxVelocityLimit(40);
        setMinCompactionPressure(25);
      }
    }
  }, [alloy]);

  // Handle dynamic defaults calibration helper
  const resetToFactoryDefaults = () => {
    setMaxStaticPressure(Math.round(casting_pressure * 1.5 || 100));
    setMaxDryVelocity(6.5);
    setDischargeCoeff(0.55);
    setCustomFillTime(0);
    const optAlloy = ALLOYS.find(a => a.name === alloy);
    if (optAlloy) {
      setMinVelocityLimit(optAlloy.type === 'Mg' ? 35 : optAlloy.type === 'Zn' ? 20 : 25);
      setMaxVelocityLimit(optAlloy.type === 'Mg' ? 55 : optAlloy.type === 'Zn' ? 40 : 50);
      setMinCompactionPressure(optAlloy.type === 'Mg' ? 45 : optAlloy.type === 'Zn' ? 25 : 40);
    }
  };

  // 2. Perform PQ2 Mathematical Model
  
  // Plunger Area (cm²)
  const plungerArea = Math.PI * Math.pow(plunger_dia / 2, 2);
  
  // Max Dry Flow Rate (L/s) = Plunger Area (cm²) * Max Dry Velocity (m/s) / 10
  const qMaxDry = (plungerArea * maxDryVelocity) / 10;
  const qMaxDry2 = Math.pow(qMaxDry, 2); // (L/s)²

  // Die/Gate constant (Slope factor k in MPa per (L/s)²)
  // Formula: k = rho / (20 * Cd² * Ag²)
  const kSlope = gate_area > 0 
    ? density / (20 * Math.pow(dischargeCoeff, 2) * Math.pow(gate_area, 2))
    : 0;

  // Machine Line Impedance/Slope (Z in MPa per (L/s)²)
  // Formula: Z = P_max_static / Q_max_dry²
  const machineZ = qMaxDry2 > 0 ? maxStaticPressure / qMaxDry2 : 0;

  // Actual Operating Point where Machine capability meets Die Gating resistance
  // Operating Q² = P_max_static / (k + Z)
  const operQ2 = (kSlope + machineZ) > 0 ? maxStaticPressure / (kSlope + machineZ) : 0;
  const operQ = Math.sqrt(operQ2); // operating flow rate in L/s
  const operP = kSlope * operQ2; // operating metal pressure in MPa
  
  // Derived operating gate velocity (m/s)
  const operGateVel = gate_area > 0 ? (operQ * 10) / gate_area : 0;

  // 3. Process Window Safe Constraints
  
  // Recommended Fill Time (ms)
  // Simplified NADCA core wall thickness estimator: 20ms + 20ms * t_wall (mm)
  const estimatedFillTime = Math.max(10, 20 + 20 * (casting_thickness || 1.8));
  const activeFillTimeLimit = customFillTime > 0 ? customFillTime : estimatedFillTime;

  // Solidification limits: minimum rate to fill the cavity volume
  const cavityVolume = (inputs.w_casting + inputs.w_overflow) / density; // cc
  const qMinFill = activeFillTimeLimit > 0 
    ? cavityVolume / activeFillTimeLimit // cc/ms is equivalent to L/s
    : 0;
  const qMinFill2 = Math.pow(qMinFill, 2);

  // Velocity Limits (Gate erosion and Gating dispersion limits)
  const qMinVelGate = (minVelocityLimit * gate_area) / 10; // L/s
  const qMinVelGate2 = Math.pow(qMinVelGate, 2);

  const qMaxVelGate = (maxVelocityLimit * gate_area) / 10; // L/s
  const qMaxVelGate2 = Math.pow(qMaxVelGate, 2);

  // Combined minimum flow rate requirement
  const combinedQMin = Math.max(qMinFill, qMinVelGate);
  const combinedQMin2 = Math.pow(combinedQMin, 2);

  // Pressure limits:
  // Casting pressure requirements (Bottom boundary to prevent porosity)
  const pMinCompaction = minCompactionPressure; // MPa

  // Machine clamping limit (Top boundary to prevent flashing)
  // P_max_clamping = Clamping Force (Tons) / (Projected Area cm² * 0.01)
  const pMaxClamping = projected_area > 0 
    ? selected_clamping / (projected_area * 0.01)
    : 150; // default safe fallback (ex. Works)

  // 4. Mapping Screen coordinates for SVG Chart plotting
  const svgWidth = 640;
  const svgHeight = 350;
  const padding = { top: 30, right: 140, bottom: 50, left: 65 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Establish stable graph limits
  const xPlotMax = Math.max(qMaxDry2 * 1.15, qMaxVelGate2 * 1.25, operQ2 * 1.3, 100);
  const yPlotMax = Math.max(maxStaticPressure * 1.15, pMaxClamping * 1.1, operP * 1.3, 120);

  const getScreenCoords = (xVal: number, yVal: number) => {
    const xPct = Math.min(1, Math.max(0, xVal / xPlotMax));
    const yPct = Math.min(1, Math.max(0, yVal / yPlotMax));
    return {
      x: padding.left + xPct * chartWidth,
      y: padding.top + chartHeight - yPct * chartHeight
    };
  };

  // Safe operating Process Box Corners
  const boxTopLeft = getScreenCoords(combinedQMin2, pMaxClamping);
  const boxBottomRight = getScreenCoords(qMaxVelGate2, pMinCompaction);
  const processBoxWidth = Math.max(0, boxBottomRight.x - boxTopLeft.x);
  const processBoxHeight = Math.max(0, boxBottomRight.y - boxTopLeft.y);

  // Operating Point SVG Coords
  const operPoint = getScreenCoords(operQ2, operP);
  const isOperatingSafe = 
    operQ >= combinedQMin && 
    operQ <= qMaxVelGate && 
    operP >= pMinCompaction && 
    operP <= pMaxClamping;

  // Dry shot machine endpoint on plot
  const machineEnd = getScreenCoords(qMaxDry2, 0);
  const machineStart = getScreenCoords(0, maxStaticPressure);

  // Gating Line plot endpoints (goes from origin to end of graph)
  const dieStart = getScreenCoords(0, 0);
  const dieEnd = getScreenCoords(xPlotMax, kSlope * xPlotMax);

  // 5. Generate nice grid system for PQ2
  // We place standard ticks on the X-axis corresponding to pleasant integers in linear Flow Rate Q (L/s)
  // E.g. 2, 4, 6, 8, 10, ... L/s, but plot them at Q² positions! This makes vertical gridlines quadratically spaced!
  const maxFlowRateLabel = Math.sqrt(xPlotMax);
  const tickStep = maxFlowRateLabel > 12 ? 2 : 1;
  const qTicks: number[] = [];
  for (let q = tickStep; q < maxFlowRateLabel; q += tickStep) {
    qTicks.push(q);
  }

  // Y-axis pressure ticks (MPa) E.g. every 20 or 25 MPa
  const pTicks: number[] = [];
  const pStep = yPlotMax > 150 ? 30 : 20;
  for (let p = pStep; p < yPlotMax; p += pStep) {
    pTicks.push(p);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl rounded-none text-slate-100" id="pq2-diagram-view">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase font-mono tracking-widest block mb-1">
            Plunger Hydraulics & Gating Intersection
          </span>
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2 uppercase">
            <Gauge className="h-5 w-5 text-cyan-500" />
            PQ² Hydrodynamics & Process Window
          </h2>
          <p className="text-xs text-slate-400 mt-1 animate-fade-in">
            Realtime matching of machine energy output against gate choke resistance. Map target alloy limits to the physical safe operating window.
          </p>
        </div>

        <button
          onClick={resetToFactoryDefaults}
          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono py-2 px-3 flex items-center gap-1.5 transition-all uppercase rounded-none cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-500" />
          Factory Re-Calibrate
        </button>
      </div>

      {/* Main Grid: SLIDERS CONTROL & DIAGRAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Sliders Tuning Block */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Machine Characteristics Card */}
          <div className="bg-slate-950 border border-slate-850 p-4 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-900 pb-2">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">1. Machine Characteristics</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Metal Pressure (P_static)</span>
                  <span className="text-cyan-400 font-bold">{maxStaticPressure} MPa</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="180"
                  step="5"
                  value={maxStaticPressure}
                  onChange={(e) => setMaxStaticPressure(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">No-flow pressure. Formed by hydraulic push limits & plunger ratio.</p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Dry Plunger Speed</span>
                  <span className="text-cyan-400 font-bold">{maxDryVelocity.toFixed(1)} m/s</span>
                </div>
                <input 
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={maxDryVelocity}
                  onChange={(e) => setMaxDryVelocity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Plunger speed with no die resistance. Forms no-resistance flow.</p>
              </div>
            </div>
          </div>

          {/* Gate Performance Card */}
          <div className="bg-slate-950 border border-slate-850 p-4 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 border-b border-slate-900 pb-2">
              <Sliders className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">2. Gating Orifice Calibration</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Discharge Coefficient (C_d)</span>
                  <span className="text-amber-400 font-bold">{dischargeCoeff.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.30"
                  max="0.85"
                  step="0.01"
                  value={dischargeCoeff}
                  onChange={(e) => setDischargeCoeff(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Runner friction & entry taper efficiency. Typical range: 0.4—0.6.</p>
              </div>

              <div className="border-t border-slate-900 pt-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Gate Size Matching (Synced)</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono select-none">
                  <div className="bg-slate-900/60 p-1.5 border border-slate-850">
                    <span className="text-slate-500 block">Gate Area:</span>
                    <span className="text-slate-200 font-bold">{gate_area.toFixed(2)} cm²</span>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 border border-slate-850">
                    <span className="text-slate-500 block">Plunger Dia:</span>
                    <span className="text-slate-200 font-bold">Ø{plunger_dia.toFixed(1)} cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Window Constraints Card */}
          <div className="bg-slate-950 border border-slate-850 p-4 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-900 pb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">3. Process Window Limits</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Min Gate Velocity Limit</span>
                  <span className="text-emerald-400 font-bold">{minVelocityLimit} m/s</span>
                </div>
                <input 
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={minVelocityLimit}
                  onChange={(e) => setMinVelocityLimit(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5">Below this: droplets fall out of atomized state (poor fusion).</p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Gate Velocity Limit</span>
                  <span className="text-emerald-450 font-bold">{maxVelocityLimit} m/s</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="85"
                  step="1"
                  value={maxVelocityLimit}
                  onChange={(e) => setMaxVelocityLimit(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5">Above this: metal erodes the H13 steel core mould rapidly.</p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Min Packing Pressure</span>
                  <span className="text-cyan-400 font-bold">{minCompactionPressure} MPa</span>
                </div>
                <input 
                  type="range"
                  min="15"
                  max="70"
                  step="5"
                  value={minCompactionPressure}
                  onChange={(e) => setMinCompactionPressure(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 mt-0.5">Minimum pressure to squeeze shrinkage porosity at end of fill.</p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Cavity Fill Time</span>
                  <span className="text-cyan-405 font-bold">
                    {activeFillTimeLimit} ms {customFillTime === 0 && '(Auto)'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={customFillTime}
                  onChange={(e) => setCustomFillTime(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block leading-tight mt-1">
                  Derived from thickness (t_wall = {casting_thickness.toFixed(1)}mm). Set to 0 to enable auto wall-thickness rule.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Chart Plotting & Diagnostic Metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Diagnostic Banner showing safe state */}
          <div className={`p-4 border flex items-center justify-between gap-4 rounded-none transition-all ${
            isOperatingSafe 
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {isOperatingSafe ? (
                <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 animate-bounce" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 animate-pulse" />
              )}
              <div>
                <h4 className="text-xs font-black font-mono tracking-wider uppercase">
                  {isOperatingSafe ? 'OPTIMIZED INTERSECTION WINDOW' : 'HYDRAULIC DEFICIT / MISMATCH'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {isOperatingSafe 
                    ? "Fantastic! The intersection point lies nicely within the process envelope. Metal atomizes efficiently with healthy compaction pressure."
                    : "Caution: Operating point lands outside of the process window! Check the critical telemetry metrics to restore casting limits."}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end font-mono">
              <span className="text-[9px] text-slate-500 uppercase">Process Score:</span>
              <span className={`text-xl font-black ${isOperatingSafe ? 'text-emerald-400' : 'text-orange-400'}`}>
                {isOperatingSafe ? '100% PASS' : 'OUT-WINDOW'}
              </span>
            </div>
          </div>

          {/* Interactive PQ2 SVG Diagram Visualizer */}
          <div className="bg-slate-950 border border-slate-850 p-4 space-y-2 relative">
            <div className="flex justify-between items-center text-xs font-mono border-b border-slate-900 pb-2 mb-2 select-none">
              <span className="font-bold flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> PQ² Intersection Graph</span>
              <span className="text-slate-500">X-Scale: Exponential (Q²), Y-Scale: Metal Pressure (P)</span>
            </div>

            {/* SVG STAGE */}
            <div className="relative overflow-x-auto select-none">
              <svg className="mx-auto min-w-[580px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight}>
                <defs>
                  {/* Glassmorphic Operating shaded window fill */}
                  <pattern id="processGrid" width="6" height="6" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="6" y2="6" stroke="#10b981" strokeWidth="0.8" opacity="0.3" />
                  </pattern>
                </defs>

                {/* CHART OUTER BASE BOUNDS */}
                <rect 
                  x={padding.left} 
                  y={padding.top} 
                  width={chartWidth} 
                  height={chartHeight} 
                  fill="#020617" 
                  stroke="#1e293b" 
                  strokeWidth="1.5" 
                />

                {/* HORIZONTAL GRIDLINES (PRESSURE TICKS) */}
                {pTicks.map((p, idx) => {
                  const lineY = getScreenCoords(0, p).y;
                  return (
                    <g key={`p-grid-${idx}`}>
                      <line 
                        x1={padding.left} 
                        y1={lineY} 
                        x2={svgWidth - padding.right} 
                        y2={lineY} 
                        stroke="#0f172a" 
                        strokeWidth="1" 
                      />
                      <line 
                        x1={padding.left} 
                        y1={lineY} 
                        x2={padding.left + 5} 
                        y2={lineY} 
                        stroke="#334155" 
                        strokeWidth="1" 
                      />
                      <text 
                        x={padding.left - 8} 
                        y={lineY + 3} 
                        fill="#64748b" 
                        fontSize="9" 
                        fontFamily="monospace" 
                        textAnchor="end"
                      >
                        {p} MPa
                      </text>
                    </g>
                  );
                })}

                {/* VERTICAL GRIDLINES (QUADRATIC TICK MARKS DISPLAYING FLOW RATE Q (L/s)) */}
                {qTicks.map((q, idx) => {
                  const lineCoords = getScreenCoords(q * q, 0);
                  return (
                    <g key={`q-grid-${idx}`}>
                      <line 
                        x1={lineCoords.x} 
                        y1={padding.top} 
                        x2={lineCoords.x} 
                        y2={padding.top + chartHeight} 
                        stroke="#0f172a" 
                        strokeWidth="1.2" 
                        strokeDasharray="2 4"
                      />
                      <line 
                        x1={lineCoords.x} 
                        y1={padding.top + chartHeight - 5} 
                        x2={lineCoords.x} 
                        y2={padding.top + chartHeight} 
                        stroke="#334155" 
                      />
                      <text 
                        x={lineCoords.x} 
                        y={padding.top + chartHeight + 14} 
                        fill="#64748b" 
                        fontSize="9" 
                        fontFamily="monospace" 
                        textAnchor="middle"
                      >
                        {q} L/s
                      </text>
                    </g>
                  );
                })}

                {/* Axis Titles */}
                <text 
                  x={padding.left + chartWidth / 2} 
                  y={padding.top + chartHeight + 35} 
                  fill="#475569" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  METAL VOLUMETRIC FLOW RATE (L/s) — QUADRATIC SCALE PROPORTIONS
                </text>

                <text 
                  x="15" 
                  y={padding.top + chartHeight / 2} 
                  fill="#475569" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  fontWeight="bold" 
                  transform={`rotate(-90 15 ${padding.top + chartHeight / 2})`}
                  textAnchor="middle"
                >
                  CASTING PRESSURE AT GATE (MPa)
                </text>

                {/* SHADED GREEN OPERATING ENVELOPE (PROCESS WINDOW) */}
                {processBoxWidth > 0 && processBoxHeight > 0 && (
                  <g>
                    {/* Textured semitransparent safe zone */}
                    <rect 
                      x={boxTopLeft.x} 
                      y={boxTopLeft.y} 
                      width={processBoxWidth} 
                      height={processBoxHeight} 
                      fill="url(#processGrid)" 
                    />
                    <rect 
                      x={boxTopLeft.x} 
                      y={boxTopLeft.y} 
                      width={processBoxWidth} 
                      height={processBoxHeight} 
                      fill="#10b981" 
                      fillOpacity="0.06"
                      stroke="#10b981" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                    {/* Process envelope label inside */}
                    <text 
                      x={boxTopLeft.x + processBoxWidth / 2} 
                      y={boxTopLeft.y + processBoxHeight / 2 + 3} 
                      fill="#10b981" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      fontWeight="black" 
                      textAnchor="middle" 
                      opacity="0.65"
                    >
                      OPTIMAL REGIME
                    </text>
                  </g>
                )}

                {/* PROCESS LIMIT CRITICAL LINES OUTSIDE ZONE */}
                {/* Min packing line */}
                <line 
                  x1={padding.left} 
                  y1={getScreenCoords(0, pMinCompaction).y} 
                  x2={svgWidth - padding.right} 
                  y2={getScreenCoords(0, pMinCompaction).y} 
                  stroke="#ef4444" 
                  strokeWidth="1" 
                  strokeDasharray="3 5" 
                  opacity="0.4"
                />
                
                {/* Max Clamping line */}
                <line 
                  x1={padding.left} 
                  y1={getScreenCoords(0, pMaxClamping).y} 
                  x2={svgWidth - padding.right} 
                  y2={getScreenCoords(0, pMaxClamping).y} 
                  stroke="#b91c1c" 
                  strokeWidth="1.2" 
                  strokeDasharray="4 2" 
                  opacity="0.6"
                />
                <text 
                  x={svgWidth - padding.right - 5} 
                  y={getScreenCoords(0, pMaxClamping).y - 4} 
                  fill="#f87171" 
                  fontSize="8" 
                  fontFamily="monospace" 
                  textAnchor="end"
                  opacity="0.85"
                >
                  Clamping Yield Limit: {pMaxClamping.toFixed(0)} MPa
                </text>

                {/* THE MACHINE CAPABILITY LINE (POWER LINE) - straight from Ps to Qmax */}
                <line 
                  x1={machineStart.x} 
                  y1={machineStart.y} 
                  x2={machineEnd.x} 
                  y2={machineEnd.y} 
                  stroke="#38bdf8" 
                  strokeWidth="3.5" 
                />

                {/* GATING RESISTANCE LINE (DIE LINE) - straight line reflecting gate pressure drop */}
                <line 
                  x1={dieStart.x} 
                  y1={dieStart.y} 
                  x2={dieEnd.x} 
                  y2={dieEnd.y} 
                  stroke="#fbbf24" 
                  strokeWidth="2.5" 
                />

                {/* OPERATING POINT PLOTTER CROSSHAIR */}
                <line 
                  x1={padding.left} 
                  y1={operPoint.y} 
                  x2={operPoint.x} 
                  y2={operPoint.y} 
                  stroke="#475569" 
                  strokeWidth="1" 
                  strokeDasharray="2 2" 
                />
                <line 
                  x1={operPoint.x} 
                  y1={operPoint.y} 
                  x2={operPoint.x} 
                  y2={padding.top + chartHeight} 
                  stroke="#475569" 
                  strokeWidth="1" 
                  strokeDasharray="2 2" 
                />

                {/* Glowing operating dot */}
                <circle 
                  cx={operPoint.x} 
                  cy={operPoint.y} 
                  r="7" 
                  fill={isOperatingSafe ? '#10b981' : '#f59e0b'} 
                  className="animate-ping" 
                  opacity="0.4"
                />
                <circle 
                  cx={operPoint.x} 
                  cy={operPoint.y} 
                  r="5" 
                  fill={isOperatingSafe ? '#10b981' : '#f97316'} 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                />

                {/* MAP LEGENDS DISPLAY RIGHT SIDE OF CHART */}
                <g transform={`translate(${svgWidth - padding.right + 12}, ${padding.top + 10})`}>
                  {/* Legend 1: Machine Line */}
                  <rect x="0" y="0" width="10" height="3" fill="#38bdf8" />
                  <text x="16" y="5" fill="#e2e8f0" fontSize="9" fontFamily="monospace" fontWeight="bold">Machine capability</text>
                  
                  {/* Legend 2: Die Line */}
                  <rect x="0" y="16" width="10" height="3" fill="#fbbf24" />
                  <text x="16" y="21" fill="#e2e8f0" fontSize="9" fontFamily="monospace" fontWeight="bold">Die Gating line</text>

                  {/* Legend 3: Process Window */}
                  <rect x="0" y="32" width="10" height="10" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
                  <text x="16" y="40" fill="#e2e8f0" fontSize="9" fontFamily="monospace" fontWeight="bold">Process Window</text>

                  {/* Legend 4: Operating intersection */}
                  <circle cx="5" cy="54" r="4" fill={isOperatingSafe ? '#10b981' : '#f97316'} />
                  <text x="16" y="57" fill="#e2e8f0" fontSize="9" fontFamily="monospace" fontWeight="bold">Operating pt</text>
                  
                  {/* Legend 5: Ticks details */}
                  <g transform="translate(0, 78)" className="text-[8.5px] font-mono fill-slate-400 leading-normal">
                    <text x="0" y="0" fill="#a7f3d0" fontWeight="bold" fontSize="9">Active Parameters:</text>
                    <text x="0" y="14">Plunger Ø: {plunger_dia.toFixed(1)} cm</text>
                    <text x="0" y="26">Gate Ag: {gate_area.toFixed(2)} cm²</text>
                    <text x="0" y="38">Alloy: {alloy}</text>
                    <text x="0" y="50">C_d Friction: {dischargeCoeff.toFixed(2)}</text>
                    <text x="0" y="62">V_dry speed: {maxDryVelocity.toFixed(1)} m/s</text>
                    <text x="0" y="74">P_static: {maxStaticPressure} MPa</text>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* Telemetry Core KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 border-l-2 border-cyan-500 p-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Actual Flow Rate (Q)</span>
              <span className="text-base font-black font-mono text-cyan-400 mt-1 block">
                {operQ.toFixed(2)} L/s
              </span>
              <span className="text-[9px] text-slate-400 font-mono italic block mt-0.5">
                ({Math.round(operQ * 1000)} cc/s)
              </span>
            </div>

            <div className="bg-slate-950 border-l-2 border-amber-400 p-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Gate Pressure (P_gate)</span>
              <span className="text-base font-black font-mono text-amber-400 mt-1 block">
                {operP.toFixed(1)} MPa
              </span>
              <span className="text-[9px] text-slate-400 font-mono italic block mt-0.5">
                ({(operP * 10.197).toFixed(0)} kg/cm²)
              </span>
            </div>

            <div className="bg-slate-950 border-l-2 border-emerald-500 p-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Gate Velocity (V_gate)</span>
              <span className={`text-base font-black font-mono mt-1 block ${
                operGateVel >= minVelocityLimit && operGateVel <= maxVelocityLimit ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {operGateVel.toFixed(1)} m/s
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">
                Range: {minVelocityLimit}—{maxVelocityLimit}
              </span>
            </div>

            <div className="bg-slate-950 border-l-2 border-rose-500 p-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Chamber Fill Time</span>
              <span className={`text-base font-black font-mono mt-1 block ${
                operQ >= qMinFill ? 'text-emerald-400' : 'text-rose-450'
              }`}>
                {operQ > 0 ? ((cavityVolume / (operQ * 1000)) * 1000).toFixed(1) : '∞'} ms
              </span>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                Max Allowable: {activeFillTimeLimit} ms
              </span>
            </div>

          </div>

          {/* Diagnostic Warnings / Recommendation Engine */}
          <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block tracking-wider">
              Diagnostic Assistant & Optimization Recommendations
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Velocity Check */}
              <div className="bg-slate-900 border border-slate-850 p-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block pb-1 border-b border-slate-950">Velocity Compliance</span>
                {operGateVel < minVelocityLimit ? (
                  <p className="text-orange-400 leading-normal text-[11px]">
                    ⚠️ <b>SPEED TOO SLOW ({operGateVel.toFixed(1)} m/s):</b> Liquid is stream-spraying. Action: Increase machine speed plunger, or choose a smaller plunger diameter, or choke down the gate area.
                  </p>
                ) : operGateVel > maxVelocityLimit ? (
                  <p className="text-orange-450 leading-normal text-[11px]">
                    ⚠️ <b>SPEED TOO FAST ({operGateVel.toFixed(1)} m/s):</b> Risk of gate soldering. Action: Increase gate area, or slow down fast shot speed plunger.
                  </p>
                ) : (
                  <p className="text-emerald-400 leading-normal text-[11px]">
                    ✅ <b>OPTIMAL SPEED ({operGateVel.toFixed(1)} m/s):</b> Atomized mist. Good balance of mold life & defect evasion.
                  </p>
                )}
              </div>

              {/* Solidification Fill check */}
              <div className="bg-slate-900 border border-slate-850 p-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block pb-1 border-b border-slate-950">Solidification Compliance</span>
                {operQ < qMinFill ? (
                  <p className="text-rose-400 leading-normal text-[11px]">
                    ❌ <b>FILL TOO SLOW:</b> Fill time ({operQ > 0 ? ((cavityVolume / (operQ * 1000)) * 1000).toFixed(1) : '0'}ms) exceeds alloy's limit ({activeFillTimeLimit}ms). Cold shut danger. Action: Boost fast shot speed plunger, or pick a wider plunger.
                  </p>
                ) : (
                  <p className="text-emerald-400 leading-normal text-[11px]">
                    ✅ <b>FAST FILL RATE:</b> Cavity fills in time ({operQ > 0 ? ((cavityVolume / (operQ * 1000)) * 1000).toFixed(1) : '0'}ms), beating solidification limits safely.
                  </p>
                )}
              </div>

              {/* Compaction check */}
              <div className="bg-slate-900 border border-slate-850 p-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block pb-1 border-b border-slate-950">Pressure Compaction</span>
                {operP < pMinCompaction ? (
                  <p className="text-orange-400 leading-normal text-[11px]">
                    ⚠️ <b>PRESSURE TOO LOW ({operP.toFixed(1)} MPa):</b> Porosity risk. Action: Raise maximum machine pressure slider, or downsize shot plunger diameter.
                  </p>
                ) : (
                  <p className="text-emerald-400 leading-normal text-[11px]">
                    ✅ <b>GOOD COMPACTION:</b> Operating pressure of {operP.toFixed(1)} MPa exceeds the necessary {pMinCompaction} MPa threshold for high density casting.
                  </p>
                )}
              </div>

              {/* Clamping check */}
              <div className="bg-slate-900 border border-slate-850 p-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block pb-1 border-b border-slate-950">Die Parting Lock</span>
                {operP > pMaxClamping ? (
                  <p className="text-rose-400 leading-normal text-[11px]">
                    ❌ <b>FLASH DEFECT ALERT:</b> Metal pressure ({operP.toFixed(1)} MPa) is more than Clamping Lock capacity ({pMaxClamping.toFixed(0)} MPa)! Action: Limit casting pressure or shift to a stronger machine mold clamp.
                  </p>
                ) : (
                  <p className="text-emerald-400 leading-normal text-[11px]">
                    ✅ <b>CLAMP CLOCKED SAFE:</b> Metal pressure remains safely below clamping yield limits. Mold lock holds with complete security.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Informational Guidance on PQ2 */}
          <div className="bg-slate-950 p-4 border border-slate-850 text-xs font-mono leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[11px]">
              <Info className="h-4 w-4" />
              <span>Gating Engineering Note: What is PQ²?</span>
            </div>
            <p className="text-slate-400 text-xs">
              In High Pressure Die Casting (HPDC), part quality is heavily governed by filling dynamics. 
              The <b>PQ² chart</b> coordinates the pressure loss of fluid flowing through the gating choke area (represented as the yellow <b>Die Gating Parabola</b>) with the hydraulic ability of the injection system (represented as the blue <b>Machine Power Line</b>).
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed pt-1.5">
              To achieve premium cast characteristics, the intersection point must sit safely within the green <b>Process Window</b>. If it falls too low, the metal will solidify premature. If too high, the machine will spray flash or erode the gates. Adjust Plunger diameter and Gate Area outputs continuously to calibrate.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

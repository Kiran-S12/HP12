import React from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';
import { Info, Gauge, ShieldCheck, ShieldAlert, Layers } from 'lucide-react';

interface CylinderCalculationProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
  onChange: (field: keyof HPDCInputs, value: any) => void;
}

export function CylinderCalculation({ inputs, outputs, onChange }: CylinderCalculationProps) {
  // Safe default fallback retrieval
  const cylinder_bore = inputs.cylinder_bore ?? 63;
  const cylinder_rod = inputs.cylinder_rod ?? 28;
  const contact_area = inputs.contact_area ?? 20629;
  const projected_core_area = inputs.projected_core_area ?? 16620;
  const slide_length = inputs.slide_length ?? 15;
  const wall_thickness = inputs.wall_thickness ?? 8;
  const pressure_factor = inputs.pressure_factor ?? 0.34;
  const cooling_stress = inputs.cooling_stress ?? 28;
  const core_casting_pressure = inputs.core_casting_pressure ?? 750;
  const hydraulic_system_pressure = inputs.hydraulic_system_pressure ?? 160;

  return (
    <div className="space-y-6" id="cylinder-tab">
      {/* Tab Highlight Card */}
      <div className="bg-slate-900 border-l-4 border-cyan-500 p-4 shadow-xl">
        <h3 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2 uppercase">
          <Layers className="h-4 w-4 text-cyan-500" />
          Hydraulic Core-Pull Cylinder Calculations
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Simulate core pulling & extraction forces under high pressure die casting (HPDC) following NADCA standard guidelines (Method 01 & 02). Compare casting pressures against hydraulic cylinder mechanical capacities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Adjustable Controls */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-xl">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1">
            Core & Cylinder Parameters
          </h4>

          {/* Cylinder Dimensions */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">Cylinder Physical Assembly</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Bore Diameter (mm)</label>
                <input 
                  type="number"
                  step="1"
                  min="20"
                  max="300"
                  value={cylinder_bore}
                  onChange={(e) => onChange('cylinder_bore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-bore-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Rod Diameter (mm)</label>
                <input 
                  type="number"
                  step="1"
                  min="10"
                  max="200"
                  value={cylinder_rod}
                  onChange={(e) => onChange('cylinder_rod', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-rod-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Sys Pressure (kg/cm²)</label>
                <input 
                  type="number"
                  step="5"
                  min="50"
                  max="400"
                  value={hydraulic_system_pressure}
                  onChange={(e) => onChange('hydraulic_system_pressure', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-sys-p-input"
                />
                <span className="text-[8px] text-slate-500 font-mono">1 kg/cm² ≈ 0.098 bar</span>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Casting Press (kg/cm²)</label>
                <input 
                  type="number"
                  step="10"
                  min="100"
                  max="1500"
                  value={core_casting_pressure}
                  onChange={(e) => onChange('core_casting_pressure', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-cast-p-input"
                />
              </div>
            </div>
          </div>

          {/* Slide Properties */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">Slide / Joint Interface</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Contact Area (mm²)</label>
                <input 
                  type="number"
                  step="100"
                  min="1000"
                  value={contact_area}
                  onChange={(e) => onChange('contact_area', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-contact-area-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Proj Core Area (mm²)</label>
                <input 
                  type="number"
                  step="100"
                  min="1000"
                  value={projected_core_area}
                  onChange={(e) => onChange('projected_core_area', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-projected-core-area-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Slide Length (mm)</label>
                <input 
                  type="number"
                  step="1"
                  min="1"
                  value={slide_length}
                  onChange={(e) => onChange('slide_length', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-slide-length-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Wall Thickness (mm)</label>
                <input 
                  type="number"
                  step="1"
                  min="1"
                  value={wall_thickness}
                  onChange={(e) => onChange('wall_thickness', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-wall-thickness-input"
                />
              </div>
            </div>
          </div>

          {/* Constants (NADCA Coefficients) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">Standard Safety Constants</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase" title="Pressure factor for shrinkage friction">Press Factor (N/mm²)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.5"
                  value={pressure_factor}
                  onChange={(e) => onChange('pressure_factor', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-press-factor-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase" title="Inter-atomic cooldown thermal shrinkage stress">Cooling Stress (MPa)</label>
                <input 
                  type="number"
                  step="1"
                  min="5"
                  max="100"
                  value={cooling_stress}
                  onChange={(e) => onChange('cooling_stress', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="cyl-cooling-stress-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Assembly Schematics & Core calculations outputs */}
        <div className="md:col-span-7 space-y-6">
          {/* Schematic visual visualization */}
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 block">Cylinder Chamber Status Map</span>
            
            <div className="flex flex-col items-center justify-center py-6 bg-slate-950 border border-slate-850 p-4 rounded-none relative overflow-hidden">
              {/* Cylinder Assembly block */}
              <div className="flex items-center w-full max-w-sm justify-center relative">
                {/* Cylinder block barrel */}
                <div className="h-16 w-36 bg-slate-900 border-2 border-slate-700 relative flex items-center justify-start rounded-l-md">
                  {/* Left pressure inlet */}
                  <div className="absolute top-[-8px] left-4 h-2 w-3 bg-slate-700"></div>
                  {/* Right pressure inlet */}
                  <div className="absolute top-[-8px] right-4 h-2 w-3 bg-slate-700"></div>

                  {/* Chamber side head (Push Chamber) - dynamic green sizing based on force */}
                  <div 
                    className="h-full bg-emerald-950/40 border-r border-emerald-500/30 transition-all duration-300" 
                    style={{ width: '45%' }}
                  >
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">Push chamber</span>
                    </div>
                  </div>

                  {/* Piston Disc */}
                  <div className="h-full w-4 bg-slate-500 border-x border-slate-400 relative z-10 flex flex-col justify-between">
                    <div className="h-2 w-full bg-slate-400"></div>
                    <div className="h-2 w-full bg-slate-400"></div>
                  </div>

                  {/* Chamber side rod (Pull Chamber) - dynamic blue sizing */}
                  <div className="h-full flex-grow bg-cyan-950/30 transition-all duration-300 relative">
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase">Pull chamber</span>
                    </div>
                  </div>
                </div>

                {/* Rod shaft */}
                <div className="h-6 w-28 bg-slate-400 border-y border-r border-slate-500 rounded-r-md flex items-center justify-end pr-3">
                  <span className="text-[8px] font-bold text-slate-950 uppercase font-mono">ø {cylinder_rod}mm</span>
                </div>
              </div>

              {/* Force directional labels */}
              <div className="w-full max-w-sm flex justify-between text-[10px] font-mono mt-4 text-slate-400 px-2 border-t border-slate-900 pt-3">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400">➡</span> Bore area: <b className="text-slate-100">{outputs.hyd_piston_area.toFixed(1)} cm²</b>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-cyan-400">⬅</span> Pull area: <b className="text-slate-100">{outputs.hyd_net_pull_area.toFixed(1)} cm²</b>
                </span>
              </div>
            </div>
          </div>

          {/* Core computations table & KPIs */}
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-black tracking-[0.15em] text-cyan-500 uppercase">Mechanical Safety Compliance Analysis</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Push Action Analysis */}
              <div className={`p-4 border rounded-none ${outputs.piston_push_status ? 'border-emerald-900 bg-emerald-950/10' : 'border-rose-900 bg-rose-950/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">CORE LOCK (PUSH FORCE)</span>
                  {outputs.piston_push_status ? (
                    <span className="text-[9px] bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold px-2 py-0.5 rounded-none font-mono">✔ COMPLIANT</span>
                  ) : (
                    <span className="text-[9px] bg-rose-950 border border-rose-600 text-rose-400 font-bold px-2 py-0.5 rounded-none font-mono">🚨 UNDERPOWER</span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Force Required (+25%):</span>
                    <span className="font-mono text-slate-200">{outputs.calc_push_force_req.toFixed(1)} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Cylinder:</span>
                    <span className="font-mono text-slate-200">{outputs.piston_push_force.toFixed(1)} Kg</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 text-[10px] leading-relaxed text-slate-400 font-mono">
                    {outputs.piston_push_status 
                      ? 'The cylinder push stroke provides sufficient force to resist liquid metal shock waves at peak casting pressure.' 
                      : 'WARNING: Casting metal pressure is high enough to slide or eject the core cylinder backward, leading to severe dimensional flash! Use a larger bore diameter.'
                    }
                  </div>
                </div>
              </div>

              {/* Pull Action Analysis */}
              <div className={`p-4 border rounded-none ${outputs.piston_pull_status ? 'border-emerald-900 bg-emerald-950/10' : 'border-rose-900 bg-rose-950/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">CORE PULLED (NADCA 1 FORCE)</span>
                  {outputs.piston_pull_status ? (
                    <span className="text-[9px] bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold px-2 py-0.5 rounded-none font-mono">✔ COMPLIANT</span>
                  ) : (
                    <span className="text-[9px] bg-rose-950 border border-rose-600 text-rose-400 font-bold px-2 py-0.5 rounded-none font-mono">🚨 CORE STUCK</span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method 01 (Max Friction):</span>
                    <span className="font-mono text-slate-200">{outputs.calc_pull_force_req_nadca01.toFixed(1)} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method 02 (Standard):</span>
                    <span className="font-mono text-slate-200">{outputs.calc_pull_force_req_nadca02.toFixed(1)} Kg</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-850 pt-1">
                    <span className="text-slate-400 font-semibold">Cylinder Extraction Force:</span>
                    <span className="font-mono text-cyan-400 font-bold">{outputs.piston_pull_force.toFixed(1)} Kg</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 text-[10px] leading-relaxed text-slate-400 font-mono">
                    {outputs.piston_pull_status 
                      ? 'Available retraction pull power is completely compliant. Standard shrinkage thermal stress is fully overcome.'
                      : 'DANGER: Selected cylinder net pulling force is insufficient to overcome Al thermal shrinkage tension stress. The core slide will get permanently stuck in casting!'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* In-depth standard equation detail */}
            <div className="bg-slate-950 border border-slate-850 p-3 flex gap-2 rounded-none text-[10px] leading-relaxed text-slate-400 font-mono">
              <Info className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <b className="text-slate-300">NADCA Methodologies:</b>
                <p className="mt-0.5">Method 1 (High thermal lock friction factor <b className="text-slate-200">0.01507</b>) compensates for high heat alloys or dry sliders. Method 2 (Low thermal friction factor <b className="text-slate-200">0.01163</b>) is valid for well-lubricated cores. Pull force contains a mandatory <b className="text-slate-200">25% safety factor</b> built-in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

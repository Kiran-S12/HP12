import React from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';
import { Info, Gauge, Compass, AlertTriangle } from 'lucide-react';

interface TieBarBalanceProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
  onChange: (field: keyof HPDCInputs, value: any) => void;
}

export function TieBarBalance({ inputs, outputs, onChange }: TieBarBalanceProps) {
  // Fallbacks
  const tb_proj_area = inputs.tie_bar_total_projected_area ?? 400;
  const tb_inj_pressure = inputs.tie_bar_injection_pressure ?? 800;
  const tb_distance = inputs.tie_bar_distance ?? 630;
  const tb_selected_machine = inputs.tie_bar_selected_machine ?? 420;
  const tb_centroid_x = inputs.centroid_x ?? 0.20;
  const tb_centroid_y = inputs.centroid_y ?? -1.50;

  // Average force per bar
  const f_avg = outputs.tie_bar_calc_tonnage / 4;
  
  // Calculate load distribution percentage deviations
  const dev_f1 = ((outputs.tie_bar_f1 - f_avg) / f_avg) * 100;
  const dev_f2 = ((outputs.tie_bar_f2 - f_avg) / f_avg) * 100;
  const dev_f3 = ((outputs.tie_bar_f3 - f_avg) / f_avg) * 100;
  const dev_f4 = ((outputs.tie_bar_f4 - f_avg) / f_avg) * 100;

  const isHighlyEccentric = Math.abs(tb_centroid_x) > 3.0 || Math.abs(tb_centroid_y) > 3.0;

  // Map offsets to visual coordinates (magnified for visibility, e.g. 10x)
  const visual_offset_x = tb_centroid_x * 8; // scale factor
  const visual_offset_y = -tb_centroid_y * 8; // invert Y for SVG

  return (
    <div className="space-y-6" id="tiebar-tab">
      {/* Tab Highlight Card */}
      <div className="bg-slate-900 border-l-4 border-cyan-500 p-4 shadow-xl">
        <h3 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2 uppercase">
          <Compass className="h-4 w-4 text-cyan-500" />
          Platen Tie Bar Load Balance Sheet
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Perform a moment-balance analysis of clamping tie bars based on the product centroid offset. Unequal loading causes platen tilting, uneven die lock pressures, and parting line flash failures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left columns: Platen Die config inputs */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-xl">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1">
            Platen & Load Center Parameters
          </h4>

          {/* Area & Pressure inputs */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">Clamping Injection Load</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Total Projected Area (cm²)</label>
                <input 
                  type="number"
                  step="5"
                  min="50"
                  max="2000"
                  value={tb_proj_area}
                  onChange={(e) => onChange('tie_bar_total_projected_area', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-proj-area-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Injection Pressure (kg/cm²)</label>
                <input 
                  type="number"
                  step="10"
                  min="200"
                  max="1500"
                  value={tb_inj_pressure}
                  onChange={(e) => onChange('tie_bar_injection_pressure', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-inj-p-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Tie Bar Distance (mm)</label>
                <input 
                  type="number"
                  step="10"
                  min="200"
                  max="2000"
                  value={tb_distance}
                  onChange={(e) => onChange('tie_bar_distance', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-dist-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Machine Rating (Tons)</label>
                <input 
                  type="number"
                  step="10"
                  min="50"
                  max="3000"
                  value={tb_selected_machine}
                  onChange={(e) => onChange('tie_bar_selected_machine', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-rating-input"
                />
              </div>
            </div>
          </div>

          {/* Centroid Offsets inputs */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-cyan-500 uppercase font-black tracking-wider block">Injection Force Centroid Offset</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Centroid Offset X (mm)</label>
                <input 
                  type="number"
                  step="0.05"
                  min="-150"
                  max="150"
                  value={tb_centroid_x}
                  onChange={(e) => onChange('centroid_x', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-centroid-x-input"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Centroid Offset Y (mm)</label>
                <input 
                  type="number"
                  step="0.05"
                  min="-150"
                  max="150"
                  value={tb_centroid_y}
                  onChange={(e) => onChange('centroid_y', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                  id="tb-centroid-y-input"
                />
              </div>
            </div>
          </div>

          {/* Machine Clamping Efficiency */}
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-none space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 font-mono">CLAMP TENSION LOAD PERCENTAGE:</span>
            <div className="flex justify-between items-center text-sm font-mono font-bold mt-1">
              <span className="text-slate-400">Total Force:</span>
              <span className="text-cyan-400">{outputs.tie_bar_calc_tonnage.toFixed(1)} Tons</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1 leading-normal font-mono">
              The required clamping force for this setup takes up <b className="text-slate-400">{((outputs.tie_bar_calc_tonnage / tb_selected_machine) * 100).toFixed(1)}%</b> of the machine's rated capacity ({tb_selected_machine} Ton).
            </div>
          </div>
        </div>

        {/* Right columns: Load balance visual sheet and details */}
        <div className="md:col-span-7 space-y-6 animate-fade-in">
          {/* Graphical platen balance load map */}
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">2D Platen Load eccentricity mapping</span>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-850 rounded-none relative">
              {/* Platen representation */}
              <div className="relative w-64 h-64 border-4 border-slate-800 bg-slate-900/50 flex items-center justify-center rounded-sm shadow-inner">
                {/* Horizontal center guideline */}
                <div className="absolute left-0 right-0 h-[1px] bg-slate-800 border-dashed"></div>
                {/* Vertical center guideline */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-slate-800 border-dashed"></div>

                {/* Corner Tie Bars (F1, F2, F3, F4) */}
                {/* Top Left - F1 */}
                <div className="absolute -top-3 -left-3 h-8 w-8 bg-slate-950 border-2 border-slate-700 rounded-full flex flex-col items-center justify-center shadow-lg" title="Tie Bar 1 (Top-Left)">
                  <span className="text-[7px] text-slate-550 font-bold leading-none">F1</span>
                  <span className={`text-[8px] font-mono font-black ${dev_f1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{outputs.tie_bar_f1.toFixed(1)}t</span>
                </div>

                {/* Top Right - F2 */}
                <div className="absolute -top-3 -right-3 h-8 w-8 bg-slate-950 border-2 border-slate-700 rounded-full flex flex-col items-center justify-center shadow-lg" title="Tie Bar 2 (Top-Right)">
                  <span className="text-[7px] text-slate-550 font-bold leading-none">F2</span>
                  <span className={`text-[8px] font-mono font-black ${dev_f2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{outputs.tie_bar_f2.toFixed(1)}t</span>
                </div>

                {/* Bottom Left - F3 */}
                <div className="absolute -bottom-3 -left-3 h-8 w-8 bg-slate-950 border-2 border-slate-700 rounded-full flex flex-col items-center justify-center shadow-lg" title="Tie Bar 3 (Bottom-Left)">
                  <span className="text-[7px] text-slate-550 font-bold leading-none">F3</span>
                  <span className={`text-[8px] font-mono font-black ${dev_f3 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{outputs.tie_bar_f3.toFixed(1)}t</span>
                </div>

                {/* Bottom Right - F4 */}
                <div className="absolute -bottom-3 -right-3 h-8 w-8 bg-slate-950 border-2 border-slate-700 rounded-full flex flex-col items-center justify-center shadow-lg" title="Tie Bar 4 (Bottom-Right)">
                  <span className="text-[7px] text-slate-550 font-bold leading-none">F4</span>
                  <span className={`text-[8px] font-mono font-black ${dev_f4 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{outputs.tie_bar_f4.toFixed(1)}t</span>
                </div>

                {/* Center Core mold envelope representation */}
                <div className="h-32 w-32 border border-cyan-800/30 bg-cyan-950/5 relative flex items-center justify-center font-bold text-slate-600 text-[9px] uppercase font-mono tracking-wider text-center select-none rounded">
                  Active Die Area Box
                </div>

                {/* Visual Offset Marker */}
                <div 
                  className="absolute h-5 w-5 bg-rose-500/20 border border-rose-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-10"
                  style={{
                    transform: `translate(${visual_offset_x}px, ${visual_offset_y}px)`
                  }}
                  title={`Injection Centroid: (${tb_centroid_x}mm, ${tb_centroid_y}mm)`}
                >
                  <div className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 mt-5 leading-normal text-center bg-slate-950 px-3 py-1.5 border border-slate-900 w-full">
                X/Y Offset Marker represents injection centroid coordinates relative to geometric center.
              </div>
            </div>
          </div>

          {/* Load values display & calculations summary list */}
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-black tracking-[0.15em] text-cyan-500 uppercase">Tie Bar Strain Equilibrium Distribution</h4>

            {isHighlyEccentric && (
              <div className="p-3 bg-amber-950/20 border border-amber-800 text-amber-400 flex gap-2 text-xs rounded-none font-mono leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <b>High eccentric load warned!</b>
                  <p>Geometric offsets exceed 3mm vertical or horizontal. This causes uneven parting plane loading. High flash danger exists on lower-pressure corners.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Load equilibrium sums */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 space-y-2 rounded-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Vertical Symmetry</span>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1 + F2 (Top Half):</span>
                    <span className="text-slate-200 font-bold">{outputs.tie_bar_f1_plus_f2.toFixed(2)} Tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F3 + F4 (Bottom Half):</span>
                    <span className="text-slate-200 font-bold">{outputs.tie_bar_f3_plus_f4.toFixed(2)} Tons</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-900 text-cyan-400 font-semibold text-[10px]">
                    <span>Left-Rig Eccent Ratio (F1/F2):</span>
                    <span>{outputs.tie_bar_f1_ratio_f2.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400 font-semibold text-[10px]">
                    <span>Left-Rig Eccent Ratio (F4/F3):</span>
                    <span>{outputs.tie_bar_f4_ratio_f3.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Equilibrium breakdown percentages */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 space-y-2 rounded-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block font-bold text-slate-350">Corner Load Split Deviation</span>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1 (Top-Left):</span>
                    <span className={`${dev_f1 >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>
                      {dev_f1 >= 0 ? '+' : ''}{dev_f1.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F2 (Top-Right):</span>
                    <span className={`${dev_f2 >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>
                      {dev_f2 >= 0 ? '+' : ''}{dev_f2.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F3 (Bottom-Left):</span>
                    <span className={`${dev_f3 >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>
                      {dev_f3 >= 0 ? '+' : ''}{dev_f3.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F4 (Bottom-Right):</span>
                    <span className={`${dev_f4 >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>
                      {dev_f4 >= 0 ? '+' : ''}{dev_f4.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3 flex gap-2 rounded-none text-[10px] leading-relaxed text-slate-400 font-mono">
              <Info className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <b className="text-slate-300">Strain Equilibrium Standard:</b>
                <p className="mt-0.5">Tie bar deviation values should stay within <b className="text-slate-200">±2.0%</b> to keep platen expansion uniform. Offsets exceeding this range require shifting helper runners or modifying cooling lines to balance expansion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

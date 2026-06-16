/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';
import { ALLOYS, GATE_THICKNESS_RECOMMENDATIONS } from '../constants';
import { Shield, Sparkles, SlidersHorizontal, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface GatingReferenceProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
}

export const GatingReference: React.FC<GatingReferenceProps> = ({ inputs, outputs }) => {
  const { casting_thickness, alloy, select_clamping = inputs.selected_clamping } = inputs;
  const { metal_speed_gate, filling_ratio, spare_force_ratio, j_passed, j_actual, j_required } = outputs;

  // Selected alloy parameters
  const currentAlloy = ALLOYS.find(a => a.name === alloy) || ALLOYS[0];

  // Determine active row in recommended thickness table
  let activeThicknessIndex = -1;
  const thicknessVal = casting_thickness;
  if (thicknessVal > 0 && thicknessVal <= 1.5) {
    activeThicknessIndex = 0;
  } else if (thicknessVal > 1.5 && thicknessVal <= 2.5) {
    activeThicknessIndex = 1;
  } else if (thicknessVal > 2.5 && thicknessVal <= 4.0) {
    activeThicknessIndex = 2;
  } else if (thicknessVal > 4.0) {
    activeThicknessIndex = 3;
  }

  // Guidelines warnings
  const warnings: { type: 'success' | 'warning' | 'danger'; title: string; message: string; icon: any }[] = [];

  // 1. Gate velocity check
  if (metal_speed_gate < currentAlloy.minGateVelocity) {
    warnings.push({
      type: 'danger',
      title: 'Gate Speed Too Low',
      message: `Calculated gate speed (${metal_speed_gate.toFixed(1)} m/s) is lower than the recommended minimum of ${currentAlloy.minGateVelocity} m/s for ${currentAlloy.name}. This is highly likely to cause low-atomization gating, poor superficial cosmetics, cold shuts, and air entrapment.`,
      icon: AlertTriangle
    });
  } else if (metal_speed_gate > currentAlloy.maxGateVelocity) {
    warnings.push({
      type: 'warning',
      title: 'Gate Speed Exceeds Limits',
      message: `Calculated gate speed (${metal_speed_gate.toFixed(1)} m/s) exceeds the recommended maximum of ${currentAlloy.maxGateVelocity} m/s. High velocities trigger severe die erosion, thermal wash out, and rapid wear of the gating inlet inserts.`,
      icon: AlertTriangle
    });
  } else {
    warnings.push({
      type: 'success',
      title: 'Gate Velocity Optimal',
      message: `Gate velocity (${metal_speed_gate.toFixed(1)} m/s) is within the recommended theoretical window (${currentAlloy.minGateVelocity} - ${currentAlloy.maxGateVelocity} m/s).`,
      icon: CheckCircle2
    });
  }

  // 2. Filling Ratio check
  if (filling_ratio < 30) {
    warnings.push({
      type: 'danger',
      title: 'Extremely Low Sleeve Filling Ratio',
      message: `The shot sleeve fill ratio is ${filling_ratio.toFixed(1)}%, which is below the safe threshold of 30%. Excessive air in the shot sleeve will be trapped during slow shot pre-acceleration, generating high injection-induced porosity. Consider using a smaller shot sleeve or smaller plunger tip if appropriate.`,
      icon: AlertTriangle
    });
  } else if (filling_ratio > 55) {
    warnings.push({
      type: 'warning',
      title: 'High Sleeve Filling Ratio',
      message: `The fill ratio is ${filling_ratio.toFixed(1)}% (exceeding standard 55%). While air entrapment is lowered, the liquid pool is vulnerable to spillbacks over the sleeve port during pour cycles or premature freezing before the plunger kicks forward.`,
      icon: AlertTriangle
    });
  } else {
    warnings.push({
      type: 'success',
      title: 'Optimal Sleeve Fill Ratio',
      message: `Sleeve fill percentage (${filling_ratio.toFixed(1)}%) is fully within the highly recommended 30% - 55% window, minimizing turbulence wave actions and gas entrapments.`,
      icon: CheckCircle2
    });
  }

  // 3. Atomization J-number check
  if (!j_passed) {
    warnings.push({
      type: 'danger',
      title: 'Incomplete Fluid Atomization',
      message: `Wallace J-number (${Math.round(j_actual)}) is below the required benchmark (${j_required}) for ${currentAlloy.name}. The die cavity will fill in a solid/unstable splashing stream rather than an atomized liquid spray, risking severe inner voids and localized cold folds.`,
      icon: Sparkles
    });
  } else {
    warnings.push({
      type: 'success',
      title: 'Atomized Flow Confirmed',
      message: `Wallace J-number (${Math.round(j_actual)}) comfortably satisfies the required atomization threshold (${j_required}).`,
      icon: CheckCircle2
    });
  }

  // 4. Clamping Force Tonnage
  if (spare_force_ratio < 0) {
    warnings.push({
      type: 'danger',
      title: 'DIE FLASH RISK: Required Clamping Exceeds Capacity',
      message: `The selected clamping force (${select_clamping} Tons) is lower than the calculated safety clamp pressure force required (${(outputs.clamping_required).toFixed(1)} Tons). This will result in parting plane deflection, molten metal flashing, weight inconsistencies, and severe safety hazards!`,
      icon: Shield
    });
  } else if (spare_force_ratio < 15) {
    warnings.push({
      type: 'warning',
      title: 'Low Clamping Force Margin',
      message: `The selected clamping capacity leaves a very tight pressure buffer margin of only ${spare_force_ratio.toFixed(1)}%. It is highly recommended to maintain at least a 15% safety factor to absorb high intensification shock waves.`,
      icon: Shield
    });
  } else {
    warnings.push({
      type: 'success',
      title: 'Clamping Tonnage Safe',
      message: `Selected clamping capacity has a comfortable safety margin of ${spare_force_ratio.toFixed(1)}% over the peak casting pressure.`,
      icon: CheckCircle2
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="gating-reference">
      {/* Dynamic Guideline Tables */}
      <div className="xl:col-span-2 space-y-6">
        {/* Table 1: Thickness recommendations */}
        <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
            <h3 className="text-xs font-black tracking-wider text-slate-100 uppercase">
              NADCA Gate Thickness Recommendations vs Wall Thickness
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Casting Min Wall (mm)</th>
                  <th className="py-2.5 px-3">Aluminium Gate t (mm)</th>
                  <th className="py-2.5 px-3">Zinc Gate t (mm)</th>
                  <th className="py-2.5 px-3">Magnesium Gate t (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {GATE_THICKNESS_RECOMMENDATIONS.map((row, idx) => {
                  const isActive = idx === activeThicknessIndex;
                  return (
                    <tr 
                      key={idx} 
                      className={`transition-all ${
                        isActive 
                          ? 'bg-cyan-950/30 border-l-4 border-l-cyan-600 text-cyan-200 font-bold' 
                          : 'text-slate-400 hover:bg-slate-950/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        {idx === 0 ? '0.75 - 1.50' : ''}
                        {idx === 1 ? '1.51 - 2.50' : ''}
                        {idx === 2 ? '2.51 - 4.00' : ''}
                        {idx === 3 ? '4.01 - 6.00' : ''}
                        {isActive && <span className="ml-2 text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-1.5 py-0.5 rounded-none font-mono font-bold uppercase">Match</span>}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{row.aluminum.toFixed(3)} mm</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{row.zinc.toFixed(3)} mm</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{row.magnesium.toFixed(3)} mm</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 items-start mt-4 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-none border border-slate-850">
            <Info className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
            <p>
              The system automatically scans your inputted maximum target wall thickness (<span className="font-semibold text-slate-200 font-mono">{casting_thickness} mm</span>) and highlights the corresponding NADCA design recommendation row. This provides casting mold die-makers with a solid starting baseline.
            </p>
          </div>
        </div>

        {/* Table 2: Recommended Velocities */}
        <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
            <h3 className="text-xs font-black tracking-wider text-slate-100 uppercase">
              Recommended Gating Velocity Limits & J-benchmark
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Alloy Type</th>
                  <th className="py-2.5 px-3">Min Gate Velocity (Vg)</th>
                  <th className="py-2.5 px-3">Max Gate Velocity (Vg)</th>
                  <th className="py-2.5 px-3">Wallace Atomization J-req</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {ALLOYS.map((alloySpec, idx) => {
                  const isActive = alloySpec.name === alloy;
                  return (
                    <tr 
                      key={idx} 
                      className={`transition-all ${
                        isActive 
                          ? 'bg-cyan-950/30 border-l-4 border-l-cyan-600 text-cyan-200 font-bold' 
                          : 'text-slate-400 hover:bg-slate-950/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-300">{alloySpec.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{alloySpec.minGateVelocity.toFixed(1)} m/s</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{alloySpec.maxGateVelocity.toFixed(1)} m/s</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{alloySpec.requiredJNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Warnings list */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-500" />
          Realtime Quality Audit
        </h3>

        <div className="space-y-3">
          {warnings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-5 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-450 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Perfect Design Profile!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your parameters sit perfectly in all gating, filling, and machine capacity design boundaries without error warnings.
              </p>
            </div>
          ) : (
            warnings.map((warn, i) => {
              const IconComp = warn.icon;
              return (
                <div 
                  key={i} 
                  className={`p-4 rounded-none border flex gap-3 items-start transition-all ${
                    warn.type === 'danger' 
                      ? 'bg-rose-950/40 border-rose-900/60 text-rose-200' 
                      : warn.type === 'warning' 
                        ? 'bg-amber-950/30 border-amber-900/50 text-amber-200' 
                        : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <IconComp className={`h-4 w-4 ${
                      warn.type === 'danger' 
                        ? 'text-rose-500' 
                        : warn.type === 'warning' 
                          ? 'text-amber-500' 
                          : 'text-emerald-500'
                    }`} />
                  </div>
                  <div>
                    <h5 className="font-bold text-[10px] uppercase tracking-wider font-mono leading-tight">{warn.title}</h5>
                    <p className="text-[11px] mt-1 leading-relaxed opacity-90 font-sans">{warn.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

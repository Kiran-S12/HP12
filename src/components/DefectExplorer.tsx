import React, { useState } from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';
import { ALLOYS } from '../constants';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  Gauge, 
  Wrench, 
  Search, 
  Info, 
  Activity, 
  CornerDownRight, 
  RotateCcw,
  Sliders
} from 'lucide-react';

interface DefectExplorerProps {
  inputs: HPDCInputs;
  outputs: HPDCOutputs;
}

interface DefectItem {
  id: string;
  name: string;
  category: 'Internal' | 'Surface' | 'Structural' | 'Dimensional';
  description: string;
  consequences: string;
  whyItHappens: string;
  
  // Real-time calculation triggers
  riskEvaluation: (inputs: HPDCInputs, outputs: HPDCOutputs) => {
    level: 'none' | 'low' | 'high' | 'critical';
    triggerReason: string;
    metrics: { label: string; current: string; recommended: string }[];
  };

  // Preventions
  dieDesignPreventions: {
    rule: string;
    details: string;
    icon: string;
  }[];
  processPreventions: {
    rule: string;
    details: string;
    icon: string;
  }[];

  // Visual styled rendering cue
  diagramType: 'voids' | 'spongy' | 'seam' | 'spitting' | 'soldering' | 'blister';
}

const DEFECTS_DATA: DefectItem[] = [
  {
    id: 'gas-porosity',
    name: 'Gas Porosity (Air Entrapment)',
    category: 'Internal',
    description: 'Rounded, smooth, shiny spherical cavities or bubbles trapped inside the casting walls.',
    consequences: 'Weakens mechanical tensile strength, forces scrap under pressure testing, and causes surface failures after post-casting painting or anodizing.',
    whyItHappens: 'High fast-shot turbulence or insufficient slow placement speed leaves air inside the sleeve which gets forced with the metal stream into the die. Volatile elements from over-lubricated mold sprays boil off into vapor pockets.',
    diagramType: 'voids',
    riskEvaluation: (inputs, outputs) => {
      const fillRatio = outputs.filling_ratio;
      const gateSpeed = outputs.metal_speed_gate;
      const currentAlloy = ALLOYS.find(a => a.name === inputs.alloy) || ALLOYS[0];
      
      const metrics = [
        { label: 'Sleeve Fill Ratio', current: `${fillRatio.toFixed(1)}%`, recommended: '30% - 55%' },
        { label: 'Gate Velocity', current: `${gateSpeed.toFixed(1)} m/s`, recommended: `${currentAlloy.minGateVelocity} - ${currentAlloy.maxGateVelocity} m/s` },
      ];

      if (fillRatio < 30) {
        return {
          level: 'high',
          triggerReason: `Sleeve fill ratio is extremely low (${fillRatio.toFixed(1)}%). Slow pre-acceleration fails to push air out, injecting a highly aerated metallic mousse.`,
          metrics
        };
      }
      
      if (gateSpeed > currentAlloy.maxGateVelocity + 15) {
        return {
          level: 'low',
          triggerReason: `Excessive gate velocity (${gateSpeed.toFixed(1)} m/s) triggers micro-turbulent atomization which grabs residual cavity gases before venting occurs.`,
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'Sleeve fill ratio and gating speed are in optimal ranges, indicating excellent aerodynamic control.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'Optimize Venting & Vacuum Valves',
        details: 'Ensure a total vent area equal to 20% to 30% of the runner gate area. Place vacuum blocks or heavy overflows at the last-filled zones.',
        icon: '💨'
      },
      {
        rule: 'Sleeve Diameter Tuning',
        details: 'Select a plunger diameter size to maintain sleeve filling ratio within 35-50% range to support continuous wave build.',
        icon: '📐'
      },
      {
        rule: 'Streamlined Runner Splitting',
        details: 'Use smooth radial curves rather than sharp sharp-corner bends. Avoid sudden runner volume expansion to prevent localized pressure drops.',
        icon: '🔀'
      }
    ],
    processPreventions: [
      {
        rule: 'Synchronize Slow Shot Phase',
        details: 'Reduce slow shot velocity during early plunger movement to allow the metal wave to rise smoothly and push air through the sprue without spilling.',
        icon: '⏱'
      },
      {
        rule: 'Reduce Plunger Lubricant Volume',
        details: 'Shorten spray release timing to prevent moisture pool condensation. Choose synthetic chemical lubricants with minimal water-dilution content.',
        icon: '💧'
      },
      {
        rule: 'Switch Transition Point',
        details: 'Delayed fast-shot start until the plunger has passed the pouring port entirely and gathered the full metal front.',
        icon: '🔛'
      }
    ]
  },
  {
    id: 'shrinkage-porosity',
    name: 'Shrinkage Porosity',
    category: 'Internal',
    description: 'Anisotropic, jagged spongy fissures or dendritic shrinkage voids usually located near thermal thick sections.',
    consequences: 'Creates structural weaknesses, causes leakages under leaks testing, and generates crack initiation focal points.',
    whyItHappens: 'Molten metals contract in volume upon phase transition from liquid to solid. If heavier sections cannot draw supplemental metal from feed gates, they solidify with deep cellular voids.',
    diagramType: 'spongy',
    riskEvaluation: (inputs, outputs) => {
      const activeIntensification = outputs.intensification_pressure;
      const castingPress = inputs.casting_pressure;
      
      const metrics = [
        { label: 'Casting Pressure', current: `${castingPress.toFixed(1)} MPa`, recommended: '60 - 100 MPa' },
        { label: 'Intensification Ratio', current: `${outputs.area_ratio.toFixed(2)}x`, recommended: '1.5x - 3.0x' },
      ];

      if (castingPress < 60) {
        return {
          level: 'high',
          triggerReason: `Casting feed pressure is critically low (${castingPress} MPa). Solidifying metal requires at least 65+ MPa of active squeeze force to collapse cellular shrinkage pockets.`,
          metrics
        };
      }

      if (outputs.area_ratio < 1.3) {
        return {
          level: 'low',
          triggerReason: `Low plunger intensifier area ratio (${outputs.area_ratio.toFixed(2)}) produces a weak squeeze vector during solidification.`,
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'High available casting pressure is active to feed solidifying grain expansions.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'Implement Direct Gate Feeds',
        details: 'Locate feed runners directly over heavy wall thicknesses to transfer solidification squeeze pressure straight to hot spots.',
        icon: '🔌'
      },
      {
        rule: 'Conformal Coolspot Bubbler',
        details: 'Install dedicated water spray bubblers or copper-fountain chill lines in the core steel core directly under massive zones.',
        icon: '❄'
      },
      {
        rule: 'Add Squeezing Pins (Local Squeeze)',
        details: 'Incorporate localized secondary mechanical squeeze pins (driven by compact cylinders) to push directly into sluggish hot spots.',
        icon: '📌'
      }
    ],
    processPreventions: [
      {
        rule: 'Maximize Fast Shot Squeeze Delay',
        details: 'Trigger pressure intensification immediately at the end of the mold filling phase (within <40 milliseconds) before gating freezes solid.',
        icon: '⚡'
      },
      {
        rule: 'Lower Melt Temperature',
        details: 'Run holding furnaces at the lowest possible fluid viscosity limit to reduce the total amount of thermal contraction.',
        icon: '🌡'
      },
      {
        rule: 'Increase Chill Dwell Time',
        details: 'Extend the timer between injection and opening of the main platen to ensure stable crystallization under pressure.',
        icon: '⌛'
      }
    ]
  },
  {
    id: 'cold-shuts',
    name: 'Cold Shuts, Folds & Misruns',
    category: 'Surface',
    description: 'Visible shallow grooves, flow line borders, or non-welded metallic seams in the outer cast skins.',
    consequences: 'Results in high aesthetic rejects, surface cracking during tapping/folding, and leaks.',
    whyItHappens: 'Two streams of molten metal meet at a distance but their fronts have lost heat, cooled too much, or oxidised. They fail to weld into a single solid crystalline structure.',
    diagramType: 'seam',
    riskEvaluation: (inputs, outputs) => {
      const gateSpeed = outputs.metal_speed_gate;
      const isAtomized = outputs.j_passed;
      const currentAlloy = ALLOYS.find(a => a.name === inputs.alloy) || ALLOYS[0];

      const metrics = [
        { label: 'Gate speed', current: `${gateSpeed.toFixed(1)} m/s`, recommended: `${currentAlloy.minGateVelocity} - ${currentAlloy.maxGateVelocity} m/s` },
        { label: 'Atomization J Index', current: `${outputs.j_actual.toFixed(0)}`, recommended: `≥ ${outputs.j_required}` },
      ];

      if (!isAtomized || gateSpeed < currentAlloy.minGateVelocity) {
        return {
          level: 'high',
          triggerReason: `Current process has failed Wallace Fluid Atomization (J-number is ${outputs.j_actual.toFixed(0)} < ${outputs.j_required}). The metal flows as a thick splashing wave front rather than an atomized heat-retaining mist.`,
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'High atomization rate ensures extremely rapid cavity dispersion before the fronts can freeze separately.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'Reduce Gating Gate Thickness',
        details: 'Reduce gate depth (e.g. from 1.5mm to 1.1mm) to throttle liquid under high shear, accelerating the liquid to fully atomized velocities.',
        icon: '✏'
      },
      {
        rule: 'Add Hot Overflow Collector Pods',
        details: 'Position voluminous secondary overflow pockets beyond the non-welded seam line to pull the sluggish chilled wave fronts out of the main cavity.',
        icon: '🪣'
      },
      {
        rule: 'Insulate Runner Splits',
        details: 'Design generous wide runner channels to hold a thick fluid volume, keeping thermal loss minimal prior to gate entry.',
        icon: '🔥'
      }
    ],
    processPreventions: [
      {
        rule: 'Raise Fast Shot Piston Speed',
        details: 'Turn up the fast-shot valve accumulator flow to fill the die cavity in under 40 milliseconds, raising kinetic heat friction.',
        icon: '🏎'
      },
      {
        rule: 'Increase holding melt temperature',
        details: 'Calibrate holding furnace thermal coils slightly higher (e.g., raise by +15°C) to elevate alloy initial enthalpy.',
        icon: '🔥'
      },
      {
        rule: 'Elevate Die Steel Preheating',
        details: 'Maintain thermal oil heater lines at 180°C - 240°C. Cold mold surfaces rapidly freeze thin metallic skins instantly.',
        icon: '🌡'
      }
    ]
  },
  {
    id: 'die-soldering',
    name: 'Die Soldering & Erosion (Washout)',
    category: 'Surface',
    description: 'Rough, cratered areas on the die steel or raised metal tearing/dragging scars on casting walls after core withdrawal.',
    consequences: 'Rapidly destroys expensive tool steel inserts, triggers dimensional scrap, and stalls continuous automatic production.',
    whyItHappens: 'High speed liquid aluminum strikes the hot H13 tool steel directly. The high shear action scrubs protective oxide layers off the steel, enabling the reactive Al and Fe alloy to bind chemically.',
    diagramType: 'soldering',
    riskEvaluation: (inputs, outputs) => {
      const gateSpeed = outputs.metal_speed_gate;
      const currentAlloy = ALLOYS.find(a => a.name === inputs.alloy) || ALLOYS[0];

      const metrics = [
        { label: 'Gate Velocity', current: `${gateSpeed.toFixed(1)} m/s`, recommended: `< ${currentAlloy.maxGateVelocity} m/s` },
        { label: 'Alloy Composition', current: inputs.alloy, recommended: 'High Silicon grades' },
      ];

      if (gateSpeed > currentAlloy.maxGateVelocity + 10) {
        return {
          level: 'high',
          triggerReason: `Gate velocity (${gateSpeed.toFixed(1)} m/s) is critically above limits, causing violent sandblasting/washout of tool steel cores. Protecting oxide scales are instantly stripped.`,
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'Gate speed is optimized to balance atomization without excessive kinetic friction on steel inserts.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'De-constrain Gate Angles',
        details: 'Do not aim incoming gate vents directly at critical cores or mold walls. Radius the impingement vectors by angled entries.',
        icon: '📐'
      },
      {
        rule: 'Apply Advanced PVD Coating',
        details: 'Coat vulnerable tool pins with high durability Chromium Nitride (CrN) or Titanium Aluminium Nitride (TiAlN) thin-film barriers.',
        icon: '🛡'
      },
      {
        rule: 'Increase Extraction Draft Taper',
        details: 'Modify core pull profiles to have at least 1.5 - 2.5 degrees of draft angle taper, reducing side wall rubbing.',
        icon: '📐'
      }
    ],
    processPreventions: [
      {
        rule: 'Calibrate Die Thermal Balance',
        details: 'Cool the specific areas of the die cavity showing soldiering tendencies. High temperatures accelerate Fe-Al phase bonding.',
        icon: '❄'
      },
      {
        rule: 'Boost Silicon Fluidity Inhibitors',
        details: 'Keep silicon concentrations optimal (alloy limits) to reduce chemical reactions with the tool steel.',
        icon: '🧪'
      },
      {
        rule: 'Optimize Spray Release Lube',
        details: 'Program specialized electrostatic robot nozzles to deposit premium anti-soldering shielding sprays on critical sliders.',
        icon: '💨'
      }
    ]
  },
  {
    id: 'die-flash',
    name: 'Parting Line Flash & Core Spitting',
    category: 'Dimensional',
    description: 'Thin, ragged sheets of metallic waste squeezing out between platen separation lines or slide gaps.',
    consequences: 'Depletes precious material, alters casting dimensions, blocks correct mold resealing, and creates explosive liquid metal safety risks.',
    whyItHappens: 'Active metal pressure and shock waves exceed the mechanical clamping force of the platen tie bars, causing local platen bending or opening.',
    diagramType: 'spitting',
    riskEvaluation: (inputs, outputs) => {
      const clampReserve = outputs.spare_force_ratio;
      const coreSafe = outputs.piston_push_status;
      const centroidX = inputs.centroid_x ?? 0;
      const centroidY = inputs.centroid_y ?? 0;

      const metrics = [
        { label: 'Clamping Force Reserve', current: `${clampReserve.toFixed(1)}%`, recommended: '≥ 15%' },
        { label: 'Core Locking Status', current: coreSafe ? 'Safe' : 'Underpower', recommended: 'Safe' },
        { label: 'Centroid Offset X/Y', current: `(${centroidX}, ${centroidY}) mm`, recommended: '< ±3.0 mm' },
      ];

      if (clampReserve < 0) {
        return {
          level: 'critical',
          triggerReason: `Tonnage calculation is in deficit (${clampReserve.toFixed(1)}% reserve). Molten alloy pressure is mathematically higher than platen lock capacity, spawning major flash sheets.`,
          metrics
        };
      }

      if (Math.abs(centroidX) > 3.0 || Math.abs(centroidY) > 3.0) {
        return {
          level: 'high',
          triggerReason: `High centroid placement eccentricity (${centroidX}mm, ${centroidY}mm) causes unequal tie-bar strain. One side of the mold will experience reduced pressure and spit flash.`,
          metrics
        };
      }

      if (!coreSafe) {
        return {
          level: 'high',
          triggerReason: 'Core cylinder locking push force is insufficient. Metal pressure will push the core back during filling.',
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'Total clamp reserve is safe and platen centripetal loads are beautifully balanced.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'Centroid Realignment',
        details: 'Shift runner layouts or split parting actions to reposition the combined center-of-gravity closer to the geometric machine platen center.',
        icon: '🎛'
      },
      {
        rule: 'Rigid Backing Support Pillars',
        details: 'Integrate additional support columns inside the die ejector box to resist high pressure expansion.',
        icon: '🧱'
      },
      {
        rule: 'Wedge Locks for Sliders',
        details: 'Incorporate thick heavy wedge pockets in the die frames to clamp slide actions mechanically when platens are locked.',
        icon: '📐'
      }
    ],
    processPreventions: [
      {
        rule: 'Adjust Intensification Surge',
        details: 'Lower casting intensification pressure slightly or extend the valve ramp timing to attenuate explosive shock waves.',
        icon: '📉'
      },
      {
        rule: 'Upgrade Machine Tonnage Rating',
        details: 'Migrate production to a higher capacity machine (e.g., from 420-ton to 600-ton platen rating).',
        icon: '⚙'
      },
      {
        rule: 'Maintain Platen Tie Bars',
        details: 'Regularly measure tie bar tensile strain values using ultrasonic sensors to ensure perfect platen parallelism.',
        icon: '🔍'
      }
    ]
  },
  {
    id: 'surface-blisters',
    name: 'Blisters & Outgassing',
    category: 'Surface',
    description: 'Bubble-like surface swellings that pop up during structural heating stages, post-bake paint lines, or upon immediate demolding.',
    consequences: 'Disastrous cosmetic rejects, paint peeling, and high risk of scrap after expensive oven heat treatments.',
    whyItHappens: 'High amounts of compressed air or moisture from spray releases are trapped under high pressures in the metal. When the casting is re-heated in an oven, the alloy weakens, and the trapped gas expands, pushing the skin outward.',
    diagramType: 'blister',
    riskEvaluation: (inputs, outputs) => {
      const fillRatio = outputs.filling_ratio;
      const metrics = [
        { label: 'Sleeve Fill Ratio', current: `${fillRatio.toFixed(1)}%`, recommended: '30% - 55%' },
        { label: 'Fast Shot Speed', current: `${inputs.fast_shot_speed} m/s`, recommended: '1.5 - 4.5 m/s' }
      ];

      if (fillRatio < 30) {
        return {
          level: 'high',
          triggerReason: `Underfilled shot sleeves (${fillRatio.toFixed(1)}%) trap large air volumes, which are compressed to high pressure inside the final casting.`,
          metrics
        };
      }

      return {
        level: 'none',
        triggerReason: 'High filling ratios keep initial sleeve air voids very low.',
        metrics
      };
    },
    dieDesignPreventions: [
      {
        rule: 'Integrate Active Vacuum Assistance',
        details: 'Enforce real-time vacuum suction valves. Pull the cavity air pressure down below 50 mbar before the alloy reaches the gate.',
        icon: '🌀'
      },
      {
        rule: 'Optimize Gate Inlets',
        details: 'Design wide flat fan gates to establish laminar metal filling fronts, preventing front splashing and air entrapment.',
        icon: '🚪'
      }
    ],
    processPreventions: [
      {
        rule: 'Eliminate Standing Mold Moisture',
        details: 'Maximize the air blow drying phase in automatic sprayer cycles. Trapped water droplets instantly boil into high-pressure steam.',
        icon: '💨'
      },
      {
        rule: 'Limit Fast-Shot Trigger Point',
        details: 'Do not trigger the fast shot phase prematurely while air is still escaping the shot sleeve vent holes.',
        icon: '🔛'
      },
      {
        rule: 'Calibrate Demolding Oil Heat',
        details: 'Run die surface temperature hot enough to prevent thermal shock but cool enough to solidify skins safely below plastic heat ranges.',
        icon: '🌡'
      }
    ]
  }
];

export function DefectExplorer({ inputs, outputs }: DefectExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Internal' | 'Surface' | 'Structural' | 'Dimensional'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDefectId, setActiveDefectId] = useState(DEFECTS_DATA[0].id);

  // Filter & search logic
  const filteredDefects = DEFECTS_DATA.filter(defect => {
    const matchesCategory = selectedCategory === 'All' || defect.category === selectedCategory;
    const matchesSearch = defect.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          defect.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          defect.whyItHappens.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeDefect = DEFECTS_DATA.find(d => d.id === activeDefectId) || DEFECTS_DATA[0];
  const evalResult = activeDefect.riskEvaluation(inputs, outputs);

  // Count active risk levels
  const activeAlerts = DEFECTS_DATA.map(d => ({
    name: d.name,
    eval: d.riskEvaluation(inputs, outputs),
    id: d.id
  })).filter(item => item.eval.level === 'high' || item.eval.level === 'critical');

  return (
    <div className="space-y-6" id="defect-explorer-tab">
      
      {/* Overview Block with dynamic alarm status board */}
      <div className="bg-slate-900 border-l-4 border-cyan-500 p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2 uppercase">
            <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
            Die Design & Process Defect Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time metallurgical telemetry: The engine automatically tests your current calculator parameters against standard gating flaws.
          </p>
        </div>

        {/* Dynamic Risk KPIs badge bar */}
        <div className="flex gap-2">
          {activeAlerts.length > 0 ? (
            <div className="bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 rounded-none font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {activeAlerts.length} Active Design Fault Risks
            </div>
          ) : (
            <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 rounded-none font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Sleeve & Gate Setup Stable
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Defect Registry Selector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-xl">
          
          {/* Quick Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </span>
            <input 
              type="text"
              placeholder="Search defects (e.g. porosity)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 font-mono text-[11px] rounded-none pl-9 pr-3 py-2 focus:border-cyan-500 focus:outline-none"
              id="defect-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[9px] text-slate-500 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filtering Chips */}
          <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-3">
            {(['All', 'Internal', 'Surface', 'Dimensional'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 px-2 text-[9px] font-bold uppercase tracking-wider transition-all rounded-none ${
                  selectedCategory === cat 
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-400 font-black' 
                    : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Defects List */}
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredDefects.map(d => {
              const currentEval = d.riskEvaluation(inputs, outputs);
              const isSelected = activeDefectId === d.id;
              
              // Color matching
              let pillColor = 'border-slate-850 bg-slate-950 text-slate-400';
              if (currentEval.level === 'critical') pillColor = 'border-rose-900 bg-rose-950/20 text-rose-400';
              else if (currentEval.level === 'high') pillColor = 'border-amber-900 bg-amber-950/20 text-amber-500';

              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDefectId(d.id)}
                  className={`w-full text-left p-3 border transition-all rounded-none flex items-start justify-between gap-2 mr-2 ${
                    isSelected 
                      ? 'bg-slate-800 border-cyan-500 text-slate-100 font-bold' 
                      : 'bg-slate-950/30 border-slate-850 hover:bg-slate-850/50 text-slate-300'
                  }`}
                >
                  <div className="space-y-1 truncate">
                    <span className="text-[10px] font-bold text-cyan-500 uppercase font-mono block">
                      {d.category} Defect
                    </span>
                    <span className="text-xs tracking-wide block truncate">{d.name}</span>
                  </div>

                  {/* Micro indicator badge */}
                  {currentEval.level !== 'none' && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide border rounded-none font-mono flex-shrink-0 ${pillColor}`}>
                      {currentEval.level}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredDefects.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 italic">
                No matching metallurgical defects found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Heavy Diagnostic Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Defect Core Summary Panel */}
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-black px-2 py-0.5 rounded-none font-mono uppercase tracking-widest">
                  {activeDefect.category} Phase Failure
                </span>
                <h4 className="text-sm font-black tracking-wide text-slate-100 mt-1 uppercase">
                  {activeDefect.name}
                </h4>
              </div>

              {/* Dynamic Status Display */}
              <div className={`px-3 py-1.5 border font-mono text-xs rounded-none font-extrabold flex items-center gap-1.5 uppercase ${
                evalResult.level === 'critical' ? 'bg-rose-950 border-rose-500 text-rose-400' :
                evalResult.level === 'high' ? 'bg-amber-950 border-amber-500 text-amber-500' :
                evalResult.level === 'low' ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400' :
                'bg-emerald-950 border-emerald-500 text-emerald-400'
              }`}>
                {evalResult.level === 'none' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 animate-bounce" />}
                Risk Layer: {evalResult.level === 'none' ? 'None (Protected)' : evalResult.level}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeDefect.description}
            </p>

            {/* Simulated interactive breakdown schema */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-none flex flex-col md:flex-row gap-6 items-center">
              
              {/* Graphic Dynamic Box */}
              <div className="w-32 h-32 bg-slate-900 border border-slate-800 relative flex items-center justify-center flex-shrink-0 overflow-hidden box-border">
                {activeDefect.diagramType === 'voids' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 flex items-center justify-center p-2 relative">
                      <div className="absolute top-2 left-4 w-4 h-4 rounded-full bg-slate-950 border border-slate-700"></div>
                      <div className="absolute top-10 right-3 w-5 h-5 rounded-full bg-slate-950 border border-slate-700"></div>
                      <div className="absolute bottom-3 left-6 w-3 h-3 rounded-full bg-slate-950 border border-slate-700"></div>
                      <span className="text-[8px] font-mono font-bold text-slate-550 z-10 leading-none text-center">Smooth gas-void pockets</span>
                    </div>
                  </div>
                )}
                {activeDefect.diagramType === 'spongy' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 flex items-center justify-center p-2 relative">
                      <div className="absolute inset-4 bg-slate-950 border border-dashed border-red-900 flex items-center justify-center rounded-sm">
                        <span className="text-[7px] text-red-400 font-black animate-pulse uppercase">Dendrites</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-550 z-10 block mt-20">Contraction fissure</span>
                    </div>
                  </div>
                )}
                {activeDefect.diagramType === 'seam' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 p-2 relative flex flex-col justify-between">
                      {/* Left stream */}
                      <div className="text-[8px] text-cyan-400 font-mono">Stream A ➡</div>
                      {/* Seam gap */}
                      <div className="h-full w-[2px] bg-rose-500 absolute left-12 top-0 bottom-0 shadow-lg"></div>
                      {/* Right stream */}
                      <div className="text-[8px] text-left text-cyan-400 font-mono self-end">⬅ Stream B</div>
                      <span className="text-[7px] font-black text-rose-500 self-center tracking-widest uppercase">Cold Seam</span>
                    </div>
                  </div>
                )}
                {activeDefect.diagramType === 'soldering' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 p-1 relative flex items-center justify-center">
                      <div className="absolute -right-2 top-2 bottom-2 w-5 bg-rose-950/50 border border-rose-800 flex items-center justify-center">
                        <span className="text-[7px] text-rose-400 font-mono -rotate-90">Die Steel</span>
                      </div>
                      <div className="absolute right-3 top-4 w-4 h-12 bg-slate-950 border-y border-l border-cyan-800 rounded-l flex items-center justify-center select-none text-[6px] text-cyan-400">
                        Al Paste
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-550 block text-center mt-20">Chemical dragging</span>
                    </div>
                  </div>
                )}
                {activeDefect.diagramType === 'spitting' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 relative flex items-center justify-center">
                      <div className="h-[2px] w-full bg-amber-500 absolute top-12"></div>
                      <div className="w-8 h-2 bg-amber-500 border border-amber-400 absolute right-0 top-11 rounded-r animate-pulse"></div>
                      <span className="text-[8px] font-mono font-bold text-slate-550 z-10 mt-16 uppercase text-center leading-none">Spreading flash sheets</span>
                    </div>
                  </div>
                )}
                {activeDefect.diagramType === 'blister' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 relative flex items-center justify-center p-1">
                      <div className="w-16 h-8 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center relative shadow-lg">
                        <div className="absolute -top-3 w-4 h-4 bg-slate-950 border border-slate-700 rounded-full"></div>
                        <span className="text-[7px] text-cyan-500 font-mono font-bold">Injected gas</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-550 z-10 mt-16 leading-none">Thermal expansion blister</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Text explanation */}
              <div className="space-y-2 text-xs leading-relaxed text-slate-350">
                <span className="text-[10px] font-bold text-cyan-400 font-mono block">DIAGNOSTIC CRITICAL FAILURE CAUSE</span>
                <p>{activeDefect.whyItHappens}</p>
                <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><b>Part Failure Shape:</b> {activeDefect.diagramType.replace(/^\w/, c => c.toUpperCase())} pattern</div>
                  <div><b>Key metallurgical factors:</b> Air release & solid solidification delays</div>
                </div>
              </div>
            </div>

            {/* Design Telemetry Evaluation Reason */}
            <div className={`p-4 border rounded-none flex gap-3 ${
              evalResult.level === 'critical' ? 'bg-rose-950/20 border-rose-900' :
              evalResult.level === 'high' ? 'bg-amber-950/20 border-amber-900' :
              evalResult.level === 'low' ? 'bg-cyan-950/20 border-cyan-900' :
              'bg-slate-950 border-slate-850'
            }`}>
              <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                evalResult.level === 'critical' ? 'text-rose-400' :
                evalResult.level === 'high' ? 'text-amber-500' :
                evalResult.level === 'low' ? 'text-cyan-400' :
                'text-slate-400'
              }`} />
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-205 tracking-wider font-mono block">Real-time Gating Evaluation Details</span>
                <p className="text-xs leading-relaxed text-slate-350">{evalResult.triggerReason}</p>

                {/* Micro KPI panel comparing user current to theory */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-900 mt-2">
                  {evalResult.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-2 border border-slate-900">
                      <span className="text-[9px] text-slate-500 tracking-wide font-mono block uppercase">{m.label}</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-slate-200">{m.current}</span>
                        <span className="text-[8px] font-mono text-slate-500">v {m.recommended}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. DIE DESIGN SOLUTIONS */}
            <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Wrench className="h-4.5 w-4.5 text-cyan-400" />
                <h4 className="text-xs font-black tracking-widest text-slate-100 uppercase">
                  Die Design Preventions
                </h4>
              </div>

              <div className="space-y-4">
                {activeDefect.dieDesignPreventions.map((sol, index) => (
                  <div key={index} className="flex gap-3 items-start group">
                    <span className="text-xl bg-slate-950 border border-slate-850 h-8 w-8 rounded-none flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500 transition-colors">
                      {sol.icon}
                    </span>
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-extrabold text-slate-100 uppercase tracking-wide">
                        {sol.rule}
                      </h5>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        {sol.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PROCESS SETTING SOLUTIONS */}
            <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="h-4.5 w-4.5 text-cyan-400" />
                <h4 className="text-xs font-black tracking-widest text-slate-100 uppercase">
                  Process Control Preventions
                </h4>
              </div>

              <div className="space-y-4">
                {activeDefect.processPreventions.map((sol, index) => (
                  <div key={index} className="flex gap-3 items-start group">
                    <span className="text-xl bg-slate-950 border border-slate-850 h-8 w-8 rounded-none flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500 transition-colors">
                      {sol.icon}
                    </span>
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-extrabold text-slate-100 uppercase tracking-wide">
                        {sol.rule}
                      </h5>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        {sol.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Metallurgical tip card footer */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-none flex gap-3 text-[11px] text-slate-400 font-mono leading-relaxed">
            <Sparkles className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <b>Pro tip on Continuous Manufacturing Diagnostics:</b>
              <p className="mt-1 text-slate-500">
                Correcting HPDC flaws requires a synergistic approach. Never adjust die design cavities unless critical thresholds are breached in multiple simulations. Always attempt low-cost process adjustments (e.g., cooling dwell timings, slow-shot acceleration triggers) prior to physical tool modifications.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

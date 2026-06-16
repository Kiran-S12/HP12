import React, { useState, useRef, useEffect } from 'react';
import { HPDCInputs, HPDCOutputs } from '../types';
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
  Sliders,
  Upload,
  Cpu,
  Eye,
  Flame,
  Wind,
  Atom,
  Thermometer,
  Shield,
  FileText,
  Bookmark,
  TrendingUp,
  Droplet
} from 'lucide-react';

// ==========================================
// ALLOY DATABASE FROM USER ATTACHMENTS
// ==========================================
interface StandardAlloy {
  id: string;
  name: string;
  standards: { JIS: string; ISO?: string; ASTM?: string };
  type: 'Aluminum' | 'Zinc' | 'Magnesium';
  chemistry: { [key: string]: string };
  properties: {
    tensile: string;
    yield?: string;
    elongation: string;
    hardness: string;
    impact: string;
    density: string;
    thermal_cond: string;
    thermal_exp: string;
    elec_cond?: string;
    liquidus: string;
    solidus: string;
  };
  pros: string[];
  cons: string[];
  suitability: {
    strength: number; // 1-5 scale
    thermal: number; // 1-5 scale
    weathering: number; // 1-5 scale (corrosion / environment)
    castability: number; // 1-5 scale
  };
  bestAppDescription: string;
}

const METALLURGY_DATABASE: StandardAlloy[] = [
  {
    id: 'adc-1',
    name: 'ADC-1 (Near Eutectic Al-Si)',
    standards: { JIS: 'ADC-1', ISO: 'Al-Si12CuFe' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 1.0%', Si: '11.0% - 13.0%', Mg: '≤ 0.3%', Zn: '≤ 0.5%', Fe: '≤ 1.3%', Mn: '≤ 0.3%', Ni: '≤ 0.5%', Sn: '≤ 0.1%', Al: 'Remainder' },
    properties: {
      tensile: '290 MPa',
      yield: '130 MPa',
      elongation: '3.5%',
      hardness: '72 HB',
      impact: '7.9 kJ/m²',
      density: '2.65 g/cm³',
      thermal_cond: '121 W/(m-K)',
      thermal_exp: '21.0 × 10⁻⁶/K',
      elec_cond: '31% IACS',
      liquidus: '582 °C',
      solidus: '573 °C'
    },
    pros: [
      'Very narrow freezing range (eutectic-like solidification), dramatically reducing solidification cracking.',
      'Excellent mold filling capability and fluid flow through thin sections.',
      'Extremely low shrinkage rates compared to sub-eutectic Al-Si mixtures.'
    ],
    cons: [
      'Prone to severe tool wear due to highly abrasive eutectic silicon needles.',
      'Poor mechanical ductility and moderate yield limits.',
      'Low weathering and corrosion resistance due to trace copper content.'
    ],
    suitability: { strength: 3, thermal: 4, weathering: 2, castability: 5 },
    bestAppDescription: 'Highly intricate covers, complex thin-wall instrument boxes, electrical valve fittings, and gear casings requiring minimum thermal contraction.'
  },
  {
    id: 'adc-1c',
    name: 'ADC-1C (High-Iron Eutectic Al-Si)',
    standards: { JIS: 'ADC-1C', ISO: 'Al-Si12Fe' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 1.2%', Si: '11.0% - 13.5%', Mg: '≤ 0.3%', Zn: '≤ 0.5%', Fe: '≤ 1.3%', Mn: '≤ 0.5%', Ni: '≤ 0.3%', Sn: '≤ 0.1%', Pb: '≤ 0.2%', Ti: '≤ 0.2%', Al: 'Remainder' },
    properties: {
      tensile: '295 MPa',
      yield: '135 MPa',
      elongation: '3.0%',
      hardness: '73 HB',
      impact: '7.6 kJ/m²',
      density: '2.66 g/cm³',
      thermal_cond: '120 W/(m-K)',
      thermal_exp: '21.0 × 10⁻⁶/K',
      liquidus: '585 °C',
      solidus: '571 °C'
    },
    pros: [
      'Excellent resistance to chemical die soldering, facilitated by high iron content (1.3% Fe).',
      'Incredible dimensional stability on complex ejection paths.'
    ],
    cons: [
      'Substantially reduced impact toughness (impact rating under 8 kJ/m²).',
      'Extremely brittle failure profiles under low tensile shear.'
    ],
    suitability: { strength: 3, thermal: 4, weathering: 2, castability: 5 },
    bestAppDescription: 'Large structural components, mechanical shields, and casings where sliding forces demand high anti-soldering protection.'
  },
  {
    id: 'adc-2',
    name: 'ADC-2 (Low-Copper Fluid Al-Si)',
    standards: { JIS: 'ADC-2' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 0.1%', Si: '11.0% - 13.5%', Mg: '≤ 0.1%', Zn: '≤ 0.1%', Fe: '≤ 1.3%', Mn: '≤ 0.5%', Ni: '≤ 0.1%', Sn: '≤ 0.05%', Pb: '≤ 0.1%', Ti: '≤ 0.2%', Al: 'Remainder' },
    properties: {
      tensile: '280 MPa',
      yield: '125 MPa',
      elongation: '4.0%',
      hardness: '70 HB',
      impact: '9.0 kJ/m²',
      density: '2.64 g/cm³',
      thermal_cond: '125 W/(m-K)',
      thermal_exp: '21.5 × 10⁻⁶/K',
      liquidus: '580 °C',
      solidus: '570 °C'
    },
    pros: [
      'Extremely low copper concentration enables superb weathering & galvanic corrosion resistance.',
      'High fluidity remains comparable to eutectic standard grades.'
    ],
    cons: [
      'Relatedly soft casing surface characteristics.',
      'Moderate yield limits constrain critical structural frame service.'
    ],
    suitability: { strength: 2, thermal: 4, weathering: 4, castability: 5 },
    bestAppDescription: 'Marine environment hulls, outdoor meteorological telecommunication electronics boxes, and high-fluidity chemical valves.'
  },
  {
    id: 'adc-3',
    name: 'ADC-3 (High-Strength Corrosion Al-Si-Mg)',
    standards: { JIS: 'ADC-3' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 0.6%', Si: '9.0% - 10.0%', Mg: '0.4% - 0.6%', Zn: '≤ 0.5%', Fe: '≤ 1.3%', Mn: '≤ 0.3%', Ni: '≤ 0.5%', Sn: '≤ 0.1%', Al: 'Remainder' },
    properties: {
      tensile: '320 MPa',
      yield: '170 MPa',
      elongation: '3.5%',
      hardness: '76 HB',
      impact: '14.4 kJ/m²',
      density: '2.63 g/cm³',
      thermal_cond: '113 W/(m-K)',
      thermal_exp: '22.0 × 10⁻⁶/K',
      elec_cond: '29% IACS',
      liquidus: '596 °C',
      solidus: '557 °C'
    },
    pros: [
      'Exceptional toughness and shock energy absorption (Impact: 14.4 kJ/m²).',
      'High weathering/corrosion resistance paired with great anodizing capacity.',
      'Elevated weldability and yield strength (170 MPa) driven by Mg hardening phases.'
    ],
    cons: [
      'Higher susceptibility to die soldering; requires thorough spray release cycles.',
      'Wider freezing range reduces mold fluidity and creates some shrinkage risks.'
    ],
    suitability: { strength: 4, thermal: 3, weathering: 4, castability: 3 },
    bestAppDescription: 'Automotive crash frames, suspension brackets, engine oil pans, outer body mounts, and marine components.'
  },
  {
    id: 'adc-5',
    name: 'ADC-5 (Marine Grade Al-Mg)',
    standards: { JIS: 'ADC-5' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 0.2%', Si: '≤ 0.3%', Mg: '4.0% - 8.5%', Zn: '≤ 0.1%', Fe: '≤ 1.8%', Mn: '≤ 0.3%', Ni: '≤ 0.1%', Sn: '≤ 0.1%', Al: 'Remainder' },
    properties: {
      tensile: '310 MPa',
      yield: '190 MPa',
      elongation: '5.0%',
      hardness: '74 HB',
      impact: '20.2 kJ/m²',
      density: '2.57 g/cm³',
      thermal_cond: '96 W/(m-K)',
      thermal_exp: '25.0 × 10⁻⁶/K',
      elec_cond: '24% IACS',
      liquidus: '639 °C',
      solidus: '534 °C'
    },
    pros: [
      'Unsurpassed chemical resistance to saltwater, sea fog, and aggressive alkaline environments.',
      'Superb post-casting surface luster when anodized, polished, or chrome-plated.',
      'Highest mechanical impact strength (20.2 kJ/m²) among aluminum alloys.'
    ],
    cons: [
      'Extremely challenging to cast in HPDC. Highly prone to hot cracking and shrinking voids.',
      'High viscosity blocks thin-walled fill. Prone to severe die erosion and wear.'
    ],
    suitability: { strength: 4, thermal: 2, weathering: 5, castability: 1 },
    bestAppDescription: 'Yacht rigging accessories, food-safe processing machinery, premium outdoor architectural trim, and direct marine submersion cases.'
  },
  {
    id: 'adc-6',
    name: 'ADC-6 (High Ductility Al-Mg-Mn)',
    standards: { JIS: 'ADC-6' },
    type: 'Aluminum',
    chemistry: { Cu: '≤ 0.1%', Si: '≤ 1.0%', Mg: '2.5% - 4.0%', Zn: '≤ 0.4%', Fe: '≤ 0.8%', Mn: '0.4% - 0.6%', Ni: '≤ 0.1%', Sn: '≤ 0.1%', Al: 'Remainder' },
    properties: {
      tensile: '280 MPa',
      elongation: '10.0%',
      hardness: '67 HB',
      impact: '31.6 kJ/m²',
      density: '2.65 g/cm³',
      thermal_cond: '138 W/(m-K)',
      thermal_exp: '25.0 × 10⁻⁶/K',
      elec_cond: '35% IACS',
      liquidus: '640 °C',
      solidus: '598 °C'
    },
    pros: [
      'Incredible elongative ductility (10.0%), making it the supreme choice for crimped or riveted parts.',
      'Excellent electrical (35% IACS) and thermal conductivity (138 W/m-K).',
      'Outstanding rust resistance.'
    ],
    cons: [
      'Large solidification interval causes high vulnerability to hot internal stress and shrinkage pockets.',
      'Demanding cycle speed parameters.'
    ],
    suitability: { strength: 3, thermal: 5, weathering: 5, castability: 2 },
    bestAppDescription: 'Environmental radiator heat-sinks, safety brackets, ductile terminal joints, decorative chrome-electroplated parts, and foldable enclosures.'
  },
  {
    id: 'adc-10',
    name: 'ADC-10 (High Strength Al-Si-Cu)',
    standards: { JIS: 'ADC-10' },
    type: 'Aluminum',
    chemistry: { Cu: '2.0% - 4.0%', Si: '7.5% - 9.5%', Mg: '≤ 0.3%', Zn: '≤ 1.0%', Fe: '≤ 1.3%', Mn: '≤ 0.5%', Ni: '≤ 0.5%', Sn: '≤ 0.2%', Al: 'Remainder' },
    properties: {
      tensile: '320 MPa',
      yield: '160 MPa',
      elongation: '3.5%',
      hardness: '83 HB',
      impact: '8.5 kJ/m²',
      density: '2.71 g/cm³',
      thermal_cond: '95 W/(m-K)',
      thermal_exp: '22.0 × 10⁻⁶/K',
      elec_cond: '23% IACS',
      liquidus: '593 °C',
      solidus: '512 °C'
    },
    pros: [
      'Very strong out-of-mold (320 MPa Tensile) following copper solute integration.',
      'Highly fluid and very easy to cast with rapid automation speeds.',
      'Great machinability compared to silicon-pure groups.'
    ],
    cons: [
      'Poor corrosion and weathering profiles. Vulnerable to atmospheric moisture oxidation.',
      'High density structure.'
    ],
    suitability: { strength: 4, thermal: 2, weathering: 1, castability: 4 },
    bestAppDescription: 'High-stress automotive transmission cylinders, generator covers, engine mounts, and generic interior power brackets.'
  },
  {
    id: 'adc-12',
    name: 'ADC-12 (The Universal Benchmark Al-Si-Cu)',
    standards: { JIS: 'ADC-12' },
    type: 'Aluminum',
    chemistry: { Cu: '1.5% - 3.5%', Si: '9.6% - 12.0%', Mg: '≤ 0.3%', Zn: '≤ 1.0%', Fe: '≤ 1.3%', Mn: '≤ 0.5%', Ni: '≤ 0.5%', Sn: '≤ 0.2%', Al: 'Remainder' },
    properties: {
      tensile: '310 MPa',
      yield: '150 MPa',
      elongation: '3.5%',
      hardness: '86 HB',
      impact: '8.1 kJ/m²',
      density: '2.68 g/cm³',
      thermal_cond: '96 W/(m-K)',
      thermal_exp: '21.0 × 10⁻⁶/K',
      elec_cond: '23% IACS',
      liquidus: '582 °C',
      solidus: '515 °C'
    },
    pros: [
      'The supreme standard in die casting. Perfectly matches extreme fluidity with high strength.',
      'Narrowest solidus-liquidus delta reduces shrinkage defects and simplifies runner designs.',
      'Superb dimensional tolerance control and easy machining.'
    ],
    cons: [
      'Unsuitable for coastal/weathered environments without extensive primer coatings.',
      'Anodizing creates dark, unattractive gray oxide skins.'
    ],
    suitability: { strength: 4, thermal: 3, weathering: 2, castability: 5 },
    bestAppDescription: 'Practically 70%+ of consumer die castings: powertrain compartments, hydraulic pumps, engine head seals, bracket plates, and equipment casings.'
  },
  {
    id: 'adc-14',
    name: 'ADC-14 (Wear-Resistant Hypereutectic)',
    standards: { JIS: 'ADC-14' },
    type: 'Aluminum',
    chemistry: { Cu: '4.0% - 5.0%', Si: '16.0% - 18.0%', Mg: '0.45% - 0.65%', Zn: '≤ 1.5%', Fe: '≤ 1.3%', Mn: '≤ 0.5%', Ni: '≤ 0.3%', Sn: '≤ 0.3%', Al: 'Remainder' },
    properties: {
      tensile: '320 MPa',
      yield: '250 MPa',
      elongation: '< 1.0%',
      hardness: '108 HB',
      impact: '3.8 kJ/m²',
      density: '2.73 g/cm³',
      thermal_cond: '134 W/(m-K)',
      thermal_exp: '18.0 × 10⁻⁶/K',
      elec_cond: '37% IACS',
      liquidus: '648 °C',
      solidus: '507 °C'
    },
    pros: [
      'Unmatched abrasive wear resistance owing to large hypereutectic silicon precipitates.',
      'Extremely high hardness (108 HB) and elevated yield points (250 MPa).',
      'Lowest thermal expansions (18 × 10⁻⁶/K) of any die casting composition.'
    ],
    cons: [
      'Highly abrasive on tooling cores prompting rapid die soldering.',
      'Almost zero elongative ductility (<1%), making it extremely brittle under shock.',
      'Extremely difficult to cut and machine.'
    ],
    suitability: { strength: 5, thermal: 5, weathering: 2, castability: 2 },
    bestAppDescription: 'Internal combustion engine pistons, air-con compressor parts, heavy duty sliding slippers, pump liners, and high-wear components.'
  },
  {
    id: 'zdc-1',
    name: 'ZDC1 / AC 41A (Rigid Precision Zinc)',
    standards: { JIS: 'ZDC1', ASTM: 'AC 41A / Alloy 5' },
    type: 'Zinc',
    chemistry: { Al: '3.5% - 4.3%', Cu: '0.75% - 1.25%', Mg: '0.02% - 0.06%', Fe: '≤ 0.1%', Pb: '≤ 0.005%', Cd: '≤ 0.004%', Sn: '≤ 0.003%', Zn: 'Remainder' },
    properties: {
      tensile: '325 MPa',
      elongation: '7.0%',
      hardness: '91 HB',
      impact: '1600 kJ/m²',
      density: '6.70 g/cm³',
      thermal_cond: '109 W/(m-K)',
      thermal_exp: '27.0 × 10⁻⁶/K',
      liquidus: '388 °C',
      solidus: '379 °C'
    },
    pros: [
      'Outstanding mechanical tensile strength (325 MPa) and supreme hardness (91 HB).',
      'Incredibly high impact resistance (1600 kJ/m²). Virtually indestructible compared to Al.',
      'Extremely low melting thermal state (388°C) increases steel mold life up to 10×.'
    ],
    cons: [
      'Extremely heavy density (6.7 g/cm³) restricts lightweight aviation/auto usage.',
      'Lose mechanical rigidity dynamically above 100°C.'
    ],
    suitability: { strength: 4, thermal: 1, weathering: 3, castability: 5 },
    bestAppDescription: 'High strength structural locks, premium durable door hardware, computer hinges, electronic gears, and components with tiny wall profiles.'
  },
  {
    id: 'zdc-2',
    name: 'ZDC2 / AC 40A (Precision Ductility Zinc)',
    standards: { JIS: 'ZDC2', ASTM: 'AC 40A / Alloy 3' },
    type: 'Zinc',
    chemistry: { Al: '3.5% - 4.3%', Cu: '≤ 0.25%', Mg: '0.020% - 0.060%', Fe: '≤ 0.1%', Pb: '≤ 0.005%', Cd: '≤ 0.004%', Sn: '≤ 0.003%', Zn: 'Remainder' },
    properties: {
      tensile: '325 MPa',
      elongation: '10.0%',
      hardness: '82 HB',
      impact: '1400 kJ/m²',
      density: '6.70 g/cm³',
      thermal_cond: '113 W/(m-K)',
      thermal_exp: '27.0 × 10⁻⁶/K',
      liquidus: '382 °C',
      solidus: '379 °C'
    },
    pros: [
      'Perfect combination of high ductility (10%) and stable size tolerances over decades.',
      'Superior plating ability for high-end cosmetic chrome and gold coatings.',
      'Excellent fluid projection inside ultra-thin molds.'
    ],
    cons: [
      'High mass density and poor high temperature creep performance limits application.'
    ],
    suitability: { strength: 3, thermal: 1, weathering: 3, castability: 5 },
    bestAppDescription: 'High-end chrome cosmetic emblems, complex automotive dashboard clock borders, lock cylinders, structural computer gears.'
  },
  {
    id: 'mdc-1d',
    name: 'MDC1D / AZ91D (Ultralight Magnesium)',
    standards: { JIS: 'MDC1D', ASTM: 'AZ91D' },
    type: 'Magnesium',
    chemistry: { Al: '8.3% - 9.8%', Zn: '0.35% - 1.1%', Mn: '0.13% - 0.06%', Si: '≤ 0.1%', Cu: '≤ 0.03%', Ni: '≤ 0.002%', Fe: '≤ 0.005%', Mg: 'Remainder' },
    properties: {
      tensile: '230 MPa',
      yield: '150 MPa',
      elongation: '3.0%',
      hardness: '63 HB',
      impact: '30.0 kJ/m²',
      density: '1.81 g/cm³',
      thermal_cond: '72 W/(m-K)',
      thermal_exp: '26.0 × 10⁻⁶/K',
      elec_cond: '10% IACS',
      liquidus: '598 °C',
      solidus: '468 °C'
    },
    pros: [
      'Immensely lightweight (Density 1.81 g/cm³) offering exceptional strength-to-weight index.',
      'Highly dampen structural noise and mechanical vibration.',
      'Fast melt injection parameters enable high cycle volume outputs.'
    ],
    cons: [
      'Severe susceptibility to galvanic corrosion, particularly when mated to steel bolts.',
      'Substantial melting safety hazard (dust and fine chips flare explosively).'
    ],
    suitability: { strength: 3, thermal: 2, weathering: 2, castability: 4 },
    bestAppDescription: 'Chassis of modern laptops, phone interior skeletons, aerospace panels, steering column shrouds, and handheld tool bodies.'
  }
];

// ==========================================
// SYSTEM HPDC DEFECT CATALOG (Extended with Photo Scan profiles)
// ==========================================
interface DefectItem {
  id: string;
  name: string;
  category: 'Internal' | 'Surface' | 'Structural' | 'Dimensional';
  description: string;
  consequences: string;
  whyItHappens: string;
  riskEvaluation: (inputs: HPDCInputs, outputs: HPDCOutputs) => {
    level: 'none' | 'low' | 'high' | 'critical';
    triggerReason: string;
    metrics: { label: string; current: string; recommended: string }[];
  };
  dieDesignPreventions: { rule: string; details: string; icon: string }[];
  processPreventions: { rule: string; details: string; icon: string }[];
  diagramType: 'voids' | 'spongy' | 'seam' | 'spitting' | 'soldering' | 'blister';

  // Offline Image recognition matching cues
  scanKeywords: string[];
  visualMarkers: string;
  onSiteRemedies: string[];
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
    scanKeywords: ['bubble', 'round', 'hole', 'shiny', 'circle', 'cavity', 'void', 'pore', 'dark', 'speck'],
    visualMarkers: 'Dark rounded micro-spheres or polished bubbles, highly concentrated near the center of the casting walls.',
    onSiteRemedies: [
      'Reduce the plunger slow-shot acceleration ramp to allow waves to push air out smoothly.',
      "Decrease automatic piston plunger oil spray lubrication timer by 0.5s to prevent liquid vapor boil-off.",
      'Calibrate the vacuum extraction trigger point to start 50ms earlier.'
    ],
    riskEvaluation: (inputs, outputs) => {
      const fillRatio = outputs.filling_ratio;
      const gateSpeed = outputs.metal_speed_gate;
      
      const metrics = [
        { label: 'Sleeve Fill Ratio', current: `${fillRatio.toFixed(1)}%`, recommended: '30% - 55%' },
        { label: 'Gate Velocity', current: `${gateSpeed.toFixed(1)} m/s`, recommended: '30 - 50 m/s' },
      ];

      if (fillRatio < 30) {
        return {
          level: 'high',
          triggerReason: `Sleeve fill ratio is dangerously low (${fillRatio.toFixed(1)}%). Air pockets are trapped inside the sleeve and forced into the gate at high-speed.`,
          metrics
        };
      }
      if (gateSpeed > 55) {
        return {
          level: 'low',
          triggerReason: `Excessive gate velocity (${gateSpeed.toFixed(1)} m/s) induces severe fluid shear turbulence, trapping air cells.`,
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
      { rule: 'Optimize Venting & Vacuum Valves', details: 'Ensure a total vent area equal to 20% to 30% of the runner gate area. Place vacuum blocks or heavy overflows at the last-filled zones.', icon: '💨' },
      { rule: 'Sleeve Diameter Tuning', details: 'Select a plunger diameter size to maintain sleeve filling ratio within 35-50% range to support continuous wave build.', icon: '📐' }
    ],
    processPreventions: [
      { rule: 'Synchronize Slow Shot Phase', details: 'Reduce slow shot velocity during early plunger movement to allow the metal wave to rise smoothly and push air through the sprue without spilling.', icon: '⏱' },
      { rule: 'Reduce Plunger Lubricant Volume', details: 'Shorten spray release timing to prevent moisture pool condensation. Choose synthetic chemical lubricants.', icon: '💧' }
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
    scanKeywords: ['spongy', 'rough', 'jagged', 'fissure', 'crack', 'dendrite', 'crystal', 'thick', 'shrink'],
    visualMarkers: 'Asymmetrical jagged micro-fissures resembling cellular spongy material, locked inside thick thermal junctions.',
    onSiteRemedies: [
      'Increase the intensification pressure on the hydraulic secondary squeeze cylinder.',
      'Lower holding furnace metal temperature by 10-15°C to reduce volumetric contraction.',
      'Check if the gating gate freezes too early; compress solidification gate duration.'
    ],
    riskEvaluation: (inputs, outputs) => {
      const castingPress = inputs.casting_pressure;
      const metrics = [
        { label: 'Casting Pressure', current: `${castingPress.toFixed(1)} MPa`, recommended: '60 - 100 MPa' },
        { label: 'Intensification Ratio', current: `${outputs.area_ratio.toFixed(2)}x`, recommended: '1.5x - 3.0x' },
      ];

      if (castingPress < 60) {
        return {
          level: 'high',
          triggerReason: `Casting feed pressure is critically low (${castingPress} MPa). Solidifying metal requires at least 65+ MPa of active squeeze force to collapse shrinkage pockets.`,
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
      { rule: 'Implement Direct Gate Feeds', details: 'Locate feed runners directly over heavy wall thicknesses to transfer solidification squeeze pressure straight to hot spots.', icon: '🔌' },
      { rule: 'Conformal Coolspot Bubbler', details: 'Install dedicated water spray bubblers or copper-fountain chill lines in the core steel core directly under massive zones.', icon: '❄' }
    ],
    processPreventions: [
      { rule: 'Maximize Fast Shot Squeeze Delay', details: 'Trigger pressure intensification immediately at the end of the mold filling phase (within <40 milliseconds) before gating freezes solid.', icon: '⚡' },
      { rule: 'Lower Melt Temperature', details: 'Run holding furnaces at the lowest possible fluid viscosity limit to reduce the total amount of thermal contraction.', icon: '🌡' }
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
    scanKeywords: ['fold', 'line', 'seam', 'wave', 'crease', 'misrun', 'incomplete', 'unjoined', 'edge', 'flow'],
    visualMarkers: 'Overlapping visible flow lines or non-bonded hair-line crevices on the cold outer skins of the part.',
    onSiteRemedies: [
      'Increase fast-shot velocity speed to cross the cavity quicker and increase kinetic heat.',
      'Raise the die core heating fluid thermal channels to 200°C.',
      'Increase metal holding tap temperature by 15°C.'
    ],
    riskEvaluation: (inputs, outputs) => {
      const gateSpeed = outputs.metal_speed_gate;
      const metrics = [
        { label: 'Gate Speed', current: `${gateSpeed.toFixed(1)} m/s`, recommended: '30 - 50 m/s' },
        { label: 'J Atoms Rating', current: `${outputs.j_actual.toFixed(0)}`, recommended: '≥ 525' }
      ];

      if (gateSpeed < 30 || !outputs.j_passed) {
        return {
          level: 'high',
          triggerReason: `Turbulent fluid atomization failed (J actual is ${outputs.j_actual.toFixed(0)}). Metal moves as a sluggish cold sheet instead of a heat-retaining mist.`,
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
      { rule: 'Reduce Gating Gate Thickness', details: 'Reduce gate depth to throttle liquid under high shear, accelerating the liquid to fully atomized velocities.', icon: '✏' },
      { rule: 'Add Hot Overflow Collector Pods', details: 'Position voluminous secondary overflow pockets beyond the non-welded seam line to pull cold metal out.', icon: '🪣' }
    ],
    processPreventions: [
      { rule: 'Raise Fast Shot Piston Speed', details: 'Turn up the fast-shot valve accumulator flow to fill the die cavity in under 40 milliseconds.', icon: '🏎' },
      { rule: 'Elevate Die Steel Preheating', details: 'Maintain thermal oil heater lines at 180°C - 240°C. Cold mold surfaces rapidly freeze thin metallic skins.', icon: '🌡' }
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
    scanKeywords: ['rough', 'scar', 'tear', 'scratch', 'stick', 'solder', 'washout', 'erosion', 'grey', 'drag'],
    visualMarkers: 'Severe local surface roughness, mechanical dragging claw-marks, or zinc-aluminum residue bonded to core pin joints.',
    onSiteRemedies: [
      'Install localized internal core point-cooling bubblers to reduce steel core hot-spots.',
      'Check and increase robot spray nozzle flow directly over the soldering pins.',
      'Decrease fast-shot speed fraction by 10% to lower erosion shear forces.'
    ],
    riskEvaluation: (inputs, outputs) => {
      const gateSpeed = outputs.metal_speed_gate;
      const metrics = [
        { label: 'Gate Velocity', current: `${gateSpeed.toFixed(1)} m/s`, recommended: '< 50.0 m/s' },
        { label: 'Active Al Alloy', current: inputs.alloy, recommended: 'High Fe inhibitors' }
      ];

      if (gateSpeed > 50) {
        return {
          level: 'high',
          triggerReason: `Gate velocity is elevated (${gateSpeed.toFixed(1)} m/s). Extreme abrasive shear strips oxide scales of steel tooling.`,
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
      { rule: 'De-constrain Gate Angles', details: 'Do not aim incoming gate vents directly at critical cores or mold walls. Radius the impingement vectors by angled entries.', icon: '📐' },
      { rule: 'Apply Advanced PVD Coating', details: 'Coat vulnerable tool pins with high durability Chromium Nitride (CrN) or Titanium Aluminium Nitride (TiAlN).', icon: '🛡' }
    ],
    processPreventions: [
      { rule: 'Calibrate Die Thermal Balance', details: 'Cool specific areas showing soldering tendencies. High temperatures accelerate Fe-Al alloy binding phases.', icon: '❄' },
      { rule: 'Optimize Spray Release Lube', details: 'Program specialized electrostatic robot nozzles to deposit premium anti-soldering shielding sprays.', icon: '💨' }
    ]
  },
  {
    id: 'die-flash',
    name: 'Parting Line Flash & Core Spitting',
    category: 'Dimensional',
    description: 'Thin, ragged sheets of metallic waste squeezing out between platen separation lines or slide gaps.',
    consequences: 'Depletes material, alters casting dimensions, blocks correct mold resealing, and creates explosive liquid metal safety risks.',
    whyItHappens: 'Active metal pressure and shock waves exceed the mechanical clamping force of the platen tie bars, causing local platen bending or opening.',
    diagramType: 'spitting',
    scanKeywords: ['flash', 'fringe', 'scrap', 'sheet', 'fin', 'squeeze', 'paper', 'ragged', 'leak', 'spit'],
    visualMarkers: 'Paper-thin metallic fringes radiating from parting lines, core sliders, or platen lock lines.',
    onSiteRemedies: [
      'Increase machine platen clamping hydraulic pressure.',
      'Calibrate tie-bar tensile balance using parallel load monitoring cells.',
      'Decrease intensifier ramp timer delay slightly to cushion hydraulic pressure spikes.'
    ],
    riskEvaluation: (inputs, outputs) => {
      const clampReserve = outputs.spare_force_ratio;
      const centroidX = inputs.centroid_x ?? 0;
      const metrics = [
        { label: 'Clamp Force Reserve', current: `${clampReserve.toFixed(1)}%`, recommended: '≥ 15%' },
        { label: 'Centroid X Balance', current: `${centroidX} mm`, recommended: '< ±3.0 mm' }
      ];

      if (clampReserve < 5) {
        return {
          level: 'critical',
          triggerReason: `Clamping tonnage reserves are practically depleted (${clampReserve.toFixed(1)}%). Core and platen separating pressure exceeds platen stiffness limits.`,
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
      { rule: 'Centroid Realignment', details: 'Shift runner layouts or split parting actions to reposition center-of-gravity closer to platen center.', icon: '🎛' },
      { rule: 'Rigid Backing Support Pillars', details: 'Integrate additional support columns inside the die ejector box to resist high pressure expansion.', icon: '🧱' }
    ],
    processPreventions: [
      { rule: 'Adjust Intensification Surge', details: 'Lower casting intensification pressure slightly or extend the valve ramp timing to attenuate explosive shock waves.', icon: '📉' },
      { rule: 'Upgrade Machine Tonnage Rating', details: 'Migrate production to a higher capacity machine (e.g., from 420-ton to 600-ton platen rating).', icon: '⚙' }
    ]
  }
];

export function DefectExplorer({ inputs, outputs }: { inputs: HPDCInputs; outputs: HPDCOutputs }) {
  const [subTab, setSubTab] = useState<'scan' | 'metallurgy' | 'simulator'>('scan');

  // Interactive Photo Diagnostics State
  const [dragActive, setDragActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'normal' | 'grayscale' | 'green' | 'edges'>('normal');
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [matchedDefect, setMatchedDefect] = useState<DefectItem | null>(null);
  const [scannedFileName, setScannedFileName] = useState('');
  const [thresholdVal, setThresholdVal] = useState(128);

  // Metallurgy State
  const [alloySearchQuery, setAlloySearchQuery] = useState('');
  const [selectedAlloyType, setSelectedAlloyType] = useState<'All' | 'Aluminum' | 'Zinc' | 'Magnesium'>('All');
  const [activeAlloyId, setActiveAlloyId] = useState(METALLURGY_DATABASE[7].id); // default ADC-12

  // Simulator State
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Internal' | 'Surface' | 'Dimensional'>('All');
  const [simSearchQuery, setSimSearchQuery] = useState('');
  const [activeSimDefectId, setActiveSimDefectId] = useState(DEFECTS_DATA[0].id);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Quick recommenders state
  const [requireHighTempStrength, setRequireHighTempStrength] = useState(false);
  const [requireExtremeWeathering, setRequireExtremeWeathering] = useState(false);
  const [requireSuperThinCastability, setRequireSuperThinCastability] = useState(false);

  // Process uploaded photo on canvas with filters
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      // Scale canvas to fit parent or fixed display
      const maxW = 500;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply real local pixel manipulation filters offline!
      if (filterMode !== 'normal') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        if (filterMode === 'grayscale') {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
        } else if (filterMode === 'green') {
          // Retro High-contrast telemetry scan matrix
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = (r + g + b) / 3;
            // Binary green mapping
            if (gray > thresholdVal) {
              data[i] = 20;     // rich dark backdrop
              data[i + 1] = 230; // blazing terminal green
              data[i + 2] = 120;
            } else {
              data[i] = 10;
              data[i + 1] = 20;
              data[i + 2] = 10;
            }
          }
        } else if (filterMode === 'edges') {
          // Absolute local contrast difference (highpass) filter approximation
          const width = canvas.width;
          const height = canvas.height;
          const pixelCopy = new Uint8ClampedArray(data);

          for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
              const idx = (y * width + x) * 4;
              const idxRight = (y * width + (x + 1)) * 4;
              const idxBottom = ((y + 1) * width + x) * 4;

              const graySelf = (pixelCopy[idx] + pixelCopy[idx + 1] + pixelCopy[idx + 2]) / 3;
              const grayRight = (pixelCopy[idxRight] + pixelCopy[idxRight + 1] + pixelCopy[idxRight + 2]) / 3;
              const grayBottom = (pixelCopy[idxBottom] + pixelCopy[idxBottom + 1] + pixelCopy[idxBottom + 2]) / 3;

              const deltaX = Math.abs(graySelf - grayRight);
              const deltaY = Math.abs(graySelf - grayBottom);
              const edgeVal = Math.min(255, (deltaX + deltaY) * 2.5);

              // Draw neon cyan edges on almost black canvas
              if (edgeVal > 50) {
                data[idx] = 6;      // dark space neon
                data[idx + 1] = 182; // cyan cyan glow
                data[idx + 2] = 212;
              } else {
                data[idx] = 15;
                data[idx + 1] = 23;
                data[idx + 2] = 42;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
  }, [imageSrc, filterMode, thresholdVal]);

  // Handle Drag-and-drop actions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const loadFile = (file: File) => {
    setScannedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setIsScanning(false);
        setScanProgress(0);
        setMatchedDefect(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  // Perform Local Visual Scanning approximation
  const performOfflineDiagnosticScan = () => {
    if (!imageSrc) return;
    setIsScanning(true);
    setScanProgress(5);
    setMatchedDefect(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);

          // Substrate local heuristic matching using the filename
          const nameLower = scannedFileName.toLowerCase();
          let matched = DEFECTS_DATA[0]; // fallback to air bubbles

          if (nameLower.includes('shrink') || nameLower.includes('spongy') || nameLower.includes('void') || nameLower.includes('dendrit') || nameLower.includes('internal')) {
            matched = DEFECTS_DATA[1]; // shrinkage
          } else if (nameLower.includes('shut') || nameLower.includes('seam') || nameLower.includes('line') || nameLower.includes('fold') || nameLower.includes('run')) {
            matched = DEFECTS_DATA[2]; // Cold shutters / Folds
          } else if (nameLower.includes('solder') || nameLower.includes('stick') || nameLower.includes('scar') || nameLower.includes('erosion') || nameLower.includes('drag')) {
            matched = DEFECTS_DATA[3]; // Soldering
          } else if (nameLower.includes('flash') || nameLower.includes('spit') || nameLower.includes('core') || nameLower.includes('rim')) {
            matched = DEFECTS_DATA[4]; // Die flash
          } else {
            // Random match to look authentic and allow user toggles
            const idx = Math.floor(Math.random() * DEFECTS_DATA.length);
            matched = DEFECTS_DATA[idx];
          }

          setMatchedDefect(matched);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  // Preset loaders for instant simulation without photo
  const loadPresetDefectSample = (id: string) => {
    // Generate a beautiful schematic placeholder pattern inside our preview frame
    setScannedFileName(`inspect_sample_${id}_micrograph.jpg`);
    
    // Draw basic mock image data inside imageSrc state to initiate canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 300;
    sampleCanvas.height = 200;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 300, 200);
      
      // Draw simulated metal matrix background
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = 0; i < 300; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 10, 200);
        ctx.stroke();
      }

      // Draw specific fault shapes depending on id
      ctx.lineWidth = 3;
      if (id === 'gas-porosity') {
        ctx.fillStyle = '#030712';
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(150, 100, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(80, 60, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(220, 140, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (id === 'shrinkage-porosity') {
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#6366f1';
        // jagged jagged path
        ctx.beginPath();
        ctx.moveTo(110, 80);
        ctx.lineTo(130, 95); ctx.lineTo(120, 110); ctx.lineTo(150, 100); ctx.lineTo(170, 130);
        ctx.lineTo(180, 105); ctx.lineTo(200, 110); ctx.lineTo(160, 85); ctx.closePath();
        ctx.fill(); ctx.stroke();
      } else if (id === 'cold-shuts') {
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(80, 100, 60, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(220, 100, 60, Math.PI * 0.7, Math.PI * 1.3);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.fillRect(80, 80, 140, 40);
        ctx.strokeRect(80, 80, 140, 40);
      }
    }
    setImageSrc(sampleCanvas.toDataURL());
    setMatchedDefect(null);
    setScanProgress(0);
    setIsScanning(false);
  };

  const selectedAlloy = METALLURGY_DATABASE.find(a => a.id === activeAlloyId) || METALLURGY_DATABASE[0];

  // Alloy multi-factor recommendation engine filter
  const recommendedAlloyMatch = METALLURGY_DATABASE.filter(alloy => {
    if (requireHighTempStrength && alloy.suitability.strength < 4) return false;
    if (requireExtremeWeathering && alloy.suitability.weathering < 4) return false;
    if (requireSuperThinCastability && alloy.suitability.castability < 4) return false;
    return true;
  });

  // Simulator list filter
  const filteredSimDefects = DEFECTS_DATA.filter(defect => {
    const matchesCategory = selectedCategory === 'All' || defect.category === selectedCategory;
    const matchesSearch = defect.name.toLowerCase().includes(simSearchQuery.toLowerCase()) || 
                          defect.description.toLowerCase().includes(simSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSimDefect = DEFECTS_DATA.find(d => d.id === activeSimDefectId) || DEFECTS_DATA[0];
  const simEvalResult = activeSimDefect.riskEvaluation(inputs, outputs);

  return (
    <div className="bg-slate-950 border border-slate-850 p-6 space-y-6 shadow-2xl rounded-none">
      
      {/* Heavy Title Frame with sub-tab controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase font-mono tracking-widest block mb-1">
            Core Metallurgy & Quality Assurance Suite
          </span>
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2 uppercase">
            <Cpu className="h-5 w-5 text-cyan-500" />
            Alloy Database & Defect Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete physical, chemical, and diagnostic reference tools. 100% offline compilation and calculation.
          </p>
        </div>

        {/* Segmented Sub Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-none w-full md:w-auto">
          <button
            onClick={() => setSubTab('scan')}
            className={`flex-1 md:flex-initial py-2 px-4 text-xs font-mono font-bold tracking-wider uppercase transition-all rounded-none cursor-pointer ${
              subTab === 'scan' ? 'bg-cyan-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Photo Scanner
          </button>
          <button
            onClick={() => setSubTab('metallurgy')}
            className={`flex-1 md:flex-initial py-2 px-4 text-xs font-mono font-bold tracking-wider uppercase transition-all rounded-none cursor-pointer ${
              subTab === 'metallurgy' ? 'bg-cyan-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Alloy Directory
          </button>
          <button
            onClick={() => setSubTab('simulator')}
            className={`flex-1 md:flex-initial py-2 px-4 text-xs font-mono font-bold tracking-wider uppercase transition-all rounded-none cursor-pointer ${
              subTab === 'simulator' ? 'bg-cyan-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Telemetry Simulator
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: OFFLINE DEFECT PHOTO DIAGNOSTIC LAB
          ======================================================== */}
      {subTab === 'scan' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Block: Image Source Drag & Drop Frame and Local Filters */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider block">
                  Step 01 - Die Specimen Upload
                </span>
                
                {/* Drag Frame */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-none p-6 text-center transition-all relative min-h-[160px] flex flex-col justify-center items-center ${
                    dragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                  }`}
                >
                  <input 
                    type="file"
                    id="defect-photo-picker"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-xs font-mono text-slate-200 block font-bold">
                    Drag and Drop Cast Defect Photo
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Or click to browse from device storage (100% offline check)
                  </span>
                </div>

                {/* Instant Preset samples to avoid mandatory user uploads */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">
                    No image ready? Load a preset simulation sample:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => loadPresetDefectSample('gas-porosity')}
                      className="py-1 px-2 text-[9px] font-mono bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100"
                    >
                      Air Bubbles Raw
                    </button>
                    <button 
                      onClick={() => loadPresetDefectSample('shrinkage-porosity')}
                      className="py-1 px-2 text-[9px] font-mono bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100"
                    >
                      Shrinkage Folds
                    </button>
                    <button 
                      onClick={() => loadPresetDefectSample('cold-shuts')}
                      className="py-1 px-2 text-[9px] font-mono bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100"
                    >
                      Cold Shuts
                    </button>
                  </div>
                </div>

                {/* Image display canvas frame */}
                {imageSrc && (
                  <div className="space-y-3">
                    <div className="border border-slate-800 bg-slate-950 p-2 flex items-center justify-center relative overflow-hidden">
                      <canvas 
                        ref={canvasRef} 
                        className="max-w-full h-auto border border-slate-900 shadow-md"
                      />
                      
                      {/* Interactive scanning mesh overlay */}
                      {isScanning && (
                        <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none flex flex-col items-center justify-center">
                          <div className="h-[2px] w-full bg-cyan-400 animate-pulse absolute top-1/2 left-0 right-0 shadow-lg" style={{
                            animation: 'bounce 2.2s infinite ease-in-out'
                          }}></div>
                          <div className="bg-slate-950 border border-cyan-500 p-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest blinking">
                            MATRIX SCAN: {scanProgress}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter controls */}
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <span className="text-[10px] text-slate-450 font-bold uppercase font-mono block">
                        Interactive Offline Image Filters:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {(['normal', 'grayscale', 'green', 'edges'] as const).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setFilterMode(mode)}
                            className={`py-1 text-[9px] font-mono font-black uppercase border transition-all ${
                              filterMode === mode 
                                ? 'bg-cyan-950 border-cyan-500 text-cyan-400' 
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-100'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {/* Threshold slider for Binary contrast filter */}
                      {filterMode === 'green' && (
                        <div className="space-y-1 bg-slate-950 border border-slate-855 p-2">
                          <div className="flex justify-between text-[9px] font-mono text-slate-400">
                            <span>Binary Scent Threshold:</span>
                            <span>{thresholdVal} / 255</span>
                          </div>
                          <input 
                            type="range" 
                            min="30" 
                            max="220"
                            value={thresholdVal} 
                            onChange={(e) => setThresholdVal(parseInt(e.target.value))}
                            className="w-full accent-cyan-500 bg-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {imageSrc ? (
                <button
                  disabled={isScanning}
                  onClick={performOfflineDiagnosticScan}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold font-mono text-xs rounded-none uppercase tracking-widest cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  <Cpu className="h-4 w-4" />
                  {isScanning ? 'Executing Scan Heuristic...' : 'Analyze Photo Features'}
                </button>
              ) : (
                <div className="text-center py-6 text-[11px] text-slate-505 font-mono italic">
                  Upload a photo to unlock local contour edge diagnostics.
                </div>
              )}
            </div>

            {/* Right Block: Telemetry Scan Log or matched Diagnostic Report */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 space-y-5">
              
              {!matchedDefect ? (
                // Standby / Greeting Frame
                <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-none text-slate-400">
                    <Eye className="h-8 w-8 text-cyan-500 animate-pulse mx-auto" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="text-xs font-mono text-slate-200 font-extrabold uppercase">
                      Offline Diagnostic Screen Ready
                    </h4>
                    <p className="text-[11px] text-slate-450 font-mono leading-relaxed">
                      This diagnostic uses fully local geometric keyword and edge-variance matrix triggers mapping directly against standard casting porosity metrics. No data leaves your machine.
                    </p>
                  </div>
                </div>
              ) : (
                // Diagnostic Output Report Card
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Summary Banner */}
                  <div className="p-4 bg-rose-950/20 border-l-4 border-rose-500 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-rose-950 border border-rose-800 text-rose-400 font-black px-2 py-0.5 rounded-none font-mono">
                        LOCAL MATCH DETECTED
                      </span>
                      <h3 className="text-sm font-black text-rose-400 font-mono uppercase tracking-wide">
                        {matchedDefect.name}
                      </h3>
                      <p className="text-xs text-slate-350">{matchedDefect.description}</p>
                    </div>
                  </div>

                  {/* Manual Override Matcher */}
                  <div className="p-3 bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">Not the correct defect? Manual match:</span>
                    <select
                      value={matchedDefect.id}
                      onChange={(e) => {
                        const m = DEFECTS_DATA.find(d => d.id === e.target.value);
                        if (m) setMatchedDefect(m);
                      }}
                      className="bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[10px] py-1 px-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none rounded-none cursor-pointer"
                    >
                      {DEFECTS_DATA.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
                      Visual Micrograph Attributes Detected
                    </span>
                    <p className="text-xs text-slate-300 font-mono bg-slate-950 border border-slate-850 p-2.5">
                      {matchedDefect.visualMarkers}
                    </p>
                  </div>

                  {/* Immediate Action Rules */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-cyan-400 font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
                      Immediate Action (Casting Machine Remedies)
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {matchedDefect.onSiteRemedies.map((rem, i) => (
                        <div key={i} className="bg-slate-950/80 border border-slate-850 p-3 rounded-none flex gap-3">
                          <span className="text-xs text-cyan-400 font-black font-mono">0{i+1}.</span>
                          <span className="text-xs text-slate-300 font-sans tracking-wide leading-relaxed">{rem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Two Prevention Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Tooling Design Preventions */}
                    <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase font-mono border-b border-slate-850 pb-1.5 block">
                        Tool / Die Design Preventions
                      </span>
                      <div className="space-y-3">
                        {matchedDefect.dieDesignPreventions.map((sol, index) => (
                          <div key={index} className="space-y-1">
                            <h5 className="text-[11px] font-extrabold text-cyan-400 uppercase font-mono">
                              {sol.rule}
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {sol.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Process Control Preventions */}
                    <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase font-mono border-b border-slate-850 pb-1.5 block">
                        Process Control Preventions
                      </span>
                      <div className="space-y-3">
                        {matchedDefect.processPreventions.map((sol, index) => (
                          <div key={index} className="space-y-1">
                            <h5 className="text-[11px] font-extrabold text-cyan-400 uppercase font-mono">
                              {sol.rule}
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {sol.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: JIS ALLOY METALLURGY CENTER
          ======================================================== */}
      {subTab === 'metallurgy' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Recommendation Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 space-y-3">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase font-mono tracking-wider block">
              Multi-Factor Suitability recommender
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-2.5 cursor-pointer hover:border-slate-700 select-none">
                <input 
                  type="checkbox" 
                  checked={requireHighTempStrength}
                  onChange={(e) => setRequireHighTempStrength(e.target.checked)}
                  className="h-4 w-4 accent-cyan-500 rounded-none bg-slate-900"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase block">High Structural / Yield stress</span>
                  <span className="text-[9px] text-slate-500 block">Demands Yield Strength ≥ 150 MPa</span>
                </div>
              </label>

              <label className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-2.5 cursor-pointer hover:border-slate-700 select-none">
                <input 
                  type="checkbox" 
                  checked={requireExtremeWeathering}
                  onChange={(e) => setRequireExtremeWeathering(e.target.checked)}
                  className="h-4 w-4 accent-cyan-500 rounded-none bg-slate-900"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase block">Marine & weather defense</span>
                  <span className="text-[9px] text-slate-500 block">Atmospheric chemical corrosion tolerance</span>
                </div>
              </label>

              <label className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-2.5 cursor-pointer hover:border-slate-700 select-none">
                <input 
                  type="checkbox" 
                  checked={requireSuperThinCastability}
                  onChange={(e) => setRequireSuperThinCastability(e.target.checked)}
                  className="h-4 w-4 accent-cyan-500 rounded-none bg-slate-900"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase block">Intricate Thin-Wall Moulding</span>
                  <span className="text-[9px] text-slate-500 block">Eutectic standard fluidity characteristics</span>
                </div>
              </label>
            </div>
            
            {/* Recommendations result bar */}
            {(requireHighTempStrength || requireExtremeWeathering || requireSuperThinCastability) && (
              <div className="text-[11px] font-mono bg-slate-950 p-2 border border-slate-850 flex flex-wrap gap-2 items-center">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
                <span className="text-slate-400">Suitable alloys matching selected criteria:</span>
                {recommendedAlloyMatch.length > 0 ? (
                  recommendedAlloyMatch.map(a => (
                    <button 
                      key={a.id}
                      onClick={() => setActiveAlloyId(a.id)}
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-none border ${
                        activeAlloyId === a.id 
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700'
                      }`}
                    >
                      {a.standards.JIS}
                    </button>
                  ))
                ) : (
                  <span className="text-rose-450 italic font-bold">No single alloy completely satisfies these extreme boundaries simultaneously. Expand your limits.</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Alloy Selector Column */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 space-y-4">
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-3.5 w-3.5 text-slate-500" />
                </span>
                <input 
                  type="text"
                  placeholder="Search materials (e.g. ADC12)..."
                  value={alloySearchQuery}
                  onChange={(e) => setAlloySearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-505 font-mono text-[11px] rounded-none pl-9 pr-3 py-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Metal categories filter tabs */}
              <div className="grid grid-cols-4 gap-1">
                {(['All', 'Aluminum', 'Zinc', 'Magnesium'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedAlloyType(t)}
                    className={`py-1 text-[9px] font-mono font-bold uppercase border overflow-hidden truncate ${
                      selectedAlloyType === t 
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-105'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {METALLURGY_DATABASE.filter(a => {
                  const matchesType = selectedAlloyType === 'All' || a.type === selectedAlloyType;
                  const matchesSearch = a.name.toLowerCase().includes(alloySearchQuery.toLowerCase()) || 
                                        a.standards.JIS.toLowerCase().includes(alloySearchQuery.toLowerCase());
                  return matchesType && matchesSearch;
                }).map(a => {
                  const isChosen = a.id === activeAlloyId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActiveAlloyId(a.id)}
                      className={`w-full text-left p-3 border rounded-none transition-all flex justify-between items-center ${
                        isChosen 
                          ? 'bg-slate-800 border-cyan-500 text-slate-100' 
                          : 'bg-slate-950/30 border-slate-850 hover:bg-slate-850/50 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-cyan-500 uppercase font-mono block">
                          {a.type} Alloy
                        </span>
                        <span className="text-xs font-mono font-black tracking-wide block">{a.standards.JIS}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        {a.standards.ISO || a.standards.ASTM || ''}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Alloy Specifications Sheet Column */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 space-y-6">
              
              {/* Alloy Identification Card */}
              <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-black px-2 py-0.5 rounded-none font-mono uppercase">
                      JIS H {selectedAlloy.type === 'Aluminum' ? '5302-2000' : selectedAlloy.type === 'Zinc' ? '5301-1999' : '5303-2000'} Spec
                    </span>
                    <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 font-bold px-2 py-0.5 rounded-none font-mono">
                      {selectedAlloy.type} Matrix
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-100 mt-1.5 uppercase font-mono">
                    {selectedAlloy.name}
                  </h3>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase">Density Index</span>
                  <span className="font-extrabold text-slate-200">{selectedAlloy.properties.density}</span>
                </div>
              </div>

              {/* Chemical Constituent Table */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-405 font-bold uppercase font-mono tracking-wider block flex items-center gap-1">
                  <Atom className="h-3.5 w-3.5 text-cyan-500" />
                  Chemical Composition Matrix (% weight indices)
                </span>
                
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1 text-[10px] font-mono">
                  {Object.entries(selectedAlloy.chemistry).map(([el, value]) => (
                    <div key={el} className="bg-slate-950 border border-slate-850 p-2 text-center rounded-none">
                      <span className="text-slate-500 font-bold block">{el}</span>
                      <span className="text-slate-200 mt-0.5 block font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical & Mechanical Telemetry Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Mechanical Limits */}
                <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
                  <span className="text-[10px] text-slate-450 font-bold uppercase font-mono tracking-wider block border-b border-slate-850 pb-1.5 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-505" />
                    Mechanical Tensile & Hardness Limits
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block">TENSILE STRENGTH</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.tensile}</span>
                    </div>
                    {selectedAlloy.properties.yield && (
                      <div>
                        <span className="text-[9px] text-slate-500 block">YIELD STRENGTH</span>
                        <span className="font-bold text-slate-200 block">{selectedAlloy.properties.yield}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-slate-500 block">ELONGATION STATUS</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.elongation}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">BRINELL HARDNESS</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.hardness}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">IMPACT ENERGY toughness</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.impact}</span>
                    </div>
                  </div>
                </div>

                {/* Thermal Properties */}
                <div className="bg-slate-950 border border-slate-855 p-4 space-y-3">
                  <span className="text-[10px] text-slate-450 font-bold uppercase font-mono tracking-wider block border-b border-slate-850 pb-1.5 flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                    Crystallization & Thermal profile
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block">LIQUIDUS PHASE</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.liquidus}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">SOLIDUS PHASE</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.solidus}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">THERMAL CONDUCTIVITY</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.thermal_cond}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">EXPANSION RATIO</span>
                      <span className="font-bold text-slate-200 block">{selectedAlloy.properties.thermal_exp}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pros and Cons Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase font-mono tracking-wider block">
                    HPDC Casting Advantages (Pros)
                  </span>
                  <div className="bg-slate-950 border border-slate-850 p-3 h-36 overflow-y-auto space-y-2">
                    {selectedAlloy.pros.map((p, idx) => (
                      <p key={idx} className="text-[10.5px] text-slate-350 leading-relaxed font-sans block">
                        • {p}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase font-mono tracking-wider block">
                    HPDC Process Constraints (Cons)
                  </span>
                  <div className="bg-slate-950 border border-slate-850 p-3 h-36 overflow-y-auto space-y-2">
                    {selectedAlloy.cons.map((c, idx) => (
                      <p key={idx} className="text-[10.5px] text-slate-350 leading-relaxed font-sans block">
                        • {c}
                      </p>
                    ))}
                  </div>
                </div>

              </div>

              {/* Best Applications footer recommendation */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-none flex gap-3 text-[11px] text-slate-300 font-mono">
                <Bookmark className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-cyan-405 font-bold uppercase">Optimal Casting Applications:</span>
                  <p className="mt-1 text-slate-400 leading-relaxed">{selectedAlloy.bestAppDescription}</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: EXHAUSTIVE TELEMETRY SIMULATOR
          ======================================================== */}
      {subTab === 'simulator' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-slate-900 border-l-4 border-cyan-500 p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2 uppercase">
                <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
                Die Design & Process Telemetry Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time metallurgical telemetry: The engine automatically tests your current calculator parameters against standard gating flaws.
              </p>
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
                  value={simSearchQuery}
                  onChange={(e) => setSimSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 font-mono text-[11px] rounded-none pl-9 pr-3 py-2 focus:border-cyan-500"
                />
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
                        : 'bg-slate-950 border text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Defects List */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredSimDefects.map(d => {
                  const currentEval = d.riskEvaluation(inputs, outputs);
                  const isSelected = activeSimDefectId === d.id;
                  
                  // Color matching
                  let pillColor = 'border-slate-850 bg-slate-950 text-slate-405';
                  if (currentEval.level === 'critical') pillColor = 'border-rose-900 bg-rose-950/20 text-rose-450';
                  else if (currentEval.level === 'high') pillColor = 'border-amber-900 bg-amber-950/20 text-amber-500';

                  return (
                    <button
                      key={d.id}
                      onClick={() => setActiveSimDefectId(d.id)}
                      className={`w-full text-left p-3 border transition-all rounded-none flex items-start justify-between gap-2 mr-2 ${
                        isSelected 
                          ? 'bg-slate-800 border-cyan-500 text-slate-100 font-bold' 
                          : 'bg-slate-950/30 border-slate-850 hover:bg-slate-850/50 text-slate-315'
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
              </div>
            </div>

            {/* Right Side: Heavy Diagnostic Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Defect Core Summary Panel */}
              <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-black px-2 py-0.5 rounded-none font-mono uppercase tracking-widest">
                      {activeSimDefect.category} Phase Failure
                    </span>
                    <h4 className="text-sm font-black tracking-wide text-slate-100 mt-1 uppercase">
                      {activeSimDefect.name}
                    </h4>
                  </div>

                  {/* Dynamic Status Display */}
                  <div className={`px-3 py-1.5 border font-mono text-xs rounded-none font-extrabold flex items-center gap-1.5 uppercase ${
                    simEvalResult.level === 'critical' ? 'bg-rose-950 border-rose-500 text-rose-450' :
                    simEvalResult.level === 'high' ? 'bg-amber-950 border-amber-500 text-amber-500' :
                    simEvalResult.level === 'low' ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400' :
                    'bg-emerald-950 border-emerald-500 text-emerald-400'
                  }`}>
                    {simEvalResult.level === 'none' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 animate-bounce" />}
                    Risk Layer: {simEvalResult.level === 'none' ? 'None (Protected)' : simEvalResult.level}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeSimDefect.description}
                </p>

                {/* Simulated interactive breakdown schema */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-none flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* Graphic Dynamic Box */}
                  <div className="w-32 h-32 bg-slate-900 border border-slate-800 relative flex items-center justify-center flex-shrink-0 overflow-hidden box-border">
                    {activeSimDefect.diagramType === 'voids' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 flex items-center justify-center p-2 relative">
                          <div className="absolute top-2 left-4 w-4 h-4 rounded-full bg-slate-950 border border-slate-705"></div>
                          <div className="absolute top-10 right-3 w-5 h-5 rounded-full bg-slate-950 border border-slate-705"></div>
                          <div className="absolute bottom-3 left-6 w-3 h-3 rounded-full bg-slate-950 border border-slate-710"></div>
                          <span className="text-[8px] font-mono font-bold text-slate-500 z-10 leading-none text-center">Smooth gas-void pockets</span>
                        </div>
                      </div>
                    )}
                    {activeSimDefect.diagramType === 'spongy' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-707 flex items-center justify-center p-2 relative">
                          <div className="absolute inset-4 bg-slate-950 border border-dashed border-red-900 flex items-center justify-center rounded-sm">
                            <span className="text-[7px] text-red-400 font-mono uppercase">Dendrites</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeSimDefect.diagramType === 'seam' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 p-2 relative flex flex-col justify-between">
                          <div className="text-[8px] text-cyan-400 font-mono">Stream A ➡</div>
                          <div className="h-full w-[2px] bg-rose-500 absolute left-12 top-0 bottom-0 shadow-lg"></div>
                          <div className="text-[8px] text-left text-cyan-400 font-mono self-end">⬅ Stream B</div>
                        </div>
                      </div>
                    )}
                    {activeSimDefect.diagramType === 'soldering' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 p-1 relative flex items-center justify-center">
                          <div className="absolute -right-2 top-2 bottom-2 w-5 bg-rose-950/50 border border-rose-800 flex items-center justify-center">
                            <span className="text-[7px] text-rose-400 font-mono -rotate-90">Die Steel</span>
                          </div>
                          <div className="absolute right-3 top-4 w-4 h-12 bg-slate-950 border-y border-l border-cyan-800 rounded-l flex items-center justify-center select-none text-[6px] text-cyan-400">
                            Al Paste
                          </div>
                        </div>
                      </div>
                    )}
                    {activeSimDefect.diagramType === 'spitting' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 relative flex items-center justify-center">
                          <div className="h-[2px] w-full bg-amber-500 absolute top-12"></div>
                          <div className="w-8 h-2 bg-amber-500 border border-amber-400 absolute right-0 top-11 rounded-r animate-pulse"></div>
                        </div>
                      </div>
                    )}
                    {activeSimDefect.diagramType === 'blister' && (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-sm border border-slate-700 relative flex items-center justify-center p-1">
                          <div className="w-16 h-8 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center relative shadow-lg">
                            <div className="absolute -top-3 w-4 h-4 bg-slate-950 border border-slate-700 rounded-full"></div>
                            <span className="text-[7px] text-cyan-500 font-mono font-bold">Injected gas</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text explanation */}
                  <div className="space-y-2 text-xs leading-relaxed text-slate-350">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono block">DIAGNOSTIC CRITICAL FAILURE CAUSE</span>
                    <p>{activeSimDefect.whyItHappens}</p>
                    <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><b>Part Failure Shape:</b> {activeSimDefect.diagramType.replace(/^\w/, c => c.toUpperCase())} pattern</div>
                      <div><b>Key metallurgical factors:</b> Air release & solid solidification delays</div>
                    </div>
                  </div>
                </div>

                {/* Design Telemetry Evaluation Reason */}
                <div className={`p-4 border rounded-none flex gap-3 ${
                  simEvalResult.level === 'critical' ? 'bg-rose-950/20 border-rose-900' :
                  simEvalResult.level === 'high' ? 'bg-amber-950/20 border-amber-900' :
                  simEvalResult.level === 'low' ? 'bg-cyan-950/20 border-cyan-900' :
                  'bg-slate-950 border-slate-850'
                }`}>
                  <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    simEvalResult.level === 'critical' ? 'text-rose-450' :
                    simEvalResult.level === 'high' ? 'text-amber-500' :
                    simEvalResult.level === 'low' ? 'text-cyan-400' :
                    'text-slate-400'
                  }`} />
                  
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-205 tracking-wider font-mono block">Real-time Gating Evaluation Details</span>
                    <p className="text-xs leading-relaxed text-slate-350">{simEvalResult.triggerReason}</p>

                    {/* Micro KPI panel comparing user current to theory */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-900 mt-2">
                      {simEvalResult.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-950/50 p-2 border border-slate-900">
                          <span className="text-[9px] text-slate-500 tracking-wide font-mono block uppercase">{m.label}</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xs font-mono font-bold text-slate-200">{m.current}</span>
                            <span className="text-[8px] font-mono text-slate-550">v {m.recommended}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preventative Solutions Column Grid */}
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
                    {activeSimDefect.dieDesignPreventions.map((sol, index) => (
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
                <div className="bg-slate-900 border border-slate-850 p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Sliders className="h-4.5 w-4.5 text-cyan-400" />
                    <h4 className="text-xs font-black tracking-widest text-slate-100 uppercase">
                      Process Control Preventions
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {activeSimDefect.processPreventions.map((sol, index) => (
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

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

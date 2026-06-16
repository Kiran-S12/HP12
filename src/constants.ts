/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlloyConfig, HPDCInputs } from './types';

export const ALLOYS: AlloyConfig[] = [
  {
    name: 'ADC12 (Al)',
    type: 'Al',
    defaultDensity: 2.54,
    minGateVelocity: 30.0,
    maxGateVelocity: 50.0,
    requiredJNumber: 525.0,
    recommendedGateThicknessRange: { min: 0.8, max: 2.5 }
  },
  {
    name: 'LM24 (Al)',
    type: 'Al',
    defaultDensity: 2.54,
    minGateVelocity: 30.0,
    maxGateVelocity: 50.0,
    requiredJNumber: 525.0,
    recommendedGateThicknessRange: { min: 0.8, max: 2.5 }
  },
  {
    name: 'Zamak-3 (Zn)',
    type: 'Zn',
    defaultDensity: 6.60,
    minGateVelocity: 25.0,
    maxGateVelocity: 40.0,
    requiredJNumber: 624.0,
    recommendedGateThicknessRange: { min: 0.4, max: 1.5 }
  },
  {
    name: 'Zamak-5 (Zn)',
    type: 'Zn',
    defaultDensity: 6.60,
    minGateVelocity: 25.0,
    maxGateVelocity: 40.0,
    requiredJNumber: 624.0,
    recommendedGateThicknessRange: { min: 0.4, max: 1.5 }
  },
  {
    name: 'AM60 (Mg)',
    type: 'Mg',
    defaultDensity: 1.81,
    minGateVelocity: 35.0,
    maxGateVelocity: 60.0,
    requiredJNumber: 400.0,
    recommendedGateThicknessRange: { min: 0.8, max: 2.8 }
  },
  {
    name: 'AZ91D (Mg)',
    type: 'Mg',
    defaultDensity: 1.81,
    minGateVelocity: 35.0,
    maxGateVelocity: 60.0,
    requiredJNumber: 400.0,
    recommendedGateThicknessRange: { min: 0.8, max: 2.8 }
  }
];

export const DEFAULT_INPUTS: HPDCInputs = {
  id: 'default-design-1',
  name: 'Oveal Fan Valaki Design',
  lastModified: Date.now(),
  alloy: 'ADC12 (Al)',
  density: 2.54,
  w_casting: 243.0,
  w_overflow: 72.0,
  w_runner: 260.0,
  casting_thickness: 2.0,
  projected_area: 245.0,
  biscuit_thickness: 2.0,
  sleeve_length: 34.0,
  plunger_dia: 5.0,
  selected_clamping: 180.0,
  fast_shot_speed: 2.50,
  gate_area: 1.50,
  gate_thickness: 1.5,
  casting_pressure: 80.0,
  intensifier_dia: 11.0,

  // Hydraulic Cylinder Core-Pull defaults
  cylinder_bore: 63,
  cylinder_rod: 28,
  contact_area: 20629,
  projected_core_area: 16620,
  slide_length: 15,
  wall_thickness: 8,
  pressure_factor: 0.34,
  cooling_stress: 28,
  core_casting_pressure: 750,
  hydraulic_system_pressure: 160,

  // Tie Bar Balance defaults
  tie_bar_total_projected_area: 400.00,
  tie_bar_injection_pressure: 800.00,
  tie_bar_distance: 630.00,
  tie_bar_selected_machine: 420.00,
  centroid_x: 0.20,
  centroid_y: -1.50,
};

// Recommended Gate Thickness based on Minimum Casting Wall Thickness (mm)
export interface GateThicknessRecommendation {
  wallMax: number;
  aluminum: number;
  zinc: number;
  magnesium: number;
}

export const GATE_THICKNESS_RECOMMENDATIONS: GateThicknessRecommendation[] = [
  { wallMax: 1.5, aluminum: 0.825, zinc: 0.450, magnesium: 0.800 },
  { wallMax: 2.5, aluminum: 1.025, zinc: 0.725, magnesium: 1.000 },
  { wallMax: 4.0, aluminum: 1.425, zinc: 1.100, magnesium: 1.400 },
  { wallMax: 6.0, aluminum: 1.800, zinc: 1.500, magnesium: 1.800 },
];

export const WALLACE_J_THRESHOLD_EXPLANATION = `
The Wallace/NADCA J-number determines whether liquid metal atomizes into a spray or flows as a cohesive stream.
An atomized spray is critical to guarantee sound surface finishes, complete fill with minimum gas entrapment, and low internal porosity in thin-walled castings.
`;

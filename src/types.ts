/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HPDCInputs {
  id: string;
  name: string;
  lastModified: number;
  
  // Material & Alloy Configuration
  alloy: string;
  density: number; // g/cm³
  
  // Shot Weights (g)
  w_casting: number; // g
  w_overflow: number; // g
  w_runner: number; // g
  
  // Tool & Physical Dimensions
  casting_thickness: number; // mm (Casting Minimum Wall Thickness)
  projected_area: number; // cm² (Total Projected Area)
  biscuit_thickness: number; // cm
  
  // Sleeve & Plunger Configuration
  sleeve_length: number; // cm
  plunger_dia: number; // cm
  
  // Machine Settings
  selected_clamping: number; // Tons
  fast_shot_speed: number; // m/s
  gate_area: number; // cm²
  gate_thickness: number; // mm
  casting_pressure: number; // MPa
  intensifier_dia: number; // cm

  // Hydraulic Cylinder Core-Pull Configuration
  cylinder_bore?: number; // mm
  cylinder_rod?: number; // mm
  contact_area?: number; // mm²
  projected_core_area?: number; // mm²
  slide_length?: number; // mm
  wall_thickness?: number; // mm
  pressure_factor?: number; // N/mm²
  cooling_stress?: number; // MPa
  core_casting_pressure?: number; // Kg/cm²
  hydraulic_system_pressure?: number; // Kg/cm²

  // Tie Bar Balance Configuration
  tie_bar_total_projected_area?: number; // cm²
  tie_bar_injection_pressure?: number; // Kg/cm²
  tie_bar_distance?: number; // mm
  tie_bar_selected_machine?: number; // Tons
  centroid_x?: number; // mm
  centroid_y?: number; // mm
}

export interface HPDCOutputs {
  // Volumetric Results
  shot_weight: number; // g
  yield_pct: number; // %
  cavity_volume: number; // cm³
  shot_volume: number; // cm³
  
  // Sleeve Configuration
  plunger_area: number; // cm²
  sleeve_capacity: number; // cm³
  filling_ratio: number; // %
  
  // Gating Stroke Profile
  fast_shot_length: number; // cm
  slow_shot_length: number; // cm
  
  // Gating Flow Dynamics
  flow_rate_actual: number; // cc/s
  metal_speed_gate: number; // m/s
  gate_width: number; // mm (derived)
  
  // Wallace/NADCA Atomization J-Number
  j_actual: number;
  j_required: number;
  j_passed: boolean;
  
  // Machine Clamping Dynamics
  clamping_required: number; // Tons
  spare_force_ratio: number; // %
  clamping_status: 'safe' | 'warning' | 'critical';
  
  // Intensification Details
  area_ratio: number;
  intensification_pressure: number; // MPa

  // Hydraulic Cylinder Outputs
  hyd_piston_area: number; // cm²
  hyd_rod_area: number; // cm²
  hyd_net_pull_area: number; // cm²
  calc_push_force_req: number; // Kg
  piston_push_force: number; // Kg
  piston_push_status: boolean;
  calc_pull_force_req_nadca01: number; // Kg
  calc_pull_force_req_nadca02: number; // Kg
  piston_pull_force: number; // Kg
  piston_pull_status: boolean;

  // Tie Bar Balance Outputs
  tie_bar_calc_tonnage: number; // Tons
  tie_bar_f1: number; // Tons
  tie_bar_f2: number; // Tons
  tie_bar_f3: number; // Tons
  tie_bar_f4: number; // Tons
  tie_bar_f1_plus_f2: number; // Tons
  tie_bar_f3_plus_f4: number; // Tons
  tie_bar_f1_ratio_f2: number;
  tie_bar_f4_ratio_f3: number;
}

export interface AlloyConfig {
  name: string;
  type: 'Al' | 'Zn' | 'Mg';
  defaultDensity: number;
  minGateVelocity: number;
  maxGateVelocity: number;
  requiredJNumber: number;
  recommendedGateThicknessRange: { min: number; max: number };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HPDCInputs, HPDCOutputs } from './types';
import { ALLOYS } from './constants';

export function calculateHPDC(inputs: HPDCInputs): HPDCOutputs {
  const {
    density,
    w_casting,
    w_overflow,
    w_runner,
    biscuit_thickness,
    sleeve_length,
    plunger_dia,
    gate_area,
    gate_thickness,
    fast_shot_speed,
    projected_area,
    casting_pressure,
    selected_clamping,
    intensifier_dia,
    alloy
  } = inputs;

  // 1. Volumetric Calculations
  const shot_weight = w_casting + w_overflow + w_runner;
  const yield_pct = shot_weight > 0 ? (w_casting / shot_weight) * 100 : 0;
  const cavity_volume = density > 0 ? (w_casting + w_overflow) / density : 0;
  const shot_volume = density > 0 ? shot_weight / density : 0;

  // 2. Sleeve Configuration
  const plunger_area = Math.PI * Math.pow(plunger_dia / 2, 2);
  const sleeve_capacity = plunger_area * sleeve_length;
  const filling_ratio = sleeve_capacity > 0 ? (shot_volume / sleeve_capacity) * 100 : 0;

  // 3. Stroke Profile
  const fast_shot_length = plunger_area > 0 ? cavity_volume / plunger_area : 0;
  const slow_shot_length = Math.max(0, sleeve_length - biscuit_thickness - fast_shot_length);

  // 4. Gating Flow Dynamics
  // Fast shot speed in m/s converted to cm/s is speed * 100.
  // Flow rate (cc/sec) = plunger area (cm²) * speed (cm/s)
  const flow_rate_actual = plunger_area * (fast_shot_speed * 100);
  
  // Metal speed at gate (m/s) = flow_rate_actual (cm³/s) / gate_area (cm²) / 100 (cm/m)
  const metal_speed_gate = gate_area > 0 ? flow_rate_actual / gate_area / 100 : 0;

  // Gate Width (mm) = (Gate Area * 100) / Gate Thickness (mm)
  // 1 cm² = 100 mm²
  const gate_width = gate_thickness > 0 ? (gate_area * 100) / gate_thickness : 0;

  // 5. Wallace/NADCA Atomization J-Number
  // Formulas: J = t_gate (mm) * density (g/cm³) * V_gate^(1.71)
  const optAlloy = ALLOYS.find(a => a.name === alloy);
  const j_required = optAlloy ? optAlloy.requiredJNumber : 525.0;
  
  const j_actual = gate_thickness * density * Math.pow(metal_speed_gate, 1.71);
  const j_passed = j_actual >= j_required;

  // 6. Clamping Tonnage Mechanics
  const clamping_required = projected_area * casting_pressure * 0.01;
  const spare_force_ratio = selected_clamping > 0 
    ? ((selected_clamping - clamping_required) / selected_clamping) * 100 
    : 0;

  let clamping_status: 'safe' | 'warning' | 'critical' = 'safe';
  if (spare_force_ratio < 0) {
    clamping_status = 'critical';
  } else if (spare_force_ratio < 15) {
    clamping_status = 'warning';
  }

  // 7. Intensification Calculations
  const area_ratio = plunger_dia > 0 ? Math.pow(intensifier_dia / plunger_dia, 2) : 1;
  const intensification_pressure = area_ratio > 0 ? casting_pressure / area_ratio : 0;

  // 8. Hydraulic Cylinder Core-Pull Calculations
  const cyl_bore = inputs.cylinder_bore ?? 63;
  const cyl_rod = inputs.cylinder_rod ?? 28;
  const cont_area = inputs.contact_area ?? 20629;
  const proj_core_area = inputs.projected_core_area ?? 16620;
  const cool_stress = inputs.cooling_stress ?? 28;
  const core_cast_pressure = inputs.core_casting_pressure ?? 750;
  const hyd_sys_pressure = inputs.hydraulic_system_pressure ?? 160;

  const hyd_piston_area = Math.PI * Math.pow((cyl_bore / 10) / 2, 2);
  const hyd_rod_area = Math.PI * Math.pow((cyl_rod / 10) / 2, 2);
  const hyd_net_pull_area = Math.max(0, hyd_piston_area - hyd_rod_area);

  const proj_core_area_cm2 = proj_core_area / 100;
  const calc_push_force_req = proj_core_area_cm2 * core_cast_pressure * 1.25;
  const piston_push_force = hyd_piston_area * hyd_sys_pressure;
  const piston_push_status = piston_push_force >= calc_push_force_req;

  const calc_pull_force_req_nadca01 = cont_area * cool_stress * 0.1019716 * 0.015067 * 1.25;
  const calc_pull_force_req_nadca02 = cont_area * cool_stress * 0.1019716 * 0.011631 * 1.25;
  const piston_pull_force = hyd_net_pull_area * hyd_sys_pressure;
  const piston_pull_status = piston_pull_force >= calc_pull_force_req_nadca01;

  // 9. Tie Bar Balance Calculations
  const tb_proj_area = inputs.tie_bar_total_projected_area ?? 400;
  const tb_inj_pressure = inputs.tie_bar_injection_pressure ?? 800;
  const tb_distance = inputs.tie_bar_distance ?? 630;
  const tb_centroid_x = inputs.centroid_x ?? 0.20;
  const tb_centroid_y = inputs.centroid_y ?? -1.50;

  const tie_bar_calc_tonnage = tb_proj_area * tb_inj_pressure / 1000;
  const tb_f0 = tie_bar_calc_tonnage / 4;
  const delta_f_x = tb_f0 * (2 * tb_centroid_x / tb_distance);
  const delta_f_y = tb_f0 * (2 * tb_centroid_y / tb_distance);

  const tie_bar_f1 = tb_f0 - delta_f_x - delta_f_y;
  const tie_bar_f2 = tb_f0 - delta_f_x + delta_f_y;
  const tie_bar_f3 = tb_f0 + delta_f_x + delta_f_y;
  const tie_bar_f4 = tb_f0 + delta_f_x - delta_f_y;

  const tie_bar_f1_plus_f2 = tie_bar_f1 + tie_bar_f2;
  const tie_bar_f3_plus_f4 = tie_bar_f3 + tie_bar_f4;
  const tie_bar_f1_ratio_f2 = tie_bar_f2 > 0 ? tie_bar_f1 / tie_bar_f2 : 1;
  const tie_bar_f4_ratio_f3 = tie_bar_f3 > 0 ? tie_bar_f4 / tie_bar_f3 : 1;

  return {
    shot_weight,
    yield_pct,
    cavity_volume,
    shot_volume,
    plunger_area,
    sleeve_capacity,
    filling_ratio,
    fast_shot_length,
    slow_shot_length,
    flow_rate_actual,
    metal_speed_gate,
    gate_width,
    j_actual,
    j_required,
    j_passed,
    clamping_required,
    spare_force_ratio,
    clamping_status,
    area_ratio,
    intensification_pressure,

    // Hydraulic Cylinder
    hyd_piston_area,
    hyd_rod_area,
    hyd_net_pull_area,
    calc_push_force_req,
    piston_push_force,
    piston_push_status,
    calc_pull_force_req_nadca01,
    calc_pull_force_req_nadca02,
    piston_pull_force,
    piston_pull_status,

    // Tie Bar Balance
    tie_bar_calc_tonnage,
    tie_bar_f1,
    tie_bar_f2,
    tie_bar_f3,
    tie_bar_f4,
    tie_bar_f1_plus_f2,
    tie_bar_f3_plus_f4,
    tie_bar_f1_ratio_f2,
    tie_bar_f4_ratio_f3
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HPDCInputs, HPDCOutputs } from './types';
import { calculateHPDC } from './utils';
import { SleeveSimulation } from './components/SleeveSimulation';
import { GateSimulation } from './components/GateSimulation';
import { GatingReference } from './components/GatingReference';
import { FormulaSheet } from './components/FormulaSheet';
import { CylinderCalculation } from './components/CylinderCalculation';
import { TieBarBalance } from './components/TieBarBalance';
import { DefectExplorer } from './components/DefectExplorer';
import { PartCostingSheet } from './components/PartCostingSheet';
import { PQ2Diagram } from './components/PQ2Diagram';
import { DEFAULT_INPUTS, ALLOYS } from './constants';
import { 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw, 
  Printer, 
  Layers, 
  Sliders, 
  BookOpen, 
  TrendingUp, 
  Download, 
  Upload, 
  Wrench, 
  Atom, 
  Gauge, 
  ShieldAlert, 
  FolderOpen, 
  Save,
  Check,
  ChevronDown,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // Saved designs state (stored in localStorage)
  const [designs, setDesigns] = useState<HPDCInputs[]>([]);
  const [activeDesignId, setActiveDesignId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sleeve' | 'gate' | 'formulas' | 'guidelines' | 'cylinder' | 'tiebar' | 'defects' | 'costing' | 'pq2'>('sleeve');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // active inputs (shallow copy)
  const [inputs, setInputs] = useState<HPDCInputs>(DEFAULT_INPUTS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load designs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hpdc_gate_designs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as HPDCInputs[];
        if (parsed.length > 0) {
          setDesigns(parsed);
          setActiveDesignId(parsed[0].id);
          setInputs(parsed[0]);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved hpdc designs', e);
      }
    }
    // Fallback if empty
    setDesigns([DEFAULT_INPUTS]);
    setActiveDesignId(DEFAULT_INPUTS.id);
    setInputs(DEFAULT_INPUTS);
  }, []);

  // Sync state to local storage when designs modify
  const saveAllDesigns = (updatedList: HPDCInputs[]) => {
    setDesigns(updatedList);
    localStorage.setItem('hpdc_gate_designs', JSON.stringify(updatedList));
  };

  const handleInputChange = (field: keyof HPDCInputs, value: any) => {
    const updatedInputs = { ...inputs, [field]: value, lastModified: Date.now() };
    
    // Auto sync liquid density on alloy change if custom density is not modified yet
    if (field === 'alloy') {
      const selectedAlloy = ALLOYS.find(a => a.name === value);
      if (selectedAlloy) {
        updatedInputs.density = selectedAlloy.defaultDensity;
      }
    }

    setInputs(updatedInputs);

    // Update active design in the list
    const updatedList = designs.map(d => d.id === inputs.id ? updatedInputs : d);
    saveAllDesigns(updatedList);
  };

  // Create new design
  const handleCreateNew = () => {
    const randomId = 'design-' + Math.random().toString(36).substring(2, 9);
    const newDesign: HPDCInputs = {
      ...DEFAULT_INPUTS,
      id: randomId,
      name: `Design Configuration #${designs.length + 1}`,
      lastModified: Date.now()
    };
    const updatedList = [...designs, newDesign];
    saveAllDesigns(updatedList);
    setActiveDesignId(randomId);
    setInputs(newDesign);
  };

  // Duplicate current design
  const handleDuplicate = () => {
    const randomId = 'design-' + Math.random().toString(36).substring(2, 9);
    const duplicated: HPDCInputs = {
      ...inputs,
      id: randomId,
      name: `${inputs.name} (Copy)`,
      lastModified: Date.now()
    };
    const updatedList = [...designs, duplicated];
    saveAllDesigns(updatedList);
    setActiveDesignId(randomId);
    setInputs(duplicated);
  };

  // Delete current design
  const handleDelete = () => {
    if (designs.length <= 1) {
      alert('You must keep at least one gating design configuration.');
      return;
    }
    const updatedList = designs.filter(d => d.id !== inputs.id);
    saveAllDesigns(updatedList);
    const nextActive = updatedList[0];
    setActiveDesignId(nextActive.id);
    setInputs(nextActive);
  };

  // Select another design
  const handleSelectDesign = (id: string) => {
    const design = designs.find(d => d.id === id);
    if (design) {
      setActiveDesignId(id);
      setInputs(design);
    }
  };

  // Reset to NADCA standard inputs
  const handleResetToDefaults = () => {
    if (window.confirm('Reset this current design configuration to default factory data? This cannot be undone.')) {
      const updated: HPDCInputs = {
        ...inputs,
        name: DEFAULT_INPUTS.name,
        alloy: DEFAULT_INPUTS.alloy,
        density: DEFAULT_INPUTS.density,
        w_casting: DEFAULT_INPUTS.w_casting,
        w_overflow: DEFAULT_INPUTS.w_overflow,
        w_runner: DEFAULT_INPUTS.w_runner,
        casting_thickness: DEFAULT_INPUTS.casting_thickness,
        projected_area: DEFAULT_INPUTS.projected_area,
        biscuit_thickness: DEFAULT_INPUTS.biscuit_thickness,
        sleeve_length: DEFAULT_INPUTS.sleeve_length,
        plunger_dia: DEFAULT_INPUTS.plunger_dia,
        selected_clamping: DEFAULT_INPUTS.selected_clamping,
        fast_shot_speed: DEFAULT_INPUTS.fast_shot_speed,
        gate_area: DEFAULT_INPUTS.gate_area,
        gate_thickness: DEFAULT_INPUTS.gate_thickness,
        casting_pressure: DEFAULT_INPUTS.casting_pressure,
        intensifier_dia: DEFAULT_INPUTS.intensifier_dia,
        
        cylinder_bore: DEFAULT_INPUTS.cylinder_bore,
        cylinder_rod: DEFAULT_INPUTS.cylinder_rod,
        contact_area: DEFAULT_INPUTS.contact_area,
        projected_core_area: DEFAULT_INPUTS.projected_core_area,
        slide_length: DEFAULT_INPUTS.slide_length,
        wall_thickness: DEFAULT_INPUTS.wall_thickness,
        pressure_factor: DEFAULT_INPUTS.pressure_factor,
        cooling_stress: DEFAULT_INPUTS.cooling_stress,
        core_casting_pressure: DEFAULT_INPUTS.core_casting_pressure,
        hydraulic_system_pressure: DEFAULT_INPUTS.hydraulic_system_pressure,

        tie_bar_total_projected_area: DEFAULT_INPUTS.tie_bar_total_projected_area,
        tie_bar_injection_pressure: DEFAULT_INPUTS.tie_bar_injection_pressure,
        tie_bar_distance: DEFAULT_INPUTS.tie_bar_distance,
        tie_bar_selected_machine: DEFAULT_INPUTS.tie_bar_selected_machine,
        centroid_x: DEFAULT_INPUTS.centroid_x,
        centroid_y: DEFAULT_INPUTS.centroid_y,
        lastModified: Date.now()
      };
      setInputs(updated);
      const updatedList = designs.map(d => d.id === inputs.id ? updated : d);
      saveAllDesigns(updatedList);
    }
  };

  // Export JSON Gating Profile
  const handleExportJSON = () => {
    const fileData = JSON.stringify(inputs, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inputs.name.toLowerCase().replace(/\s+/g, '_')}_gating_profile.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON configuration
  const handleImportJSONSubmit = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.alloy || !parsed.w_casting || !parsed.plunger_dia) {
        setImportError('Invalid format. Confirms keys include alloy, w_casting, plunger_dia, etc.');
        return;
      }
      const randomId = 'design-' + Math.random().toString(36).substring(2, 9);
      const imported: HPDCInputs = {
        ...DEFAULT_INPUTS,
        ...parsed,
        id: randomId,
        lastModified: Date.now()
      };
      
      const updatedList = [...designs, imported];
      saveAllDesigns(updatedList);
      setActiveDesignId(randomId);
      setInputs(imported);
      setShowImportModal(false);
      setImportJsonText('');
      setImportError('');
    } catch (e) {
      setImportError('JSON parsing error. Verify syntax.');
    }
  };

  // Export CSV design sheet
  const handleExportCSV = () => {
    const dataRows = [
      ['HPDC Gate Design Sheet Export'],
      ['Parameter', 'Symbol', 'Input Value', 'Units', 'Formula used'],
      ['Part Design Name', '-', inputs.name, '', ''],
      ['Alloy Material', '-', inputs.alloy, '', ''],
      ['Liquid density', 'ρ', inputs.density, 'g/cm³', ''],
      ['Casting Weight', 'W_casting', inputs.w_casting, 'g', ''],
      ['Overflow Weight', 'W_overflow', inputs.w_overflow, 'g', ''],
      ['Runner Weight', 'W_runner', inputs.w_runner, 'g', ''],
      ['Total Calculated Shot Weight', 'W_shot', outputs.shot_weight.toFixed(2), 'g', 'W_casting + W_overflow + W_runner'],
      ['Casting wall minim thickness', 'T_wall', inputs.casting_thickness, 'mm', ''],
      ['Projected Area', 'A_proj', inputs.projected_area, 'cm²', ''],
      ['Sleeve Length', 'L_sleeve', inputs.sleeve_length, 'cm', ''],
      ['Plunger diameter', 'D_plun', inputs.plunger_dia, 'cm', ''],
      ['Sleeve metal check Filling Ratio', 'F_ratio', outputs.filling_ratio.toFixed(2), '%', '(V_shot / C_sleeve) * 100'],
      ['Fast stroke S2', 'L_fast', outputs.fast_shot_length.toFixed(2), 'cm', 'V_cavity / Plunger Area'],
      ['Slow stroke S1', 'L_slow', outputs.slow_shot_length.toFixed(2), 'cm', 'L_sleeve - T_biscuit - L_fast'],
      ['Gate Area', 'A_gate', inputs.gate_area, 'cm²', ''],
      ['Gate Thickness', 't_gate', inputs.gate_thickness, 'mm', ''],
      ['Gate Speed velocity', 'V_gate', outputs.metal_speed_gate.toFixed(2), 'm/s', 'Q_act / G_area'],
      ['Wallace Atomization J number', 'J', outputs.j_actual.toFixed(0), 'dimensionless', 't_gate * Density * V_gate^1.71'],
      ['Clamping Force required', 'F_clamp', outputs.clamping_required.toFixed(2), 'Tons', 'A_proj * Casting pressure * 0.01'],
      ['Intensifier Cylinder Cylinder Area Ratio', 'R_area', outputs.area_ratio.toFixed(2), '', '(D_int / D_plun)^2'],
      ['Required Hydraulic Pressure', 'P_hydro', outputs.intensification_pressure.toFixed(2), 'MPa', 'Casting Pressure / Area Ratio'],
      ['---', '---', '---', '---', '---'],
      ['Hydraulic Cylinder Core-Pull Piston Area', 'A_piston', outputs.hyd_piston_area.toFixed(2), 'cm²', 'pi * (Bore / 10 / 2)^2'],
      ['Hydraulic Cylinder Core-Pull Net Pull Area', 'A_net_pull', outputs.hyd_net_pull_area.toFixed(2), 'cm²', 'Piston Area - Rod Area'],
      ['Cylinder Calculated Push Force Req', 'F_push_req', outputs.calc_push_force_req.toFixed(1), 'Kg', 'Proj Area (cm2) * Cast Press * 1.25'],
      ['Cylinder Realized Push Force', 'F_push_piston', outputs.piston_push_force.toFixed(1), 'Kg', 'Piston Area * System Pressure'],
      ['Cylinder Push Compliance Status', '-', outputs.piston_push_status ? 'COMPLIANT' : 'UNDERPOWER', '', ''],
      ['NADCA Pull Force Req (Method 01)', 'F_pull_nadca01', outputs.calc_pull_force_req_nadca01.toFixed(1), 'Kg', 'Contact Area * Stress * Friction * 1.25'],
      ['Cylinder Realized Pull Force', 'F_pull_cylinder', outputs.piston_pull_force.toFixed(1), 'Kg', 'Net Pull Area * System Pressure'],
      ['Cylinder Pull Compliance Status', '-', outputs.piston_pull_status ? 'COMPLIANT' : 'STUCK RISK', '', ''],
      ['---', '---', '---', '---', '---'],
      ['Tie Bar Calculated Injection Tonnage', 'T_calc', outputs.tie_bar_calc_tonnage.toFixed(1), 'Tons', 'Proj Area * Inj Pressure / 1000'],
      ['Tie Bar F1 Load (Top-Left)', 'F1', outputs.tie_bar_f1.toFixed(1), 'Tons', 'F0 - delta_f_x - delta_f_y'],
      ['Tie Bar F2 Load (Top-Right)', 'F2', outputs.tie_bar_f2.toFixed(1), 'Tons', 'F0 - delta_f_x + delta_f_y'],
      ['Tie Bar F3 Load (Bottom-Left)', 'F3', outputs.tie_bar_f3.toFixed(1), 'Tons', 'F0 + delta_f_x + delta_f_y'],
      ['Tie Bar F4 Load (Bottom-Right)', 'F4', outputs.tie_bar_f4.toFixed(1), 'Tons', 'F0 + delta_f_x - delta_f_y'],
      ['F1/F2 Eccentricity Ratio', 'R_top', outputs.tie_bar_f1_ratio_f2.toFixed(2), 'ratio', 'F1 / F2'],
      ['F4/F3 Eccentricity Ratio', 'R_bottom', outputs.tie_bar_f4_ratio_f3.toFixed(2), 'ratio', 'F4 / F3']
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + dataRows.map(e => e.map(item => `"${item}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${inputs.name.toLowerCase().replace(/\s+/g, '_')}_calculations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform active calculation
  const outputs: HPDCOutputs = calculateHPDC(inputs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans border-8 border-slate-900" id="app-root">
      
      {/* HEADER SECTION */}
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 print:hidden py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-cyan-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-inner border border-cyan-500">
              ⚡
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.2em] text-cyan-500 uppercase">HPDC GATE CORE v2.4</h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">NADCA & WALLACE PROCESS STANDARDS ENGINE</p>
            </div>
          </div>

          {/* Configuration system controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project dropdown selection */}
            <div className="flex items-center bg-slate-950 rounded-none border border-slate-800 p-1">
              <FolderOpen className="h-4 w-4 text-cyan-500 ml-2 mr-1" />
              <select 
                value={activeDesignId}
                onChange={(e) => handleSelectDesign(e.target.value)}
                className="bg-transparent text-xs text-cyan-400 font-mono focus:outline-none border-none py-1 pr-8 scrollbar-thin max-w-[180px] sm:max-w-[240px] font-semibold cursor-pointer uppercase"
              >
                {designs.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-950 text-slate-200">
                    {d.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile utilities */}
            <button 
              onClick={handleCreateNew}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-none px-3 py-2 shadow-sm transition-all text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 focus:ring-1 focus:ring-cyan-550"
              title="Create New Blank Design"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New</span>
            </button>
            <button 
              onClick={handleDuplicate}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-none px-3 py-2 shadow-sm transition-all text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 focus:ring-1 focus:ring-slate-800"
              title="Duplicate Gating Profile"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden md:inline">Clone</span>
            </button>
            <button 
              onClick={handleDelete}
              className="bg-slate-950 hover:bg-red-950 hover:border-red-800 border border-slate-800 text-rose-400 rounded-none p-2.5 shadow-sm transition-all focus:ring-1 focus:ring-rose-500"
              title="Delete Active Profile"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DETAILED PRINT REPORT VIEWS (Hidden on active page rendering) */}
      <div className="hidden print:block p-8 bg-white max-w-5xl mx-auto text-slate-950 font-sans" id="print-view">
        <div className="border-b-4 border-slate-900 pb-5 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">HPDC GATING COMPLIANCE REPORT</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">NADCA Die Casting Standards Gating & Hydraulics Calculation Sheet</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{inputs.name}</p>
            <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-slate-500">Target User: kiranshinde012@gmail.com</p>
          </div>
        </div>

        {/* Print overview dynamic KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Shot Weight</span>
            <span className="text-lg font-mono font-bold text-slate-900">{outputs.shot_weight.toFixed(1)} g</span>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Sleeve Fill Pct</span>
            <span className="text-lg font-mono font-bold text-slate-900">{outputs.filling_ratio.toFixed(1)}%</span>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Gate Velocity</span>
            <span className="text-lg font-mono font-bold text-slate-900">{outputs.metal_speed_gate.toFixed(1)} m/s</span>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Wallace J-Number</span>
            <span className="text-lg font-mono font-bold text-slate-900">{outputs.j_actual.toFixed(0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Inputs list */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Input Parameters (User Specified)</h3>
            <table className="w-full text-xs text-slate-800">
              <tbody>
                <tr className="border-b border-slate-100 py-1"><td className="font-semibold">Alloy Material</td><td className="text-right font-mono">{inputs.alloy} (ρ: {inputs.density} g/cm³)</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Casting Weight</td><td className="text-right font-mono">{inputs.w_casting} g</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Overflow Weight</td><td className="text-right font-mono">{inputs.w_overflow} g</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Runner & Biscuit</td><td className="text-right font-mono">{inputs.w_runner} g</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Min Part Thickness</td><td className="text-right font-mono">{inputs.casting_thickness} mm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Sleeve Total Length/Dia</td><td className="text-right font-mono">{inputs.sleeve_length} cm / {inputs.plunger_dia} cm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Sleeve Biscuit Thick</td><td className="text-right font-mono">{inputs.biscuit_thickness} cm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Projected Die Area</td><td className="text-right font-mono">{inputs.projected_area} cm²</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Spec. Metal Pressure</td><td className="text-right font-mono">{inputs.casting_pressure} MPa</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Selected Machine Lock</td><td className="text-right font-mono">{inputs.selected_clamping} Tons</td></tr>
              </tbody>
            </table>
          </div>

          {/* Calculations results list */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">Computed Dynamics (CAD/CAM Core)</h3>
            <table className="w-full text-xs text-slate-800">
              <tbody>
                <tr className="border-b border-slate-100 py-1"><td className="font-semibold">Yield Percentage</td><td className="text-right font-mono">{outputs.yield_pct.toFixed(1)} %</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Sleeve Fill Capacity</td><td className="text-right font-mono">{outputs.sleeve_capacity.toFixed(1)} cm³</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Slow Shot Stoke S1</td><td className="text-right font-mono">{outputs.slow_shot_length.toFixed(1)} cm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Fast Stroke Stroke S2</td><td className="text-right font-mono">{outputs.fast_shot_length.toFixed(1)} cm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Max Shot Flow Rate (Q)</td><td className="text-right font-mono">{outputs.flow_rate_actual.toFixed(0)} cc/sec</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Orifice Recalculated Width</td><td className="text-right font-mono">{outputs.gate_width.toFixed(1)} mm</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Required Lock Power</td><td className="text-right font-mono">{outputs.clamping_required.toFixed(1)} Tons</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Lock Safety Factor</td><td className="text-right font-mono">{outputs.spare_force_ratio.toFixed(1)} %</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Intensifier Area Ratio</td><td className="text-right font-mono">{outputs.area_ratio.toFixed(2)}</td></tr>
                <tr className="border-b border-slate-100 py-1"><td>Required Hydr Pressure</td><td className="text-right font-mono">{outputs.intensification_pressure.toFixed(1)} MPa</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[11px] leading-relaxed">
          <p className="font-bold text-slate-800 mb-1">🏁 Gating Verdict Summary:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your gate velocity is <span className="font-bold">{outputs.metal_speed_gate.toFixed(1)} m/s</span>. Recommended Al gating range is 30 - 50 m/s.</li>
            <li>Sleeve filling level behaves in {outputs.filling_ratio.toFixed(1)}% ratio. (Optimal fills lie between 30% and 55% to stop air cavities).</li>
            <li>The Wallace J-number computes to <span className="font-bold">{outputs.j_actual.toFixed(0)}</span> (Required: {outputs.j_required}). Status: <span className="font-bold">{outputs.j_passed ? 'PASS (Fully atomized mist spray)' : 'FAIL (Slight splashing stream jet)'}</span></li>
            <li>Die Locking Force spare efficiency margin behaves at {outputs.spare_force_ratio.toFixed(1)}%. {outputs.spare_force_ratio < 0 ? '⚠️ DANGER: Die parting flash risk is active!' : 'Standard lock buffer is verified.'}</li>
          </ul>
        </div>
      </div>

      {/* MAIN SCREEN LAYOUT Workspce (Hidden during browser printing) */}
      <main className="max-w-7xl mx-auto py-6 px-4 md:px-6 print:hidden">
        
        {/* DESIGN TITLE BAR & METADATA SAVE FEEDBACK */}
        <div className="bg-slate-900 border border-slate-800 p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl rounded-none">
          <div className="flex-1">
            <span className="text-[10px] text-slate-500 font-bold tracking-[0.15em] uppercase block mb-1">Active Design Sheet Configuration</span>
            <input 
              type="text"
              value={inputs.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full text-base font-black text-slate-100 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-cyan-500 focus:outline-none transition-all py-1 font-mono uppercase tracking-wider"
              placeholder="e.g. OVEAL FAN GATING CONFIGURATION"
            />
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-400 rounded-none px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 focus:outline-none transition-all"
            >
              <Download className="h-4 w-4" />
              Download CSV Sheet
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-none px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest focus:outline-none transition-all"
            >
              <Download className="h-4 w-4" />
              JSON Profile
            </button>
            <button
              onClick={() => {
                setImportJsonText('');
                setShowImportModal(true);
              }}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-none px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest focus:outline-none transition-all"
            >
              <Upload className="h-4 w-4" />
              Import Design
            </button>
            <button
              onClick={() => window.print()}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-none px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 focus:outline-none shadow-xl transition-all"
            >
              <Printer className="h-4 w-4" />
              Print PDF Report
            </button>
          </div>
        </div>

        {/* METRICS / HIGHLIGHTS RIBBON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Yield Weight Card */}
          <div className="bg-slate-900 border-l-4 border-cyan-500 p-4 shadow-xl rounded-none">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Total Shot Yield</p>
            <h2 className="text-2xl font-mono text-slate-100 mt-1">
              {outputs.yield_pct.toFixed(1)}<span className="text-xs text-slate-500 ml-1">%</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Weight: {Math.round(outputs.shot_weight)}g</p>
          </div>

          {/* Sleeve Fill Level Card */}
          <div className={`bg-slate-900 border-l-4 p-4 shadow-xl rounded-none ${
            outputs.filling_ratio >= 30 && outputs.filling_ratio <= 55 
              ? 'border-emerald-500' 
              : 'border-amber-500'
          }`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Sleeve Fill Ratio</p>
            <h2 className={`text-2xl font-mono mt-1 ${
              outputs.filling_ratio >= 30 && outputs.filling_ratio <= 55 ? 'text-slate-100' : 'text-amber-450'
            }`}>
              {outputs.filling_ratio.toFixed(1)}<span className="text-xs text-slate-500 ml-1">%</span>
            </h2>
            <p className={`text-[10px] font-mono mt-1 ${
              outputs.filling_ratio >= 30 && outputs.filling_ratio <= 55 ? 'text-emerald-500 font-semibold' : 'text-amber-500'
            }`}>
              {outputs.filling_ratio >= 30 && outputs.filling_ratio <= 55 ? '✔ Optimal Fill' : '⚠ Nonoptimal Fill'}
            </p>
          </div>

          {/* Gating speed Card */}
          <div className={`bg-slate-900 border-l-4 p-4 shadow-xl rounded-none ${
            outputs.metal_speed_gate < 30 || outputs.metal_speed_gate > 50 ? 'border-amber-500' : 'border-cyan-500'
          }`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Gate Fast Velocity</p>
            <h2 className="text-2xl font-mono text-slate-100 mt-1">
              {outputs.metal_speed_gate.toFixed(1)}<span className="text-xs text-slate-500 ml-1">m/s</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Width: {outputs.gate_width.toFixed(0)}mm</p>
          </div>

          {/* Machine Safety clamping Card */}
          <div className={`bg-slate-900 border-l-4 p-4 shadow-xl rounded-none ${
            outputs.spare_force_ratio < 0 
              ? 'border-rose-500' 
              : outputs.spare_force_ratio < 15 
                ? 'border-amber-500' 
                : 'border-emerald-500'
          }`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Clamping Margin</p>
            <h2 className={`text-2xl font-mono mt-1 ${
              outputs.spare_force_ratio < 0 ? 'text-rose-400' : 'text-slate-100'
            }`}>
              {outputs.spare_force_ratio >= 0 ? '+' : ''}{outputs.spare_force_ratio.toFixed(1)}<span className="text-xs text-slate-500 ml-1">%</span>
            </h2>
            <p className={`text-[10px] font-semibold mt-1 ${
              outputs.spare_force_ratio < 0 
                ? 'text-rose-500' 
                : outputs.spare_force_ratio < 15 
                  ? 'text-amber-500' 
                  : 'text-emerald-500'
            }`}>
              {outputs.spare_force_ratio < 0 ? '🚨 Flash Hazard!' : '✔ Clamping Safe'}
            </p>
          </div>
        </div>

        {/* WORKSPACE SIDE-BY-SIDE PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: DENSE INDUSTRIAL INPUT CONTROL SHARDS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input card container */}
            <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-none">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-100">
                  <Sliders className="h-4 w-4 text-cyan-500" />
                  <h3 className="text-xs font-black tracking-[0.15em] text-cyan-500 uppercase">Design Cockpit Inputs</h3>
                </div>
                <button
                  onClick={handleResetToDefaults}
                  className="text-[10px] hover:text-cyan-400 text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 focus:outline-none transition-colors"
                  title="Reset inputs to factory default"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Defaults
                </button>
              </div>

              {/* Shard 1: Material & Part Profile */}
              <div className="p-4 border-b border-slate-800 space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Alloy & Component Profile
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">ALLOY SELECTOR</label>
                    <select
                      value={inputs.alloy}
                      onChange={(e) => handleInputChange('alloy', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer uppercase font-semibold"
                    >
                      {ALLOYS.map((al) => (
                        <option key={al.name} value={al.name} className="bg-slate-950 text-slate-200">{al.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">DENSITY (g/cm³)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={inputs.density}
                      onChange={(e) => handleInputChange('density', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 truncate" title="Casting Weight (grams)">CAST WT (g)</label>
                    <input 
                      type="number"
                      step="1"
                      value={inputs.w_casting}
                      onChange={(e) => handleInputChange('w_casting', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 truncate" title="Overflow + Chillvent Weight (grams)">OVERFLOW (g)</label>
                    <input 
                      type="number"
                      step="1"
                      value={inputs.w_overflow}
                      onChange={(e) => handleInputChange('w_overflow', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1 truncate" title="Runner Weight (grams)">RUNNER (g)</label>
                    <input 
                      type="number"
                      step="1"
                      value={inputs.w_runner}
                      onChange={(e) => handleInputChange('w_runner', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">MIN THICKNESS (mm)</label>
                    <input 
                      type="number"
                      step="0.05"
                      value={inputs.casting_thickness}
                      onChange={(e) => handleInputChange('casting_thickness', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">PROJECTED AREA (cm²)</label>
                    <input 
                      type="number"
                      step="1"
                      value={inputs.projected_area}
                      onChange={(e) => handleInputChange('projected_area', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Shard 2: Sleeve and Shot settings */}
              <div className="p-4 border-b border-slate-800 space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Sleeve & Injection Parameters
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">SLEEVE L (cm)</label>
                    <input 
                      type="number"
                      step="0.5"
                      value={inputs.sleeve_length}
                      onChange={(e) => handleInputChange('sleeve_length', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">PLUNGER ø (cm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={inputs.plunger_dia}
                      onChange={(e) => handleInputChange('plunger_dia', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">BISCUIT t (cm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={inputs.biscuit_thickness}
                      onChange={(e) => handleInputChange('biscuit_thickness', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2 py-1 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">FAST SPEED (v, m/s)</label>
                    <input 
                      type="number"
                      step="0.05"
                      value={inputs.fast_shot_speed}
                      onChange={(e) => handleInputChange('fast_shot_speed', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">CAST PRESSURE (MPa)</label>
                    <input 
                      type="number"
                      step="5"
                      value={inputs.casting_pressure}
                      onChange={(e) => handleInputChange('casting_pressure', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Shard 3: Machine and Gate land settings */}
              <div className="p-4 space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Gating & Die Clamping setup
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">GATE AREA (Ag, cm²)</label>
                    <input 
                      type="number"
                      step="0.05"
                      value={inputs.gate_area}
                      onChange={(e) => handleInputChange('gate_area', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">GATE THICKNESS (mm)</label>
                    <input 
                      type="number"
                      step="0.05"
                      value={inputs.gate_thickness}
                      onChange={(e) => handleInputChange('gate_thickness', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">TONNAGE (Tons)</label>
                    <input 
                      type="number"
                      step="10"
                      value={inputs.selected_clamping}
                      onChange={(e) => handleInputChange('selected_clamping', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">INTENSIFIER ø (cm)</label>
                    <input 
                      type="number"
                      step="0.5"
                      value={inputs.intensifier_dia}
                      onChange={(e) => handleInputChange('intensifier_dia', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-none px-2.5 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Disclaimer & Standards Tag */}
            <div className="bg-slate-900 text-slate-400 p-4 rounded-none text-[10px] leading-relaxed border border-slate-800">
              <p className="font-bold text-slate-200 mb-1 uppercase tracking-wider">🔬 Mathematical Verification Basis</p>
              This HPDC engine computes core parameters relative to official <span className="text-cyan-400 font-mono">North American Die Casting Association (NADCA)</span> standards under the Wallace/Döhler gating physics framework. Sub-second liquid metal solidification dynamics make correct sleeve fills & J-regimes critical.
            </div>
          </div>

          {/* RIGHT COLUMN: WORKSPACE DASHBOARD (Simulators, Guides, Formulas info) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interactive Tab switchers */}
            <div className="bg-slate-900 border border-slate-800 p-2 flex flex-wrap gap-2 shadow-inner rounded-none">
              <button
                onClick={() => setActiveTab('sleeve')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'sleeve' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <Layers className="h-4 w-4" />
                Sleeve Simulator
              </button>
              <button
                onClick={() => setActiveTab('gate')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'gate' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <Atom className="h-4 w-4" />
                Gate Orifice
              </button>
              <button
                onClick={() => setActiveTab('cylinder')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'cylinder' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <Wrench className="h-4 w-4" />
                Hydro Cylinder
              </button>
              <button
                onClick={() => setActiveTab('tiebar')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'tiebar' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <Compass className="h-4 w-4" />
                Tie Bar Balance
              </button>
              <button
                onClick={() => setActiveTab('defects')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'defects' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Defects & Solutions
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'formulas' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Formulas
              </button>
              <button
                onClick={() => setActiveTab('guidelines')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'guidelines' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Guidelines
              </button>
              <button
                onClick={() => setActiveTab('costing')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'costing' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Costing Sheet
              </button>
              <button
                onClick={() => setActiveTab('pq2')}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide cursor-pointer ${
                  activeTab === 'pq2' 
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-950'
                }`}
              >
                <Gauge className="h-4 w-4" />
                PQ² Diagram
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="transition-all duration-300">
              {activeTab === 'sleeve' && (
                <div className="space-y-6">
                  <SleeveSimulation inputs={inputs} outputs={outputs} />
                  
                  {/* Detailed sleeve variables sheet */}
                  <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none">
                    <h4 className="text-xs font-black tracking-[0.15em] text-cyan-500 mb-3 block uppercase">Stroke Variables Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Plunge Area</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.plunger_area.toFixed(2)} cm²</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Max Capacity</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.sleeve_capacity.toFixed(1)} cm³</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Cavity Volume</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.cavity_volume.toFixed(2)} cm³</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Shot Vol</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.shot_volume.toFixed(2)} cm³</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gate' && (
                <div className="space-y-6">
                  <GateSimulation inputs={inputs} outputs={outputs} />

                  {/* Flow Dynamics variables sheet */}
                  <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl rounded-none">
                    <h4 className="text-xs font-black tracking-[0.15em] text-cyan-500 mb-3 block uppercase">Flow Dynametrics Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Actual Flow Rate</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{Math.round(outputs.flow_rate_actual)} cc/s</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Recalc Width (W)</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.gate_width.toFixed(1)} mm</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Casting Pressure</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{inputs.casting_pressure} MPa</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-none border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Intensifier Area R</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{outputs.area_ratio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'formulas' && (
                <FormulaSheet inputs={inputs} outputs={outputs} />
              )}

              {activeTab === 'cylinder' && (
                <CylinderCalculation inputs={inputs} outputs={outputs} onChange={handleInputChange} />
              )}

              {activeTab === 'tiebar' && (
                <TieBarBalance inputs={inputs} outputs={outputs} onChange={handleInputChange} />
              )}

              {activeTab === 'guidelines' && (
                <GatingReference inputs={inputs} outputs={outputs} />
              )}

              {activeTab === 'defects' && (
                <DefectExplorer inputs={inputs} outputs={outputs} />
              )}

              {activeTab === 'costing' && (
                <PartCostingSheet />
              )}

              {activeTab === 'pq2' && (
                <PQ2Diagram inputs={inputs} outputs={outputs} onChange={handleInputChange} />
              )}
            </div>

          </div>
        </div>
      </main>

      {/* IMPORT JSON MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 shadow-2xl rounded-none">
            <h3 className="text-base font-black tracking-wider text-slate-100 mb-2 uppercase">Import Gating Profile</h3>
            <p className="text-xs text-slate-400 mb-4">Paste the JSON config code here to load the parameters immediately.</p>
            
            <textarea 
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-none p-3 font-mono text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-cyan-400"
              placeholder='{ "alloy": "ADC12 (Al)", "w_casting": 243, "plunger_dia": 5.0, ... }'
            />
            {importError && <p className="text-[11px] text-rose-500 font-bold mt-1.5 font-mono">{importError}</p>}
            
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setShowImportModal(false)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-none px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleImportJSONSubmit}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-none px-4 py-2 text-xs font-mono font-black uppercase tracking-widest cursor-pointer"
              >
                Validate & Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

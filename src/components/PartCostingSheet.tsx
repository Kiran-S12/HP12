import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  Layers, 
  Settings, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Info, 
  Sliders, 
  Briefcase, 
  Wrench, 
  PenTool, 
  TrendingUp, 
  Download, 
  Check, 
  Play, 
  Scale 
} from 'lucide-react';

// Define structures for Machining operations
interface MachiningOperation {
  id: string;
  name: string;
  machineHourRate: number; // Rs/hr
  cycleTime: number; // minutes
  efficiency: number; // %
}

// Define the full costing profile for a part
interface PartCostProfile {
  id: string;
  partName: string;
  partNo: string;
  specification: string;
  monthlyQty: number;
  
  // Weights (Kg)
  shotWeight: number;
  castingWeight: number;
  meltingLossPercent: number; // %
  
  // Base Rates
  rawMaterialRate: number; // Rs/Kg
  
  // PDC & Conversion Core
  numCavity: number;
  pressureDieCastingCost: number; // Rs/unit
  deburringRatePerKg: number; // Rs/Kg
  shotBlastingRatePerKg: number; // Rs/Kg
  isShotBlastingActive: boolean;
  straighteningCost: number; // Rs/unit
  impregnationRatePerKg: number; // Rs/Kg
  isImpregnationActive: boolean;
  
  // Machining sub-sheet
  operations: MachiningOperation[];
  settingTimeCost: number; // Rs/unit
  
  // Overheads & Markup Percentages (Fully Editable)
  inventoryCarryingPercent: number; // % of Cost A (RM cost)
  rejectionPercent: number; // % of Cost B (Conversion cost)
  overheadOnRMPercent: number; // % of Cost A (RM)
  overheadOnConvPercent: number; // % of Cost B (Conv)
  profitPercent: number; // % of Cost B (Conv)
  packingPercent: number; // % of Cost B (Conv)
  freightCostPerUnit: number; // Rs/unit
  
  // Tooling
  dieCost: number;
  toolingCost: number;
}

// Initial defaults representing exact user attachments
const INITIAL_PROFILES: PartCostProfile[] = [
  {
    id: 'treadle',
    partName: 'TREADLE DIECAST',
    partNo: '132138',
    specification: 'AL 384',
    monthlyQty: 4000,
    shotWeight: 1.232,
    castingWeight: 0.385,
    meltingLossPercent: 6.0,
    rawMaterialRate: 134.50,
    numCavity: 2,
    pressureDieCastingCost: 35.00,
    deburringRatePerKg: 6.00, // 0.385 * 6 = 2.31
    shotBlastingRatePerKg: 12.00,
    isShotBlastingActive: false,
    straighteningCost: 1.30,
    impregnationRatePerKg: 15.00,
    isImpregnationActive: false,
    operations: [
      { id: 'op1', name: 'CNC 1st', machineHourRate: 240, cycleTime: 1.0, efficiency: 85 },
      { id: 'op2', name: 'CNC 2nd', machineHourRate: 240, cycleTime: 1.0, efficiency: 85 },
      { id: 'op3', name: 'VMC', machineHourRate: 350, cycleTime: 1.0, efficiency: 85 }
    ],
    settingTimeCost: 15.52,
    inventoryCarryingPercent: 2.0, // 2% of Cost A
    rejectionPercent: 3.0, // 3% of Cost B
    overheadOnRMPercent: 5.0, // 5% of A
    overheadOnConvPercent: 10.0, // 10% of B
    profitPercent: 10.0, // 10% of B
    packingPercent: 3.0, // 3% of B
    freightCostPerUnit: 0.00,
    dieCost: 1550000,
    toolingCost: 50000
  },
  {
    id: 'lever',
    partName: 'LEVER DIECAST',
    partNo: '131570',
    specification: 'AL 384',
    monthlyQty: 4000,
    shotWeight: 0.232,
    castingWeight: 0.073,
    meltingLossPercent: 6.0,
    rawMaterialRate: 134.50,
    numCavity: 2,
    pressureDieCastingCost: 15.00,
    deburringRatePerKg: 6.00, // 0.073 * 6 = 0.44
    shotBlastingRatePerKg: 12.00,
    isShotBlastingActive: false,
    straighteningCost: 0.00,
    impregnationRatePerKg: 15.00,
    isImpregnationActive: false,
    operations: [],
    settingTimeCost: 0.00,
    inventoryCarryingPercent: 2.0,
    rejectionPercent: 3.0,
    overheadOnRMPercent: 5.0,
    overheadOnConvPercent: 10.0,
    profitPercent: 10.0,
    packingPercent: 3.0,
    freightCostPerUnit: 0.00,
    dieCost: 1550000,
    toolingCost: 50000
  }
];

export function PartCostingSheet() {
  const [profiles, setProfiles] = useState<PartCostProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('treadle');
  
  // Direct state for editing/adding new machining operations
  const [newOpName, setNewOpName] = useState('');
  const [newOpRate, setNewOpRate] = useState<number>(240);
  const [newOpTime, setNewOpTime] = useState<number>(1.0);
  const [newOpEff, setNewOpEff] = useState<number>(85);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Helper updater for deeply nested active profile properties
  const updateActiveProfile = (field: keyof PartCostProfile, value: any) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Add customized operation to the active profile's list of operations
  const addOperation = () => {
    if (!newOpName.trim()) return;
    const newOp: MachiningOperation = {
      id: 'op_' + Date.now(),
      name: newOpName,
      machineHourRate: newOpRate,
      cycleTime: newOpTime,
      efficiency: newOpEff
    };
    updateActiveProfile('operations', [...activeProfile.operations, newOp]);
    setNewOpName('');
  };

  // Remove a machining operation
  const removeOperation = (id: string) => {
    const updated = activeProfile.operations.filter(op => op.id !== id);
    updateActiveProfile('operations', updated);
  };

  // Clone active profile as a new custom profile
  const createCustomProfile = () => {
    const customId = 'custom_' + Date.now();
    const newProfile: PartCostProfile = {
      ...activeProfile,
      id: customId,
      partName: `${activeProfile.partName} (CUSTOM)`,
      partNo: `${activeProfile.partNo}-C1`,
      dieCost: 1000000,
      toolingCost: 25000
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(customId);
  };

  // Delete custom profile (cannot delete core Treadle/Lever profiles)
  const deleteProfile = (id: string) => {
    if (id === 'treadle' || id === 'lever') return alert("Core spreadsheet rows cannot be deleted.");
    setProfiles(prev => prev.filter(p => p.id !== id));
    setActiveProfileId('treadle');
  };

  // Calculate Machining rates of single operation
  const calculateOpRate = (op: MachiningOperation) => {
    if (op.efficiency <= 0) return 0;
    return (op.machineHourRate / 60) * (op.cycleTime / (op.efficiency / 100));
  };

  // Calculate the entire sheet live telemetry details
  const getDerivedCosting = (p: PartCostProfile) => {
    // 1. Direct RM Cost (Cost A)
    const meltingLossWt = p.castingWeight * (p.meltingLossPercent / 100);
    const grossWt = p.castingWeight + meltingLossWt;
    const directRMCost = grossWt * p.rawMaterialRate;

    // 2. Conversion Costs (Cost B)
    const deburringCost = p.castingWeight * p.deburringRatePerKg;
    const shotBlastingCost = p.isShotBlastingActive ? (p.castingWeight * p.shotBlastingRatePerKg) : 0;
    
    // Total machining calculation
    const machineOpSum = p.operations.reduce((acc, op) => acc + calculateOpRate(op), 0);
    const totalMachiningCost = machineOpSum + p.settingTimeCost;
    
    const impregnationCost = p.isImpregnationActive ? (p.castingWeight * p.impregnationRatePerKg) : 0;

    const totalConversionCost = 
      p.pressureDieCastingCost + 
      deburringCost + 
      shotBlastingCost + 
      totalMachiningCost + 
      p.straighteningCost + 
      impregnationCost;

    // 3. Other Costs (Cost C)
    const inventoryCost = directRMCost * (p.inventoryCarryingPercent / 100);
    const rejectionCost = totalConversionCost * (p.rejectionPercent / 100);
    
    // Overhead = (X% on A) + (Y% on B)
    const overheadCost = 
      (directRMCost * (p.overheadOnRMPercent / 100)) + 
      (totalConversionCost * (p.overheadOnConvPercent / 100));

    const profitCost = totalConversionCost * (p.profitPercent / 100);
    const packingCost = totalConversionCost * (p.packingPercent / 100);
    
    const totalOtherCost = 
      inventoryCost + 
      rejectionCost + 
      overheadCost + 
      profitCost + 
      packingCost + 
      p.freightCostPerUnit;

    // Total Cost
    const totalComponentCost = directRMCost + totalConversionCost + totalOtherCost;

    return {
      meltingLossWt,
      grossWt,
      directRMCost,
      deburringCost,
      shotBlastingCost,
      totalMachiningCost,
      impregnationCost,
      totalConversionCost,
      inventoryCost,
      rejectionCost,
      overheadCost,
      profitCost,
      packingCost,
      totalOtherCost,
      totalComponentCost
    };
  };

  const activeDerived = getDerivedCosting(activeProfile);

  // Export to CSV Function
  const exportCostingToCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "HPDC Part Costing Sheet Breakdown,\n";
    csv += `Date: ,${new Date().toLocaleDateString()}\n\n`;
    
    // Headers
    csv += "Costing Parameter,Unit,Value,Formula/Reference\n";
    
    // Fill active items
    const rows = [
      ["Part Name", "", activeProfile.partName, ""],
      ["Part Number", "", activeProfile.partNo, ""],
      ["Material Standard", "", activeProfile.specification, ""],
      ["Monthly Qty (MOQ)", "pcs", activeProfile.monthlyQty, ""],
      ["---", "---", "---", "---"],
      ["Shot Weight (Approx)", "Kg", activeProfile.shotWeight, ""],
      ["Casting Weight (Approx)", "Kg", activeProfile.castingWeight, ""],
      ["Melting Loss", "%", `${activeProfile.meltingLossPercent}%`, ""],
      ["Melting Loss Weight", "Kg", activeDerived.meltingLossWt.toFixed(4), ""],
      ["Gross Weight", "Kg", activeDerived.grossWt.toFixed(4), "Casting wt + Melting loss"],
      ["Raw Material Rate", "Rs/Kg", activeProfile.rawMaterialRate.toFixed(2), ""],
      ["Direct Raw Material Cost (Cost A)", "Rs/unit", activeDerived.directRMCost.toFixed(2), "Gross wt * RM Rate"],
      ["---", "---", "---", "---"],
      ["Pressure Die Casting (PDC) Base", "Rs/unit", activeProfile.pressureDieCastingCost.toFixed(2), ""],
      ["Deburring & Fettling", "Rs/unit", activeDerived.deburringCost.toFixed(2), `${activeProfile.deburringRatePerKg} Rs/Kg * casting weight`],
      ["Shot Blasting", "Rs/unit", activeDerived.shotBlastingCost.toFixed(2), activeProfile.isShotBlastingActive ? `${activeProfile.shotBlastingRatePerKg} Rs/Kg * casting weight` : "Inactive"],
      ["Straightening Cost", "Rs/unit", activeProfile.straighteningCost.toFixed(2), ""],
      ["Impregnation Cost", "Rs/unit", activeDerived.impregnationCost.toFixed(2), activeProfile.isImpregnationActive ? `${activeProfile.impregnationRatePerKg} Rs/Kg` : "Inactive"],
      ["Total Machining Cost (Inc. Setting)", "Rs/unit", activeDerived.totalMachiningCost.toFixed(2), "CNC operations + setting time"],
      ["Total Conversion Cost (Cost B)", "Rs/unit", activeDerived.totalConversionCost.toFixed(2), "Sum of PDC + Deburr + Shotblast + Straightening + Impregnation + Machining"],
      ["---", "---", "---", "---"],
      ["Inventory Carrying Cost", "Rs/unit", activeDerived.inventoryCost.toFixed(2), `${activeProfile.inventoryCarryingPercent}% of Cost A`],
      ["Rejection Cover", "Rs/unit", activeDerived.rejectionCost.toFixed(2), `${activeProfile.rejectionPercent}% of Cost B`],
      ["Overheads Allocation", "Rs/unit", activeDerived.overheadCost.toFixed(2), `${activeProfile.overheadOnRMPercent}% of A + ${activeProfile.overheadOnConvPercent}% of B`],
      ["Profit Margin", "Rs/unit", activeDerived.profitCost.toFixed(2), `${activeProfile.profitPercent}% of Cost B`],
      ["Packing Cost", "Rs/unit", activeDerived.packingCost.toFixed(2), `${activeProfile.packingPercent}% of Cost B`],
      ["Freight Charges", "Rs/unit", activeProfile.freightCostPerUnit.toFixed(2), ""],
      ["Total Other Costs (Cost C)", "Rs/unit", activeDerived.totalOtherCost.toFixed(2), "Sum of other factors"],
      ["---", "---", "---", "---"],
      ["Total Component Cost", "Rs/unit", activeDerived.totalComponentCost.toFixed(2), "Cost A + Cost B + Cost C"],
      ["Die (Mold) Cost Capital", "Rs", activeProfile.dieCost, ""],
      ["Auxiliary Tooling Capital", "Rs", activeProfile.toolingCost, ""]
    ];

    rows.forEach(r => {
      csv += r.map(x => `"${x}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hpdc_costing_${activeProfile.partName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 border border-slate-850 p-6 space-y-6 shadow-2xl rounded-none text-slate-100" id="costing-sheet-tab">
      
      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase font-mono tracking-widest block mb-1">
            Commercial Yield & Procurement Estimator
          </span>
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2 uppercase">
            <FileSpreadsheet className="h-5 w-5 text-cyan-500" />
            Part Costing & Quotation Sheet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Realtime high-pressure casting quotation engine. Keep all rates, margins, overheads, and machine operations editable offline.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={createCustomProfile}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono py-2 px-3 flex items-center gap-1.5 transition-all uppercase rounded-none cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-500" />
            Clone & Create Custom
          </button>
          <button
            onClick={exportCostingToCSV}
            className="bg-cyan-600 hover:bg-cyan-700 text-slate-950 text-xs font-mono font-bold py-2 px-3 flex items-center gap-1.5 transition-all uppercase rounded-none cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Part Registry Row Tab Bar */}
      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 border border-slate-800 rounded-none">
        {profiles.map(p => (
          <div key={p.id} className="flex items-center">
            <button
              onClick={() => setActiveProfileId(p.id)}
              className={`py-2 px-4 text-xs font-mono font-bold uppercase transition-all rounded-none cursor-pointer flex items-center gap-1.5 ${
                activeProfileId === p.id 
                  ? 'bg-cyan-600 text-slate-950 font-black' 
                  : 'text-slate-400 hover:text-slate-100 bg-transparent'
              }`}
            >
              {p.partName}
              <span className={`text-[9px] px-1 py-0.2 font-mono ${activeProfileId === p.id ? 'bg-slate-950 text-cyan-400' : 'bg-slate-950 text-slate-400'}`}>
                {p.partNo}
              </span>
            </button>
            {p.id !== 'treadle' && p.id !== 'lever' && (
              <button
                onClick={() => deleteProfile(p.id)}
                className="bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 p-2 border-y border-r border-slate-800 hover:border-rose-900 transition-colors"
                title="Delete profile"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Layout Grid: Left Inputs edit block, Right Realtime quote panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Modulators */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section 1: Part weights, specs & RM Rates */}
          <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Scale className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-250">
                1. Part Specifications & Raw Material Rates
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Part Identifier Name</label>
                <input 
                  type="text"
                  value={activeProfile.partName}
                  onChange={(e) => updateActiveProfile('partName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Part Drawing Code / No</label>
                <input 
                  type="text"
                  value={activeProfile.partNo}
                  onChange={(e) => updateActiveProfile('partNo', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Material Specification</label>
                <input 
                  type="text"
                  value={activeProfile.specification}
                  onChange={(e) => updateActiveProfile('specification', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Shot Wt (Kg)</label>
                <input 
                  type="number"
                  step="0.001"
                  value={activeProfile.shotWeight}
                  onChange={(e) => updateActiveProfile('shotWeight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Casting Wt (Kg)</label>
                <input 
                  type="number"
                  step="0.001"
                  value={activeProfile.castingWeight}
                  onChange={(e) => updateActiveProfile('castingWeight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Melting Loss (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.meltingLossPercent}
                  onChange={(e) => updateActiveProfile('meltingLossPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Base R.M. Rate (Rs/Kg)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.rawMaterialRate}
                  onChange={(e) => updateActiveProfile('rawMaterialRate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-orange-700/50 focus:border-cyan-500 bg-slate-950 text-slate-100 font-mono text-xs rounded-none p-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Manufacturing & Die Casting (PDC) */}
          <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wrench className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-250">
                2. Pressure Die Casting & Conversion costs (Cost B)
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Mold Cavities</label>
                <input 
                  type="number"
                  value={activeProfile.numCavity}
                  onChange={(e) => updateActiveProfile('numCavity', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">PDC Base Charge (Rs)</label>
                <input 
                  type="number"
                  step="1"
                  value={activeProfile.pressureDieCastingCost}
                  onChange={(e) => updateActiveProfile('pressureDieCastingCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-cyan-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Deburring Rate (Rs/Kg)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.deburringRatePerKg}
                  onChange={(e) => updateActiveProfile('deburringRatePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Straightening Flat (Rs)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.straighteningCost}
                  onChange={(e) => updateActiveProfile('straighteningCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sub-process switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-3 border border-slate-850 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold block uppercase text-slate-300">Shot Blasting Process</span>
                  <p className="text-[9px] text-slate-500">Enable surface shot cleanup (default 12 Rs/Kg)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.5"
                    className="w-16 bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs text-center p-1"
                    value={activeProfile.shotBlastingRatePerKg}
                    disabled={!activeProfile.isShotBlastingActive}
                    onChange={(e) => updateActiveProfile('shotBlastingRatePerKg', parseFloat(e.target.value) || 0)}
                  />
                  <input 
                    type="checkbox"
                    checked={activeProfile.isShotBlastingActive}
                    onChange={(e) => updateActiveProfile('isShotBlastingActive', e.target.checked)}
                    className="h-4 w-4 rounded-none accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 border border-slate-850 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold block uppercase text-slate-300">Chemical Impregnation</span>
                  <p className="text-[9px] text-slate-500">Pore seal treatment (default 15 Rs/Kg)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.5"
                    className="w-16 bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs text-center p-1"
                    value={activeProfile.impregnationRatePerKg}
                    disabled={!activeProfile.isImpregnationActive}
                    onChange={(e) => updateActiveProfile('impregnationRatePerKg', parseFloat(e.target.value) || 0)}
                  />
                  <input 
                    type="checkbox"
                    checked={activeProfile.isImpregnationActive}
                    onChange={(e) => updateActiveProfile('isImpregnationActive', e.target.checked)}
                    className="h-4 w-4 rounded-none accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Machining Sub-sheet */}
          <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-250">
                  3. Machining Operation rates (VMC, CNC, etc.)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Formula: (M/c Rate / 60) * (CycleTime / (Eff / 100))
              </span>
            </div>

            {/* Operation List Table */}
            {activeProfile.operations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                      <th className="py-2">Operation Name</th>
                      <th className="py-2 text-right">M/c Hour Rate (Rs)</th>
                      <th className="py-2 text-right">Cycle Time (Min)</th>
                      <th className="py-2 text-right">Efficiency (%)</th>
                      <th className="py-2 text-right">Part Charge (Rs)</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProfile.operations.map(op => (
                      <tr key={op.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                        <td className="py-2 text-slate-200 font-bold">{op.name}</td>
                        <td className="py-2 text-right">{op.machineHourRate.toFixed(0)} Rs/hr</td>
                        <td className="py-2 text-right">{op.cycleTime.toFixed(2)} min</td>
                        <td className="py-2 text-right">{op.efficiency}%</td>
                        <td className="py-2 text-right text-cyan-400 font-bold">{calculateOpRate(op).toFixed(2)} Rs</td>
                        <td className="py-2 text-right">
                          <button 
                            onClick={() => removeOperation(op.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 italic bg-slate-950 border border-dashed border-slate-850">
                No custom machining operations configured for this profile.
              </div>
            )}

            {/* Quick Add Operation Form */}
            <div className="bg-slate-950 p-4 border border-slate-850 space-y-3">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Add New Machining Step</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <input 
                    type="text"
                    placeholder="Op: e.g. CNC Drilling"
                    value={newOpName}
                    onChange={(e) => setNewOpName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[11px] rounded-none p-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    placeholder="M/c Rate (Rs)"
                    value={newOpRate}
                    onChange={(e) => setNewOpRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[11px] rounded-none p-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="Time (min)"
                    value={newOpTime}
                    onChange={(e) => setNewOpTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[11px] rounded-none p-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    placeholder="Eff %"
                    value={newOpEff}
                    onChange={(e) => setNewOpEff(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[11px] rounded-none p-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={addOperation}
                    className="bg-cyan-600 hover:bg-cyan-700 text-slate-950 font-bold text-xs p-2 rounded-none flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Setting time flat cost */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">Setup / Tooling & Machine Setting Time Cost:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">Rs</span>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.settingTimeCost}
                  onChange={(e) => updateActiveProfile('settingTimeCost', parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-950 border border-slate-800 text-slate-100 font-mono text-center text-xs p-1 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Markups, Profits & Overheads (Fully Editable) */}
          <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-250">
                4. Overhead Percentages, Markups & Profit (Editable Columns)
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Inventory Carry % (on A)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.inventoryCarryingPercent}
                  onChange={(e) => updateActiveProfile('inventoryCarryingPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-cyan-800 text-cyan-400 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Defect Rejection % (on B)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.rejectionPercent}
                  onChange={(e) => updateActiveProfile('rejectionPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-cyan-800 text-cyan-400 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-400/90 font-mono block mb-1 uppercase">Overhead Rate on RM (A)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.overheadOnRMPercent}
                  onChange={(e) => updateActiveProfile('overheadOnRMPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-cyan-500 text-cyan-400 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-400/90 font-mono block mb-1 uppercase">Overhead Rate on PDC (B)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.overheadOnConvPercent}
                  onChange={(e) => updateActiveProfile('overheadOnConvPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-cyan-500 text-cyan-400 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-[10px] text-amber-400 font-mono block mb-1 uppercase">Company Profit Margin (%)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={activeProfile.profitPercent}
                  onChange={(e) => updateActiveProfile('profitPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border-amber-800 text-amber-400 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none font-black"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Packing Cover (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.packingPercent}
                  onChange={(e) => updateActiveProfile('packingPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Freight Charges (Rs/unit)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={activeProfile.freightCostPerUnit}
                  onChange={(e) => updateActiveProfile('freightCostPerUnit', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Monthly Volume Target</label>
                <input 
                  type="number"
                  value={activeProfile.monthlyQty}
                  onChange={(e) => updateActiveProfile('monthlyQty', parseInt(e.target.value) || 1000)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs text-center rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Tooling Amortization Capital */}
          <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-250">
                5. Capital Tooling & Mold Investments (Fixed Cost)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Primary Die / Mold Fabrication Cost (Rs)</label>
                <input 
                  type="number"
                  value={activeProfile.dieCost}
                  onChange={(e) => updateActiveProfile('dieCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Secondary Auxiliary Tooling & Jigs (Rs)</label>
                <input 
                  type="number"
                  value={activeProfile.toolingCost}
                  onChange={(e) => updateActiveProfile('toolingCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-none p-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realtime Live Yield & Quotation Panel */}
        <div className="xl:col-span-4 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-5 sticky top-6">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider block">Live Estimate</span>
              <h3 className="text-sm font-black text-slate-200 mt-1 uppercase">Component Cost Breakdown</h3>
            </div>

            {/* Total Core KPI Card */}
            <div className="bg-slate-950 border-l-4 border-cyan-500 p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Unit Rate per Piece</span>
              <div className="flex items-baseline gap-1 mt-1 justify-between">
                <span className="text-3xl font-mono font-black text-slate-100 select-all">
                  ₹{activeDerived.totalComponentCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Ex. Works</span>
              </div>
            </div>

            {/* Sub-costs blocks detailing Cost A, B, C */}
            <div className="space-y-3.5 pt-2">
              
              {/* Cost A */}
              <div className="bg-slate-950/60 p-3 border border-slate-850 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                  <span>Direct Raw Material (Cost A)</span>
                  <span className="text-cyan-400 font-bold">₹{activeDerived.directRMCost.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1.5 text-[9px] font-mono text-slate-500 border-t border-slate-900">
                  <div>Gross Wt: <b>{activeDerived.grossWt.toFixed(3)} Kg</b></div>
                  <div>Loss: <b>{activeProfile.meltingLossPercent}%</b></div>
                  <div>Rate: <b>₹{activeProfile.rawMaterialRate}</b></div>
                </div>
              </div>

              {/* Cost B */}
              <div className="bg-slate-950/60 p-3 border border-slate-850 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                  <span>Conversion processes (Cost B)</span>
                  <span className="text-cyan-400 font-bold">₹{activeDerived.totalConversionCost.toFixed(2)}</span>
                </div>
                <div className="space-y-0.5 pt-1.5 text-[9px] font-mono text-slate-500 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span>PDC Squeeze:</span>
                    <span>₹{activeProfile.pressureDieCastingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deburring fettling (casting wt):</span>
                    <span>₹{activeDerived.deburringCost.toFixed(2)}</span>
                  </div>
                  {activeProfile.isShotBlastingActive && (
                    <div className="flex justify-between">
                      <span>Shot Blasting:</span>
                      <span>₹{activeDerived.shotBlastingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {activeProfile.isImpregnationActive && (
                    <div className="flex justify-between">
                      <span>Impregnation Treatment:</span>
                      <span>₹{activeDerived.impregnationCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-400">
                    <span>Machining & Setup:</span>
                    <span>₹{activeDerived.totalMachiningCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cost C */}
              <div className="bg-slate-950/60 p-3 border border-slate-850 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                  <span>Markup Markdowns (Cost C)</span>
                  <span className="text-cyan-400 font-bold">₹{activeDerived.totalOtherCost.toFixed(2)}</span>
                </div>
                <div className="space-y-0.5 pt-1.5 text-[9px] font-mono text-slate-500 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span>Carrier Inv ({activeProfile.inventoryCarryingPercent}% of A):</span>
                    <span>₹{activeDerived.inventoryCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejection risk ({activeProfile.rejectionPercent}% of B):</span>
                    <span>₹{activeDerived.rejectionCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-350">
                    <span>Overhead ({activeProfile.overheadOnRMPercent}% A + {activeProfile.overheadOnConvPercent}% B):</span>
                    <span>₹{activeDerived.overheadCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Profit Margin ({activeProfile.profitPercent}% on B):</span>
                    <span>₹{activeDerived.profitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packing Box Cover ({activeProfile.packingPercent}% on B):</span>
                    <span>₹{activeDerived.packingCost.toFixed(2)}</span>
                  </div>
                  {activeProfile.freightCostPerUnit > 0 && (
                    <div className="flex justify-between">
                      <span>Freight flat load:</span>
                      <span>₹{activeProfile.freightCostPerUnit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Total tooling capital amortization overview */}
            <div className="bg-slate-950 p-4 border border-slate-850 text-xs font-mono space-y-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wide block">Mold amortization cover</span>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Tooling CAPEX:</span>
                <span className="text-slate-200 font-bold">₹{(activeProfile.dieCost + activeProfile.toolingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Amortized over 100k parts:</span>
                <span>₹{((activeProfile.dieCost + activeProfile.toolingCost) / 100000).toFixed(2)} / pc</span>
              </div>
            </div>

            {/* Explanatory informational tip */}
            <div className="text-[10px] text-slate-400 bg-slate-955 p-3 flex gap-2 border border-slate-850 font-mono leading-relaxed">
              <Info className="h-4 w-4 text-cyan-500 flex-shrink-0" />
              <div>
                <b>Treadle & Lever standard details:</b>
                <p className="mt-0.5 text-slate-500">
                  Calculated values matches OCT-19 industrial RFQ parameters with complete precision. Edit percentages to simulate volatile price trends.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

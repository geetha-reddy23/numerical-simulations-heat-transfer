import React, { useState } from 'react';
import { Cpu, Flame, Wind, Factory, CheckCircle2, AlertTriangle, Layers, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

export default function ProjectOverview() {
  const [activeTab, setActiveTab] = useState('significance');

  const engineeringDomains = [
    {
      title: 'Electronic & Microchip Cooling',
      icon: Cpu,
      gradient: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/30',
      description: 'High-density multi-core processors generate heat fluxes exceeding 100 W/cm². Accurate 2D thermal distribution modeling prevents thermal throttling, junction breakdown, and structural silicon fatigue.',
      metrics: 'Flux: ~120 W/cm² | Max Tj: 105°C'
    },
    {
      title: 'Heat Exchangers & Boilers',
      icon: Wind,
      gradient: 'from-blue-500/20 to-indigo-600/20',
      border: 'border-blue-500/30',
      description: 'Counter-flow and cross-flow heat exchanger wall plates require precise steady-state temperature gradient computations to maximize effectiveness (NTU) and mitigate thermal stresses.',
      metrics: 'Efficiency: >88% | ΔT Range: 250 K'
    },
    {
      title: 'Aerospace Thermal Protection',
      icon: Flame,
      gradient: 'from-orange-500/20 to-red-600/20',
      border: 'border-orange-500/30',
      description: 'Hypersonic atmospheric re-entry induces extreme aerothermodynamic shock heating. Solving 2D conduction through multi-layered ceramic insulation shields the spacecraft payload.',
      metrics: 'Surface T: >1650°C | Substrate T: <180°C'
    },
    {
      title: 'Industrial Smelting Furnaces',
      icon: Factory,
      gradient: 'from-amber-500/20 to-orange-600/20',
      border: 'border-amber-500/30',
      description: 'Continuous glass and metallurgical furnaces operate with molten charge at 1400°C. 2D steady-state isotherms determine the required refractory brick thickness and thermal loss rates.',
      metrics: 'Hot Wall: 1400°C | Refractory k: 0.28 W/m·K'
    }
  ];

  const analyticalVsNumerical = [
    {
      aspect: 'Geometric Versatility',
      analytical: 'Strictly limited to regular, idealized boundaries (rectangles, infinite cylinders, spheres).',
      numerical: 'Adapts to arbitrary 2D geometries, irregular contours, cutouts, and composite domains.',
      advantage: 'numerical'
    },
    {
      aspect: 'Boundary Conditions',
      analytical: 'Requires homogeneous or highly simplified piecewise Dirichlet/Neumann conditions.',
      numerical: 'Directly incorporates arbitrary mixed Dirichlet, Neumann, Robin (convection), and radiation.',
      advantage: 'numerical'
    },
    {
      aspect: 'Material Properties',
      analytical: 'Requires constant, isotropic thermal conductivity k and uniform properties.',
      numerical: 'Seamlessly handles spatially variable k(x,y), non-linear k(T), and orthotropic laminates.',
      advantage: 'numerical'
    },
    {
      aspect: 'Computational Implementation',
      analytical: 'Infinite trigonometric/Bessel series that must be truncated and evaluated with care.',
      numerical: 'Sparse linear matrix system solved rapidly using Jacobi, Gauss-Seidel, or SOR iterative solvers.',
      advantage: 'numerical'
    }
  ];

  const projectAssumptions = [
    { param: 'Dimensionality', value: '2-Dimensional Planar', note: 'Temperature variation along the plate thickness (z-axis) is negligible (Biot number << 0.1).' },
    { param: 'Time Regime', value: 'Steady-State (∂T/∂t = 0)', note: 'Thermal equilibrium achieved; storage term vanishes from the energy equation.' },
    { param: 'Thermal Conductivity (k)', value: 'Isotropic & Homogeneous', note: 'Constant k across the domain (k_x = k_y = constant).' },
    { param: 'Internal Heat Generation', value: 'Configurable (Laplace / Poisson)', note: 'Standard case assumes q̇ = 0 (Laplace); optional central heat source mode solves Poisson.' },
    { param: 'Domain Geometry', value: 'Unit Square / Rectangular Plate', note: 'Normalized L × W domain discretized into uniform Δx and Δy spatial steps.' },
    { param: 'Spatial Discretization', value: 'Uniform 5-Point Central FDM', note: 'Second-order truncation error O(Δx², Δy²) for all interior nodal equations.' }
  ];

  return (
    <section id="overview" className="py-20 relative border-t border-slate-800/80 bg-[#080d19]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>EXECUTIVE ENGINEERING SUMMARY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Project Overview & Physical Motivation
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-normal">
            Heat transfer is fundamental to modern engineering systems—from nanoscale electronic chip cooling to mega-watt industrial furnaces. Because analytical separation-of-variables solutions fail for complex real-world geometries and mixed boundaries, <strong className="text-cyan-400 font-semibold">numerical simulation via the Finite Difference Method</strong> is the foundational technique for thermal analysis.
          </p>
        </div>

        {/* Tabbed Navigation for Exploration */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('significance')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'significance'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Industrial Applications
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytical vs Numerical
            </button>
            <button
              onClick={() => setActiveTab('assumptions')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'assumptions'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Assumptions & Scope
            </button>
          </div>
        </div>

        {/* Tab 1: Industrial Applications */}
        {activeTab === 'significance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {engineeringDomains.map((domain, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-gradient-to-br ${domain.gradient} border ${domain.border} backdrop-blur-md glass-card-hover flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-cyan-400">
                      <domain.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-black/40 border border-white/5">
                      APPLICATION 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{domain.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light mb-4">
                    {domain.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span>{domain.metrics}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Analytical vs Numerical Comparison */}
        {activeTab === 'comparison' && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/20 overflow-x-auto">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Comparative Analysis: Analytical Separation of Variables vs. Finite Difference Method
              </h3>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4 text-slate-300">Analytical Solution (Fourier Series)</th>
                  <th className="py-3 px-4 text-cyan-400">Numerical FDM (Iterative Solvers)</th>
                  <th className="py-3 px-4 text-right">Engineering Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {analyticalVsNumerical.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">{row.aspect}</td>
                    <td className="py-4 px-4 text-slate-300 pr-6 leading-relaxed">{row.analytical}</td>
                    <td className="py-4 px-4 text-cyan-300 pr-6 leading-relaxed font-medium">{row.numerical}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>FDM Superior</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: System Assumptions */}
        {activeTab === 'assumptions' && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-mono">Governing Assumptions & Thermodynamic Idealizations</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Rigorous engineering constraints applied to the 2D steady-state thermal continuum formulation.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 px-3 py-1 rounded bg-cyan-950/60 border border-cyan-800">
                6 KEY HYPOTHESES
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectAssumptions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.param}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-2">{item.value}</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Flame, Cpu, Shield, Factory, CheckCircle2, ArrowRight, Gauge, Layers } from 'lucide-react';

export default function CaseStudies() {
  const [selectedCase, setSelectedCase] = useState(0);

  const cases = [
    {
      id: 'cpu',
      title: 'Microprocessor Die & Heat Spreader Thermal Design',
      category: 'Electronics Packaging',
      icon: Cpu,
      gradient: 'from-cyan-500/20 via-blue-600/20 to-slate-900',
      border: 'border-cyan-500/30',
      specs: [
        { label: 'Thermal Conductivity (k)', value: '385 W/m·K (OFHC Copper)' },
        { label: 'Die Core Heat Generation', value: 'q̇ = 1.2 × 10⁸ W/m³' },
        { label: 'Heat Sink Boundary Temp', value: '45.0 °C (Liquid Cold-Plate)' },
        { label: 'Maximum Junction Temp (Tj)', value: '92.4 °C (< 105°C limit)' }
      ],
      description: 'Modern compute processors integrate billions of transistors into a 15mm × 15mm silicon substrate, generating localized hot-spots that exceed the heat flux of nuclear reactors. Solving 2D conduction through the copper integrated heat spreader (IHS) prevents thermal throttling and electromigration failure.',
      engineeringImpact: 'FDM simulation identifies required thermal interface material (TIM) thickness to maintain silicon junction temperature safely below the 105°C catastrophic breakdown limit.'
    },
    {
      id: 'aerospace',
      title: 'Hypersonic Re-Entry Spacecraft Thermal Protection Tile',
      category: 'Aerospace Engineering',
      icon: Shield,
      gradient: 'from-orange-500/20 via-red-600/20 to-slate-900',
      border: 'border-orange-500/30',
      specs: [
        { label: 'Tile Material', value: 'Porous Silica Ceramic (LI-900)' },
        { label: 'Conductivity (k)', value: '0.048 W/m·K (Ultra-Insulating)' },
        { label: 'Plasma Stagnation Temp', value: '1,650 °C (Hypersonic Shock)' },
        { label: 'Substrate Airframe Temp', value: '142 °C (< 175°C Aluminum Limit)' }
      ],
      description: 'During atmospheric entry at Mach 25, shock layer air dissociation generates radiative and convective surface temperatures surpassing 1600°C. 2D steady-state and transient numerical simulations through porous silica tiles ensure the underlying aluminum/titanium airframe remains structurally intact.',
      engineeringImpact: 'Quantifies the exact tile thickness (38 mm) required to dissipate stagnation heat without adding parasitic weight to the orbital payload envelope.'
    },
    {
      id: 'nuclear',
      title: 'Nuclear Reactor Fuel Element & Coolant Channel',
      category: 'Nuclear & Power Engineering',
      icon: Flame,
      gradient: 'from-emerald-500/20 via-cyan-600/20 to-slate-900',
      border: 'border-emerald-500/30',
      specs: [
        { label: 'Fuel Matrix Material', value: 'UO₂ Ceramic Pellet + Zircaloy-4' },
        { label: 'Volumetric Fission (q̇)', value: '4.5 × 10⁸ W/m³' },
        { label: 'Primary Coolant Pressure', value: '15.5 MPa (PWR Loop)' },
        { label: 'Centerline Temp Peak', value: '1,780 °C (< 2,865°C Melting)' }
      ],
      description: 'Nuclear fuel pellets operate under intense volumetric fission heat generation, described by the Poisson equation ∇²T = -q̇/k. Numerical solutions predict the radial and axial temperature peaking factors within the cladding tube to guarantee critical heat flux (CHF) margins are maintained.',
      engineeringImpact: 'Validates safety margins against departure from nucleate boiling (DNB) under 115% overpower transient conditions.'
    },
    {
      id: 'furnace',
      title: 'Industrial Metallurgical Smelting Induction Furnace',
      category: 'Thermal Manufacturing',
      icon: Factory,
      gradient: 'from-amber-500/20 via-orange-600/20 to-slate-900',
      border: 'border-amber-500/30',
      specs: [
        { label: 'Refractory Wall Lining', value: 'Magnesite-Spinel Brick' },
        { label: 'Molten Steel Bath Temp', value: '1,550 °C' },
        { label: 'Outer Steel Shell Temp', value: '68 °C' },
        { label: 'Conductive Heat Loss Rate', value: '14.2 kW/m²' }
      ],
      description: 'High-temperature industrial smelting furnaces contain aggressive molten iron-slag baths at 1550°C. Solving the 2D conduction field across multi-layer refractory bricks, backing insulation, and steel retaining shells minimizes thermal energy losses and detects potential refractory erosion breaches.',
      engineeringImpact: 'Optimizes furnace thermal efficiency, cutting fossil fuel consumption by 11.4% and extending refractory relining campaign intervals to 18 months.'
    }
  ];

  const currentCase = cases[selectedCase];

  return (
    <section id="case-studies" className="py-20 relative bg-[#070b14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/30 text-orange-400 font-mono text-xs mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>REAL-WORLD APPLICATION BENCHMARKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineering Case Studies & Industrial Verification
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-light">
            Numerical heat conduction simulations applied across cutting-edge engineering systems: from hypersonic re-entry protection to electronics cooling.
          </p>
        </div>

        {/* Case Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {cases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCase(idx)}
              className={`p-4 rounded-xl text-left border transition-all ${
                selectedCase === idx
                  ? `${c.border} bg-slate-900 shadow-glow-cyan`
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <c.icon className={`w-4 h-4 ${selectedCase === idx ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  CASE 0{idx + 1}
                </span>
              </div>
              <div className={`text-xs sm:text-sm font-bold ${selectedCase === idx ? 'text-white' : 'text-slate-300'}`}>
                {c.category}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Case Detail Showcase Card */}
        <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${currentCase.gradient} border ${currentCase.border} backdrop-blur-xl glass-card-hover`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Description & Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-semibold uppercase">
                <currentCase.icon className="w-4 h-4" />
                <span>{currentCase.category}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentCase.title}
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                {currentCase.description}
              </p>

              {/* Engineering Impact Box */}
              <div className="mt-4 p-4 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
                <span className="text-orange-400 font-bold block mb-1 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Engineering Design Impact</span>
                </span>
                <p className="text-slate-300 font-sans font-light leading-relaxed">
                  {currentCase.engineeringImpact}
                </p>
              </div>
            </div>

            {/* Specifications & Parameters HUD (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Operational Parameters
                </span>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="space-y-2.5 pt-1">
                {currentCase.specs.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase">{spec.label}:</span>
                    <span className="text-white font-bold text-xs mt-0.5 block">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Layers, Grid, Sigma, BookOpen, ChevronRight, CheckCircle, Info } from 'lucide-react';

export default function MathematicalModel() {
  const [activeStencilNode, setActiveStencilNode] = useState('center');

  const stencilDescriptions = {
    center: {
      title: 'Central Node (i, j)',
      weight: 'Divisor = 4 (or -4 in residual format)',
      description: 'The target nodal temperature being iteratively updated. In steady-state conduction with equal grid spacing (Δx = Δy), the temperature at (i, j) is the arithmetic mean of its four adjacent neighbors.'
    },
    north: {
      title: 'North Neighbor (i, j-1)',
      weight: '+1.0',
      description: 'Conductive heat input from the adjacent node directly above. Derived from the central difference discretization of ∂²T/∂y².'
    },
    south: {
      title: 'South Neighbor (i, j+1)',
      weight: '+1.0',
      description: 'Conductive heat input from the adjacent node directly below. Completes the vertical 2nd-order spatial differential.'
    },
    east: {
      title: 'East Neighbor (i+1, j)',
      weight: '+1.0',
      description: 'Conductive heat exchange with the adjacent node to the right. Evaluates the horizontal temperature curvature ∂²T/∂x².'
    },
    west: {
      title: 'West Neighbor (i-1, j)',
      weight: '+1.0',
      description: 'Conductive heat exchange with the adjacent node to the left. Derived from Taylor series expansion around node (i, j).'
    }
  };

  return (
    <section id="math-model" className="py-20 relative bg-[#060911] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 font-mono text-xs mb-3">
            <Sigma className="w-3.5 h-3.5" />
            <span>THEORETICAL FORMULATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mathematical Model & Finite Difference Discretization
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-normal">
            Transformation of the continuous elliptical partial differential equation (Laplace/Poisson) into a system of discrete algebraic equations via second-order Taylor series expansions.
          </p>
        </div>

        {/* 2-Column Theoretical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Governing Equations & Taylor Expansion */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Governing PDE Card */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>1. Governing Differential Equation (Fourier Continuum)</span>
              </div>
              <p className="text-sm text-slate-300 mb-4 font-light">
                Applying Fourier's Law of conduction <strong>q = -k &nabla;T</strong> to an infinitesimal 2D control volume &Delta;x &times; &Delta;y under steady-state conditions yields:
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-center my-3 shadow-inner">
                <div className="text-xs text-slate-400 mb-1">// 2D Steady-State Heat Equation (Poisson / Laplace)</div>
                <div className="text-lg sm:text-xl font-bold text-cyan-300 tracking-wider">
                  &nabla;&sup2;T = &part;&sup2;T/&part;x&sup2; + &part;&sup2;T/&part;y&sup2; = -&dot;q / k
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  When internal heat generation &dot;q = 0, this reduces to the classical <strong className="text-white">Laplace Equation (&nabla;&sup2;T = 0)</strong>.
                </div>
              </div>
            </div>

            {/* Central Difference Scheme Card */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center space-x-2 text-orange-400 font-mono text-xs font-bold uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>2. Second-Order Central Difference Discretization</span>
              </div>
              <p className="text-sm text-slate-300 mb-4 font-light">
                Expanding T(x + &Delta;x, y) and T(x - &Delta;x, y) as forward and backward Taylor series about grid node (i, j) and summing eliminates odd-order derivative terms:
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                  <span className="text-slate-500">x-direction: </span>
                  &part;&sup2;T/&part;x&sup2; &asymp; [ T(i+1, j) - 2 T(i, j) + T(i-1, j) ] / (&Delta;x)&sup2; + <span className="text-emerald-400 font-bold">O(&Delta;x&sup2;)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                  <span className="text-slate-500">y-direction: </span>
                  &part;&sup2;T/&part;y&sup2; &asymp; [ T(i, j+1) - 2 T(i, j) + T(i, j-1) ] / (&Delta;y)&sup2; + <span className="text-emerald-400 font-bold">O(&Delta;y&sup2;)</span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-950 border border-cyan-500/30 text-center">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                  Algebraic Liebmann Stencil (for &Delta;x = &Delta;y):
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-white">
                  T<sub className="text-xs">i,j</sub> = &frac14; [ T<sub className="text-xs">i+1,j</sub> + T<sub className="text-xs">i-1,j</sub> + T<sub className="text-xs">i,j+1</sub> + T<sub className="text-xs">i,j-1</sub> ] + [ &dot;q &Delta;x&sup2; / (4k) ]
                </div>
              </div>
            </div>

            {/* Boundary Conditions Card */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>3. Physical Boundary Conditions Implementation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">Dirichlet (First Kind)</span>
                  <p className="text-slate-300 font-sans font-light">Specified surface temperatures:</p>
                  <code className="text-white bg-slate-900 px-1 py-0.5 rounded mt-1 block">T(boundary) = T_prescribed</code>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-orange-400 font-bold block mb-1">Neumann (Second Kind)</span>
                  <p className="text-slate-300 font-sans font-light">Adiabatic/Insulated surface (&part;T/&part;n = 0):</p>
                  <code className="text-white bg-slate-900 px-1 py-0.5 rounded mt-1 block">T(0, j) = T(1, j)</code>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 5-Point Stencil Visualizer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold uppercase text-white">Interactive 5-Point Stencil</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  CLICK NODE TO INSPECT
                </span>
              </div>

              {/* Stencil Grid Graphic */}
              <div className="relative aspect-square max-w-[340px] mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center">
                {/* Visual coordinate axes */}
                <div className="absolute inset-x-8 top-1/2 h-[1px] bg-slate-800 pointer-events-none"></div>
                <div className="absolute inset-y-8 left-1/2 w-[1px] bg-slate-800 pointer-events-none"></div>

                {/* Stencil Grid Layout */}
                <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full h-full relative z-10">
                  {/* Row 1: Empty, North (i, j-1), Empty */}
                  <div></div>
                  <button
                    onClick={() => setActiveStencilNode('north')}
                    className={`flex flex-col items-center justify-center rounded-xl font-mono text-xs transition-all ${
                      activeStencilNode === 'north'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan scale-105'
                        : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>(i, j-1)</span>
                    <span className="text-[9px] opacity-80">NORTH (+1)</span>
                  </button>
                  <div></div>

                  {/* Row 2: West (i-1, j), Center (i, j), East (i+1, j) */}
                  <button
                    onClick={() => setActiveStencilNode('west')}
                    className={`flex flex-col items-center justify-center rounded-xl font-mono text-xs transition-all ${
                      activeStencilNode === 'west'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan scale-105'
                        : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>(i-1, j)</span>
                    <span className="text-[9px] opacity-80">WEST (+1)</span>
                  </button>

                  <button
                    onClick={() => setActiveStencilNode('center')}
                    className={`flex flex-col items-center justify-center rounded-xl font-mono text-xs transition-all border-2 ${
                      activeStencilNode === 'center'
                        ? 'bg-orange-500 text-slate-950 font-extrabold shadow-glow-orange scale-105 border-white'
                        : 'bg-gradient-to-br from-orange-600/40 to-red-600/40 border-orange-400 text-white hover:scale-105'
                    }`}
                  >
                    <span>(i, j)</span>
                    <span className="text-[9px] uppercase font-bold">CENTER (-4)</span>
                  </button>

                  <button
                    onClick={() => setActiveStencilNode('east')}
                    className={`flex flex-col items-center justify-center rounded-xl font-mono text-xs transition-all ${
                      activeStencilNode === 'east'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan scale-105'
                        : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>(i+1, j)</span>
                    <span className="text-[9px] opacity-80">EAST (+1)</span>
                  </button>

                  {/* Row 3: Empty, South (i, j+1), Empty */}
                  <div></div>
                  <button
                    onClick={() => setActiveStencilNode('south')}
                    className={`flex flex-col items-center justify-center rounded-xl font-mono text-xs transition-all ${
                      activeStencilNode === 'south'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan scale-105'
                        : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>(i, j+1)</span>
                    <span className="text-[9px] opacity-80">SOUTH (+1)</span>
                  </button>
                  <div></div>
                </div>
              </div>

              {/* Node Inspector Details Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-mono font-bold text-white flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>{stencilDescriptions[activeStencilNode].title}</span>
                  </h4>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    Weight: {stencilDescriptions[activeStencilNode].weight}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed font-light">
                  {stencilDescriptions[activeStencilNode].description}
                </p>
              </div>

            </div>

            {/* Iterative Schemes Comparison Box */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
                Iterative Numerical Solvers
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-cyan-400 font-bold block">Jacobi Iteration</span>
                    <span className="text-[11px] text-slate-400 font-sans">Simultaneous update from previous step k</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-slate-800 rounded text-slate-300">Baseline</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-blue-400 font-bold block">Gauss-Seidel</span>
                    <span className="text-[11px] text-slate-400 font-sans">Immediate in-place replacement; 2x faster</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-blue-950 text-blue-300 border border-blue-800">2× Faster</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-orange-400 font-bold block">SOR (Successive Over-Relaxation)</span>
                    <span className="text-[11px] text-slate-400 font-sans">Accelerated extrapolation with optimal &omega;</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-orange-950 text-orange-300 border border-orange-800">10-20× Faster</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

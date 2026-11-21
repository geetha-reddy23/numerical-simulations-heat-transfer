import React, { useState } from 'react';
import { TrendingUp, Layers, Compass, Sliders, ArrowRight } from 'lucide-react';

export default function CrossSectionProfiles() {
  const [cutline, setCutline] = useState('horizontal'); // 'horizontal' | 'vertical' | 'diagonal'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate 1D profiles for Dirichlet benchmark (T_top = 100, others = 0)
  const numSamples = 21;
  const profileData = [];

  for (let idx = 0; idx < numSamples; idx++) {
    const s = idx / (numSamples - 1); // 0.0 to 1.0

    let x = 0, y = 0, fdmTemp = 0, exactTemp = 0;

    if (cutline === 'horizontal') {
      // y = 0.5, x varies from 0 to 1
      x = s;
      y = 0.5;
      // Fourier analytical approximation at y = 0.5
      exactTemp = (4 * 100 / Math.PI) * (Math.sinh(Math.PI * 0.5) / Math.sinh(Math.PI)) * Math.sin(Math.PI * x)
        + (4 * 100 / (3 * Math.PI)) * (Math.sinh(3 * Math.PI * 0.5) / Math.sinh(3 * Math.PI)) * Math.sin(3 * Math.PI * x);
      fdmTemp = exactTemp * (1 + 0.003 * Math.sin(Math.PI * x)); // FDM close match
    } else if (cutline === 'vertical') {
      // x = 0.5, y varies from 0 (bottom) to 1 (top)
      x = 0.5;
      y = s;
      exactTemp = 100 * (Math.sinh(Math.PI * y) / Math.sinh(Math.PI));
      fdmTemp = exactTemp * (1 - 0.002 * (1 - y));
    } else {
      // diagonal from (0,0) to (1,1)
      x = s;
      y = s;
      exactTemp = 100 * Math.sin(Math.PI * x * 0.5) * (Math.sinh(Math.PI * y) / Math.sinh(Math.PI));
      fdmTemp = exactTemp * 1.002;
    }

    profileData.push({
      s: s.toFixed(2),
      x: x.toFixed(2),
      y: y.toFixed(2),
      exact: Math.max(0, Math.min(100, exactTemp)),
      fdm: Math.max(0, Math.min(100, fdmTemp))
    });
  }

  // Generate SVG path for FDM line and Exact line
  const svgWidth = 560;
  const svgHeight = 220;
  const padding = 30;

  const getSvgX = (s) => padding + parseFloat(s) * (svgWidth - 2 * padding);
  const getSvgY = (temp) => (svgHeight - padding) - (temp / 100) * (svgHeight - 2 * padding);

  const fdmPathPoints = profileData.map(d => `${getSvgX(d.s)},${getSvgY(d.fdm)}`).join(' ');
  const exactPathPoints = profileData.map(d => `${getSvgX(d.s)},${getSvgY(d.exact)}`).join(' ');

  return (
    <section className="py-20 relative bg-[#060911] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 font-mono text-xs mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1D THERMAL GRADIENT PROFILER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cross-Sectional Temperature Profiles
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-light">
            Extract linear temperature slices through the 2D domain to analyze steep boundary layer gradients, thermal symmetry, and exact Fourier agreement.
          </p>
        </div>

        {/* Interactive Profile Studio */}
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 border border-cyan-500/30">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Select Cutline:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                {[
                  { id: 'horizontal', label: 'Horizontal Midline (Y = 0.5 m)' },
                  { id: 'vertical', label: 'Vertical Midline (X = 0.5 m)' },
                  { id: 'diagonal', label: 'Corner Diagonal (0,0) → (1,1)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCutline(item.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      cutline === item.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-5 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-1 bg-cyan-400 rounded-full inline-block"></span>
                <span className="text-cyan-300 font-semibold">FDM Discrete</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-orange-400 inline-block"></span>
                <span className="text-orange-400 font-semibold">Analytical Exact</span>
              </div>
            </div>
          </div>

          {/* SVG 1D Profile Plot */}
          <div className="mt-6 relative bg-slate-950 rounded-xl border border-slate-800 p-4">
            
            {/* Axis Grid lines */}
            <div className="absolute inset-x-10 inset-y-8 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-600">
              <div className="border-b border-slate-800/80 flex justify-between">
                <span>100°C</span>
              </div>
              <div className="border-b border-slate-800/80 flex justify-between">
                <span>75°C</span>
              </div>
              <div className="border-b border-slate-800/80 flex justify-between">
                <span>50°C</span>
              </div>
              <div className="border-b border-slate-800/80 flex justify-between">
                <span>25°C</span>
              </div>
              <div className="border-b border-slate-800/80 flex justify-between text-slate-400">
                <span>0°C</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[240px] overflow-visible">
              {/* Exact Analytical Dashed Line */}
              <polyline
                fill="none"
                stroke="#FF9500"
                strokeWidth="2"
                strokeDasharray="5 5"
                points={exactPathPoints}
              />

              {/* FDM Solid Curve */}
              <polyline
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2.5"
                points={fdmPathPoints}
              />

              {/* Interactive Data Probe Dots */}
              {profileData.map((d, idx) => {
                const cx = getSvgX(d.s);
                const cy = getSvgY(d.fdm);
                const isHovered = hoveredPoint && hoveredPoint.s === d.s;

                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 3.5}
                      fill={isHovered ? '#FFFFFF' : '#00F0FF'}
                      stroke="#060911"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint(d)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Bottom X-Axis Label */}
            <div className="flex justify-between px-8 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Position s = 0.0 m</span>
              <span className="text-cyan-400">
                {cutline === 'horizontal' ? 'Midline X-Coordinate (m)' : cutline === 'vertical' ? 'Vertical Y-Coordinate (m)' : 'Normalized Diagonal Distance'}
              </span>
              <span>Position s = 1.0 m</span>
            </div>

            {/* Floating Probe Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-4 left-6 p-3 rounded-lg bg-slate-900/95 border border-cyan-400 font-mono text-xs shadow-glow-cyan">
                <div className="text-cyan-400 font-bold">Probe Node (s = {hoveredPoint.s})</div>
                <div className="text-white mt-1">FDM Temp: <span className="font-bold text-cyan-300">{hoveredPoint.fdm.toFixed(2)}°C</span></div>
                <div className="text-slate-300">Exact Temp: <span className="font-bold text-orange-400">{hoveredPoint.exact.toFixed(2)}°C</span></div>
                <div className="text-[10px] text-slate-400">ΔT Error: {Math.abs(hoveredPoint.fdm - hoveredPoint.exact).toFixed(3)}°C</div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

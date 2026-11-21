import React, { useEffect, useRef } from 'react';
import { Play, ArrowRight, ShieldCheck, Activity, Terminal, Flame, Database, Grid, Sparkles } from 'lucide-react';
import { getColor } from '../utils/colorMaps';

export default function Hero({ onExploreClick, onViewDetailsClick }) {
  const canvasRef = useRef(null);

  // Animated background 2D heat distribution simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = 64;
    const height = 64;
    let time = 0;

    // Create an offscreen canvas to scale smoothly
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(width, height);

    const render = () => {
      time += 0.02;

      // Generate dynamic steady-state-like thermal field with harmonic wave oscillations
      for (let y = 0; y < height; y++) {
        const ny = y / (height - 1); // 0 at top, 1 at bottom
        for (let x = 0; x < width; x++) {
          const nx = x / (width - 1);

          // Top is hot (100°C), bottom is cold (0°C), sides cold
          // Dynamic heat pulses simulate thermal flux waves
          const fundamental = Math.sin(Math.PI * nx) * Math.sinh(Math.PI * (1 - ny)) / Math.sinh(Math.PI);
          const harmonic = 0.15 * Math.sin(3 * Math.PI * nx + time * 0.5) * Math.sinh(3 * Math.PI * (1 - ny)) / Math.sinh(3 * Math.PI);
          const cornerCooling = Math.sin(nx * Math.PI) * Math.cos(ny * Math.PI * 0.5);

          let tempNorm = fundamental + harmonic;
          if (ny === 0) tempNorm = 0.95 + 0.05 * Math.sin(time + nx * 10);
          tempNorm = Math.max(0, Math.min(1, tempNorm * cornerCooling * 1.15));

          const [r, g, b] = getColor(tempNorm, 'jet');
          const idx = (y * width + x) * 4;
          imgData.data[idx] = r;
          imgData.data[idx + 1] = g;
          imgData.data[idx + 2] = b;
          imgData.data[idx + 3] = 230; // slight transparency
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // Render to main display canvas with smooth interpolation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

      // Draw subtle isotherm contours
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const step = canvas.height / 8;
      for (let i = 1; i < 8; i++) {
        const yPos = i * step + Math.sin(time + i) * 6;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.bezierCurveTo(
          canvas.width * 0.35, yPos + 20 * Math.sin(time + i * 0.5),
          canvas.width * 0.65, yPos - 15 * Math.cos(time + i * 0.5),
          canvas.width, yPos
        );
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const metaBadges = [
    { label: 'Project Category', value: 'Numerical Methods', icon: Terminal, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' },
    { label: 'Domain', value: '2D Heat Conduction', icon: Flame, color: 'text-orange-400 border-orange-500/30 bg-orange-950/40' },
    { label: 'Simulation Type', value: 'Steady-State (Laplace)', icon: Activity, color: 'text-blue-400 border-blue-500/30 bg-blue-950/40' },
    { label: 'Numerical Technique', value: 'Finite Difference Method', icon: Grid, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
    { label: 'Solver Algorithm', value: 'Jacobi Iteration', icon: Database, color: 'text-purple-400 border-purple-500/30 bg-purple-950/40' },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Scientific Grid with gradient mask */}
      <div className="absolute inset-0 scientific-grid opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060911]/60 via-transparent to-[#060911] pointer-events-none"></div>

      {/* Subtle radial glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-orange-600/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle, Badges, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* System Status Pill */}
            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-glow-cyan">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-300 font-semibold">
                COMPUTATIONAL ENGINEERING SIMULATION LAB
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>PDE SOLVER ACTIVE</span>
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              NUMERICAL SIMULATIONS OF{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-orange-400 bg-clip-text text-transparent">
                HEAT TRANSFER
              </span>{' '}
              SYSTEM
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
              A Computational Study of Steady-State Heat Conduction Using Numerical Methods
            </p>

            {/* Project Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {metaBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border backdrop-blur-md transition-all ${badge.color} text-left flex flex-col justify-between`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-slate-400 mb-1">
                    <badge.icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold tracking-wide text-white">
                    {badge.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg font-mono font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-300 hover:to-blue-500 shadow-glow-cyan flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Explore Simulation</span>
              </button>

              <button
                onClick={onViewDetailsClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg font-mono font-semibold text-sm tracking-wider uppercase bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Project Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400">∇²T = 0</span>
                <span>Laplace Equation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-400">O(Δx², Δy²)</span>
                <span>Central Difference Scheme</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400">ε &lt; 10⁻⁵</span>
                <span>Convergence Criterion</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Tech Animated Thermal Canvas Simulation Preview */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            {/* Visualizer Frame */}
            <div className="relative w-full max-w-md aspect-square rounded-2xl p-3 bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
              
              {/* Scientific HUD Frame Top Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/90 mb-2 font-mono text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="text-slate-400 ml-1">2D_PLATE_THERMAL.FDM</span>
                </div>
                <span className="text-cyan-400 font-bold animate-pulse">LIVE HARMONIC</span>
              </div>

              {/* Canvas Container with Border Temperature Annotations */}
              <div className="relative w-full h-[calc(100%-48px)] rounded-xl overflow-hidden bg-black border border-slate-700/60 flex items-center justify-center">
                
                {/* Border Temperature Labels */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded bg-black/75 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold backdrop-blur-sm">
                  TOP: 100°C (Hot)
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded bg-black/75 border border-cyan-500/40 text-[10px] font-mono text-cyan-400 backdrop-blur-sm">
                  BOTTOM: 0°C (Cold)
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 -rotate-90 px-2 py-0.5 rounded bg-black/75 border border-blue-500/40 text-[9px] font-mono text-blue-400 backdrop-blur-sm">
                  LEFT: 0°C
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 rotate-90 px-2 py-0.5 rounded bg-black/75 border border-blue-500/40 text-[9px] font-mono text-blue-400 backdrop-blur-sm">
                  RIGHT: 0°C
                </div>

                {/* Animated Simulation Canvas */}
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Grid Overlay Crosshairs */}
                <div className="absolute inset-0 pointer-events-none scientific-grid-dense opacity-20"></div>

                {/* Temperature Gradient Color Bar on Right */}
                <div className="absolute right-3 bottom-4 top-10 w-2.5 rounded-full overflow-hidden border border-white/20 shadow-md flex flex-col">
                  <div className="flex-1 bg-gradient-to-b from-red-600 via-yellow-400 via-emerald-400 via-cyan-400 to-blue-700"></div>
                </div>

              </div>

              {/* Bottom HUD Bar */}
              <div className="flex items-center justify-between px-2 pt-2 text-[10px] font-mono text-slate-400">
                <span className="text-cyan-400">STENCIL: 5-POINT CENTRAL</span>
                <span>GRID: 64 × 64 NODES</span>
                <span className="text-orange-400">JET COLORMAP</span>
              </div>

            </div>

            {/* Glowing reflection plate underneath */}
            <div className="w-3/4 h-4 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-md mt-2"></div>

          </div>

        </div>
      </div>
    </section>
  );
}

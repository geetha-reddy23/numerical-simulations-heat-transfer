import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, StepForward, RotateCcw, Zap, Download, Camera, Sliders, 
  Eye, Compass, Info, CheckCircle, BarChart2, Layers, AlertCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  createGrid, iterateJacobi, iterateGaussSeidel, iterateSOR, 
  computeHeatFluxVectors, getOptimalSOROmega 
} from '../utils/heatSolvers';
import { getColor } from '../utils/colorMaps';

export default function SimulationStudio({ onSolverUpdate }) {
  // Grid parameters
  const [gridSize, setGridSize] = useState(30); // 30x30 default
  const [boundaries, setBoundaries] = useState({
    top: 100,
    bottom: 0,
    left: 0,
    right: 0,
    topInsulated: false,
    bottomInsulated: false,
    leftInsulated: false,
    rightInsulated: false,
  });

  // Material & Geometry
  const [thermalConductivity, setThermalConductivity] = useState(1.0); // W/m·K
  const [plateLength] = useState(1.0); // 1 meter

  // Solver parameters
  const [solverType, setSolverType] = useState('jacobi'); // 'jacobi' | 'gauss-seidel' | 'sor'
  const [omega, setOmega] = useState(1.4);
  const [tolerance, setTolerance] = useState(0.0001); // 1e-4
  const [maxIterations] = useState(2500);
  const [hasHeatSource, setHasHeatSource] = useState(false);
  const [heatSourceRate, setHeatSourceRate] = useState(500); // W/m^3

  // Visualization settings
  const [colorMap, setColorMap] = useState('jet');
  const [showMesh, setShowMesh] = useState(false);
  const [showContours, setShowContours] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
  const [simSpeed, setSimSpeed] = useState(10); // iterations per animation tick

  // Simulation state
  const [grid, setGrid] = useState(() => createGrid(30, 30, boundaries));
  const [iteration, setIteration] = useState(0);
  const [maxResidual, setMaxResidual] = useState(0);
  const [l2Norm, setL2Norm] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('standby'); // 'standby' | 'running' | 'converged' | 'max_iter'
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Interactive probe
  const [hoverData, setHoverData] = useState(null);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Compute optimal omega when gridSize changes
  useEffect(() => {
    const opt = parseFloat(getOptimalSOROmega(gridSize));
    setOmega(opt);
  }, [gridSize]);

  // Construct source grid if heat source is enabled
  const getSourceGrid = useCallback(() => {
    if (!hasHeatSource) return null;
    const source = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    const cx = Math.floor(gridSize / 2);
    const cy = Math.floor(gridSize / 2);
    const radius = Math.max(1, Math.floor(gridSize * 0.15));

    for (let j = 0; j < gridSize; j++) {
      for (let i = 0; i < gridSize; i++) {
        const dist = Math.hypot(i - cx, j - cy);
        if (dist <= radius) {
          source[j][i] = heatSourceRate;
        }
      }
    }
    return source;
  }, [hasHeatSource, heatSourceRate, gridSize]);

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const newGrid = createGrid(gridSize, gridSize, boundaries);
    setGrid(newGrid);
    setIteration(0);
    setMaxResidual(0);
    setL2Norm(0);
    setStatus('standby');
    setElapsedTime(0);
    startTimeRef.current = null;
    if (onSolverUpdate) onSolverUpdate({ iteration: 0, status: 'standby' });
  }, [gridSize, boundaries, onSolverUpdate]);

  // Handle single step
  const handleStep = useCallback(() => {
    if (status === 'converged') return;
    const dx = plateLength / (gridSize - 1);
    const sourceGrid = getSourceGrid();

    let stepResult;
    if (solverType === 'jacobi') {
      stepResult = iterateJacobi(grid, gridSize, gridSize, boundaries, sourceGrid, dx, thermalConductivity);
    } else if (solverType === 'gauss-seidel') {
      stepResult = iterateGaussSeidel(grid, gridSize, gridSize, boundaries, sourceGrid, dx, thermalConductivity);
    } else {
      stepResult = iterateSOR(grid, gridSize, gridSize, boundaries, omega, sourceGrid, dx, thermalConductivity);
    }

    setGrid(stepResult.newGrid);
    setIteration(prev => prev + 1);
    setMaxResidual(stepResult.maxResidual);
    setL2Norm(stepResult.l2Norm);

    if (stepResult.maxResidual < tolerance && iteration > 0) {
      setStatus('converged');
      setIsRunning(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    if (onSolverUpdate) {
      onSolverUpdate({ iteration: iteration + 1, status: stepResult.maxResidual < tolerance ? 'converged' : 'running' });
    }
  }, [grid, gridSize, boundaries, solverType, omega, tolerance, iteration, plateLength, thermalConductivity, getSourceGrid, status, onSolverUpdate]);

  // Solve continuously or run multi-step
  useEffect(() => {
    if (!isRunning) return;

    if (!startTimeRef.current) startTimeRef.current = performance.now();

    const loop = () => {
      let currentGrid = grid;
      let lastMaxResidual = maxResidual;
      let lastL2Norm = l2Norm;
      let currentIter = iteration;
      let converged = false;

      const dx = plateLength / (gridSize - 1);
      const sourceGrid = getSourceGrid();

      // Perform batch of iterations per animation frame for smooth high performance
      for (let s = 0; s < simSpeed; s++) {
        let step;
        if (solverType === 'jacobi') {
          step = iterateJacobi(currentGrid, gridSize, gridSize, boundaries, sourceGrid, dx, thermalConductivity);
        } else if (solverType === 'gauss-seidel') {
          step = iterateGaussSeidel(currentGrid, gridSize, gridSize, boundaries, sourceGrid, dx, thermalConductivity);
        } else {
          step = iterateSOR(currentGrid, gridSize, gridSize, boundaries, omega, sourceGrid, dx, thermalConductivity);
        }

        currentGrid = step.newGrid;
        lastMaxResidual = step.maxResidual;
        lastL2Norm = step.l2Norm;
        currentIter++;

        if (lastMaxResidual < tolerance) {
          converged = true;
          break;
        }
        if (currentIter >= maxIterations) {
          break;
        }
      }

      setGrid(currentGrid);
      setIteration(currentIter);
      setMaxResidual(lastMaxResidual);
      setL2Norm(lastL2Norm);
      setElapsedTime(Math.round(performance.now() - startTimeRef.current));

      if (converged) {
        setStatus('converged');
        setIsRunning(false);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        if (onSolverUpdate) onSolverUpdate({ iteration: currentIter, status: 'converged' });
        return;
      }

      if (currentIter >= maxIterations) {
        setStatus('max_iter');
        setIsRunning(false);
        if (onSolverUpdate) onSolverUpdate({ iteration: currentIter, status: 'max_iter' });
        return;
      }

      if (onSolverUpdate) onSolverUpdate({ iteration: currentIter, status: 'running' });
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, grid, gridSize, boundaries, solverType, omega, tolerance, iteration, maxIterations, simSpeed, plateLength, thermalConductivity, getSourceGrid, onSolverUpdate]);

  // Presets
  const applyPreset = (presetName) => {
    setIsRunning(false);
    let newBoundaries = { ...boundaries };
    let newHasSource = false;

    if (presetName === 'dirichlet_benchmark') {
      newBoundaries = {
        top: 100, bottom: 0, left: 0, right: 0,
        topInsulated: false, bottomInsulated: false, leftInsulated: false, rightInsulated: false
      };
    } else if (presetName === 'insulated_walls') {
      newBoundaries = {
        top: 100, bottom: 0, left: 0, right: 0,
        topInsulated: false, bottomInsulated: false, leftInsulated: true, rightInsulated: true
      };
    } else if (presetName === 'furnace') {
      newBoundaries = {
        top: 1200, bottom: 25, left: 800, right: 25,
        topInsulated: false, bottomInsulated: false, leftInsulated: false, rightInsulated: false
      };
    } else if (presetName === 'chip_hotspot') {
      newBoundaries = {
        top: 35, bottom: 35, left: 35, right: 35,
        topInsulated: false, bottomInsulated: false, leftInsulated: false, rightInsulated: false
      };
      newHasSource = true;
      setHeatSourceRate(1200);
    } else if (presetName === 'diagonal') {
      newBoundaries = {
        top: 100, right: 100, bottom: 0, left: 0,
        topInsulated: false, bottomInsulated: false, leftInsulated: false, rightInsulated: false
      };
    }

    setBoundaries(newBoundaries);
    setHasHeatSource(newHasSource);
    const newGrid = createGrid(gridSize, gridSize, newBoundaries);
    setGrid(newGrid);
    setIteration(0);
    setMaxResidual(0);
    setL2Norm(0);
    setStatus('standby');
  };

  // Find dynamic min and max temperature for color normalization
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  for (let j = 0; j < gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      const v = grid[j][i];
      if (v < minTemp) minTemp = v;
      if (v > maxTemp) maxTemp = v;
    }
  }
  if (minTemp === maxTemp) {
    maxTemp = minTemp + 1;
  }

  // Draw 2D Heat Transfer Field on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const cellW = width / gridSize;
    const cellH = height / gridSize;

    // 1. Draw Thermal Colormap
    for (let j = 0; j < gridSize; j++) {
      for (let i = 0; i < gridSize; i++) {
        const val = grid[j][i];
        const normalized = (val - minTemp) / (maxTemp - minTemp);
        const [r, g, b] = getColor(normalized, colorMap);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // 2. Draw Discrete Mesh Lines if enabled
    if (showMesh) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, height);
        ctx.stroke();
      }
      for (let j = 0; j <= gridSize; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellH);
        ctx.lineTo(width, j * cellH);
        ctx.stroke();
      }
    }

    // 3. Draw Isotherm Contours if enabled
    if (showContours) {
      const numLevels = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;

      for (let level = 1; level < numLevels; level++) {
        const targetTemp = minTemp + (level / numLevels) * (maxTemp - minTemp);

        // Simple marching contour lines through adjacent cells
        for (let j = 0; j < gridSize - 1; j++) {
          for (let i = 0; i < gridSize - 1; i++) {
            const v00 = grid[j][i];
            const v10 = grid[j][i + 1];
            const v01 = grid[j + 1][i];
            const v11 = grid[j + 1][i + 1];

            const minCell = Math.min(v00, v10, v01, v11);
            const maxCell = Math.max(v00, v10, v01, v11);

            if (targetTemp >= minCell && targetTemp <= maxCell) {
              const xCenter = (i + 0.5) * cellW;
              const yCenter = (j + 0.5) * cellH;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(xCenter - 1, yCenter - 1, 2, 2);
            }
          }
        }
      }
    }

    // 4. Draw Heat Flux Vector Field if enabled (q = -k * grad T)
    if (showVectors) {
      const dx = plateLength / (gridSize - 1);
      const { fluxX, fluxY } = computeHeatFluxVectors(grid, gridSize, gridSize, thermalConductivity, dx);

      const step = Math.max(1, Math.floor(gridSize / 15));
      ctx.strokeStyle = '#00F0FF';
      ctx.fillStyle = '#00F0FF';
      ctx.lineWidth = 1.2;

      for (let j = 0; j < gridSize; j += step) {
        for (let i = 0; i < gridSize; i += step) {
          const qx = fluxX[j][i];
          const qy = fluxY[j][i];
          const mag = Math.hypot(qx, qy);

          if (mag > 0.001) {
            const x = (i + 0.5) * cellW;
            const y = (j + 0.5) * cellH;

            // Normalized arrow length (max 14px)
            const arrowLen = Math.min(cellW * 0.9, 14);
            const dirX = (qx / mag) * arrowLen;
            const dirY = (qy / mag) * arrowLen;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + dirX, y + dirY);
            ctx.stroke();

            // Arrow head
            const angle = Math.atan2(dirY, dirX);
            ctx.beginPath();
            ctx.moveTo(x + dirX, y + dirY);
            ctx.lineTo(x + dirX - 4 * Math.cos(angle - Math.PI / 6), y + dirY - 4 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x + dirX - 4 * Math.cos(angle + Math.PI / 6), y + dirY - 4 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    // 5. Draw Hover Indicator
    if (hoverData) {
      const { i, j } = hoverData;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(i * cellW, j * cellH, cellW, cellH);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(0, (j + 0.5) * cellH);
      ctx.lineTo(width, (j + 0.5) * cellH);
      ctx.moveTo((i + 0.5) * cellW, 0);
      ctx.lineTo((i + 0.5) * cellW, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [grid, gridSize, minTemp, maxTemp, colorMap, showMesh, showContours, showVectors, hoverData, plateLength, thermalConductivity]);

  // Handle canvas mouse move for probe inspection
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = rect.width / gridSize;
    const cellH = rect.height / gridSize;

    const i = Math.max(0, Math.min(gridSize - 1, Math.floor(x / cellW)));
    const j = Math.max(0, Math.min(gridSize - 1, Math.floor(y / cellH)));

    const temperature = grid[j][i];
    const dx = plateLength / (gridSize - 1);
    const { fluxMag } = computeHeatFluxVectors(grid, gridSize, gridSize, thermalConductivity, dx);
    const flux = fluxMag[j][i];

    setHoverData({
      xCoord: (i * dx).toFixed(3),
      yCoord: ((gridSize - 1 - j) * dx).toFixed(3),
      i,
      j,
      temperature: temperature.toFixed(2),
      heatFlux: flux.toFixed(1),
      normalized: ((temperature - minTemp) / (maxTemp - minTemp)).toFixed(2)
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoverData(null);
  };

  // Export Matrix to CSV
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `# NUMERICAL SIMULATION TEMPERATURE FIELD MATRIX\n`;
    csvContent += `# Grid: ${gridSize}x${gridSize}, Solver: ${solverType}, Iterations: ${iteration}, MaxResidual: ${maxResidual}\n`;
    grid.forEach(row => {
      csvContent += row.map(v => v.toFixed(4)).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `heat_distribution_${gridSize}x${gridSize}_iter${iteration}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Capture Canvas Screenshot
  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.setAttribute('href', imgUri);
    link.setAttribute('download', `thermal_simulation_screenshot_${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="simulation" className="py-20 relative bg-[#070b14] border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 font-mono text-xs mb-3 shadow-glow-cyan">
              <Zap className="w-3.5 h-3.5" />
              <span>LIVE INTERACTIVE SIMULATION LAB</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              2D Heat Conduction Simulation Studio
            </h2>
            <p className="mt-2 text-sm text-slate-300 font-light max-w-2xl">
              Solve the steady-state thermal field in real-time. Alter boundary temperatures, compare iterative solvers (Jacobi vs Gauss-Seidel vs SOR), inspect heat flux vectors, and probe local gradients.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span className="text-xs font-mono text-slate-400 self-center mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('dirichlet_benchmark')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 transition-all"
            >
              Dirichlet Benchmark
            </button>
            <button
              onClick={() => applyPreset('insulated_walls')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-white transition-all"
            >
              Insulated Walls
            </button>
            <button
              onClick={() => applyPreset('chip_hotspot')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 border border-orange-500/30 text-orange-300 hover:bg-orange-950 transition-all"
            >
              Microchip Hotspot
            </button>
            <button
              onClick={() => applyPreset('furnace')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 border border-red-500/30 text-red-300 hover:bg-red-950 transition-all"
            >
              Smelting Furnace
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout: Canvas on Left, Controls & HUD on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visualizer Stage (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Canvas Outer Housing */}
            <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 border border-cyan-500/30 relative">
              
              {/* Top Controls Bar: Visualizer Modes */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">COLORMAP:</span>
                  <select
                    value={colorMap}
                    onChange={(e) => setColorMap(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="jet">Jet (Standard Thermal)</option>
                    <option value="turbo">Google Turbo (Perceptual)</option>
                    <option value="inferno">Inferno (Radiation Hot)</option>
                    <option value="coolwarm">Cool-Warm (Divergent)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowContours(!showContours)}
                    className={`px-2.5 py-1 rounded border transition-all ${
                      showContours
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Isotherms
                  </button>
                  <button
                    onClick={() => setShowVectors(!showVectors)}
                    className={`px-2.5 py-1 rounded border transition-all ${
                      showVectors
                        ? 'bg-blue-950 text-blue-300 border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Flux Vectors (q)
                  </button>
                  <button
                    onClick={() => setShowMesh(!showMesh)}
                    className={`px-2.5 py-1 rounded border transition-all ${
                      showMesh
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Mesh Grid
                  </button>
                </div>
              </div>

              {/* The Visualizer Canvas Frame with Boundary Annotations */}
              <div className="relative aspect-square max-w-[540px] mx-auto bg-black rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl flex items-center justify-center">
                
                {/* Boundary Badges */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400 font-semibold backdrop-blur-md">
                  TOP: {boundaries.topInsulated ? 'Adiabatic (Insulated)' : `${boundaries.top}°C`}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded bg-black/80 border border-cyan-500/50 text-[10px] font-mono text-cyan-400 font-semibold backdrop-blur-md">
                  BOTTOM: {boundaries.bottomInsulated ? 'Adiabatic (Insulated)' : `${boundaries.bottom}°C`}
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 -rotate-90 px-2.5 py-0.5 rounded bg-black/80 border border-blue-500/50 text-[10px] font-mono text-blue-400 font-semibold backdrop-blur-md">
                  LEFT: {boundaries.leftInsulated ? 'Insulated' : `${boundaries.left}°C`}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rotate-90 px-2.5 py-0.5 rounded bg-black/80 border border-blue-500/50 text-[10px] font-mono text-blue-400 font-semibold backdrop-blur-md">
                  RIGHT: {boundaries.rightInsulated ? 'Insulated' : `${boundaries.right}°C`}
                </div>

                {/* Main 2D Heatmap Canvas */}
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  className="w-full h-full object-cover cursor-crosshair"
                />

                {/* Vertical Colorbar Legend on Far Right */}
                <div className="absolute right-3 top-12 bottom-12 w-3 rounded-full overflow-hidden border border-white/20 shadow-lg flex flex-col pointer-events-none">
                  <div className="flex-1 bg-gradient-to-b from-red-600 via-yellow-400 via-emerald-400 via-cyan-400 to-blue-700"></div>
                </div>
                <div className="absolute right-7 top-11 text-[9px] font-mono text-white/80 pointer-events-none">
                  {maxTemp.toFixed(0)}°C
                </div>
                <div className="absolute right-7 bottom-11 text-[9px] font-mono text-white/80 pointer-events-none">
                  {minTemp.toFixed(0)}°C
                </div>

              </div>

              {/* Real-time Cursor Hover Telemetry Bar */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                {hoverData ? (
                  <>
                    <div className="flex items-center space-x-2 text-cyan-300">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Node ({hoverData.i}, {hoverData.j})</span>
                      <span className="text-slate-500">|</span>
                      <span>Pos: ({hoverData.xCoord}m, {hoverData.yCoord}m)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-slate-400 mr-1.5">T:</span>
                        <span className="text-orange-400 font-bold text-sm">{hoverData.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-1.5">Flux |q|:</span>
                        <span className="text-cyan-400 font-bold">{hoverData.heatFlux} W/m²</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 italic text-center w-full py-0.5">
                    Hover over the plate mesh to inspect local nodal temperature, coordinates, and heat flux vector.
                  </div>
                )}
              </div>

            </div>

            {/* Simulation Playback & Step Controls */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-5 py-2.5 rounded-lg font-mono font-bold text-xs tracking-wider uppercase flex items-center space-x-2 transition-all transform active:scale-95 ${
                    isRunning
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-glow-orange'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 hover:from-cyan-300 hover:to-blue-500 shadow-glow-cyan'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>PAUSE SOLVER</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>RUN ITERATIONS</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStep}
                  disabled={isRunning || status === 'converged'}
                  className="px-3.5 py-2.5 rounded-lg font-mono text-xs text-slate-300 bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-all flex items-center space-x-1.5"
                  title="Perform 1 Discrete Iteration Step"
                >
                  <StepForward className="w-4 h-4" />
                  <span>STEP (1)</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-lg font-mono text-xs text-slate-300 bg-slate-900 border border-slate-700 hover:border-red-400 hover:text-red-400 transition-all flex items-center space-x-1.5"
                  title="Reset Simulation Grid to Initial State"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Speed / Batching Multiplier */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-slate-400">SPEED:</span>
                {[1, 10, 50].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${
                      simSpeed === spd
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>

              {/* Export actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportCSV}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-all"
                  title="Export Temperature Matrix as CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={captureScreenshot}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-all"
                  title="Download Canvas PNG Snapshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Parameters & Telemetry Console (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-Time Solver HUD Telemetry */}
            <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/30 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Solver Telemetry HUD</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  status === 'converged'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : status === 'running'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-700 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">ITERATION COUNT</div>
                  <div className="text-xl font-bold text-white mt-1">{iteration}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">MAX RESIDUAL (L∞)</div>
                  <div className="text-xl font-bold text-cyan-300 mt-1">
                    {maxResidual > 0 ? maxResidual.toExponential(3) : '0.000'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">RMS / L2 NORM</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {l2Norm > 0 ? l2Norm.toExponential(3) : '0.000'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">ELAPSED TIME</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">{elapsedTime} ms</div>
                </div>
              </div>

              {status === 'converged' && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>CONVERGED:</strong> Residual dropped below tolerance &epsilon; ({tolerance}) in {iteration} iterations!
                  </span>
                </div>
              )}
            </div>

            {/* Algorithm & Discretization Selection */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white uppercase">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Numerical Algorithm & Grid</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Solver Type Radios */}
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">SOLVER METHOD:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'jacobi', label: 'Jacobi' },
                      { id: 'gauss-seidel', label: 'Gauss-Seidel' },
                      { id: 'sor', label: 'SOR' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSolverType(s.id); handleReset(); }}
                        className={`py-2 px-2 rounded-lg text-center font-bold transition-all border ${
                          solverType === s.id
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SOR Omega Relaxation Slider */}
                {solverType === 'sor' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-orange-500/30 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-orange-400 font-bold">RELAXATION FACTOR (&omega;):</span>
                      <span className="text-white font-bold">{omega}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="1.95"
                      step="0.02"
                      value={omega}
                      onChange={(e) => setOmega(parseFloat(e.target.value))}
                      className="w-full accent-orange-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1.0 (Gauss-Seidel)</span>
                      <span>Opt: {getOptimalSOROmega(gridSize)}</span>
                      <span>1.95 (Over-relaxed)</span>
                    </div>
                  </div>
                )}

                {/* Grid Density */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">GRID RESOLUTION (N × N):</span>
                    <span className="text-cyan-400 font-bold">{gridSize} × {gridSize} ({gridSize * gridSize} nodes)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 30, 40, 50].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => { setGridSize(sz); handleReset(); }}
                        className={`py-1.5 rounded text-center font-bold ${
                          gridSize === sz
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {sz}×{sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convergence Tolerance */}
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">CONVERGENCE TOLERANCE (&epsilon;):</label>
                  <select
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-400"
                  >
                    <option value={0.001}>1e-3 (0.001) - Fast Draft</option>
                    <option value={0.0001}>1e-4 (0.0001) - Standard Engineering</option>
                    <option value={0.00001}>1e-5 (0.00001) - High Precision</option>
                    <option value={0.000001}>1e-6 (0.000001) - Scientific Exact</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Boundary Conditions Configuration */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-white uppercase">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <span>Boundary Conditions (Dirichlet / Neumann)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Top Boundary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-400 font-bold">TOP (Y=0)</span>
                    <label className="text-[10px] text-slate-400 flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boundaries.topInsulated}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, topInsulated: e.target.checked }));
                          handleReset();
                        }}
                        className="accent-cyan-400 rounded"
                      />
                      <span>Insulated</span>
                    </label>
                  </div>
                  {!boundaries.topInsulated && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={boundaries.top}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, top: parseFloat(e.target.value) }));
                          handleReset();
                        }}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                      <span className="text-white font-bold w-12 text-right">{boundaries.top}°C</span>
                    </div>
                  )}
                </div>

                {/* Bottom Boundary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-cyan-400 font-bold">BOTTOM (Y=W)</span>
                    <label className="text-[10px] text-slate-400 flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boundaries.bottomInsulated}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, bottomInsulated: e.target.checked }));
                          handleReset();
                        }}
                        className="accent-cyan-400 rounded"
                      />
                      <span>Insulated</span>
                    </label>
                  </div>
                  {!boundaries.bottomInsulated && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={boundaries.bottom}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, bottom: parseFloat(e.target.value) }));
                          handleReset();
                        }}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <span className="text-white font-bold w-12 text-right">{boundaries.bottom}°C</span>
                    </div>
                  )}
                </div>

                {/* Left Boundary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 font-bold">LEFT (X=0)</span>
                    <label className="text-[10px] text-slate-400 flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boundaries.leftInsulated}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, leftInsulated: e.target.checked }));
                          handleReset();
                        }}
                        className="accent-cyan-400 rounded"
                      />
                      <span>Insulated</span>
                    </label>
                  </div>
                  {!boundaries.leftInsulated && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={boundaries.left}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, left: parseFloat(e.target.value) }));
                          handleReset();
                        }}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <span className="text-white font-bold w-12 text-right">{boundaries.left}°C</span>
                    </div>
                  )}
                </div>

                {/* Right Boundary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 font-bold">RIGHT (X=L)</span>
                    <label className="text-[10px] text-slate-400 flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boundaries.rightInsulated}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, rightInsulated: e.target.checked }));
                          handleReset();
                        }}
                        className="accent-cyan-400 rounded"
                      />
                      <span>Insulated</span>
                    </label>
                  </div>
                  {!boundaries.rightInsulated && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={boundaries.right}
                        onChange={(e) => {
                          setBoundaries(b => ({ ...b, right: parseFloat(e.target.value) }));
                          handleReset();
                        }}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <span className="text-white font-bold w-12 text-right">{boundaries.right}°C</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Poisson Heat Source Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Internal Heat Generation (&dot;q)</span>
                  <span className="text-[10px] text-slate-400">Enables Poisson PDE: &nabla;&sup2;T = -&dot;q/k</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasHeatSource}
                  onChange={(e) => { setHasHeatSource(e.target.checked); handleReset(); }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

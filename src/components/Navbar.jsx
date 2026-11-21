import React, { useState, useEffect } from 'react';
import { Flame, Cpu, Play, Menu, X, Activity, BookOpen, Layers, Terminal, ChevronRight } from 'lucide-react';

export default function Navbar({ onScrollTo, currentIteration, solverStatus }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Overview', target: 'overview', icon: BookOpen },
    { label: 'Governing PDE', target: 'math-model', icon: Layers },
    { label: 'Simulation Studio', target: 'simulation', icon: Play, highlight: true },
    { label: 'Convergence & Solvers', target: 'convergence', icon: Activity },
    { label: 'Analytical Verification', target: 'verification', icon: Cpu },
    { label: 'Case Studies', target: 'case-studies', icon: Flame },
    { label: 'Formulation & Code', target: 'code', icon: Terminal },
  ];

  const handleNavClick = (target) => {
    setMobileMenuOpen(false);
    if (onScrollTo) {
      onScrollTo(target);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#060911]/90 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-lg shadow-black/40' 
        : 'bg-transparent border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Lab Identifier */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-orange-500/20 border border-cyan-400/40 shadow-glow-cyan">
              <Flame className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -inset-0.5 bg-cyan-400/20 rounded-lg blur-sm -z-10"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-bold tracking-wider font-mono text-white">
                  THERMO<span className="text-cyan-400">SIM</span><span className="text-orange-400">.2D</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800 rounded">
                  FDM v2.4
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block tracking-tight">
                Computational Heat Transfer Laboratory
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono text-xs">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                  item.highlight
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 hover:shadow-glow-cyan'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Telemetry Indicator & Fast CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  solverStatus === 'converged' ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  solverStatus === 'converged' ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}></span>
              </span>
              <span className="text-slate-400">STATUS:</span>
              <span className="text-cyan-300 font-semibold tracking-wide">
                {solverStatus === 'converged' ? 'CONVERGED' : solverStatus === 'running' ? `ITER ${currentIteration}` : 'STANDBY'}
              </span>
            </div>

            <button
              onClick={() => handleNavClick('simulation')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN SIM</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-cyan-500/20 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 font-mono text-sm">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-slate-300 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/20"
            >
              <span className="flex items-center space-x-2">
                <item.icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('simulation')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-mono font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-glow-cyan"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Simulator Canvas</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

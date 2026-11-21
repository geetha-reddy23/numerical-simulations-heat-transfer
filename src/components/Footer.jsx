import React from 'react';
import { Flame, BookOpen, ExternalLink, ShieldCheck, Github, Cpu, Heart } from 'lucide-react';

export default function Footer({ onScrollTo }) {
  const citations = [
    {
      title: 'Fundamentals of Heat and Mass Transfer (8th Edition)',
      authors: 'Theodore L. Bergman, Adrienne S. Lavine, Frank P. Incropera, David P. DeWitt',
      publisher: 'John Wiley & Sons, Inc., New York',
      chapter: 'Chapter 4: Two-Dimensional, Steady-State Conduction (Finite-Difference Equations)'
    },
    {
      title: 'Numerical Methods for Engineers (7th Edition)',
      authors: 'Steven C. Chapra, Raymond P. Canale',
      publisher: 'McGraw-Hill Education',
      chapter: 'Part 8: Partial Differential Equations, Elliptic Equations & Liebmann Method'
    },
    {
      title: 'Numerical Heat Transfer and Fluid Flow',
      authors: 'Suhas V. Patankar',
      publisher: 'Hemisphere Publishing Corporation',
      chapter: 'Control-Volume Finite-Difference Formulations'
    }
  ];

  return (
    <footer className="bg-[#04060c] border-t border-slate-800 text-slate-400 font-sans text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Project Summary (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 text-cyan-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-lg font-bold font-mono tracking-wider text-white">
                THERMO<span className="text-cyan-400">SIM</span><span className="text-orange-400">.2D</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-light">
              A state-of-the-art computational simulation platform for 2D steady-state heat conduction in engineering domains. Developed for rigorous numerical methods coursework, theoretical verification, and industrial thermal analysis.
            </p>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SIMULATION ENGINE: FDM 5-POINT CENTRAL STENCIL</span>
            </div>
          </div>

          {/* Academic References & Bibliography (4 cols) */}
          <div className="md:col-span-4 space-y-3 font-mono">
            <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Standard Academic References</span>
            </div>
            <div className="space-y-3 text-[11px] text-slate-400 font-sans">
              {citations.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-200 font-semibold">{c.title}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{c.authors}</div>
                  <div className="text-cyan-400/80 text-[10px] mt-0.5">{c.chapter}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links & Modules (3 cols) */}
          <div className="md:col-span-3 space-y-3 font-mono">
            <div className="text-white font-bold text-xs uppercase tracking-wider">
              Simulation Modules
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onScrollTo('overview')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Engineering Overview
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('math-model')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Governing Laplace PDE
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('simulation')} className="text-cyan-300 hover:text-cyan-200 transition-colors font-bold">
                  &rarr; Interactive 2D Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('convergence')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Convergence Analysis
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('verification')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Analytical Verification
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('case-studies')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Industrial Case Studies
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('code')} className="hover:text-cyan-400 transition-colors">
                  &rarr; Python & MATLAB Code
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} Numerical Simulations of Heat Transfer System. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Computational Engineering & Science</span>
            <span>&bull;</span>
            <span className="text-cyan-400">Finite Difference Method (FDM)</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

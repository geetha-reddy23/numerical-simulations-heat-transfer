import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectOverview from './components/ProjectOverview';
import MathematicalModel from './components/MathematicalModel';
import SimulationStudio from './components/SimulationStudio';
import ConvergenceAnalysis from './components/ConvergenceAnalysis';
import AnalyticalVerification from './components/AnalyticalVerification';
import CrossSectionProfiles from './components/CrossSectionProfiles';
import CaseStudies from './components/CaseStudies';
import CodeFormulation from './components/CodeFormulation';
import Footer from './components/Footer';

export default function App() {
  const [solverState, setSolverState] = useState({
    iteration: 0,
    status: 'standby' // 'standby' | 'running' | 'converged'
  });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Scientific Navigation Header */}
      <Navbar
        onScrollTo={scrollToSection}
        currentIteration={solverState.iteration}
        solverStatus={solverState.status}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreClick={() => scrollToSection('simulation')}
          onViewDetailsClick={() => scrollToSection('overview')}
        />

        {/* Project Overview & Industrial Motivation */}
        <ProjectOverview />

        {/* Mathematical Modeling & Finite Difference Stencil */}
        <MathematicalModel />

        {/* Interactive 2D Heat Transfer Simulation Studio */}
        <SimulationStudio
          onSolverUpdate={(data) => setSolverState(data)}
        />

        {/* Convergence & Spectral Radius Performance Benchmarks */}
        <ConvergenceAnalysis />

        {/* Analytical Fourier Separation of Variables Verification */}
        <AnalyticalVerification />

        {/* 1D Cross-Sectional Temperature Profiles */}
        <CrossSectionProfiles />

        {/* Real-World Engineering Case Studies */}
        <CaseStudies />

        {/* Matrix Formulation & Multi-Language Code Generator */}
        <CodeFormulation />
      </main>

      {/* Academic Citations & Project Footer */}
      <Footer onScrollTo={scrollToSection} />

    </div>
  );
}

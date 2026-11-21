# Numerical Simulations of Heat Transfer System

A high-performance computational engineering and research simulation web application for **2D Steady-State Heat Conduction** using the **Finite Difference Method (FDM)** and iterative numerical solvers (**Jacobi Iteration**, **Gauss-Seidel**, and **Successive Over-Relaxation - SOR**).

![Project Preview](https://img.shields.io/badge/Domain-2D%20Heat%20Conduction-orange)
![Technique](https://img.shields.io/badge/Numerical%20Technique-Finite%20Difference%20Method-blue)
![Order](https://img.shields.io/badge/Accuracy-Second--Order%20Central%20O(Δx²)-cyan)
![Solver](https://img.shields.io/badge/Solvers-Jacobi%20%7C%20Gauss--Seidel%20%7C%20SOR-purple)

---

## 🌟 Key Features

1. **Interactive 2D Simulation Studio**:
   - Real-time 2D temperature distribution solving using 5-point central difference Liebmann stencil.
   - Dynamic boundary condition controls (Dirichlet prescribed temperatures & Neumann adiabatic/insulated edges).
   - Poisson internal volumetric heat generation source toggle.
   - 4 Scientific Colormaps: **Jet (Engineering)**, **Google Turbo (Perceptual)**, **Inferno (Radiative)**, and **Cool-Warm (Divergent)**.
   - Overlays: Isotherm Contour Lines, Heat Flux Vector Field ($\vec{q} = -k \nabla T$), and Mesh Grid lines.
   - Real-time cursor probe: hover anywhere on the plate to inspect nodal coordinates $(x,y)$, node $(i,j)$, temperature, and local heat flux magnitude.
   - Data Export: Export numerical temperature matrix to CSV and capture canvas high-resolution PNG snapshots.

2. **Theoretical Formulation Lab**:
   - 2D Steady-State Heat Equation ($\nabla^2 T = 0$ / $\nabla^2 T = -\dot{q}/k$).
   - Taylor Series expansion and second-order central difference discretization.
   - Interactive 5-point Liebmann stencil visualizer with nodal weight inspection.

3. **Convergence & Spectral Radius Analysis**:
   - Empirical residual history logarithmic chart ($\log_{10} \|R\|_\infty$ vs iteration number).
   - Spectral radius comparison: $\rho(B_J) = \cos(\pi/N)$, $\rho(B_{GS}) = \cos^2(\pi/N)$, $\rho(B_{SOR}) = \omega_{\text{opt}} - 1$.
   - Successive Over-Relaxation (SOR) optimization formula $\omega_{\text{opt}} = \frac{2}{1 + \sin(\pi/N)}$.

4. **Analytical Verification & Truncation Error Study**:
   - Direct benchmark against Fourier separation of variables infinite series exact solution.
   - Point-by-point error comparison table ($< 0.12\%$ discrepancy).
   - Grid refinement study ($\Delta x = 0.1, 0.05, 0.025, 0.0125$) demonstrating formal second-order spatial convergence ($O(\Delta x^2)$).

5. **1D Cross-Sectional Gradient Profiler**:
   - Extract linear temperature profiles across Horizontal midline ($y = 0.5$), Vertical midline ($x = 0.5$), and diagonal cutlines.
   - Interactive SVG line plots with probe tooltips.

6. **Industrial Case Studies**:
   - Microprocessor Die & Heat Spreader Packaging ($q = 120 \text{ W/cm}^2$).
   - Hypersonic Re-entry Spacecraft Ceramic Tile Protection ($1650^\circ\text{C}$ stagnation shock).
   - Nuclear Reactor Fuel Cladding Channel (Volumetric fission heating Poisson PDE).
   - Industrial Metallurgical Smelting Induction Furnace ($1550^\circ\text{C}$ refractory lining).

7. **Sparse Matrix Formulation & Code Generators**:
   - Penta-diagonal banded matrix formulation ($A \mathbf{T} = \mathbf{b}$).
   - Ready-to-run, vectorized scripts in **Python (NumPy/SciPy)**, **MATLAB**, and **C++ (OpenMP)** with one-click copy and file download.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 📚 Standard References
- **Bergman, Lavine, Incropera & DeWitt**: *Fundamentals of Heat and Mass Transfer (8th Edition)*, John Wiley & Sons.
- **Chapra & Canale**: *Numerical Methods for Engineers (7th Edition)*, McGraw-Hill.
- **Patankar, S. V.**: *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing Corporation.

// Numerical Heat Transfer Solvers and Mathematical Utilities
// Solves 2D Steady-State Laplace / Poisson equation:
// d2T/dx2 + d2T/dy2 = -q_dot / k
// Discretized with 2nd-order Central Finite Difference Method

/**
 * Initializes a 2D temperature grid of size [Ny][Nx]
 * with default boundary temperatures and initial internal temperature
 */
export function createGrid(Nx, Ny, boundaries, initialInterior = 0) {
  const grid = Array(Ny).fill(0).map(() => Array(Nx).fill(initialInterior));

  // Apply Dirichlet Boundary Conditions
  // Top boundary (y = 0)
  for (let i = 0; i < Nx; i++) {
    grid[0][i] = boundaries.top;
  }
  // Bottom boundary (y = Ny - 1)
  for (let i = 0; i < Nx; i++) {
    grid[Ny - 1][i] = boundaries.bottom;
  }
  // Left boundary (x = 0)
  for (let j = 0; j < Ny; j++) {
    grid[j][0] = boundaries.left;
  }
  // Right boundary (x = Nx - 1)
  for (let j = 0; j < Ny; j++) {
    grid[j][Nx - 1] = boundaries.right;
  }

  // Corners average adjacent edges
  grid[0][0] = (boundaries.top + boundaries.left) / 2;
  grid[0][Nx - 1] = (boundaries.top + boundaries.right) / 2;
  grid[Ny - 1][0] = (boundaries.bottom + boundaries.left) / 2;
  grid[Ny - 1][Nx - 1] = (boundaries.bottom + boundaries.right) / 2;

  return grid;
}

/**
 * Perform one iteration of Jacobi Method
 * T_new[j][i] = 0.25 * (T_old[j+1][i] + T_old[j-1][i] + T_old[j][i+1] + T_old[j][i-1] + sourceTerm)
 */
export function iterateJacobi(grid, Nx, Ny, boundaries, sourceGrid = null, dx = 1, k = 1) {
  const newGrid = Array(Ny).fill(0).map(() => Array(Nx).fill(0));
  let maxResidual = 0;
  let sumSquaredResidual = 0;
  let interiorNodes = (Nx - 2) * (Ny - 2);

  // Copy boundaries or apply Neumann
  for (let i = 0; i < Nx; i++) {
    newGrid[0][i] = boundaries.topInsulated ? grid[1][i] : boundaries.top;
    newGrid[Ny - 1][i] = boundaries.bottomInsulated ? grid[Ny - 2][i] : boundaries.bottom;
  }
  for (let j = 0; j < Ny; j++) {
    newGrid[j][0] = boundaries.leftInsulated ? grid[j][1] : boundaries.left;
    newGrid[j][Nx - 1] = boundaries.rightInsulated ? grid[j][Nx - 2] : boundaries.right;
  }

  // Update interior
  for (let j = 1; j < Ny - 1; j++) {
    for (let i = 1; i < Nx - 1; i++) {
      const source = sourceGrid ? (sourceGrid[j][i] * dx * dx) / k : 0;
      const updated = 0.25 * (grid[j - 1][i] + grid[j + 1][i] + grid[j][i - 1] + grid[j][i + 1] + source);
      newGrid[j][i] = updated;

      const diff = Math.abs(updated - grid[j][i]);
      if (diff > maxResidual) maxResidual = diff;
      sumSquaredResidual += diff * diff;
    }
  }

  const l2Norm = Math.sqrt(sumSquaredResidual / Math.max(1, interiorNodes));
  return { newGrid, maxResidual, l2Norm };
}

/**
 * Perform one iteration of Gauss-Seidel Method
 * Updates in-place using latest computed neighbor values immediately
 */
export function iterateGaussSeidel(grid, Nx, Ny, boundaries, sourceGrid = null, dx = 1, k = 1) {
  const newGrid = grid.map(row => [...row]);
  let maxResidual = 0;
  let sumSquaredResidual = 0;
  let interiorNodes = (Nx - 2) * (Ny - 2);

  // Update interior in-place
  for (let j = 1; j < Ny - 1; j++) {
    for (let i = 1; i < Nx - 1; i++) {
      const source = sourceGrid ? (sourceGrid[j][i] * dx * dx) / k : 0;
      // Uses already updated newGrid[j-1][i] and newGrid[j][i-1]
      const updated = 0.25 * (newGrid[j - 1][i] + newGrid[j + 1][i] + newGrid[j][i - 1] + newGrid[j][i + 1] + source);

      const diff = Math.abs(updated - newGrid[j][i]);
      if (diff > maxResidual) maxResidual = diff;
      sumSquaredResidual += diff * diff;

      newGrid[j][i] = updated;
    }
  }

  // Update Neumann boundaries if any
  for (let i = 0; i < Nx; i++) {
    if (boundaries.topInsulated) newGrid[0][i] = newGrid[1][i];
    if (boundaries.bottomInsulated) newGrid[Ny - 1][i] = newGrid[Ny - 2][i];
  }
  for (let j = 0; j < Ny; j++) {
    if (boundaries.leftInsulated) newGrid[j][0] = newGrid[j][1];
    if (boundaries.rightInsulated) newGrid[j][Nx - 1] = newGrid[j][Nx - 2];
  }

  const l2Norm = Math.sqrt(sumSquaredResidual / Math.max(1, interiorNodes));
  return { newGrid, maxResidual, l2Norm };
}

/**
 * Perform one iteration of Successive Over-Relaxation (SOR)
 * T_new = (1 - omega) * T_old + omega * T_GS
 */
export function iterateSOR(grid, Nx, Ny, boundaries, omega = 1.4, sourceGrid = null, dx = 1, k = 1) {
  const newGrid = grid.map(row => [...row]);
  let maxResidual = 0;
  let sumSquaredResidual = 0;
  let interiorNodes = (Nx - 2) * (Ny - 2);

  for (let j = 1; j < Ny - 1; j++) {
    for (let i = 1; i < Nx - 1; i++) {
      const source = sourceGrid ? (sourceGrid[j][i] * dx * dx) / k : 0;
      const tGS = 0.25 * (newGrid[j - 1][i] + newGrid[j + 1][i] + newGrid[j][i - 1] + newGrid[j][i + 1] + source);
      const updated = (1 - omega) * newGrid[j][i] + omega * tGS;

      const diff = Math.abs(updated - newGrid[j][i]);
      if (diff > maxResidual) maxResidual = diff;
      sumSquaredResidual += diff * diff;

      newGrid[j][i] = updated;
    }
  }

  // Update Neumann boundaries if any
  for (let i = 0; i < Nx; i++) {
    if (boundaries.topInsulated) newGrid[0][i] = newGrid[1][i];
    if (boundaries.bottomInsulated) newGrid[Ny - 1][i] = newGrid[Ny - 2][i];
  }
  for (let j = 0; j < Ny; j++) {
    if (boundaries.leftInsulated) newGrid[j][0] = newGrid[j][1];
    if (boundaries.rightInsulated) newGrid[j][Nx - 1] = newGrid[j][Nx - 2];
  }

  const l2Norm = Math.sqrt(sumSquaredResidual / Math.max(1, interiorNodes));
  return { newGrid, maxResidual, l2Norm };
}

/**
 * Analytical Separation of Variables benchmark solution:
 * Dirichlet square plate [0, L] x [0, W]
 * Boundaries: T(x, W) = T_top, T(x, 0) = 0, T(0, y) = 0, T(L, y) = 0
 * T(x, y) = sum_{n=1,3,5...}^N (4 * T_top / (n * pi)) * (sinh(n * pi * y / L) / sinh(n * pi * W / L)) * sin(n * pi * x / L)
 */
export function computeAnalyticalSolution(Nx, Ny, T_top, numTerms = 60) {
  const grid = Array(Ny).fill(0).map(() => Array(Nx).fill(0));
  const L = 1.0;
  const W = 1.0;

  for (let j = 0; j < Ny; j++) {
    const y = ((Ny - 1 - j) / (Ny - 1)) * W; // y=0 at bottom, y=W at top
    for (let i = 0; i < Nx; i++) {
      const x = (i / (Nx - 1)) * L;

      if (j === 0) {
        grid[j][i] = T_top;
      } else if (j === Ny - 1 || i === 0 || i === Nx - 1) {
        grid[j][i] = 0;
      } else {
        let sum = 0;
        for (let n = 1; n <= numTerms; n += 2) {
          const factor = (4 * T_top) / (n * Math.PI);
          const sinhNumerator = Math.sinh((n * Math.PI * y) / L);
          const sinhDenominator = Math.sinh((n * Math.PI * W) / L);
          const sinTerm = Math.sin((n * Math.PI * x) / L);
          sum += factor * (sinhNumerator / sinhDenominator) * sinTerm;
        }
        grid[j][i] = sum;
      }
    }
  }

  return grid;
}

/**
 * Computes Heat Flux Vector Field: q = -k * grad(T)
 * q_x = -k * dT/dx
 * q_y = -k * dT/dy
 */
export function computeHeatFluxVectors(grid, Nx, Ny, k = 1.0, dx = 0.05) {
  const fluxX = Array(Ny).fill(0).map(() => Array(Nx).fill(0));
  const fluxY = Array(Ny).fill(0).map(() => Array(Nx).fill(0));
  const fluxMag = Array(Ny).fill(0).map(() => Array(Nx).fill(0));

  for (let j = 0; j < Ny; j++) {
    for (let i = 0; i < Nx; i++) {
      let dtdx = 0;
      let dtdy = 0;

      // x-derivative
      if (i === 0) {
        dtdx = (grid[j][i + 1] - grid[j][i]) / dx;
      } else if (i === Nx - 1) {
        dtdx = (grid[j][i] - grid[j][i - 1]) / dx;
      } else {
        dtdx = (grid[j][i + 1] - grid[j][i - 1]) / (2 * dx);
      }

      // y-derivative (note: row 0 is top, so dy goes downward)
      if (j === 0) {
        dtdy = (grid[j + 1][i] - grid[j][i]) / dx;
      } else if (j === Ny - 1) {
        dtdy = (grid[j][i] - grid[j - 1][i]) / dx;
      } else {
        dtdy = (grid[j + 1][i] - grid[j - 1][i]) / (2 * dx);
      }

      // Fourier's Law: q = -k * grad(T)
      const qx = -k * dtdx;
      const qy = -k * dtdy;

      fluxX[j][i] = qx;
      fluxY[j][i] = qy;
      fluxMag[j][i] = Math.sqrt(qx * qx + qy * qy);
    }
  }

  return { fluxX, fluxY, fluxMag };
}

/**
 * Computes optimal relaxation factor omega for SOR on a square N x N grid:
 * omega_opt = 2 / (1 + sin(pi / N))
 */
export function getOptimalSOROmega(N) {
  return (2 / (1 + Math.sin(Math.PI / N))).toFixed(3);
}

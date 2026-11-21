// Scientific colormaps for numerical heat simulation visualization

// Normalized value t in [0, 1]
export function getColor(t, scheme = 'jet') {
  // Clamp t between 0 and 1
  t = Math.max(0, Math.min(1, t));

  switch (scheme) {
    case 'jet': {
      // Classic engineering Jet colormap
      // 0.0 -> Blue, 0.25 -> Cyan, 0.5 -> Green, 0.75 -> Yellow, 1.0 -> Red
      let r = 0, g = 0, b = 0;
      if (t < 0.125) {
        r = 0;
        g = 0;
        b = 0.5 + 4 * t;
      } else if (t < 0.375) {
        r = 0;
        g = 4 * (t - 0.125);
        b = 1;
      } else if (t < 0.625) {
        r = 4 * (t - 0.375);
        g = 1;
        b = 1 - 4 * (t - 0.375);
      } else if (t < 0.875) {
        r = 1;
        g = 1 - 4 * (t - 0.625);
        b = 0;
      } else {
        r = 1 - 2 * (t - 0.875);
        g = 0;
        b = 0;
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    case 'inferno': {
      // Perceptually uniform hot colormap
      // 0 -> black/dark purple -> red -> orange -> bright yellow
      const r = Math.min(1, Math.max(0, 1.3 * Math.pow(t, 0.7) - 0.1));
      const g = Math.min(1, Math.max(0, 1.1 * Math.pow(t, 1.8) - 0.05));
      const b = Math.min(1, Math.max(0, 0.6 * Math.sin(t * Math.PI) * (1 - t * 0.8) + (t > 0.8 ? (t - 0.8) * 4 : 0)));
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    case 'turbo': {
      // Google Turbo Colormap (polynomial approximation)
      const r = 0.1357 + t * (4.5974 - t * (42.3277 - t * (130.5887 - t * (150.5666 - t * 58.1375))));
      const g = 0.0914 + t * (2.1856 + t * (4.8052 - t * (14.0195 - t * (4.2109 - t * 2.7747))));
      const b = 0.1067 + t * (12.5732 - t * (80.147 - t * (197.9496 - t * (205.1633 - t * 74.3323))));
      return [
        Math.min(255, Math.max(0, Math.round(r * 255))),
        Math.min(255, Math.max(0, Math.round(g * 255))),
        Math.min(255, Math.max(0, Math.round(b * 255)))
      ];
    }

    case 'coolwarm': {
      // Divergent Blue-White-Red
      let r, g, b;
      if (t < 0.5) {
        const factor = t * 2;
        r = Math.round(59 + factor * (220 - 59));
        g = Math.round(76 + factor * (220 - 76));
        b = Math.round(192 + factor * (220 - 192));
      } else {
        const factor = (t - 0.5) * 2;
        r = Math.round(220 + factor * (180 - 220));
        g = Math.round(220 - factor * (220 - 40));
        b = Math.round(220 - factor * (220 - 40));
      }
      return [r, g, b];
    }

    default: // fallback to jet
      return getColor(t, 'jet');
  }
}

// Convert RGB array to hex string
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

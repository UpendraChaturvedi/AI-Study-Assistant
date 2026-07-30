import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = path.join(__dirname, 'src', 'assets', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Ultra-sleek SVG icon with vibrant gradients and AI Sparkles + Graduation Cap
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#db2777" />
    </linearGradient>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
  </defs>

  <!-- Glowing Rounded Badge Container -->
  <rect x="4" y="4" width="120" height="120" rx="30" fill="url(#bgGrad)" />
  <rect x="4" y="4" width="120" height="120" rx="30" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3" />

  <!-- Main AI Sparkle Symbol -->
  <g>
    <!-- Central Large Sparkle -->
    <path d="M 64 22 C 64 43, 64 43, 85 43 C 64 43, 64 43, 64 64 C 64 43, 64 43, 43 43 C 64 43, 64 43, 64 22 Z" fill="url(#starGrad)" />
    
    <!-- Secondary Small Sparkles -->
    <path d="M 96 60 C 96 70, 96 70, 106 70 C 96 70, 96 70, 96 80 C 96 70, 96 70, 86 70 C 96 70, 96 70, 96 60 Z" fill="#ffffff" opacity="0.95" />
    <path d="M 34 68 C 34 76, 34 76, 42 76 C 34 76, 34 76, 34 84 C 34 76, 34 76, 26 76 C 34 76, 34 76, 34 68 Z" fill="#ffffff" opacity="0.9" />
    
    <!-- Graduation Cap Symbol at bottom center -->
    <path d="M 30 94 L 64 78 L 98 94 L 64 110 Z" fill="#ffffff" />
    <path d="M 42 100 V 108 C 42 113, 86 113, 86 108 V 100" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
  </g>
</svg>`;

const svgPath = path.join(iconDir, 'icon.svg');
fs.writeFileSync(svgPath, svgContent);

async function generatePngs() {
  const svgBuffer = Buffer.from(svgContent);
  const sizes = [16, 48, 128];

  for (const size of sizes) {
    const pngPath = path.join(iconDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`Generated ${pngPath}`);
  }
}

generatePngs().catch(console.error);

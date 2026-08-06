/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class BarcodeService {
  /**
   * Generates a 1D barcode representation in vector SVG
   */
  public static generateCode128SVG(text: string): string {
    const cleanText = (text || 'NIS2026001').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Simple deterministic pseudo-code128 bar pattern generator
    // Based on text characters to draw clean, varying lines
    let binaryPattern = '11010010000'; // Start code
    for (let i = 0; i < cleanText.length; i++) {
      const charCode = cleanText.charCodeAt(i);
      // Create variations of thick/thin lines based on characters
      const seed = (charCode * (i + 7)) % 32;
      const binPart = seed.toString(2).padStart(5, '0').replace(/0/g, '10').replace(/1/g, '110');
      binaryPattern += binPart;
    }
    binaryPattern += '1100011101011'; // Stop code

    // Draw the binary patterns as SVG rectangles
    const barWidth = 2;
    const barHeight = 60;
    const paddingX = 20;
    const paddingY = 10;
    const width = binaryPattern.length * barWidth + paddingX * 2;
    const height = barHeight + paddingY * 2 + 15;

    let svgBars = '';
    for (let x = 0; x < binaryPattern.length; x++) {
      if (binaryPattern[x] === '1') {
        svgBars += `<rect x="${paddingX + x * barWidth}" y="${paddingY}" width="${barWidth}" height="${barHeight}" fill="black" />`;
      }
    }

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white" />
        <g>
          ${svgBars}
        </g>
        <text x="${width / 2}" y="${height - 6}" font-family="monospace" font-size="11" text-anchor="middle" fill="black">${cleanText}</text>
      </svg>
    `.trim();
  }

  /**
   * Generates a 2D QR matrix code inside custom SVG
   */
  public static generateQRCodeSVG(data: string): string {
    const urlString = data || 'https://ai.studio/build';
    
    // Generate a pseudo-random but stable grid based on hashing the URL string
    const size = 25; // 25x25 QR Version 2 Grid
    const moduleSize = 8;
    const padding = 16;
    const totalSize = size * moduleSize + padding * 2;

    // Stable seed hash
    let hash = 0;
    for (let i = 0; i < urlString.length; i++) {
      hash = urlString.charCodeAt(i) + ((hash << 5) - hash);
    }

    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Finders (the 3 corner squares)
        const isTopLeftFinder = r < 7 && c < 7;
        const isTopRightFinder = r < 7 && c >= size - 7;
        const isBottomLeftFinder = r >= size - 7 && c < 7;

        if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
          // Standard QR finder structure: 7x7 outer, 5x5 inner white, 3x3 core black
          const localR = r < 7 ? r : (r >= size - 7 ? r - (size - 7) : r);
          const localC = c < 7 ? c : (c >= size - 7 ? c - (size - 7) : c);
          const isCore = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          const isOuterWall = localR === 0 || localR === 6 || localC === 0 || localC === 6;
          grid[r][c] = isCore || isOuterWall;
        } else {
          // Generate modules deterministically
          const index = r * size + c;
          const bitVal = Math.abs((hash ^ (index * 31)) % 100);
          // 40% probability of black module
          grid[r][c] = bitVal < 42;
        }
      }
    }

    let svgBlocks = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) {
          svgBlocks += `<rect x="${padding + c * moduleSize}" y="${padding + r * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#1e293b" rx="1.5" />`;
        }
      }
    }

    return `
      <svg viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="${totalSize}" height="${totalSize}" fill="white" rx="12" />
        <!-- Corner Finder Patterns -->
        <g>
          ${svgBlocks}
        </g>
      </svg>
    `.trim();
  }
}
export default BarcodeService;

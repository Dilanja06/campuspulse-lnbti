/**
 * Lightweight, zero-dependency ISO/IEC 18004 QR Code matrix generator (Versions 1-5, ECC Level L, Byte Mode).
 * Produces an authentic scannable boolean[][] QR module matrix for dynamic student attendance tokens.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(ecCount: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeECC(data: number[], ecCount: number): number[] {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];

  for (let i = 0; i < data.length; i++) {
    const factor = res[i];
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return res.slice(data.length);
}

interface VersionSpec {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewords: number;
  alignments: number[];
}

// Single-block ECC-L specs (supports up to 106 UTF-8 bytes)
const VERSIONS_L: VersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, alignments: [] },
  { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, alignments: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, alignments: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, alignments: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, ecCodewords: 26, alignments: [6, 30] },
];

function computeFormatBits(mask: number): number {
  const ecLevelL = 0b01; // L = 01
  const data = (ecLevelL << 3) | (mask & 7);
  let rem = data << 10;
  const gen = 0b10100110111;
  for (let bit = 14; bit >= 10; bit--) {
    if ((rem >> bit) & 1) {
      rem ^= gen << (bit - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

export function generateQRMatrix(payload: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = Array.from(encoder.encode(payload)).slice(0, 106);

  const spec =
    VERSIONS_L.find((v) => v.dataCodewords - 2 >= rawBytes.length) || VERSIONS_L[VERSIONS_L.length - 1];
  const bytes = rawBytes.slice(0, spec.dataCodewords - 2);

  // Build bitstream (Byte mode indicator 0100 + 8-bit length + payload bytes + terminator + pad bytes)
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const maxDataBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, maxDataBits - bits.length);
  pushBits(0, termLen);
  while (bits.length % 8 !== 0) bits.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    dataCodewords.push(byte);
  }

  const ecCodewords = rsComputeECC(dataCodewords, spec.ecCodewords);
  const allCodewords = [...dataCodewords, ...ecCodewords];
  const totalBits: number[] = [];
  for (const cw of allCodewords) {
    for (let b = 7; b >= 0; b--) totalBits.push((cw >> b) & 1);
  }

  const n = spec.size;
  const modules: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  const reserved: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));

  const setModule = (r: number, c: number, dark: boolean, isFunc = true) => {
    if (r >= 0 && r < n && c >= 0 && c < n) {
      modules[r][c] = dark;
      if (isFunc) reserved[r][c] = true;
    }
  };

  // Finder patterns + separators
  const drawFinder = (r0: number, c0: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r < 0 || r >= n || c < 0 || c >= n) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const inBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setModule(r, c, inOuter && (inBorder || inCenter), true);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, n - 7);
  drawFinder(n - 7, 0);

  // Alignment patterns
  if (spec.alignments.length >= 2) {
    for (const ar of spec.alignments) {
      for (const ac of spec.alignments) {
        if (
          (ar === 6 && ac === 6) ||
          (ar === 6 && ac === n - 7) ||
          (ar === n - 7 && ac === 6)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setModule(ar + dr, ac + dc, dark, true);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < n - 8; i++) {
    setModule(6, i, i % 2 === 0, true);
    setModule(i, 6, i % 2 === 0, true);
  }

  // Dark module & format info reservations
  setModule(n - 8, 8, true, true);
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][n - 1 - i] = true;
    if (i < 7) reserved[n - 1 - i][8] = true;
  }

  // Place data bits in zigzag
  let bitIdx = 0;
  let upward = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < n; step++) {
      const r = upward ? n - 1 - step : step;
      for (let dx = 0; dx < 2; dx++) {
        const c = col - dx;
        if (!reserved[r][c]) {
          const bit = bitIdx < totalBits.length ? totalBits[bitIdx++] === 1 : false;
          modules[r][c] = bit;
        }
      }
    }
    upward = !upward;
  }

  // Evaluate mask patterns 0..7 and select lowest penalty
  const maskPredicates: Array<(r: number, c: number) => boolean> = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (_, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  const writeFormat = (grid: boolean[][], maskIdx: number) => {
    const fmt = computeFormatBits(maskIdx);
    const getBit = (k: number) => ((fmt >> (14 - k)) & 1) === 1;
    // Around top-left finder
    for (let i = 0; i <= 5; i++) grid[8][i] = getBit(i);
    grid[8][7] = getBit(6);
    grid[8][8] = getBit(7);
    grid[7][8] = getBit(8);
    for (let i = 9; i <= 14; i++) grid[14 - i][8] = getBit(i);
    // Split bottom-left & top-right
    for (let i = 0; i < 7; i++) grid[n - 1 - i][8] = getBit(i);
    for (let i = 7; i < 15; i++) grid[8][n - 15 + i] = getBit(i);
  };

  let bestGrid = modules;
  let bestScore = Infinity;

  for (let m = 0; m < 8; m++) {
    const candidate = modules.map((row) => [...row]);
    const pred = maskPredicates[m];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!reserved[r][c] && pred(r, c)) {
          candidate[r][c] = !candidate[r][c];
        }
      }
    }
    writeFormat(candidate, m);

    // Simple N1 + N3 balance penalty calculation
    let score = 0;
    let darkCount = 0;
    for (let r = 0; r < n; r++) {
      let runLen = 1;
      for (let c = 1; c < n; c++) {
        if (candidate[r][c]) darkCount++;
        if (candidate[r][c] === candidate[r][c - 1]) {
          runLen++;
          if (runLen === 5) score += 3;
          else if (runLen > 5) score += 1;
        } else {
          runLen = 1;
        }
      }
    }
    for (let c = 0; c < n; c++) {
      let runLen = 1;
      for (let r = 1; r < n; r++) {
        if (candidate[r][c] === candidate[r - 1][c]) {
          runLen++;
          if (runLen === 5) score += 3;
          else if (runLen > 5) score += 1;
        } else {
          runLen = 1;
        }
      }
    }
    const percent = (darkCount * 100) / (n * n);
    score += Math.floor(Math.abs(percent - 50) / 5) * 10;

    if (score < bestScore) {
      bestScore = score;
      bestGrid = candidate;
    }
  }

  return bestGrid;
}

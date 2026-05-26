import type { SignatureTraitKey, SignatureTraitValue } from '@pridicta/types';

export type SignaturePixelBuffer = {
  data: ArrayLike<number>;
  height: number;
  width: number;
};

export type SignatureTraitDetection = {
  hasVisibleSignature: boolean;
  metrics: {
    aspectRatio: number;
    baselineSlope: number;
    boundingBox: {
      height: number;
      width: number;
      xMax: number;
      xMin: number;
      yMax: number;
      yMin: number;
    };
    componentCount: number;
    density: number;
    gapCount: number;
    inkPixels: number;
    inkRatio: number;
    intensity: number;
  };
  notAssessed: SignatureTraitKey[];
  traits: Partial<Record<SignatureTraitKey, SignatureTraitValue>>;
};

type InkPoint = {
  intensity: number;
  x: number;
  y: number;
};

const EMPTY_BOX = {
  height: 0,
  width: 0,
  xMax: 0,
  xMin: 0,
  yMax: 0,
  yMin: 0,
};

const EMPTY_DETECTION: SignatureTraitDetection = {
  hasVisibleSignature: false,
  metrics: {
    aspectRatio: 0,
    baselineSlope: 0,
    boundingBox: EMPTY_BOX,
    componentCount: 0,
    density: 0,
    gapCount: 0,
    inkPixels: 0,
    inkRatio: 0,
    intensity: 0,
  },
  notAssessed: [
    'baseline',
    'capital-emphasis',
    'flourish',
    'legibility',
    'letter-connection',
    'margin-use',
    'pressure',
    'signature-size',
    'slant',
    'spacing',
    'speed',
    'underline',
  ],
  traits: {},
};

export function detectSignatureTraitsFromPixels(
  image: SignaturePixelBuffer,
): SignatureTraitDetection {
  const points = extractInkPoints(image);
  if (!points.length) {
    return EMPTY_DETECTION;
  }

  const box = buildBoundingBox(points);
  const boundingArea = Math.max(1, box.width * box.height);
  const totalPixels = Math.max(1, image.width * image.height);
  const inkRatio = points.length / totalPixels;
  const density = points.length / boundingArea;
  const aspectRatio = box.width / Math.max(1, box.height);
  const intensity =
    points.reduce((sum, point) => sum + point.intensity, 0) / points.length;

  if (
    points.length < Math.max(28, totalPixels * 0.0015) ||
    box.width < Math.max(18, image.width * 0.06) ||
    box.height < Math.max(5, image.height * 0.025)
  ) {
    return EMPTY_DETECTION;
  }

  const baselineSlope = estimateBaselineSlope(points, box);
  const componentCount = countInkComponents(points, image.width, image.height);
  const gapCount = countColumnGaps(points, box);
  const traits: Partial<Record<SignatureTraitKey, SignatureTraitValue>> = {};
  const notAssessed = new Set(EMPTY_DETECTION.notAssessed);

  traits.baseline = classifyBaseline(baselineSlope, points, box);
  notAssessed.delete('baseline');

  traits['signature-size'] = classifySignatureSize(box.width / image.width);
  notAssessed.delete('signature-size');

  traits['margin-use'] = classifyMarginUse(box.width / image.width);
  notAssessed.delete('margin-use');

  traits.pressure = classifyPressure(intensity, density);
  notAssessed.delete('pressure');

  traits.slant = classifySlant(points, box);
  notAssessed.delete('slant');

  traits.spacing = classifySpacing(gapCount, aspectRatio);
  notAssessed.delete('spacing');

  traits['letter-connection'] = classifyLetterConnection(componentCount);
  notAssessed.delete('letter-connection');

  traits.speed = classifySpeed(componentCount, aspectRatio, density);
  notAssessed.delete('speed');

  traits.flourish = classifyFlourish(aspectRatio, box.width / image.width, density);
  notAssessed.delete('flourish');

  const underline = detectUnderline(points, box);
  if (underline) {
    traits.underline = underline;
    notAssessed.delete('underline');
  }

  const capitalEmphasis = detectCapitalEmphasis(points, box);
  if (capitalEmphasis) {
    traits['capital-emphasis'] = capitalEmphasis;
    notAssessed.delete('capital-emphasis');
  }

  traits.legibility = classifyLegibility(componentCount, density, gapCount);
  notAssessed.delete('legibility');

  return {
    hasVisibleSignature: true,
    metrics: {
      aspectRatio,
      baselineSlope,
      boundingBox: box,
      componentCount,
      density,
      gapCount,
      inkPixels: points.length,
      inkRatio,
      intensity,
    },
    notAssessed: Array.from(notAssessed),
    traits,
  };
}

function extractInkPoints(image: SignaturePixelBuffer): InkPoint[] {
  const background = estimateBackgroundColor(image);
  const points: InkPoint[] = [];

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = (y * image.width + x) * 4;
      const alpha = image.data[index + 3] ?? 0;
      if (alpha < 18) {
        continue;
      }

      const red = image.data[index] ?? 255;
      const green = image.data[index + 1] ?? 255;
      const blue = image.data[index + 2] ?? 255;
      const alphaDelta = Math.abs(alpha - background.alpha);
      const colorDelta =
        Math.abs(red - background.red) +
        Math.abs(green - background.green) +
        Math.abs(blue - background.blue);
      const brightness = (red + green + blue) / 3;
      const backgroundBrightness =
        (background.red + background.green + background.blue) / 3;

      if (
        alphaDelta > 36 ||
        colorDelta > 42 ||
        Math.abs(brightness - backgroundBrightness) > 18
      ) {
        points.push({
          intensity: Math.min(1, Math.max(alphaDelta / 255, colorDelta / 360)),
          x,
          y,
        });
      }
    }
  }

  return points;
}

function estimateBackgroundColor(image: SignaturePixelBuffer): {
  alpha: number;
  blue: number;
  green: number;
  red: number;
} {
  const samples: Array<{ alpha: number; blue: number; green: number; red: number }> = [];
  const sampleSize = Math.max(3, Math.floor(Math.min(image.width, image.height) * 0.08));
  const regions = [
    [0, 0],
    [Math.max(0, image.width - sampleSize), 0],
    [0, Math.max(0, image.height - sampleSize)],
    [Math.max(0, image.width - sampleSize), Math.max(0, image.height - sampleSize)],
  ];

  for (const [xStart, yStart] of regions) {
    for (let y = yStart; y < Math.min(image.height, yStart + sampleSize); y += 1) {
      for (let x = xStart; x < Math.min(image.width, xStart + sampleSize); x += 1) {
        const index = (y * image.width + x) * 4;
        samples.push({
          alpha: image.data[index + 3] ?? 0,
          blue: image.data[index + 2] ?? 255,
          green: image.data[index + 1] ?? 255,
          red: image.data[index] ?? 255,
        });
      }
    }
  }

  return {
    alpha: median(samples.map(sample => sample.alpha)),
    blue: median(samples.map(sample => sample.blue)),
    green: median(samples.map(sample => sample.green)),
    red: median(samples.map(sample => sample.red)),
  };
}

function buildBoundingBox(points: InkPoint[]): SignatureTraitDetection['metrics']['boundingBox'] {
  let xMin = Number.POSITIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let xMax = 0;
  let yMax = 0;

  for (const point of points) {
    xMin = Math.min(xMin, point.x);
    yMin = Math.min(yMin, point.y);
    xMax = Math.max(xMax, point.x);
    yMax = Math.max(yMax, point.y);
  }

  return {
    height: yMax - yMin + 1,
    width: xMax - xMin + 1,
    xMax,
    xMin,
    yMax,
    yMin,
  };
}

function estimateBaselineSlope(
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): number {
  const bins = 8;
  const bottoms: Array<{ x: number; y: number }> = [];

  for (let bin = 0; bin < bins; bin += 1) {
    const xStart = box.xMin + (box.width * bin) / bins;
    const xEnd = box.xMin + (box.width * (bin + 1)) / bins;
    const binPoints = points.filter(point => point.x >= xStart && point.x < xEnd);
    if (binPoints.length < 3) {
      continue;
    }

    const sortedY = binPoints.map(point => point.y).sort((a, b) => a - b);
    const bottomY = percentile(sortedY, 0.88);
    bottoms.push({ x: (xStart + xEnd) / 2, y: bottomY });
  }

  if (bottoms.length < 3) {
    return 0;
  }

  const first = bottoms.slice(0, 2).reduce((sum, point) => sum + point.y, 0) / 2;
  const last = bottoms.slice(-2).reduce((sum, point) => sum + point.y, 0) / 2;
  return (last - first) / Math.max(1, box.width);
}

function classifyBaseline(
  slope: number,
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): SignatureTraitValue {
  const verticalSpread = box.height / Math.max(1, box.width);
  if (verticalSpread > 0.55 && Math.abs(slope) < 0.03) {
    return 'mixed';
  }
  if (slope < -0.055) {
    return 'upward';
  }
  if (slope > 0.055) {
    return 'downward';
  }
  return points.length > 0 ? 'steady' : 'mixed';
}

function classifySignatureSize(widthRatio: number): SignatureTraitValue {
  if (widthRatio >= 0.62) {
    return 'large';
  }
  if (widthRatio <= 0.28) {
    return 'small';
  }
  return 'medium';
}

function classifyMarginUse(widthRatio: number): SignatureTraitValue {
  if (widthRatio >= 0.68) {
    return 'expansive';
  }
  if (widthRatio <= 0.3) {
    return 'compact';
  }
  return 'balanced';
}

function classifyPressure(
  intensity: number,
  density: number,
): SignatureTraitValue {
  const score = intensity * 0.7 + Math.min(1, density * 3) * 0.3;
  if (score >= 0.58) {
    return 'heavy';
  }
  if (score <= 0.28) {
    return 'light';
  }
  return 'medium';
}

function classifySlant(
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): SignatureTraitValue {
  if (box.height < 12) {
    return 'mixed';
  }

  const top = points.filter(point => point.y <= box.yMin + box.height * 0.42);
  const bottom = points.filter(point => point.y >= box.yMin + box.height * 0.58);
  if (top.length < 6 || bottom.length < 6) {
    return 'mixed';
  }

  const topX = average(top.map(point => point.x));
  const bottomX = average(bottom.map(point => point.x));
  const slant = (topX - bottomX) / Math.max(1, box.height);

  if (slant > 0.12) {
    return 'right';
  }
  if (slant < -0.12) {
    return 'left';
  }
  return 'steady';
}

function classifySpacing(
  gapCount: number,
  aspectRatio: number,
): SignatureTraitValue {
  if (gapCount >= 3 && aspectRatio >= 2.2) {
    return 'wide';
  }
  if (gapCount === 0 && aspectRatio < 3.2) {
    return 'tight';
  }
  return 'balanced';
}

function classifyLetterConnection(componentCount: number): SignatureTraitValue {
  if (componentCount <= 3) {
    return 'connected';
  }
  if (componentCount >= 8) {
    return 'disconnected';
  }
  return 'mixed';
}

function classifySpeed(
  componentCount: number,
  aspectRatio: number,
  density: number,
): SignatureTraitValue {
  if (componentCount <= 3 && aspectRatio >= 3.2 && density < 0.22) {
    return 'fast';
  }
  if (componentCount >= 8 || density > 0.34) {
    return 'slow';
  }
  return 'moderate';
}

function classifyFlourish(
  aspectRatio: number,
  widthRatio: number,
  density: number,
): SignatureTraitValue {
  if (aspectRatio >= 5.2 || (widthRatio >= 0.72 && density < 0.2)) {
    return 'expansive';
  }
  if (aspectRatio >= 3 || widthRatio >= 0.48) {
    return 'moderate';
  }
  return 'none';
}

function classifyLegibility(
  componentCount: number,
  density: number,
  gapCount: number,
): SignatureTraitValue {
  if (density > 0.42 || componentCount <= 1) {
    return 'abstract';
  }
  if (gapCount >= 1 && componentCount <= 7) {
    return 'partial';
  }
  return 'partial';
}

function detectUnderline(
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): SignatureTraitValue | undefined {
  const bottomStart = box.yMin + box.height * 0.72;
  const bottomPoints = points.filter(point => point.y >= bottomStart);
  if (bottomPoints.length < Math.max(12, points.length * 0.12)) {
    return undefined;
  }

  const bottomBox = buildBoundingBox(bottomPoints);
  if (bottomBox.width / Math.max(1, box.width) >= 0.48 && bottomBox.height <= box.height * 0.22) {
    return 'single';
  }

  return undefined;
}

function detectCapitalEmphasis(
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): SignatureTraitValue | undefined {
  const firstRegion = points.filter(point => point.x <= box.xMin + box.width * 0.28);
  const laterRegion = points.filter(point => point.x > box.xMin + box.width * 0.28);
  if (firstRegion.length < 8 || laterRegion.length < 8) {
    return undefined;
  }

  const firstBox = buildBoundingBox(firstRegion);
  const laterBox = buildBoundingBox(laterRegion);
  const ratio = firstBox.height / Math.max(1, laterBox.height);

  if (ratio >= 1.35) {
    return 'high';
  }
  if (ratio <= 0.72) {
    return 'low';
  }
  return 'balanced';
}

function countColumnGaps(
  points: InkPoint[],
  box: SignatureTraitDetection['metrics']['boundingBox'],
): number {
  const columns = new Array(box.width).fill(0) as number[];
  for (const point of points) {
    columns[point.x - box.xMin] += 1;
  }

  const gapThreshold = Math.max(2, Math.floor(box.width * 0.035));
  let gapRun = 0;
  let gaps = 0;
  let insideInk = false;

  for (const count of columns) {
    if (count > 0) {
      if (insideInk && gapRun >= gapThreshold) {
        gaps += 1;
      }
      insideInk = true;
      gapRun = 0;
      continue;
    }

    if (insideInk) {
      gapRun += 1;
    }
  }

  return gaps;
}

function countInkComponents(
  points: InkPoint[],
  width: number,
  height: number,
): number {
  const mask = new Uint8Array(width * height);
  for (const point of points) {
    mask[point.y * width + point.x] = 1;
  }

  const visited = new Uint8Array(width * height);
  let components = 0;
  const queue: number[] = [];

  for (const point of points) {
    const start = point.y * width + point.x;
    if (visited[start]) {
      continue;
    }

    components += 1;
    visited[start] = 1;
    queue.push(start);

    while (queue.length) {
      const current = queue.pop() ?? 0;
      const currentX = current % width;
      const currentY = Math.floor(current / width);

      for (let y = Math.max(0, currentY - 1); y <= Math.min(height - 1, currentY + 1); y += 1) {
        for (let x = Math.max(0, currentX - 1); x <= Math.min(width - 1, currentX + 1); x += 1) {
          const next = y * width + x;
          if (mask[next] && !visited[next]) {
            visited[next] = 1;
            queue.push(next);
          }
        }
      }
    }
  }

  return components;
}

function median(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  return percentile(sorted, 0.5);
}

function percentile(sortedValues: number[], rank: number): number {
  if (!sortedValues.length) {
    return 0;
  }

  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.floor((sortedValues.length - 1) * rank)),
  );
  return sortedValues[index] ?? 0;
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

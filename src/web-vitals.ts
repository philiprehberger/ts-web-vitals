export type WebVitalName = 'LCP' | 'CLS' | 'FID' | 'INP' | 'FCP' | 'TTFB';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export const WEB_VITALS_THRESHOLDS: Record<
  WebVitalName,
  { good: number; needsImprovement: number; unit: string; label: string }
> = {
  LCP: { good: 2500, needsImprovement: 4000, unit: 'ms', label: 'Largest Contentful Paint' },
  CLS: { good: 0.1, needsImprovement: 0.25, unit: '', label: 'Cumulative Layout Shift' },
  FID: { good: 100, needsImprovement: 300, unit: 'ms', label: 'First Input Delay' },
  INP: { good: 200, needsImprovement: 500, unit: 'ms', label: 'Interaction to Next Paint' },
  FCP: { good: 1800, needsImprovement: 3000, unit: 'ms', label: 'First Contentful Paint' },
  TTFB: { good: 800, needsImprovement: 1800, unit: 'ms', label: 'Time to First Byte' },
};

export function getWebVitalRating(metric: WebVitalName, value: number): WebVitalRating {
  const thresholds = WEB_VITALS_THRESHOLDS[metric];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

export interface WebVitalStats {
  metric: WebVitalName;
  label: string;
  unit: string;
  p50: number;
  p75: number;
  p95: number;
  good: number;
  needsImprovement: number;
  poor: number;
  total: number;
  rating: WebVitalRating;
}

export function calculateWebVitalStats(metric: WebVitalName, values: number[]): WebVitalStats {
  const thresholds = WEB_VITALS_THRESHOLDS[metric];

  if (values.length === 0) {
    return { metric, label: thresholds.label, unit: thresholds.unit, p50: 0, p75: 0, p95: 0, good: 0, needsImprovement: 0, poor: 0, total: 0, rating: 'good' };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const p50 = calculatePercentile(sorted, 50);
  const p75 = calculatePercentile(sorted, 75);
  const p95 = calculatePercentile(sorted, 95);

  let good = 0, needsImprovement = 0, poor = 0;
  for (const value of values) {
    const rating = getWebVitalRating(metric, value);
    if (rating === 'good') good++;
    else if (rating === 'needs-improvement') needsImprovement++;
    else poor++;
  }

  return { metric, label: thresholds.label, unit: thresholds.unit, p50, p75, p95, good, needsImprovement, poor, total: values.length, rating: getWebVitalRating(metric, p75) };
}

export function formatWebVitalValue(metric: WebVitalName, value: number): string {
  const thresholds = WEB_VITALS_THRESHOLDS[metric];
  if (metric === 'CLS') return value.toFixed(2);
  const rounded = Math.round(value);
  if (rounded >= 1000) return `${(rounded / 1000).toFixed(1)}${thresholds.unit === 'ms' ? 's' : thresholds.unit}`;
  return `${rounded}${thresholds.unit}`;
}

export function getRatingLabel(rating: WebVitalRating): string {
  switch (rating) {
    case 'good': return 'Good';
    case 'needs-improvement': return 'Needs Improvement';
    case 'poor': return 'Poor';
  }
}

export interface PageWebVitals {
  url: string;
  metrics: Partial<Record<WebVitalName, WebVitalStats>>;
  worstMetric?: { name: WebVitalName; rating: WebVitalRating; value: number };
}

export function getWorstMetric(metrics: Partial<Record<WebVitalName, WebVitalStats>>): PageWebVitals['worstMetric'] | undefined {
  const priority: WebVitalName[] = ['LCP', 'CLS', 'INP', 'FID', 'FCP', 'TTFB'];
  for (const name of priority) {
    const stats = metrics[name];
    if (stats && stats.rating === 'poor') return { name, rating: 'poor', value: stats.p75 };
  }
  for (const name of priority) {
    const stats = metrics[name];
    if (stats && stats.rating === 'needs-improvement') return { name, rating: 'needs-improvement', value: stats.p75 };
  }
  return undefined;
}

export function normalizePagePath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname
      .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/[uuid]')
      .replace(/\/[a-z0-9]{20,}/gi, '/[id]')
      .replace(/\/\d+/g, '/[id]');
  } catch { return url; }
}

# @philiprehberger/ts-web-vitals

Web Vitals calculation utilities and client error capture.

## Installation

```bash
npm install @philiprehberger/ts-web-vitals
```

## Usage

```ts
import { getWebVitalRating, calculateWebVitalStats, formatWebVitalValue } from '@philiprehberger/ts-web-vitals';

const rating = getWebVitalRating('LCP', 2100); // 'good'
const stats = calculateWebVitalStats('LCP', [1200, 2500, 3800, 1800]);
console.log(formatWebVitalValue('LCP', stats.p75)); // '2.5s'
```

### Client Error Capture

```ts
import { initClientErrorCapture } from '@philiprehberger/ts-web-vitals';

initClientErrorCapture({
  endpoint: '/api/monitoring/errors',
});
```

## Features

- Web Vitals thresholds based on Google's recommendations (LCP, CLS, FID, INP, FCP, TTFB)
- Rating calculation (good / needs-improvement / poor)
- Percentile calculation (p50, p75, p95)
- Value formatting for display
- Page path normalization (replaces dynamic IDs)
- Client-side error capture (unhandled errors + promise rejections)

## License

MIT

interface ClientErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

export interface ClientErrorCaptureOptions {
  /** API endpoint to report errors to */
  endpoint: string;
  /** Additional headers for the report request */
  headers?: Record<string, string>;
  /** Transform error before reporting */
  beforeReport?: (error: ClientErrorReport) => ClientErrorReport | null;
}

async function reportError(error: ClientErrorReport, options: ClientErrorCaptureOptions): Promise<void> {
  try {
    const transformed = options.beforeReport ? options.beforeReport(error) : error;
    if (!transformed) return;
    await fetch(options.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(transformed),
    });
  } catch (e) {
    console.error('Failed to report error:', e);
  }
}

export function initClientErrorCapture(options: ClientErrorCaptureOptions): void {
  if (typeof window === 'undefined') return;

  window.onerror = (message, source, lineno, colno, error) => {
    reportError({
      message: String(message),
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata: { source, lineno, colno },
    }, options);
    return false;
  };

  window.onunhandledrejection = (event) => {
    const error = event.reason;
    reportError({
      message: error?.message || 'Unhandled Promise Rejection',
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata: { type: 'unhandledrejection' },
    }, options);
  };
}

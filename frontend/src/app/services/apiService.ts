// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiEndpoint {
  endpoint: string;
  method: string;
  description: string;
  headers: Record<string, string>;
  payload: unknown | null;
  response: {
    type: string;
    description: string;
  };
}

export interface ApiConfig {
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  responseFormat: {
    statusKey: string;
    messageKey: string;
    dataKey: string;
  };
  apis: Record<string, ApiEndpoint>;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data: T;
}

export interface CallApiOverrides {
  headers?: Record<string, string>;
  payload?: unknown;
  queryParams?: Record<string, string>;
  pathParams?: Record<string, string>;
}

// ─── Global State ────────────────────────────────────────────────────────────

let _apiConfig: ApiConfig | null = null;
let _initPromise: Promise<void> | null = null;

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Loads the API config JSON from /assets/config/api-config.json.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export async function initApiConfig(): Promise<void> {
  if (_apiConfig) return;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const res = await fetch('/assets/config/api-config.json');
    if (!res.ok) {
      throw new Error(`Failed to load API config: ${res.status} ${res.statusText}`);
    }
    _apiConfig = await res.json();
  })();

  return _initPromise;
}

/**
 * Returns the loaded API config. Throws if not yet initialized.
 */
export function getApiConfig(): ApiConfig {
  if (!_apiConfig) {
    throw new Error('API config not initialized. Call initApiConfig() first.');
  }
  return _apiConfig;
}

/**
 * Returns a specific API endpoint definition by its identifier.
 */
export function getApiEndpoint(apiId: string): ApiEndpoint {
  const config = getApiConfig();
  const api = config.apis[apiId];
  if (!api) {
    throw new Error(`API endpoint not found: "${apiId}". Check api-config.json.`);
  }
  return api;
}

// ─── API Caller ──────────────────────────────────────────────────────────────

/**
 * Calls an API by its identifier from the config.
 *
 * @param apiId   - The key in apis, e.g. "getCreators_Home"
 * @param overrides - Optional headers, payload, or query params
 * @returns Standardized ApiResponse<T>
 *
 * @example
 *   const { data } = await callApi<Creator[]>('getCreators_Marketplace');
 *   const { data } = await callApi<Statement>('getStatementData_Statement');
 */
export async function callApi<T = unknown>(
  apiId: string,
  overrides?: CallApiOverrides,
): Promise<ApiResponse<T>> {
  const config = getApiConfig();
  const api = getApiEndpoint(apiId);

  // Build URL — substitute any {param} placeholders first
  let endpoint = api.endpoint;
  if (overrides?.pathParams) {
    for (const [key, value] of Object.entries(overrides.pathParams)) {
      endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(value));
    }
  }

  let url = `${config.baseUrl}${endpoint}`;
  if (overrides?.queryParams) {
    const params = new URLSearchParams(overrides.queryParams);
    url += `?${params.toString()}`;
  }

  // Merge headers: defaults < endpoint-level < call-level
  const headers: Record<string, string> = {
    ...config.defaultHeaders,
    ...api.headers,
    ...overrides?.headers,
  };

  // Build fetch options
  const options: RequestInit = { method: api.method, headers };

  if (api.method !== 'GET' && (api.payload || overrides?.payload)) {
    options.body = JSON.stringify(overrides?.payload ?? api.payload);
  }

  // Execute
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API call "${apiId}" failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // Map to standardized response using config keys
  const { statusKey, messageKey, dataKey } = config.responseFormat;

  return {
    status: json[statusKey],
    message: json[messageKey],
    data: json[dataKey] as T,
  };
}

// ─── React Hook Helper ──────────────────────────────────────────────────────

/**
 * Convenience: returns all API identifiers from the config.
 */
export function getApiIds(): string[] {
  return Object.keys(getApiConfig().apis);
}

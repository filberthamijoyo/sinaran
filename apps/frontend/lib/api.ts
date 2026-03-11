const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";
  const port = process.env.NEXT_PUBLIC_API_PORT;
  // Production URLs (https://...) should not have port appended; localhost needs :3001
  const isProductionUrl =
    baseUrl.startsWith("https://") ||
    (baseUrl.startsWith("http://") && !baseUrl.includes("localhost"));
  const effectivePort = port || (isProductionUrl ? "" : "3001");
  const base = baseUrl.replace(/\/$/, "");
  return effectivePort ? `${base}:${effectivePort}/api` : `${base}/api`;
};

const apiBase = getApiUrl();

export const API_ENDPOINTS = {
  quality: `${apiBase}/quality`,
  production: `${apiBase}/production`,
  unified: `${apiBase}/unified`,
  indigo: `${apiBase}/denim/indigo`,
  weaving: `${apiBase}/denim/weaving`,
  warping: `${apiBase}/denim/warping`,
  sacon: `${apiBase}/sacon`,
  denim: `${apiBase}/denim`,
  // Inspect Gray division (greige inspection) – defaults to /inspect-gray,
  // but the InspectGrayDivisionPage will also fall back to /quality/inspect-gray if needed.
  inspectGray: `${apiBase}/inspect-gray`,
} as const;

type ApiCallOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object;
};

const safeParseJson = (text: string): unknown => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
};

const formatBodySnippet = (text: string, maxLen = 280) => {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen)}…`;
};

/**
 * Fetch and parse JSON with better errors when the response is not JSON (HTML/empty/etc).
 * This avoids cryptic `SyntaxError` from `Response.json()` and tells you which URL failed.
 */
export const fetchJson = async (url: string, options: RequestInit = {}): Promise<unknown> => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    // Try to read `{ error: string }` style errors, otherwise include a snippet.
    try {
      const parsed = safeParseJson(text) as any;
      const msg = parsed?.error || parsed?.message;
      throw new Error(msg || `HTTP ${response.status}: ${response.statusText}`);
    } catch (e) {
      const snippet = formatBodySnippet(text);
      const hint = snippet ? ` Body: ${snippet}` : "";
      throw new Error(`HTTP ${response.status}: ${response.statusText} (${url}).${hint}`);
    }
  }

  // Success: if server returns empty body (e.g., 204) treat as null.
  if (!text.trim()) return null;

  try {
    return safeParseJson(text);
  } catch (e: any) {
    const snippet = formatBodySnippet(text);
    const ctHint = contentType ? ` content-type=${contentType};` : "";
    throw new Error(`Expected JSON but could not parse (${url});${ctHint} body: ${snippet || "(empty)"}`);
  }
};

// Helper function for making API calls
export const apiCall = async (
  url: string,
  options: ApiCallOptions = {},
): Promise<unknown> => {
  const { body, headers = {}, ...fetchOptions } = options;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...fetchOptions,
  };

  // Stringify body if it's a plain object
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    defaultOptions.body = JSON.stringify(body);
  } else if (body) {
    // Allow callers to pass a pre-built BodyInit (string, FormData, etc.)
    defaultOptions.body = body as BodyInit;
  }

  try {
    return await fetchJson(url, defaultOptions);
  } catch (error) {
    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${url}. Is the API server running?`,
      );
    }
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    // Fallback for unexpected error types
    throw new Error(error?.toString() || "Unknown error occurred");
  }
};

export default API_ENDPOINTS;


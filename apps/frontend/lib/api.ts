import { apiBase } from './authFetch';

export const API_ENDPOINTS = {
  quality: `${apiBase}/quality`,
  production: `${apiBase}/production`,
  unified: `${apiBase}/unified`,
  indigo: `${apiBase}/denim/indigo`,
  weaving: `${apiBase}/denim/weaving`,
  warping: `${apiBase}/denim/warping`,
  sacon: `${apiBase}/sacon`,
  denim: `${apiBase}/denim`,
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

export const fetchJson = async (url: string, options: RequestInit = {}): Promise<unknown> => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    try {
      const parsed = safeParseJson(text) as { error?: string; message?: string };
      const msg = parsed?.error || parsed?.message;
      throw new Error(msg || `HTTP ${response.status}: ${response.statusText}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      const snippet = formatBodySnippet(text);
      const hint = snippet ? ` Body: ${snippet}` : "";
      throw new Error(`HTTP ${response.status}: ${response.statusText} (${url}).${hint}`);
    }
  }

  if (!text.trim()) return null;

  try {
    return safeParseJson(text);
  } catch (e) {
    const snippet = formatBodySnippet(text);
    const ctHint = contentType ? ` content-type=${contentType};` : "";
    throw new Error(`Expected JSON but could not parse (${url});${ctHint} body: ${snippet || "(empty)"}`);
  }
};

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

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    defaultOptions.body = JSON.stringify(body);
  } else if (body) {
    defaultOptions.body = body as BodyInit;
  }

  try {
    return await fetchJson(url, defaultOptions);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${url}. Is the API server running?`,
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error) || "Unknown error occurred");
  }
};

export default API_ENDPOINTS;

const LOCALE = "id-ID";

// Normalize a user-entered number string so both comma and dot decimals work.
// Example:
//  "1,23"     -> 1.23
//  "1.234,56" -> 1234.56
//  "1234.56"  -> 1234.56
export const parseLocalizedNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;

  const trimmed = value.toString().trim();
  if (!trimmed) return null;

  // If string already looks like a plain JS number, parse directly
  if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
    const direct = Number(trimmed);
    return Number.isNaN(direct) ? null : direct;
  }

  // Treat "." as thousands and "," as decimal for typical ID formatting
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
};

export const formatDecimal = (
  value: unknown,
  decimals: number = 2,
): string => {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "number" ? value : parseLocalizedNumber(value);
  if (num === null) return "-";
  return num.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatInteger = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "number" ? value : parseLocalizedNumber(value);
  if (num === null) return "-";
  return num.toLocaleString(LOCALE, {
    maximumFractionDigits: 0,
  });
};

// For use inside inputs (no "-" fallback, just empty string)
export const formatDecimalInput = (
  value: unknown,
  decimals: number = 2,
): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : parseLocalizedNumber(value);
  if (num === null) return "";
  return num.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatIntegerInput = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : parseLocalizedNumber(value);
  if (num === null) return "";
  return num.toLocaleString(LOCALE, {
    maximumFractionDigits: 0,
  });
};


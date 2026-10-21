// The backend reports what happened; the frontend decides how to show it.
// That's why errors carry a code and no user-facing message.
export type ErrorCode = "CITY_NOT_FOUND" | "UPSTREAM_FAILED";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode } };

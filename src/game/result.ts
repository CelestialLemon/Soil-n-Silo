// Results: how an operation that can fail in an expected way (a player's action against the rules, a broken save) says so. It
// returns a Result, and the caller checks `ok` before using the value. Throw only for a programmer's bug or a broken invariant,
// never for something a player or a saved file can cause.

/** A value, or why there isn't one. */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/** Parsed JSON, or why the text isn't JSON. */
export function tryParseJson(text: string): Result<unknown> {
  try {
    return ok(JSON.parse(text));
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

/** The value, which an invariant says is there: a missing one is a programmer's bug, so it throws. */
export function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Missing ${what}`);
  return value;
}

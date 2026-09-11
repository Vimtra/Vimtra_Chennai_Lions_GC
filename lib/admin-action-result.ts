/**
 * The one result shape every admin form action returns.
 *
 * Actions never `redirect()` on failure — that throws NEXT_REDIRECT, which a
 * client form cannot tell apart from a crash, and it discards everything the
 * admin typed. Returning a value lets the form keep its input, show the
 * server's own message inline, and decide where to go on success.
 *
 * Pure types only (no server-only import) so client components can use it.
 */
export type ActionResult<T extends object = object> =
  | ({ ok: true; message?: string } & T)
  | { ok: false; error: string; field?: string };

export function fail(error: string, field?: string): { ok: false; error: string; field?: string } {
  return { ok: false, error, field };
}

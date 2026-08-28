/**
 * Node ESM resolver hook — used ONLY by the Phase 5.3 test harness
 * runner (`npm run test:checkout`).
 *
 * `lib/orders.ts` starts with `import "server-only";` which is a guard
 * against being included in client bundles. Next.js's own bundler
 * resolves `server-only` via its react-server exports condition; when
 * the harness runs outside Next.js under raw Node/tsx, resolution
 * fails because `server-only` isn't a direct dependency in
 * node_modules. We ONLY route `import "server-only"` to an inert stub
 * during harness execution. The production client-bundle boundary
 * that `server-only` normally enforces stays exactly as it was —
 * Next.js keeps enforcing it for every real build.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      // A data-URL module that exports an empty default. Node loads it
      // in-memory, no disk write, no external package.
      url: "data:text/javascript;base64,ZXhwb3J0IGRlZmF1bHQge307",
      format: "module",
    };
  }
  return nextResolve(specifier, context);
}

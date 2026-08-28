/**
 * Boot module — registers the harness-only `server-only` interceptor
 * before any user module is loaded. Referenced by the npm script
 * `test:checkout` via `tsx --import`.
 *
 * Two hooks are installed because tsx transforms TypeScript through
 * BOTH the ESM loader chain AND CommonJS's `Module._resolveFilename`:
 *
 *   1. Node ESM `resolve` hook (harness-server-only-loader.mjs) —
 *      handles `import "server-only"` when the containing module is
 *      loaded as ESM.
 *
 *   2. CJS `Module._resolveFilename` shim below — handles the same
 *      import when tsx routes the transformed file through Node's
 *      CommonJS resolver (which it does for many .ts files).
 *
 * Both hooks route `server-only` to an inert stub. Every other
 * specifier is passed through untouched. Production Next.js runtime
 * is not affected — Next never loads this preload.
 */
import { register } from "node:module";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

// (1) ESM resolver hook.
register("./harness-server-only-loader.mjs", import.meta.url);

// (2) CJS resolver shim. Return the absolute path of the CJS stub.
const here = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.join(here, "harness-server-only-stub.cjs");

const origResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "server-only") return stubPath;
  return origResolveFilename.call(this, request, ...rest);
};

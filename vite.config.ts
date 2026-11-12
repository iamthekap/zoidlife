import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
let commit = "unknown";
try { commit = execFileSync("git",["rev-parse","--short=8","HEAD"],{encoding:"utf8"}).trim(); }
catch { /* Preview without Git still builds, but does not claim verified provenance. */ }
export default defineConfig({
  server: { host: "0.0.0.0" },
  define: {"__ZOID_BUILD_COMMIT__":JSON.stringify(commit)}
});

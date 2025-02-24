import { resolveSync, ResolveOpts } from "./resolve";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const loaded: Record<string, unknown> = {};

const options: ResolveOpts = {
  caller: "Module loader",
  basedirs: [process.cwd()],
  extensions: [".js", ".mjs", ".cjs", ".json"],
  preserveSymlinks: false,
  packageFilter: pkg => pkg,
};

export default function (moduleId: string): unknown {
  if (loaded[moduleId]) return loaded[moduleId];
  if (loaded[moduleId] === null) return;

  try {
    loaded[moduleId] = require(resolveSync([moduleId, `./${moduleId}`], options));
  } catch {
    loaded[moduleId] = null;
    return;
  }

  return loaded[moduleId];
}

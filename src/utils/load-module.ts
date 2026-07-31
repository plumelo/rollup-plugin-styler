import { resolveSync, ResolveOpts, packageFilterBuilder } from "./resolve";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const loaded: Record<string, unknown> = {};

const options: ResolveOpts = {
  caller: "Module loader",
  basedirs: [process.cwd()],
  extensions: [".js", ".mjs", ".cjs", ".json"],
  preserveSymlinks: false,
  packageFilter: packageFilterBuilder(),
};

export default async function (moduleId: string): Promise<unknown> {
  if (loaded[moduleId]) return loaded[moduleId];
  if (loaded[moduleId] === null) return;

  try {
    const resolved = resolveSync([moduleId, `./${moduleId}`], options);
    try {
      loaded[moduleId] = require(resolved);
    } catch {
      // ESM module that cannot be require()d (e.g. .mjs in jest VM context)

      const mod = (await import(resolved)) as { default: unknown };
      loaded[moduleId] = mod.default;
    }
  } catch {
    loaded[moduleId] = null;
    return;
  }

  return loaded[moduleId];
}

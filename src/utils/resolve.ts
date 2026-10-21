import resolver, { AsyncOpts, SyncOpts, PackageJSON } from "resolve";
import { resolve as resolveExports, legacy as resolveFields } from "resolve.exports";
import arrayFmt from "./array-fmt";
import path from "path";
import { fileURLToPath } from "url";

const baseDir = path.dirname(fileURLToPath(import.meta.url));

interface Package extends PackageJSON {}
type PackageFilterFn = (pkg: Package, pkgfile: string) => Package;

export interface ResolveOpts {
  /** name of the caller for error message (default to `Resolver`) */
  caller?: string;
  /** directories to begin resolving from (defaults to `[__dirname]`) */
  basedirs?: string[];
  /** array of file extensions to search in order (defaults to `[".mjs", ".js", ".cjs", ".json"]`) */
  extensions?: string | ReadonlyArray<string>;
  /** don't resolve `basedirs` to real path before resolving. (defaults to `true`) */
  preserveSymlinks?: boolean;
  /** transform the parsed `package.json` contents before looking at the "main" field */
  packageFilter?: PackageFilterFn;
}

interface ResolveDefaultOpts {
  caller: string;
  basedirs: ReadonlyArray<string>;
  extensions: ReadonlyArray<string>;
  preserveSymlinks: boolean;
  packageFilter: PackageFilterFn;
}

interface PackageFilterBuilderOpts {
  fields?: string[];
  conditions?: string[];
}

type PackageFilterBuilderFn = (opts?: PackageFilterBuilderOpts) => PackageFilterFn;

export const packageFilterBuilder: PackageFilterBuilderFn = (opts = {}) => {
  const conditions = opts.conditions ?? ["style", "import", "require"];
  const fields = opts.fields ?? ["style", "module", "main"];
  return pkg => {
    // Check `exports` fields
    try {
      const resolvedExport = resolveExports(pkg, ".", { conditions, unsafe: true });
      if (typeof resolvedExport === "string") {
        pkg.main = resolvedExport;
        return pkg;
      }
      if (Array.isArray(resolvedExport) && resolvedExport.length > 0) {
        pkg.main = resolvedExport[0];
        return pkg;
      }
    } catch {
      /* noop */
    }

    // Check independent fields
    try {
      const resolvedField = resolveFields(pkg, { fields, browser: false });
      if (typeof resolvedField === "string") {
        pkg.main = resolvedField;
        return pkg;
      }
    } catch {
      /* noop */
    }

    return pkg;
  };
};

const defaultOpts: ResolveDefaultOpts = {
  caller: "Resolver",
  basedirs: [baseDir],
  extensions: [".mjs", ".js", ".cjs", ".json"],
  preserveSymlinks: true,
  packageFilter: packageFilterBuilder(),
};

const resolverAsync = async (id: string, options: AsyncOpts = {}): Promise<string | undefined> =>
  new Promise(resolve => resolver(id, options, (_, res) => resolve(res)));

export async function resolveAsync(ids: string[], userOpts: ResolveOpts): Promise<string> {
  const options = { ...defaultOpts, ...userOpts };
  for await (const basedir of options.basedirs) {
    const opts = { ...options, basedir, basedirs: undefined, caller: undefined };
    for await (const id of ids) {
      const resolved = await resolverAsync(id, opts);
      if (resolved) return resolved;
    }
  }

  throw new Error(`${options.caller} could not resolve ${arrayFmt(ids)}`);
}

const resolverSync = (id: string, options: SyncOpts = {}): string | undefined => {
  try {
    return resolver.sync(id, options);
  } catch {
    return;
  }
};

export function resolveSync(ids: string[], userOpts: ResolveOpts): string {
  const options = { ...defaultOpts, ...userOpts };
  for (const basedir of options.basedirs) {
    const opts = { ...options, basedir, basedirs: undefined, caller: undefined };
    for (const id of ids) {
      const resolved = resolverSync(id, opts);
      if (resolved) return resolved;
    }
  }

  throw new Error(`${options.caller} could not resolve ${arrayFmt(ids)}`);
}

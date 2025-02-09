import arrayFmt from "../../utils/array-fmt";
import type { SassModule } from "./types";

const ids = ["sass", "node-sass"];
const idsFmt = arrayFmt(ids);
export default async function (impl?: string): Promise<readonly [SassModule, string]> {
  // Loading provided implementation
  if (impl) {
    return import(impl)
      .then((provided: SassModule) => {
        if (provided) return [provided, impl] as const;
        throw undefined;
      })
      .catch(() => {
        throw new Error(`Could not load \`${impl}\` Sass implementation`);
      });
  }

  // Loading one of the supported modules
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const sass: SassModule = (await import(id)) as SassModule;
      if (sass) return [sass, id] as const;
      // eslint-disable-next-line no-empty
    } catch {}
  }

  throw new Error(`You need to install ${idsFmt} package in order to process Sass files`);
}

import path from "path";
import { normalizePath } from "../../utils/path";
import { Loader } from "../types";
import importer from "./importer";

/** Options for Less loader */
export interface LESSLoaderOptions extends Record<string, unknown>, Less.Options {}

const loader: Loader<LESSLoaderOptions> = {
  name: "less",
  test: /\.less$/i,
  async process({ code, map }) {
    const options = { ...this.options };
    const less = await import("less").then(m => m.default);
    if (!less) throw new Error("You need to install `less` package in order to process Less files");

    const plugins = [importer];
    if (options.plugins) plugins.push(...options.plugins);

    const res = await less.render(code, {
      ...options,
      plugins,
      filename: this.id,
      sourceMap: {
        outputSourceFiles: true,
        sourceMapBasepath: path.dirname(this.id),
        disableSourcemapAnnotation: true,
      } as Less.SourceMapOption,
    });

    const deps = res.imports;
    for (const dep of deps) this.deps.add(normalizePath(dep));

    return { code: res.css, map: res.map ?? map };
  },
};

export default loader;

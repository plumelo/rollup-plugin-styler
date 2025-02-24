import path from "path";
import { packageFilterBuilder, resolveAsync, resolveSync } from "../../utils/resolve";
import { getUrlOfPartial, isModule, normalizeUrl } from "../../utils/url";
import { Data, AsyncImporter, SyncImporter } from "./types";

const extensions = [".scss", ".sass", ".css"];
const conditions = ["sass", "style"];

export const importer: AsyncImporter = (url, importer, done): void => {
  const finalize = (id: string): void => done({ file: id.replace(/\.css$/i, "") });
  const next = (): void => done(null);

  if (!isModule(url)) return next();
  const moduleUrl = normalizeUrl(url);
  const partialUrl = getUrlOfPartial(moduleUrl);
  const options = {
    caller: "Sass importer",
    basedirs: [path.dirname(importer)],
    extensions,
    packageFilter: packageFilterBuilder({ conditions }),
  };
  // Give precedence to importing a partial
  resolveAsync([partialUrl, moduleUrl], options).then(finalize).catch(next);
};

const finalize = (id: string): Data => ({ file: id.replace(/\.css$/i, "") });
export const importerSync: SyncImporter = (url, importer): Data => {
  if (!isModule(url)) return null;
  const moduleUrl = normalizeUrl(url);
  const partialUrl = getUrlOfPartial(moduleUrl);
  const options = {
    caller: "Sass importer",
    basedirs: [path.dirname(importer)],
    extensions,
    packageFilter: packageFilterBuilder({ conditions }),
  };
  // Give precedence to importing a partial
  try {
    return finalize(resolveSync([partialUrl, moduleUrl], options));
  } catch {
    return null;
  }
};

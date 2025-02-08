import type { LegacyAsyncImporter, LegacySyncImporter } from "sass/types/legacy/importer";
import type { LegacyOptions } from "sass/types/legacy/options";
import type { LegacyResult } from "sass/types/legacy/render";

export type SassModule = typeof import("sass");
export type SyncImporter = LegacySyncImporter;
export type AsyncImporter = LegacyAsyncImporter;
export type Importer = SyncImporter | AsyncImporter;

export type Type = "sync" | "async";

export interface PublicOptions<T extends Type = Type>
  extends Pick<
    LegacyOptions<T>,
    | "data"
    | "includePaths"
    | "indentType"
    | "indentWidth"
    | "importer"
    | "linefeed"
    | "outputStyle"
    | "quietDeps"
    | "silenceDeprecations"
  > {}

export type Data = { file: string } | { contents: string } | Error | null;

export type Options<T extends Type = Type> = LegacyOptions<T>;

export type Result = LegacyResult;

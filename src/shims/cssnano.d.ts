// Type surface mirrors cssnano 8's exports-only declarations
// (node_modules/cssnano/types/index.d.ts), which TypeScript cannot reach
// under tsconfig's moduleResolution: "node" setting.
declare module "cssnano" {
  import { PluginCreator } from "postcss";

  export type PluginOptions = boolean | void | { exclude?: boolean } | undefined;
  export type PresetPlugin = [PluginCreator<unknown>, PluginOptions];
  export type PresetFactory = (options?: Options) => { plugins: PresetPlugin[] };
  export type PresetSpec =
    string | PresetFactory | [string | PresetFactory, object] | { plugins: PresetPlugin[] };
  export type PluginSpec =
    string | PluginCreator<unknown> | [string | PluginCreator<unknown>, object?];
  export type Options = {
    preset?: PresetSpec;
    plugins?: PluginSpec[];
    configFile?: string;
  };

  declare function cssnanoPlugin(options?: {}): import("postcss").Processor;
  export default cssnanoPlugin;
}

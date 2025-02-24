import type PQueue from "p-queue";
import { Loader, LoaderContext, Payload } from "./types";
import postcssLoader from "./postcss";
import sourcemapLoader from "./sourcemap";
import sassLoader from "./sass";
import stylusLoader from "./stylus";
import lessLoader from "./less";

function matchFile(file: string, condition: Loader["test"]): boolean {
  if (!condition) return false;
  if (typeof condition === "function") return condition(file);
  return condition.test(file);
}

// This queue makes sure one thread is always available,
// which is necessary for some cases
// ex.: https://github.com/sass/node-sass/issues/857
const threadPoolSize = process.env.UV_THREADPOOL_SIZE
  ? Number.parseInt(process.env.UV_THREADPOOL_SIZE)
  : 4; // default `libuv` threadpool size

/** Options for {@link Loaders} class */
interface LoadersOptions {
  /** @see {@link Options.use} */
  use: [string, Record<string, unknown>][];
  /** @see {@link Options.loaders} */
  loaders?: Loader[];
  /** @see {@link Options.extensions} */
  extensions: string[];
}

export default class Loaders {
  private readonly use: Map<string, Record<string, unknown>>;
  private readonly test: (file: string) => boolean;
  private readonly loaders = new Map<string, Loader>();
  private workQueue?: PQueue;

  constructor(options: LoadersOptions) {
    this.use = new Map(options.use.reverse());
    this.test = (file): boolean => options.extensions.some(ext => file.toLowerCase().endsWith(ext));
    this.add(postcssLoader, sourcemapLoader, sassLoader, lessLoader, stylusLoader);
    if (options.loaders) this.add(...options.loaders);
  }

  add<T extends Record<string, unknown>>(...loaders: Loader<T>[]): void {
    for (const loader of loaders) {
      if (!this.use.has(loader.name)) continue;
      this.loaders.set(loader.name, loader as Loader);
    }
  }

  isSupported(file: string): boolean {
    if (this.test(file)) return true;
    for (const [, loader] of this.loaders) {
      if (matchFile(file, loader.test)) return true;
    }
    return false;
  }

  async process(payload: Payload, context: LoaderContext): Promise<Payload> {
    if (!this.workQueue) {
      // eslint-disable-next-line import/no-unresolved
      const { default: pQueue } = await import("p-queue");
      this.workQueue = new pQueue({ concurrency: threadPoolSize - 1 });
    }
    const workQueue = this.workQueue;
    for await (const [name, options] of this.use) {
      const loader = this.loaders.get(name);
      if (!loader) continue;
      const ctx: LoaderContext = { ...context, options };
      //eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (loader.alwaysProcess || matchFile(ctx.id, loader.test)) {
        payload = (await workQueue.add(loader.process.bind(ctx, payload)))!;
      }
    }

    return payload;
  }
}

// Type surface mirrors p-queue 10's exports-only declarations
// (node_modules/p-queue/dist/index.d.ts), which TypeScript cannot
// reach under tsconfig's moduleResolution: "node" setting.
declare module "p-queue" {
  /**
  Task accepted by {@linkcode PQueue.add}: receives nothing meaningful.
  */
  type Task<TaskResultType> = (...args: never[]) => TaskResultType | PromiseLike<TaskResultType>;

  export interface PQueueOptions {
    concurrency?: number | undefined;
    autoStart?: boolean | undefined;
    intervalCap?: number | undefined;
    interval?: number | undefined;
    carryoverConcurrencyCount?: boolean | undefined;
  }

  export interface PQueueAddOptions {
    priority?: number | undefined;
    signal?: AbortSignal | undefined;
  }

  export interface QueueAddOptions extends PQueueAddOptions {
    throwOnTimeout?: boolean | undefined;
    timeout?: number | undefined;
  }

  export default class PQueue {
    readonly size: number;
    readonly pending: number;

    constructor(options?: PQueueOptions);

    add<TaskResultType>(
      function_: Task<TaskResultType>,
      options?: Partial<QueueAddOptions>,
    ): Promise<Awaited<TaskResultType>> | undefined;
    addAll<TaskResultType>(
      functions: ReadonlyArray<Task<TaskResultType>>,
    ): Promise<Array<Awaited<TaskResultType>>>;

    pause(): void;
    resume(): void;
    clear(): void;
    setConcurrency(concurrency: number): void;
    onEmpty(): Promise<void>;
    onIdle(): Promise<void>;
    onSizeLessThan(limit: number): Promise<void>;
    onSizeMoreThan(limit: number): Promise<void>;
  }
}

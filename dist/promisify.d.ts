declare function promisify<TResult>(fn: (cb: (err: any, result: TResult) => void) => void): () => Promise<TResult>;
declare function promisify<TArg1, TResult>(
  fn: (arg1: TArg1, cb: (err: any, result: TResult) => void) => void
): (arg1: TArg1) => Promise<TResult>;
declare function promisify<TArg1, TArg2, TResult>(
  fn: (arg1: TArg1, arg2: TArg2, cb: (err: any, result: TResult) => void) => void): (arg1: TArg1, arg2: TArg2) => Promise<TResult>;
declare function promisify<TArg1, TArg2, TArg3, TResult>(
  fn: (arg1: TArg1, arg2: TArg2, arg3: TArg3, cb: (err: any, result: TResult) => void) => void
  ): (arg1: TArg1, arg2: TArg2, arg3: TArg3) => Promise<TResult>;
declare function promisify<TResult>(fn: (...args: any[]) => void): (...args: any[]) => Promise<TResult>;

export = promisify;

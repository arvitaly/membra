export { default as HttpResolver } from "./HttpResolver";
export { default as Membra, IQueryResult, IMembraClient, IResolver } from "./Membra";
export { default as QueryParser } from "./QueryParser";
export { IExecution, default as Generator } from "./Generator";
export * from "./typings";
export function returnof<T>(fn: (...args: any[]) => T): T {
    return null as any && fn();
}
export function returnofPromise<T>(fn: (...args: any[]) => Promise<T>): T {
    return null as any && fn() as any;
}


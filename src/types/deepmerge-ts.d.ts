declare module "deepmerge-ts" {
  export function deepmerge<T1, T2>(o1: T1, o2: T2): T1 & T2;
  export function deepmerge<T1, T2, T3>(o1: T1, o2: T2, o3: T3): T1 & T2 & T3;
  export function deepmerge<T extends object[]>(...objects: T): unknown;
}

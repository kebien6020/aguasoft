export type MakeRequired<T, K extends keyof T> =
  Pick<T, Exclude<keyof T, K>> & {[P in K]-?:Exclude<T[P], undefined> }


export type MakeOptional<T, K extends keyof T> =
  Pick<T, Exclude<keyof T, K>> & {[P in K]?: T[P] }

export type Option = {
  value: string;
  label: string;
}

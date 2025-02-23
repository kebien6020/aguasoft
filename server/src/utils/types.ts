export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? Mutable<U>[] : Mutable<T[P]>
};

export type MakeRequired<T, K extends keyof T> =
  Pick<T, Exclude<keyof T, K>> & { [P in K]-?: Exclude<T[P], undefined> }


export type MakeOptional<T, K extends keyof T> =
  Pick<T, Exclude<keyof T, K>> & { [P in K]?: T[P] }


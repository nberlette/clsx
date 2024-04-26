import type { UnionToTuple } from "jsr:@type/union@^0.1.0";

/**
 * Asserts that the type of `expr` is identical to type `T`.
 * @param expr - Expression that should be identical to type `T`.
 */
export const expectType = <T>(expr: T): void => void expr;

export const falsy = [
  void 0 as void,
  undefined,
  null,
  false,
  0,
  0n,
  "",
] as const;

/**
 * Determines if the given value is truthy or not.
 * @param value The value to check.
 * @returns `true` if the value is truthy, otherwise `false`.
 * @internal
 */
export function isTruthy(it: unknown): it is Truthy {
  return typeof it != "undefined" && !falsy.includes(it as Falsy);
}

// deno-lint-ignore no-explicit-any
export type ClassDictionary<T = any> = Record<string, T>;
export type ClassValue = ClassArray | ClassDictionary | Primitive;
export type ClassValues = readonly ClassValue[];
export type ClassArray =
  readonly (ClassValue | ClassValues | Falsy | StringOrTruthy)[];
export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

// #region Internal
type TruthyObject = { [x: string]: StringOrTruthy };
type StringOrTruthy = Truthy | TruthyObject | (Truthy | TruthyObject)[];
type Falsy = "" | 0 | 0n | false | null | undefined | void | never;
type Falsies =
  | `${false | null | undefined | 0}`
  | ""
  | 0
  | 0n
  | false
  | null
  | undefined
  | void
  | never;

type Printable = Exclude<Primitive, Falsies>;

// deno-lint-ignore ban-types
type Truthy = {} | Printable;

// deno-fmt-ignore
type FlattenTuple<A extends readonly unknown[]> =
  | A extends readonly [infer X, ...infer Y]
    ? X extends readonly unknown[]
      ? [...FlattenTuple<X>, ...FlattenTuple<Y>]
    : [X, ...FlattenTuple<Y>]
  : [];

type ValueOf<T> = T[keyof T];

type ExtractObjectKeys<A extends ClassDictionary> = ValueOf<
  {
    [
      K in keyof A as [A[K]] extends [Falsy] ? never
        : [A[K]] extends [Truthy] ? K // IsLiteral<K, K, never>
        : never
    ]: Exclude<K, symbol>;
  }
>;

export type MergeValues<T, Fallback = string> = T extends [] ? never
  : T extends ClassArray ? FlattenTuple<T> extends [infer A, ...infer B]
      // handle any generic 'string' types
      // ? string extends A ? Join<[MergeValues<B, Fallback>]>
      ? A extends Falsy ? Join<[MergeValues<B, Fallback>]>
      : A extends `${infer C}` ? Join<[C, MergeValues<B, Fallback>]>
      : A extends ClassDictionary ? Join<[
          // MergeValues<UnionToTuple<ExtractObjectKeys<A>>, Fallback>,
          ...UnionToTuple<ExtractObjectKeys<A>>,
          MergeValues<B, Fallback>,
        ]>
      : A extends ClassArray
        ? Join<[MergeValues<A, Fallback>, MergeValues<B, Fallback>]>
      : A extends Primitive
        ? Join<[...A extends boolean ? [] : [A], MergeValues<B, Fallback>]>
      : MergeValues<B, Fallback>
    : Fallback
  : Fallback;

export type IsNever<T, True = true, False = false> = [T] extends [never] ? True
  : False;

export type IsAny<A, True = true, False = false> = boolean extends
  (A extends never ? true : false) ? True : False;

export type IsUnknown<A, True = true, False = false> = IsAny<
  A,
  False,
  unknown extends A ? True : False
>;

export type IsValidInput<T, True = T, False = never> = IsNever<
  T,
  False,
  IsAny<
    T,
    False,
    IsUnknown<T, False, T extends readonly ClassValue[] ? True : False>
  >
>;

// deno-fmt-ignore
export type Filter<A extends readonly unknown[], T = never> =
  | A extends [infer B, ...infer C]
    ? IsNever<B> extends true ? Filter<C, T>
  : B extends T ? [B, ...Filter<C, T>]
  : Filter<C, T>
  : [];

// deno-fmt-ignore
export type Join<
  T extends readonly unknown[],
  C extends string = " ",
> = Filter<T, Truthy> extends infer P
    ? P extends []
      ? ""
    : P extends [infer S extends Primitive] ? `${S}`
    : P extends [infer S extends Primitive, ...infer Rest]
      ? Join<Rest, C> extends infer R extends string
        ? S extends "" | Falsy ? R
        : R extends "" ? `${S}`
        : `${S}${C}${R}`
      : `${S}`
    : ""
  : "";

// #endregion Internal

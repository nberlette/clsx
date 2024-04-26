import { isTruthy } from "./_internal.ts";
import type {
  ClassArray,
  ClassValue,
  ClassValues,
  IsValidInput,
  MergeValues,
} from "./_internal.ts";

/**
 * @module clsx
 *
 * This module provides a type-safe utility for conditionally constructing
 * className strings in TypeScript. It's a direct port of Luke Edwards' `clsx`
 * package, rewritten in TypeScript to support type-level previewing of the
 * expected output string.
 *
 * ```sh
 * deno add @nick/clsx
 * ```
 *
 * ```sh
 * npx jsr add @nick/clsx
 * ```
 *
 * ```sh
 * bun add @nberlette/clsx
 * # or
 * pnpm add @nberlette/clsx
 * # or
 * yarn add @nberlette/clsx
 * # or
 * npm i @nberlette/clsx
 * ```
 *
 * #### Features
 *
 * By taking advantage of advanced features like conditional type inferences,
 * template literal types, and recursion, this module is capable of providing
 * a real-time preview of className strings it expects to generate at runtime.
 *
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * const cn = clsx("foo", { bar: true, baz: false });
 * //     ^? const cn: "foo bar"
 * ```
 *
 * #### Compatibility
 *
 * The `clsx` function exported by this module is fully compatible with the
 * original `clsx` package, meaning you can use it as a drop-in replacement in
 * your TypeScript projects without any changes to your existing codebase.
 *
 * ##### Already using `clsx`? Here's how you can switch in 2 easy steps:
 *
 * ```sh
 * npm uninstall clsx
 *
 * # alias the @nick/clsx package to the original clsx package name:
 * npm install clsx@npm:@nberlette/clsx
 * ```
 *
 * #### Prior Art
 *
 * This was directly adapted from the original `clsx` package by Luke Edwards
 * (@lukeed). It was rewritten from the ground up in 100% TypeScript, enhanced
 * with state-of-the-art language features, and distributed through the new
 * [JSR](https://jsr.io/@nick/clsx) package registry.
 *
 * @example
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * const cn = clsx("foo", "bar", "baz");
 * //     ^? const cn: "foo bar baz"
 * ```
 * @example
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * const cn = clsx("foo", { bar: true, baz: false });
 * //     ^? const cn: "foo bar"
 * ```
 * @example
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * const cn = clsx("nest", [["deep"], { no: 0 }, [{ yes: 1 }, ["yuh", null]]]);
 * //     ^? const cn: "nested deep yuh"
 * ```
 * @example
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * const dark = matchMedia("(prefers-color-scheme: dark)").matches;
 *
 * const cn1 = clsx("mx-auto", { "text-white": dark, "text-black": !dark });
 * //     ^? const cn1: "mx-auto text-white" | "mx-auto text-black"
 *
 * const bgs = ["bg-white", "bg-black"] as const;
 * const cn2 = clsx("w-1/2", "h-full", bgs[+dark]);
 * //     ^? const cn2: "w-1/2 h-full bg-white" | "w-1/2 h-full bg-black"
 * ```
 * @example
 * ```ts
 * import { clsx } from "@nick/clsx";
 *
 * let foo = "bar"; // <- string, not "bar"
 *
 * // if a literal type cannot be inferred, it defaults to `string`:
 * const cn1 = clsx(foo);
 * //     ^? const cn1: string
 *
 * // but inferred literals will always be preserved, wherever possible:
 * const cn2 = clsx("foo", foo);
 * //     ^? const cn2: `foo ${string}`
 * ```
 *
 * > **Note**: the type-level implementation of the `clsx` function is still
 * > considered unstable, and may not alwaus reflect the exact value returned
 * > by the {@link clsx} function at runtime. If you encounter any issues or
 * > other unexpected behavior while using `@nick/clsx`, please open an issue
 * > in the GitHub Repository so it can be addressed and fixed. Thanks!
 *
 * @see https://jsr.io/@nick/clsx for the JSR distribution and docs.
 * @see https://deno.land/x/clsx for the Deno distribution.
 * @see https://npmjs.org/packages/@nberlette/clsx for the NPM distribution.
 * @see https://github.com/nberlette/clsx for this module's source code.
 * @see https://github.com/lukeed/clsx for the inspiring Node package.
 *
 * @template {ClassValues} T The type of the class names to be compiled.
 * @param {T} classes The className segments to compile into a string.
 * @returns {clsx<T>} The compiled className string.
 *
 * @author Nicholas Berlette <https://github.com/nberlette>
 * @copyright Luke Edwards. All rights reserved.
 * @copyright Nicholas Berlette. All rights reserved.
 * @license MIT
 */
export function clsx<const T extends ClassValues>(
  ...classes: [...T]
): clsx<T>;
export function clsx<const T extends ClassValues>(
  classes: [[...T]],
): clsx<T>;
export function clsx(...classes: ClassValues): string;
/** @ignore */
export function clsx(...classes: ClassValues): string {
  function worker(mix: ClassValue | void): string {
    let str = "";
    if (mix != null) {
      if (typeof mix === "number" && (isNaN(mix) || !isFinite(mix))) {
        mix = String(mix);
      }
      if (
        typeof mix === "string" ||
        typeof mix === "number" ||
        typeof mix === "bigint"
      ) {
        str += mix;
      } else if (Array.isArray(mix)) {
        for (let k = 0, y = ""; k < mix.length; y = worker(mix[k++])) {
          if (y) str += (str && " ") + y;
        }
      } else if (typeof mix === "object") {
        for (const k in mix) {
          const v = mix[k as keyof typeof mix];
          // only include _own_ properties
          if (!Object.hasOwn(mix, k) || !isTruthy(v)) continue;
          str += (str && " ") + k;
        }
      }
    }
    return str;
  }

  return classes // rest param containing all the arguments.
    .flat(10) // max recursion depth of 10 seems reasonable.
    .filter(isTruthy) // filter out falsy + nullable values.
    .flatMap(worker) // process each argument, then flatten.
    .filter(isTruthy) // strip empty strings + extra spaces.
    .join(" "); // concatenate classes using a single space.
}

// deno-fmt-ignore
/**
 * The type-level equivalent of the {@link clsx} function. This type is used
 * to infer the output string of the `clsx` function at compile time.
 *
 * @template T The type of the class names to be compiled.
 * @template [Fallback=string] The fallback type to use if the input is
 * invalid.
 * @category Types
 */
export type clsx<T, Fallback = string> =
  | T extends ClassArray
    ? T["length"] extends 0 ? Fallback
  : IsValidInput<T, MergeValues<T, Fallback> extends infer S extends string
      ? S : Fallback, Fallback>
  : Fallback;

/**
 * The type-level equivalent of the {@link clsx} function. This type is simply
 * an alias for the {@link clsx} type (which is named the same as the
 * function) to distinguish between the value-level and type-level components
 * of the API.
 *
 * @see {@link clsx} for the value-level equivalent and underlying type alias
 * that this type is based on.
 * @ignore
 */
export type Clsx<T, Fallback = string> = clsx<T, Fallback> extends
  infer S extends string ? S : Fallback;

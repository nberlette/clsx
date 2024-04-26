# [![][letter-m] `@nick/clsx`][GitHub]

This is a utility for constructing conditional class names in JavaScript and
TypeScript from a set of mixed inputs. It's based on the popular
[`clsx`](https://github.com/lukeed/clsx) package by
[Luke Edwards](https://github.com/lukeed), re-written and enhanced by
[Nicholas Berlette] in 100% TypeScript using modern language features.

In addition to being a drop-in replacement for the original, this package also
introduces an advanced type-level implementation of the `clsx` function. It
leverages nearly identical logic as the runtime function, at a purely type
level.

That type-level implementation affords you with a compile-time preview of the
className strings that `clsx` expects to generate at runtime, without ever
leaving your editor. This is quite useful for catching typos and errors before
they occur.

## Usage

### 📦 Install

This package is distributed through **[JSR]**, **[NPM]**, and **[Deno]**.

It can be installed using your package manager of choice:

```sh
deno add @nick/clsx
```

```sh
npx jsr add @nick/clsx
```

```sh
bun add @nberlette/clsx
# or
pnpm add @nberlette/clsx
# or
yarn add @nberlette/clsx
# or
npm install @nberlette/clsx
```

### 📜 Import

The package exports a single function, [`clsx`](#clsx), which can be imported as
follows:

```ts
import { clsx } from "@nick/clsx";

const className = clsx("foo", "bar", "baz");
```

If you're using the NPM package:

```ts
import { clsx } from "@nberlette/clsx";

const className = clsx("foo", "bar", "baz");
```

Or, if you're importing from [deno.land][Deno]:

```ts
import { clsx } from "https://deno.land/x/clsx/mod.ts";

const className = clsx("foo", "bar", "baz");
```

---

# API

## ![][letter-f] `clsx`

Constructs a composite className string from a given set of mixed inputs.

#### Signature

```ts
function clsx<T extends ClassInputs>(...classes: T): Clsx<T>;
```

#### Parameters

| Name          | Info                                      |
| :------------ | :---------------------------------------- |
| **`classes`** | The class names to compile into a string. |

#### Returns

| Type                                 | Info                                                 |
| :----------------------------------- | :--------------------------------------------------- |
| [`Clsx<T, string>`](#clsxt-fallback) | Composite className string generated from the input. |

---

## ![][letter-t] `Clsx<T, Fallback>`

```ts
type Clsx<T, Fallback = string> = T extends ClassInputs
  ? T["length"] extends 0 ? Fallback
  : IsValidwInput<
    T,
    MergeValues<T, Fallback> extends infer S ? S extends "" ? Fallback : S
      : Fallback,
    Fallback
  >
  : Fallback;
```

The type-level equivalent of the [`clsx`](#clsx "clsx") function, which is used
to render a compile-time preview of the className string expected to be
generated.

For your convenience, an optional `Fallback` type parameter can be specified,
which will be used in an event where a suitable type cannot be inferred. The
default fallback type is the generic `string` type, since the `clsx` function
will always return a string at runtime.

#### Type Parameters

| Name       | Extends | Default  |
| :--------- | :------ | :------- |
| `T`        | `--`    | `--`     |
| `Fallback` | `--`    | `string` |

---

## Examples

```ts
import { clsx } from "@nick/clsx";

const cn = clsx("foo", "bar", "baz");
//     ^? const cn: "foo bar baz"

const cn2 = clsx("foo", { bar: true, baz: false });
//     ^? const cn2: "foo bar"

const cn3 = clsx("nested", ["deep", { no: null }, ["yuh"]]);
//     ^? const cn3: "nested deep yuh"
```

```ts
import { clsx } from "@nick/clsx";

const dark = matchMedia("(prefers-color-scheme: dark)").matches;

const bgs = ["bg-white", "bg-black"] as const;

// This type is correctly inferred as a union of two possible class names:
const cn = clsx("w-1/2", "h-full", bgs[+dark]);
//     ^? const cn: "w-1/2 h-full bg-white" | "w-1/2 h-full bg-black"
```

> For more examples, refer to the [test suite](./mod.test.ts).

---

## Further Reading

### 🧑🏽‍💻 Contributing

This project is open-source, and I welcome contributions of any kind. Feel free
to [open an issue] or [pull request] in the [GitHub Repository][GitHub] if you
have any suggestions, bug reports, or feature requests.

### 🐛 Bugs and Issues

If you encounter any bugs or unexpected behavior, please [open an issue] in the
[GitHub Repository][GitHub] so it can be addressed promptly. Thank you!

---

<div align="center">

##### [MIT] © [Nicholas Berlette]. All rights reserved.

###### [GitHub] · [JSR] · [NPM] · [Deno] · [Docs]

</div>

[MIT]: https://nick.mit-license.org "MIT License. Copyright © 2023-2024+ Nicholas Berlette. All rights reserved."
[Nicholas Berlette]: https://n.berlette.com "Nicholas Berlette's Personal Website"
[GitHub]: https://github.com/nberlette/clsx "GitHub Repository: nberlette/clsx"
[open an issue]: https://github.com/nberlette/clsx/issues/new "Open a new issue on GitHub"
[JSR]: https://jsr.io/@nick/clsx "View the @nick/clsx package on jsr.io"
[NPM]: https://npmjs.com/package/@nberlette/clsx "View the @nberlette/clsx package on NPM"
[Deno]: https://deno.land/x/clsx "View the clsx module on deno.land/x"
[Docs]: https://nberlette.github.io/clsx "View the @nick/clsx documentation"
[Contributing Guide]: https://github.com/nberlette/clsx/blob/main/.github/CONTRIBUTING.md "View the Contributing Guide"
[pull request]: https://github.com/nberlette/clsx/pulls "Open a new pull request on GitHub"
[letter-m]: https://api.iconify.design/tabler:square-letter-m.svg?width=1.5rem&height=1.5rem&color=seagreen&inline=true
[letter-t]: https://api.iconify.design/tabler:square-letter-t.svg?width=1.5rem&height=1.5rem&color=orchid&inline=true
[letter-f]: https://api.iconify.design/tabler:square-letter-f.svg?width=1.5rem&height=1.5rem&color=dodgerblue&inline=true

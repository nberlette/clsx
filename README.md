# <img src="https://api.iconify.design/tabler:square-letter-m.svg?width=1.5rem&height=1.5rem&color=seagreen&inline=true" alt="Module" /> [`@nick/clsx`][GitHub]

This is a modern rewrite of the popular [clsx](https://github.com/lukeed/clsx)
package by [Luke Edwards](https://github.com/lukeed), which is a utility for
constructing conditional class names in JavaScript and TypeScript from a set of
mixed inputs.

In addition to being a drop-in replacement for the original, this package also
introduces an advanced type-level implementation that provides a compile-time
type-level preview of the className strings it expects to generate at runtime.
This can be quite useful for catching typos and other errors before they occur.

## 📦 Install

This package is distributed through the [JSR], [NPM], and [Deno] registries, and
can be installed using your package manager of choice.

```sh
deno add @nick/clsx
```

```sh
npx jsr add @nick/clsx
```

```sh
npm install @nberlette/clsx
```

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

---

## API

### <img src="https://api.iconify.design/tabler:square-letter-f.svg?width=1.5rem&height=1.5rem&color=%23056CF0&inline=true" alt="Function" /> `clsx`

Constructs a composite className string from a given set of mixed inputs.

#### Signature

```ts
export function clsx<T extends ClassInputs>(...classes: T): Clsx<T>;
```

#### Parameters

| Name          | Info                                      |
| :------------ | :---------------------------------------- |
| **`classes`** | The class names to compile into a string. |

### <img src="https://api.iconify.design/tabler:square-letter-f.svg?width=1.5rem&height=1.5rem&color=%23056CF0&inline=true" alt="Function" /> `clsx`

#### Signature

```ts
function clsx<T extends ClassInputs>(...clsx: T): Clsx<T>;
```

#### Parameters

| Name          | Info                                      |
| :------------ | :---------------------------------------- |
| **`classes`** | The class names to compile into a string. |

---

### <img src="https://api.iconify.design/tabler:square-letter-t.svg?width=1.5rem&height=1.5rem&color=%23A4478C&inline=true" alt="Type Alias" /> `Clsx<T, Fallback>`

```ts
export type Clsx<T, Fallback = string> = T extends ClassInputs
  ? T["length"] extends 0 ? Fallback
  : IsValidwInput<
    T,
    MergeValues<T, Fallback> extends infer S ? S extends "" ? Fallback : S
      : Fallback,
    Fallback
  >
  : Fallback;
```

The type-level equivalent of the [clsx](#clsx "clsx") function, which is used to
render a compile-time preview of the className string expected to be generated.

For your convenience, an optional `Fallback` type parameter can be specified,
which will be used in an event where a suitable type cannot be inferred. The
default fallback type is the generic `string` type, since the `clsx` function
will always return a string at runtime.

##### Type Parameters

| Name       | Extends | Default  |
| :--------- | :------ | :------- |
| `T`        | `--`    | `--`     |
| `Fallback` | `--`    | `string` |

---

### 🧑🏽‍💻 Contributing

This project is open-source, and I welcome contributions of all kinds. Feel free
to [open an issue] or [pull request] in the [GitHub Repository][GitHub] if you
have any suggestions, bug reports, or feature requests. If you would like to
contribute to the project, please check out the [Contributing Guide] for more
information.

### 🐛 Bugs and Issues

If you encounter any bugs or unexpected behavior, please [open an issue] in the
[GitHub Repository][GitHub]. I will do my best to address the issue as soon as
possible.

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

import { clsx } from "./mod.ts";
import { expectType } from "./_internal.ts";
import { describe, it } from "jsr:@std/testing@^0.224.0/bdd";
import { assertEquals } from "jsr:@std/assert@^0.224.0";

describe("@nick/clsx", () => {
  it("should handle simple non-literal strings", () => {
    // if a literal type cannot be inferred, defaults to `string`.
    const cn = clsx("bar" as string);
    //     ^? const cn: string
    assertEquals(cn, "bar");
    //     ^? const cn: string
    expectType<string>(cn);
  });

  it("should preserve inferred literals whenever possible", () => {
    // inferred types (literals or generics) are preserved whenever possible:
    const cn1 = clsx("foo", "100");
    //     ^? const cn1: "foo 100"
    assertEquals(cn1, "foo 100");
    expectType<"foo 100">(cn1);

    const cn2 = clsx("foo", "100" as `${number}`);
    //     ^? const cn2: `foo ${number}`
    assertEquals(cn2, "foo 100");
    expectType<`foo ${number}`>(cn2);

    const cn3 = clsx("foo", 100);
    //     ^? const cn3: `foo 100`
    assertEquals(cn3, "foo 100");
    expectType<`foo 100`>(cn3);

    const cn4 = clsx("foo", 100 as number);
    //     ^? const cn3: `foo ${number}`
    assertEquals(cn4, "foo 100");
    expectType<`foo ${number}`>(cn4);
  });

  it("should filter out falsy values", () => {
    // falsy values are filtered out:
    const cn5 = clsx("foo-bar", "barfoo", Math.random() > 0);
    //     ^? const cn5: "foo-bar barfoo"
    assertEquals(cn5, "foo-bar barfoo");
    expectType<"foo-bar barfoo">(cn5);
  });

  it("should flatten nested arrays", () => {
    const cn6 = clsx("To", [1e333, ["and", ["", "beyond", [0, "!"]]]]);
    //     ^? const cn6: "To Infinity and beyond !"
    assertEquals(cn6, "To Infinity and beyond !");
    expectType<"To Infinity and beyond !">(cn6);
  });

  it("should handle 'Infinity'", () => {
    const cn = clsx(Infinity);
    //     ^? const cn: `${number}`
    assertEquals(cn, "Infinity", "Should handle 'Infinity'");
    expectType<`${number}`>(cn);
  });

  it("should handle '-Infinity'", () => {
    const cn7 = clsx(-Infinity);
    //     ^? const cn7: `${number}`
    assertEquals(cn7, "-Infinity", "Should handle '-Infinity'");
    // since Infinity is not typed as a literal, it defaults to `number`:
    expectType<`${number}`>(cn7);
  });

  it("should handle literal infinite numbers", () => {
    const cn7_1 = clsx(1e333);
    //     ^? const cn7_1: "Infinity"
    assertEquals(cn7_1, "Infinity", "Should handle 1e333 as Infinity");
    // a large number like 1e333, however, is inferred as "Infinity":
    expectType<"Infinity">(cn7_1);
  });

  it("should handle literal negative infinite numbers", () => {
    const cn7_2 = clsx(-1e333);
    //     ^? const cn7_2: "-Infinity"
    assertEquals(cn7_2, "-Infinity", "Should handle -1e333 as -Infinity");
    // a large negative number like -1e333 is inferred as "-Infinity":
    expectType<"-Infinity">(cn7_2);
  });

  it("should handle literal exponential numeric strings", () => {
    const cn7_3 = clsx("1e333");
    //     ^? const cn7_3: "1e333"
    assertEquals(cn7_3, "1e333");
    // when passed as a string, however, it is preserved as a literal:
    expectType<"1e333">(cn7_3);
  });

  it("should handle NaN", () => {
    const cn7_4 = clsx("not-a", NaN);
    //     ^? const cn8: `not-a ${number}`
    assertEquals(cn7_4, "not-a NaN");
    // like Infinity, NaN is not typed as a literal, so we just get `number`:
    expectType<`not-a ${number}`>(cn7_4);
  });

  it("should handle nested arrays", () => {
    const cn8 = clsx("foo", [[[[[[["baz"]]]]]]]);
    //     ^? const cn8: "foo baz"
    assertEquals(cn8, "foo baz");
    expectType<"foo baz">(cn8);
  });

  it("should handle empty strings", () => {
    const cn9 = clsx("");
    //     ^? const cn9: ""
    assertEquals(cn9, "");
    expectType<"">(cn9);
  });

  it("should handle empty objects", () => {
    const cn11 = clsx({});
    //     ^? const cn11: ""
    assertEquals(cn11, "");
    expectType<string>(cn11);
  });

  it("should handle empty tuples", () => {
    const cn12 = clsx([]);
    //     ^? const cn12: ""
    assertEquals(cn12, "");
    expectType<string>(cn12);
  });

  it("should handle empty nested tuples", () => {
    const cn13 = clsx([[]]);
    //     ^? const cn13: ""
    assertEquals(cn13, "");
    expectType<string>(cn13);
  });

  it("should preserve literal object keys with truthy values", () => {
    const cn5 = clsx({ "foo-bar": true, barfoo: Math.random() > 0 });
    //     ^? const _cn5: "foo-bar barfoo"
    assertEquals(cn5, "foo-bar barfoo");
    expectType<"foo-bar barfoo">(cn5);
  });

  // mock the DOM function `matchMedia` for testing purposes
  const matchMedia = (query: string): { matches: boolean } => ({
    matches: query.includes("dark"),
  });

  it("should handle mixed values", () => {
    // TODO(nberlette): should be "mx-auto text-white" | "mx-auto text-black".
    // find out why it's not, and fix it.
    const cn1 = clsx("mx-auto", {
      //     ^? const _cn1: "mx-auto text-white text-black"
      "text-white": Boolean(matchMedia("(prefers-color-scheme: dark)").matches),
      "text-black": !matchMedia("(prefers-color-scheme: light)").matches,
    });
    assertEquals(cn1, "mx-auto text-white text-black");
    expectType<"mx-auto text-white text-black">(cn1);
  });

  it("should handle mixed values with indexed access", () => {
    const cn2 = clsx(
      "w-1/2",
      "h-full",
      (["bg-white", "bg-black"] as const)[
        //     ^? const _cn2: "w-1/2 h-full bg-white" | "w-1/2 h-full bg-black"
        +Boolean(matchMedia("(prefers-color-scheme: dark)").matches)
      ],
    );
    assertEquals(cn2, "w-1/2 h-full bg-black");
    expectType<"w-1/2 h-full bg-white" | "w-1/2 h-full bg-black">(cn2);
  });
});

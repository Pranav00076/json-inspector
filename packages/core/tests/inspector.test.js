
import { describe, it, expect } from "vitest";
import { inspectJSON } from "../src/index.js";

describe("inspectJSON", () => {
  it("should identify object types", () => {
    const result = inspectJSON({
      name: "Pranav",
      age: 20
    });

    expect(result.type).toBe("object");
    expect(result.stats.objects).toBe(1);
    expect(result.stats.strings).toBe(1);
    expect(result.stats.numbers).toBe(1);
  });

  it("should inspect nested objects", () => {
    const result = inspectJSON({
      user: {
        name: "Pranav"
      }
    });

    expect(result.tree.children[0].path)
      .toBe("$.user");

    expect(result.tree.children[0].children[0].path)
      .toBe("$.user.name");
  });

  it("should identify arrays", () => {
    const result = inspectJSON([1, 2, 3]);

    expect(result.type).toBe("array");
    expect(result.stats.arrays).toBe(1);
    expect(result.tree.length).toBe(3);
  });

  it("should reject undefined", () => {
    expect(() => inspectJSON(undefined))
      .toThrow(TypeError);
  });
});

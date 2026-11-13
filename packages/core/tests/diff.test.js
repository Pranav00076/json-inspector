
import { describe, it, expect } from "vitest";
import { diffJSON } from "../src/index.js";

describe("diffJSON", () => {
  it("should detect modified values", () => {
    const result = diffJSON(
      { age: 20 },
      { age: 21 }
    );

    expect(result.count).toBe(1);
    expect(result.changes[0]).toMatchObject({
      path: '$["age"]',
      type: "modified",
      oldValue: 20,
      newValue: 21
    });
  });

  it("should detect added properties", () => {
    const result = diffJSON(
      { name: "Pranav" },
      { name: "Pranav", city: "Pune" }
    );

    expect(result.summary.added).toBe(1);
    expect(result.changes[0].type).toBe("added");
    expect(result.changes[0].newValue).toBe("Pune");
  });

  it("should detect removed properties", () => {
    const result = diffJSON(
      { name: "Pranav", city: "Pune" },
      { name: "Pranav" }
    );

    expect(result.summary.removed).toBe(1);
    expect(result.changes[0].type).toBe("removed");
    expect(result.changes[0].oldValue).toBe("Pune");
  });

  it("should compare nested objects", () => {
    const result = diffJSON(
      {
        user: {
          profile: {
            age: 20
          }
        }
      },
      {
        user: {
          profile: {
            age: 21
          }
        }
      }
    );

    expect(result.changes[0].path).toBe(
      '$["user"]["profile"]["age"]'
    );
  });

  it("should compare arrays by index", () => {
    const result = diffJSON(
      ["React", "Node.js"],
      ["React", "Python"]
    );

    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.modified).toBe(1);
    expect(result.changes[0].path).toBe("$[1]");
  });

  it("should detect added array elements", () => {
    const result = diffJSON(
      [1, 2],
      [1, 2, 3]
    );

    expect(result.summary.added).toBe(1);
    expect(result.changes[0]).toMatchObject({
      path: "$[2]",
      type: "added",
      newValue: 3
    });
  });

  it("should detect removed array elements", () => {
    const result = diffJSON(
      [1, 2, 3],
      [1, 2]
    );

    expect(result.summary.removed).toBe(1);
  });

  it("should detect different data types", () => {
    const result = diffJSON(
      { value: 100 },
      { value: "100" }
    );

    expect(result.changes[0]).toMatchObject({
      type: "modified",
      oldType: "number",
      newType: "string"
    });
  });

  it("should handle null values", () => {
    const result = diffJSON(
      { value: null },
      { value: "hello" }
    );

    expect(result.summary.modified).toBe(1);
  });

  it("should count unchanged values", () => {
    const result = diffJSON(
      { name: "Pranav", age: 20 },
      { name: "Pranav", age: 20 }
    );

    expect(result.count).toBe(0);
    expect(result.summary.unchanged).toBe(2);
    expect(result.changes).toEqual([]);
  });

  it("should handle special property names", () => {
    const result = diffJSON(
      { "first.name": 10 },
      { "first.name": 20 }
    );

    expect(result.changes[0].path).toBe(
      '$["first.name"]'
    );
  });

  it("should compare root primitive values", () => {
    const result = diffJSON(10, 20);

    expect(result.count).toBe(1);
    expect(result.changes[0].path).toBe("$");
  });
});

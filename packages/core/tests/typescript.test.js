
import { describe, it, expect } from "vitest";
import { jsonToTypescript } from "../src/index.js";

describe("jsonToTypescript", () => {
  it("should generate a basic interface", () => {
    const result = jsonToTypescript({
      name: "Pranav",
      age: 20
    });

    expect(result).toContain("interface Root");
    expect(result).toContain("name: string;");
    expect(result).toContain("age: number;");
  });

  it("should support custom root names", () => {
    const result = jsonToTypescript(
      { name: "Pranav" },
      { rootName: "User" }
    );

    expect(result).toContain("interface User");
  });

  it("should generate nested interfaces", () => {
    const result = jsonToTypescript({
      user: {
        name: "Pranav"
      }
    });

    expect(result).toContain("interface RootUser");
    expect(result).toContain("user: RootUser;");
  });

  it("should support arrays of primitives", () => {
    const result = jsonToTypescript({
      skills: ["React", "Node.js"]
    });

    expect(result).toContain("skills: string[];");
  });

  it("should support arrays of objects", () => {
    const result = jsonToTypescript(
      {
        users: [
          { name: "Alice", age: 20 },
          { name: "Bob", email: "bob@example.com" }
        ]
      }
    );

    expect(result).toContain("users: RootUsersItem[];");
    expect(result).toContain("name: string;");
    expect(result).toContain("age?: number;");
    expect(result).toContain("email?: string;");
  });

  it("should support null values", () => {
    const result = jsonToTypescript({
      name: null
    });

    expect(result).toContain("name: null;");
  });

  it("should support mixed arrays", () => {
    const result = jsonToTypescript({
      values: ["hello", 20, true]
    });

    expect(result).toContain(
      "values: (string | number | boolean)[];"
    );
  });

  it("should support optional properties", () => {
    const result = jsonToTypescript(
      { name: "Pranav", email: "test@example.com" },
      {
        optionalProperties: ["$.email"]
      }
    );

    expect(result).toContain("email?: string;");
  });

  it("should support non-exported interfaces", () => {
    const result = jsonToTypescript(
      { name: "Pranav" },
      { exportTypes: false }
    );

    expect(result).not.toContain("export interface");
  });

  it("should support custom indentation", () => {
    const result = jsonToTypescript(
      { name: "Pranav" },
      { indent: 4 }
    );

    expect(result).toContain("    name: string;");
  });

  it("should quote invalid property names", () => {
    const result = jsonToTypescript({
      "first-name": "Pranav"
    });

    expect(result).toContain('"first-name": string;');
  });

  it("should reject invalid indentation", () => {
    expect(() => jsonToTypescript(
      { name: "Pranav" },
      { indent: 10 }
    )).toThrow(RangeError);
  });

  it("should generate unknown arrays for empty arrays", () => {
    const result = jsonToTypescript({
      skills: []
    });

    expect(result).toContain("skills: unknown[];");
  });
});

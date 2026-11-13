
import { describe, it, expect } from "vitest";
import { searchJSON } from "../src/index.js";

const data = {
  user: {
    name: "Pranav",
    email: "abs@example.com",
    age: 20,
    active: true,
    skills: ["React", "Node.js", "Python"]
  },
  city: "Pune"
};

describe("searchJSON", () => {
  it("should be case insensitive by default", () => {
  const result = searchJSON(data, {
    query: "PRANAV",
    exact: true
  });

  expect(result.count).toBe(1);
  expect(result.matches[0].value).toBe("Pranav");
});

  it("should search object keys", () => {
    const result = searchJSON(data, {
      query: "email",
      searchIn: "keys"
    });

    expect(result.count).toBe(1);
    expect(result.matches[0].path)
      .toBe("$.user.email");
  });

  it("should be case insensitive by default", () => {
    const result = searchJSON(data, {
      query: "PRANAV"
    });

    expect(result.count).toBe(1);
  });

  it("should support case-sensitive matching", () => {
    const result = searchJSON(data, {
      query: "PRANAV",
      caseSensitive: true
    });

    expect(result.count).toBe(0);
  });

  it("should support exact matching", () => {
    const result = searchJSON(data, {
      query: "React",
      exact: true
    });

    expect(result.count).toBe(1);
  });

  it("should filter results by data type", () => {
    const result = searchJSON(data, {
      query: "20",
      type: "number"
    });

    expect(result.count).toBe(1);
    expect(result.matches[0].value).toBe(20);
  });

  it("should search boolean values", () => {
    const result = searchJSON(data, {
      query: "true",
      searchIn: "values"
    });

    expect(result.count).toBe(1);
    expect(result.matches[0].type).toBe("boolean");
  });

  it("should respect maxResults", () => {
    const result = searchJSON(data, {
      query: "a",
      searchIn: "values",
      maxResults: 2
    });

    expect(result.count).toBe(2);
  });

  it("should return an empty result when no match exists", () => {
    const result = searchJSON(data, {
      query: "nonexistent"
    });

    expect(result.count).toBe(0);
    expect(result.matches).toEqual([]);
  });

  it("should reject empty queries", () => {
    expect(() => searchJSON(data, {
      query: ""
    })).toThrow(TypeError);
  });

  it("should reject invalid search locations", () => {
    expect(() => searchJSON(data, {
      query: "test",
      searchIn: "invalid"
    })).toThrow(TypeError);
  });
});

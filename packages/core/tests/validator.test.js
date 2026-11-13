
import { describe, it, expect } from "vitest";
import { validateJSON } from "../src/index.js";

describe("validateJSON", () => {
  it("should accept valid JSON strings", () => {
    const result = validateJSON('{"name":"Pranav"}');

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data.name).toBe("Pranav");
  });

  it("should reject invalid JSON strings", () => {
    const result = validateJSON('{"name":}');

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("syntax");
  });

  it("should validate object types", () => {
    const result = validateJSON(
      { name: "Pranav", age: 20 },
      {
        schema: {
          type: "object"
        }
      }
    );

    expect(result.valid).toBe(true);
  });

  it("should detect missing required properties", () => {
    const result = validateJSON(
      { name: "Pranav" },
      {
        schema: {
          type: "object",
          required: ["name", "age"]
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("required");
  });

  it("should validate nested properties", () => {
    const result = validateJSON(
      {
        user: {
          age: "twenty"
        }
      },
      {
        schema: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                age: {
                  type: "number"
                }
              }
            }
          }
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("$.user.age");
  });

  it("should validate array items", () => {
    const result = validateJSON(
      [1, 2, "three"],
      {
        schema: {
          type: "array",
          items: {
            type: "number"
          }
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("$[2]");
  });

  it("should validate string length", () => {
    const result = validateJSON(
      { username: "ab" },
      {
        schema: {
          type: "object",
          properties: {
            username: {
              type: "string",
              minLength: 3
            }
          }
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("minLength");
  });

  it("should validate number boundaries", () => {
    const result = validateJSON(
      { age: 15 },
      {
        schema: {
          type: "object",
          properties: {
            age: {
              type: "number",
              minimum: 18,
              maximum: 100
            }
          }
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("minimum");
  });

  it("should validate enum values", () => {
    const result = validateJSON(
      { role: "admin" },
      {
        schema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["user", "guest"]
            }
          }
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("enum");
  });

  it("should reject additional properties", () => {
    const result = validateJSON(
      {
        name: "Pranav",
        secret: "123"
      },
      {
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string"
            }
          },
          additionalProperties: false
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword)
      .toBe("additionalProperties");
  });

  it("should support integer validation", () => {
    const result = validateJSON(
      { age: 20.5 },
      {
        schema: {
          type: "object",
          properties: {
            age: {
              type: "integer"
            }
          }
        }
      }
    );

    expect(result.valid).toBe(false);
  });

  it("should support array length validation", () => {
    const result = validateJSON(
      [1, 2],
      {
        schema: {
          type: "array",
          minItems: 3
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("minItems");
  });

  it("should support multiple allowed types", () => {
    const result = validateJSON(
      { value: null },
      {
        schema: {
          type: "object",
          properties: {
            value: {
              type: ["string", "null"]
            }
          }
        }
      }
    );

    expect(result.valid).toBe(true);
  });
});

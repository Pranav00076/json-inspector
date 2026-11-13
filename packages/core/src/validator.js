
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }

  return typeof value;
}

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function isEqual(a, b) {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length &&
      a.every((item, i) => isEqual(item, b[i]));
  }

  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    return keysA.length === keysB.length &&
      keysA.every(
        key =>
          Object.hasOwn(b, key) &&
          isEqual(a[key], b[key])
      );
  }

  return false;
}

function getActualType(value) {
  const type = getType(value);
  return type === "integer" ? "number" : type;
}

function isValidType(value, expectedType) {
  if (expectedType === "integer") {
    return typeof value === "number" &&
      Number.isInteger(value);
  }

  if (expectedType === "number") {
    return typeof value === "number" &&
      Number.isFinite(value);
  }

  return getType(value) === expectedType;
}

function validateSchema(data, schema, path, errors) {
  if (!isObject(schema)) {
    throw new TypeError("Schema must be an object.");
  }

  // Type validation
  if (schema.type !== undefined) {
    const allowedTypes = Array.isArray(schema.type)
      ? schema.type
      : [schema.type];

    const valid = allowedTypes.some(type =>
      isValidType(data, type)
    );

    if (!valid) {
      errors.push({
        path,
        keyword: "type",
        message: `Expected ${allowedTypes.join(" or ")}, received ${getActualType(data)}`
      });

      return;
    }
  }

  // Enum validation
  if (schema.enum !== undefined) {
    if (
      !Array.isArray(schema.enum) ||
      !schema.enum.some(value => isEqual(data, value))
    ) {
      errors.push({
        path,
        keyword: "enum",
        message: "Value is not one of the allowed values."
      });
    }
  }

  // Object validation
  if (isObject(data)) {
    const properties = schema.properties ?? {};
    const required = schema.required ?? [];

    if (!isObject(properties)) {
      throw new TypeError("schema.properties must be an object.");
    }

    if (
      !Array.isArray(required) ||
      !required.every(key => typeof key === "string")
    ) {
      throw new TypeError(
        "schema.required must be an array of strings."
      );
    }

    // Required properties
    for (const key of required) {
      if (!Object.hasOwn(data, key)) {
        errors.push({
          path: `${path}.${key}`,
          keyword: "required",
          message: `Required property "${key}" is missing.`
        });
      }
    }

    // Additional properties
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!Object.hasOwn(properties, key)) {
          errors.push({
            path: `${path}.${key}`,
            keyword: "additionalProperties",
            message: `Unexpected property "${key}".`
          });
        }
      }
    }

    // Validate nested properties
    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.hasOwn(data, key)) {
        validateSchema(
          data[key],
          childSchema,
          `${path}.${key}`,
          errors
        );
      }
    }
  }

  // Array validation
  if (Array.isArray(data)) {
    if (
      schema.minItems !== undefined &&
      data.length < schema.minItems
    ) {
      errors.push({
        path,
        keyword: "minItems",
        message: `Expected at least ${schema.minItems} items.`
      });
    }

    if (
      schema.maxItems !== undefined &&
      data.length > schema.maxItems
    ) {
      errors.push({
        path,
        keyword: "maxItems",
        message: `Expected at most ${schema.maxItems} items.`
      });
    }

    if (schema.items !== undefined) {
      for (let i = 0; i < data.length; i++) {
        validateSchema(
          data[i],
          schema.items,
          `${path}[${i}]`,
          errors
        );
      }
    }
  }

  // String validation
  if (typeof data === "string") {
    if (
      schema.minLength !== undefined &&
      data.length < schema.minLength
    ) {
      errors.push({
        path,
        keyword: "minLength",
        message: `Expected at least ${schema.minLength} characters.`
      });
    }

    if (
      schema.maxLength !== undefined &&
      data.length > schema.maxLength
    ) {
      errors.push({
        path,
        keyword: "maxLength",
        message: `Expected at most ${schema.maxLength} characters.`
      });
    }
  }

  // Number validation
  if (typeof data === "number") {
    if (
      schema.minimum !== undefined &&
      data < schema.minimum
    ) {
      errors.push({
        path,
        keyword: "minimum",
        message: `Value must be at least ${schema.minimum}.`
      });
    }

    if (
      schema.maximum !== undefined &&
      data > schema.maximum
    ) {
      errors.push({
        path,
        keyword: "maximum",
        message: `Value must be at most ${schema.maximum}.`
      });
    }
  }
}

export function validateJSON(input, options = {}) {
  let data = input;

  // Parse JSON strings
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          path: "$",
          keyword: "syntax",
          message: error.message
        }],
        data: undefined
      };
    }
  }

  const errors = [];

  // Validate against schema if provided
  if (options.schema !== undefined) {
    validateSchema(
      data,
      options.schema,
      "$",
      errors
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    data
  };
}

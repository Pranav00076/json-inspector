
function toPascalCase(value) {
  const words = String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .match(/[a-zA-Z0-9]+/g) ?? [];

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") || "Generated";
}

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function getPropertyPath(parent, key) {
  return /^[$A-Z_a-z][$\w]*$/.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

function formatPropertyName(key) {
  return /^[$A-Z_a-z][$\w]*$/.test(key)
    ? key
    : JSON.stringify(key);
}

export function jsonToTypescript(data, options = {}) {
  const {
    rootName = "Root",
    exportTypes = true,
    optionalProperties = [],
    indent = 2
  } = options;

  if (!Number.isInteger(indent) || indent < 0 || indent > 8) {
    throw new RangeError("indent must be an integer from 0 to 8.");
  }

  if (
    !Array.isArray(optionalProperties) ||
    !optionalProperties.every(path => typeof path === "string")
  ) {
    throw new TypeError(
      "optionalProperties must be an array of strings."
    );
  }

  const interfaces = [];
  const usedNames = new Set();

  function uniqueName(name) {
    const base = toPascalCase(name);
    let candidate = base;
    let index = 2;

    while (usedNames.has(candidate)) {
      candidate = `${base}${index++}`;
    }

    usedNames.add(candidate);
    return candidate;
  }

  function combineTypes(types) {
    const unique = [...new Set(types)];

    if (unique.length === 1) {
      return unique[0];
    }

    return unique.join(" | ");
  }

  function inferType(value, name, path) {
    if (value === null) return "null";

    if (typeof value === "string") return "string";
    if (typeof value === "boolean") return "boolean";

    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new TypeError(`Invalid number at ${path}.`);
      }

      return "number";
    }

    if (Array.isArray(value)) {
      return inferArrayType(value, name, path);
    }

    if (isObject(value)) {
      return createInterface([value], name, path);
    }

    throw new TypeError(
      `Unsupported value at ${path}. Expected JSON-compatible data.`
    );
  }

  function inferTypes(values, name, path) {
    const nonNullValues = values.filter(
      value => value !== null
    );

    const hasNull = nonNullValues.length !== values.length;

    if (nonNullValues.length === 0) {
      return "null";
    }

    // Merge multiple object structures into one interface.
    if (nonNullValues.every(isObject)) {
      const objectType = createInterface(
        nonNullValues,
        name,
        path
      );

      return hasNull
        ? `${objectType} | null`
        : objectType;
    }

    const types = nonNullValues.map((value, index) =>
      inferType(value, name, `${path}[${index}]`)
    );

    if (hasNull) {
      types.push("null");
    }

    return combineTypes(types);
  }

  function inferArrayType(values, name, path) {
    if (values.length === 0) {
      return "unknown[]";
    }

    const elementType = inferTypes(
      values,
      `${name}Item`,
      `${path}[]`
    );

    return `${elementType.includes(" | ") ? `(${elementType})` : elementType}[]`;
  }

  function createInterface(objects, name, path) {
    const interfaceName = uniqueName(name);
    const keys = new Set();

    for (const object of objects) {
      Object.keys(object).forEach(key => keys.add(key));
    }

    const lines = [];

    for (const key of keys) {
      const propertyPath = getPropertyPath(path, key);

      const values = objects
        .filter(object => Object.hasOwn(object, key))
        .map(object => object[key]);

      const missingInSomeObjects =
        values.length < objects.length;

      const optional =
        missingInSomeObjects ||
        optionalProperties.includes(propertyPath);

      const propertyType = inferTypes(
        values,
        `${interfaceName}${toPascalCase(key)}`,
        propertyPath
      );

      lines.push(
        `${" ".repeat(indent)}${formatPropertyName(key)}${optional ? "?" : ""}: ${propertyType};`
      );
    }

    const declaration = [
      `interface ${interfaceName} {`,
      ...lines,
      "}"
    ].join("\n");

    interfaces.push(declaration);

    return interfaceName;
  }

  let rootType;

  if (isObject(data)) {
    rootType = createInterface(
      [data],
      rootName,
      "$"
    );
  } else {
    rootType = inferType(data, rootName, "$");
  }

  const declarations = interfaces.map(declaration =>
    exportTypes
      ? declaration.replace(/^interface /, "export interface ")
      : declaration
  );

  // Root arrays and primitive values need a type alias.
  if (!isObject(data)) {
    declarations.unshift(
      `${exportTypes ? "export " : ""}type ${toPascalCase(rootName)} = ${rootType};`
    );
  }

  return declarations.join("\n\n");
}

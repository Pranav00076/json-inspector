
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function traverse(value, path = "$", depth = 0) {
  const type = getType(value);

  const result = {
    path,
    type,
    depth,
    value
  };

  if (type === "object") {
    result.keys = Object.keys(value).length;

    result.children = Object.entries(value).map(
      ([key, child]) =>
        traverse(child, `${path}.${key}`, depth + 1)
    );
  }

  if (type === "array") {
    result.length = value.length;

    result.children = value.map(
      (child, index) =>
        traverse(child, `${path}[${index}]`, depth + 1)
    );
  }

  return result;
}

export function inspectJSON(data) {
  if (
    data === undefined ||
    typeof data === "function" ||
    typeof data === "symbol" ||
    typeof data === "bigint"
  ) {
    throw new TypeError("Input must be valid JSON-compatible data.");
  }

  return {
    type: getType(data),
    tree: traverse(data),
    stats: getStats(data)
  };
}

function getStats(data) {
  let objects = 0;
  let arrays = 0;
  let strings = 0;
  let numbers = 0;
  let booleans = 0;
  let nulls = 0;

  function count(value) {
    const type = getType(value);

    if (type === "object") {
      objects++;
      Object.values(value).forEach(count);
    } else if (type === "array") {
      arrays++;
      value.forEach(count);
    } else if (type === "string") {
      strings++;
    } else if (type === "number") {
      numbers++;
    } else if (type === "boolean") {
      booleans++;
    } else if (type === "null") {
      nulls++;
    }
  }

  count(data);

  return {
    objects,
    arrays,
    strings,
    numbers,
    booleans,
    nulls,
    total:
      objects + arrays + strings +
      numbers + booleans + nulls
  };
}

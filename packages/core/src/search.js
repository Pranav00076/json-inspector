
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function matchesQuery(value, query, options) {
  const text = String(value);

  const source = options.caseSensitive
    ? text
    : text.toLowerCase();

  const target = options.caseSensitive
    ? query
    : query.toLowerCase();

  return options.exact
    ? source === target
    : source.includes(target);
}

export function searchJSON(data, options = {}) {
  const {
    query,
    searchIn = "both",
    caseSensitive = false,
    exact = false,
    type,
    maxResults = Infinity
  } = options;

  if (typeof query !== "string" || query.length === 0) {
    throw new TypeError("Search query must be a non-empty string.");
  }

  if (!["keys", "values", "both"].includes(searchIn)) {
    throw new TypeError(
      'searchIn must be "keys", "values", or "both".'
    );
  }

  if (
    type !== undefined &&
    !["object", "array", "string", "number", "boolean", "null"]
      .includes(type)
  ) {
    throw new TypeError("Invalid JSON data type filter.");
  }

  if (
    maxResults !== Infinity &&
    (!Number.isInteger(maxResults) || maxResults < 1)
  ) {
    throw new RangeError("maxResults must be a positive integer.");
  }

  const matches = [];

  function traverse(value, path = "$", key = null) {
    if (matches.length >= maxResults) return;

    const valueType = getType(value);

    const typeMatches = type === undefined || type === valueType;

    const matchedIn = [];

    // Search property names.
    if (
      key !== null &&
      typeMatches &&
      (searchIn === "keys" || searchIn === "both") &&
      matchesQuery(key, query, { caseSensitive, exact })
    ) {
      matchedIn.push("key");
    }

    // Search actual values.
    if (
      typeMatches &&
      (searchIn === "values" || searchIn === "both") &&
      !["object", "array"].includes(valueType) &&
      matchesQuery(value, query, { caseSensitive, exact })
    ) {
      matchedIn.push("value");
    }

    if (matchedIn.length > 0) {
      matches.push({
        path,
        key,
        value,
        type: valueType,
        matchedIn
      });
    }

    if (matches.length >= maxResults) return;

    // Traverse nested objects.
    if (valueType === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        if (matches.length >= maxResults) break;

        traverse(
          childValue,
          `${path}.${childKey}`,
          childKey
        );
      }
    }

    // Traverse arrays.
    if (valueType === "array") {
      for (let i = 0; i < value.length; i++) {
        if (matches.length >= maxResults) break;

        traverse(
          value[i],
          `${path}[${i}]`,
          String(i)
        );
      }
    }
  }

  traverse(data);

  return {
    query,
    count: matches.length,
    matches
  };
}

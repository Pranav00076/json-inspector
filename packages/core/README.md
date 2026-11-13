# JSON Inspector Pro

A lightweight JavaScript toolkit for inspecting, searching, comparing, validating, and transforming JSON data.

**JSON Inspector Pro** provides five developer utilities through one simple API.

## Features

- 🔍 **JSON Inspection** — Explore nested JSON structures, data types, paths, and statistics.
- 🔎 **JSON Search** — Search nested keys and values with filters and case-sensitive matching.
- 🔄 **JSON Diff** — Compare two JSON objects and identify added, removed, and modified values.
- 🛡️ **JSON Validation** — Validate JSON syntax and check data against supported schema rules.
- ⚡ **TypeScript Generator** — Generate TypeScript interfaces from JSON data.

## Installation

```bash
npm install json-inspector-pro
```

Requires Node.js 18 or later.

## Quick Start

```javascript
import {
  inspectJSON,
  searchJSON,
  diffJSON,
  validateJSON,
  jsonToTypescript
} from "json-inspector-pro";

const data = {
  user: {
    name: "Pranav",
    age: 20,
    skills: ["JavaScript", "React", "Node.js"]
  }
};

// Inspect JSON
const inspection = inspectJSON(data);

// Search JSON
const search = searchJSON(data, {
  query: "React",
  searchIn: "values"
});

// Compare JSON
const differences = diffJSON(
  { name: "John", age: 20 },
  { name: "John", age: 21 }
);

// Validate JSON
const validation = validateJSON(
  '{"name": "Pranav", "age": 20}'
);

// Generate TypeScript
const types = jsonToTypescript(data, {
  rootName: "User"
});
```

## API Reference

### 1. inspectJSON(data)

Inspects JSON-compatible data and returns a nested tree representation and statistics.

```javascript
const result = inspectJSON({
  name: "Pranav",
  age: 20,
  skills: ["React", "Node.js"]
});

console.log(result.type);
console.log(result.tree);
console.log(result.stats);
```

The result includes:

- `type`: Root data type.
- `tree`: Nested representation with paths and types.
- `stats`: Counts of objects, arrays, strings, numbers, booleans, and null values.

### 2. searchJSON(data, options)

Searches nested JSON properties and values.

```javascript
const result = searchJSON(data, {
  query: "React",
  searchIn: "values",
  caseSensitive: false,
  exact: false,
  maxResults: 100
});

console.log(result.matches);
```

Options:

| Option | Description | Default |
|---|---|---|
| query | Search string | Required |
| searchIn | keys, values, both | both |
| caseSensitive | Case-sensitive search | false |
| exact | Exact matching | false |
| type | Data type filter | All |
| maxResults | Maximum matches | Infinity |

Each match contains its JSON path, key, value, type, and matched location.

### 3. diffJSON(oldData, newData)

Compares two JSON-compatible values recursively.

```javascript
const result = diffJSON(
  {
    name: "Pranav",
    age: 20,
    city: "Pune"
  },
  {
    name: "Pranav",
    age: 21,
    country: "India"
  }
);

console.log(result.summary);
console.log(result.changes);
```

Change types:

- `added`
- `removed`
- `modified`

Arrays are compared by index.

The summary also includes the number of unchanged primitive values encountered during comparison.

### 4. validateJSON(input, options)

Validates JSON syntax and optionally checks a supported JSON Schema subset.

**Syntax validation**

```javascript
const result = validateJSON(
  '{"name": "Pranav"}'
);

console.log(result.valid);
console.log(result.errors);
```

**Schema validation**

```javascript
const result = validateJSON(
  {
    name: "Pranav",
    age: 20
  },
  {
    schema: {
      type: "object",
      required: ["name", "age"],
      properties: {
        name: {
          type: "string"
        },
        age: {
          type: "number",
          minimum: 18
        }
      }
    }
  }
);

console.log(result.valid);
```

Supported schema keywords:

- `type`
- `required`
- `properties`
- `items`
- `additionalProperties`
- `minimum`
- `maximum`
- `minLength`
- `maxLength`
- `minItems`
- `maxItems`
- `enum`

**Note:** This is a custom subset of JSON Schema, not a complete JSON Schema implementation.

### 5. jsonToTypescript(data, options)

Generates TypeScript interfaces from JSON-compatible data.

```javascript
const types = jsonToTypescript(
  {
    user: {
      name: "Pranav",
      age: 20,
      skills: ["React", "Node.js"]
    }
  },
  {
    rootName: "User",
    exportTypes: true,
    indent: 2
  }
);

console.log(types);
```

Options:

| Option | Description | Default |
|---|---|---|
| rootName | Root interface name | Root |
| exportTypes | Export generated types | true |
| optionalProperties | Explicit optional property paths | [] |
| indent | Indentation spaces | 2 |

Properties missing from some objects in an array are automatically marked optional.

Empty arrays generate `unknown[]`.

## TypeScript Support

JSON Inspector Pro is implemented in JavaScript and includes TypeScript declaration files.

TypeScript users get type information and editor autocomplete without needing to install additional type packages.

```typescript
import {
  inspectJSON,
  searchJSON,
  diffJSON,
  validateJSON,
  jsonToTypescript
} from "json-inspector-pro";
```

## Error Handling

Invalid inputs and unsupported options may throw JavaScript errors such as `TypeError` and `RangeError`.

Syntax errors passed to `validateJSON()` are returned through the `errors` array.

## Project Status

JSON Inspector Pro is currently in its initial beta release.

The API and feature set may evolve as the project receives testing and feedback.

## Contributing

Contributions, bug reports, feature requests, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Add tests.
5. Submit a pull request.

## License

MIT License.

See the LICENSE file for details.
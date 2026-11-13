
# Getting Started

## Installation

```bash
npm install json-inspector-pro
```

## Importing

```javascript
import {
  inspectJSON,
  searchJSON,
  diffJSON,
  validateJSON,
  jsonToTypescript
} from "json-inspector-pro";
```

## Basic Example

```javascript
const data = {
  name: "Pranav",
  age: 20,
  skills: ["JavaScript", "React"]
};

const result = inspectJSON(data);

console.log(result.stats);
```

## Available Methods

| Method | Purpose |
|---|---|
| inspectJSON | Inspect nested JSON |
| searchJSON | Search JSON properties |
| diffJSON | Compare JSON values |
| validateJSON | Validate JSON and supported schemas |
| jsonToTypescript | Generate TypeScript declarations |

See the package README for complete API documentation.
```

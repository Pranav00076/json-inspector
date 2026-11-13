import {
  searchJSON
} from "../packages/core/src/index.js";

const data = {
  company: "OpenAI",
  employees: [
    { name: "Alice", role: "Developer" },
    { name: "Bob", role: "Designer" },
    { name: "Charlie", role: "Developer" }
  ]
};

const result = searchJSON(data, {
  query: "Developer",
  searchIn: "values"
});

console.dir(result, { depth: null });
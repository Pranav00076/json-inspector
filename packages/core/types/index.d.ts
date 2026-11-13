
export type JSONPrimitive =
  | string
  | number
  | boolean
  | null;

export type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface InspectionNode {
  path: string;
  type: string;
  depth: number;
  value: JSONValue;
  keys?: number;
  length?: number;
  children?: InspectionNode[];
}

export interface JSONStats {
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  total: number;
}

export interface InspectionResult {
  type: string;
  tree: InspectionNode;
  stats: JSONStats;
}

export type JSONType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null";

export type SearchLocation = "keys" | "values" | "both";

export interface SearchOptions {
  query: string;
  searchIn?: SearchLocation;
  caseSensitive?: boolean;
  exact?: boolean;
  type?: JSONType;
  maxResults?: number;
}

export interface SearchMatch {
  path: string;
  key: string | null;
  value: JSONValue;
  type: JSONType;
  matchedIn: Array<"key" | "value">;
}

export interface SearchResult {
  query: string;
  count: number;
  matches: SearchMatch[];
}

export function inspectJSON(
  data: JSONValue
): InspectionResult;

export function searchJSON(
  data: JSONValue,
  options: SearchOptions
): SearchResult;



export type DiffType =
  | "added"
  | "removed"
  | "modified";

export interface DiffChange {
  path: string;
  type: DiffType;
  oldValue?: JSONValue;
  newValue?: JSONValue;
  oldType?: JSONType;
  newType?: JSONType;
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export interface DiffResult {
  count: number;
  summary: DiffSummary;
  changes: DiffChange[];
}

export function diffJSON(
  oldData: JSONValue,
  newData: JSONValue
): DiffResult;


export type ValidationError = {
  path: string;
  keyword: string;
  message: string;
};

export type JSONSchemaType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null";

export interface JSONSchema {
  type?: JSONSchemaType | JSONSchemaType[];
  required?: string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  additionalProperties?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  enum?: JSONValue[];
}

export interface ValidationOptions {
  schema?: JSONSchema;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data: JSONValue | undefined;
}

export function validateJSON(
  input: string | JSONValue,
  options?: ValidationOptions
): ValidationResult;



export interface TypeScriptGeneratorOptions {
  rootName?: string;
  exportTypes?: boolean;
  optionalProperties?: string[];
  indent?: number;
}

export function jsonToTypescript(
  data: JSONValue,
  options?: TypeScriptGeneratorOptions
): string;

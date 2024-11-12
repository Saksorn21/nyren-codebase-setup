export const typescriptReservedWords = [
  "abstract", "any", "as", "asserts", "boolean", "break", "case", "catch", "class", "const",
  "constructor", "continue", "debugger", "default", "delete", "do", "else", "enum", "export",
  "extends", "false", "finally", "for", "from", "function", "get", "if", "implements", "import",
  "in", "instanceof", "interface", "let", "module", "namespace", "new", "null", "number", "of",
  "package", "private", "protected", "public", "readonly", "require", "return", "set", "static",
  "super", "switch", "symbol", "this", "throw", "try", "type", "typeof", "undefined", "unique",
  "var", "void", "while", "with", "yield"
];


// And the keywords

export const javascriptAdditionalKeywords = [
  "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "default", "return", 
  "try", "catch", "finally", "throw", "new", "this", "super", "instanceof", "typeof", 
  "void", "delete", "in", "of", "yield", "async", "await", "import", "export", "const", "let", 
  "class", "extends", "function", "var", "null", "true", "false", "instanceof", "debugger", 
  "with", "eval", "arguments", "private", "protected", "public", "static", "super"
];
export const javascriptES6AndBeyondKeywords = [
  "const", "let", "class", "extends", "import", "export", "super", "yield", "default", "function*",
  "async", "await", "promise", "symbol"
];
const keywordTypes = [...javascriptAdditionalKeywords]

const set: Set<string> = new Set<string>()
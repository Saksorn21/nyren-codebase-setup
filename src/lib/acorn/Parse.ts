import kw from './schema-keywordType.js'
class SourcePosition {
  constructor(public line: number, public column: number) {}
}

class SourceLocation {
  constructor(public start: SourcePosition, public end: SourcePosition) {}
}

class TokenType {
  constructor(public label: string, public keyword: string = '') {}
}

class Token {
  constructor(
      public type: TokenType,
      public value: string,
      public start: number,
      public end: number,
      public loc: SourceLocation
  ) {}
}
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let line = 1, column = 0, start = 0;

  const isSeparator = (char: string) => /\s|,|\(|\)|{|}|\n/.test(char);
  let currentToken = '';

  for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const nextChar = input[i + 1] ?? '';

      // Handle line breaks
      if (char === '\n') {
          if (currentToken) {
              tokens.push(createToken(currentToken, start, i, line, column - currentToken.length));
              currentToken = '';
          }
          line++;
          column = 0;
          start = i + 1;
          continue;
      }

      // Handle separators
      if (isSeparator(char)) {
          if (currentToken) {
              tokens.push(createToken(currentToken, start, i, line, column - currentToken.length));
              currentToken = '';
          }

          if (char.trim() !== '') {
              tokens.push(createToken(char, i, i + 1, line, column)); // Separator as a token
          }
          start = i + 1;
      } else {
          if (currentToken === '') start = i;
          currentToken += char;
      }

      column++;
  }

  // Add last token if it exists
  if (currentToken) {
      tokens.push(createToken(currentToken, start, input.length, line, column - currentToken.length));
  }

  return tokens;
}

function createToken(value: string, start: number, end: number, line: number, column: number): Token {
  const loc = new SourceLocation(
      new SourcePosition(line, column - (end - start)),
      new SourcePosition(line, column)
  );

  let type: TokenType;

  // Determine token type
  if (types.keywordAnyTypes.includes(value)) {
      type = new TokenType('keyword', value);
  } else if (/^["'].*["']$/.test(value)) {
      type = new TokenType('string');
  } else if (!isNaN(Number(value))) {
      type = new TokenType('number');
  } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
      type = new TokenType('identifier');
  } else {
      type = new TokenType('symbol');
  }

  return new Token(type, value, start, end, loc);
}

// Example Usage
const types = {
  keywordAnyTypes: ['const', 'let', 'function', 'return', 'if', 'else'],
};

const input = `const sum = (a, b) => a + b;`;
const tokens = tokenize(input);

console.log(JSON.stringify(tokens, null, 2));
export default class Parser {
  pos: number = 0;
  tokens: Token[] = [];
  eof: Token;

  constructor(private readonly code: string) {
    this.eof = new Token({ type: 'eof', label: 'eof', keyword: 'eof', value: null });
  }

  parse() {
    const arr = this.code.split(' ');

    for (let inCode of arr) {
      let label = '';
      let keyword: string | undefined = undefined
      let value: any = '';
      if (kw.keywordAnyTypes.includes(inCode)) {
        label = inCode;
        keyword = inCode;
        value = inCode;
      } else {
        if (!isNaN(Number(inCode))) {
          label = 'num';
          keyword = undefined
          value = Number(inCode);
        } else {
          label = 'name';
          keyword = inCode;
          value = inCode;
        }
      }
      this.tokens.push(new Token({ type: 'identifier', label, keyword, value }));
    }

    this.tokens.push(this.eof); // Append EOF token at the end
  }

  getToken() {
    this.next();
    return this.tokens[this.pos];
  }

  next() {
    if (this.pos < this.tokens.length - 1) {
      this.pos++;
    }
  }
}

const pp = Parser.prototype;
if (typeof Symbol !== 'undefined') {
  (pp as any)[Symbol.iterator] = function () {
    return {
      next: () => {
        const token = this.getToken();
        return {
          done: token.type === this.eof.type,
          value: token,
        };
      },
    };
  };
}
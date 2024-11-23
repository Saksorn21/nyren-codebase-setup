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
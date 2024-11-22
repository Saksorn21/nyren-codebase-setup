import kw from './schema-keywordType.js'
class Token {
  type: string;
  label: string;
  keyword: string | null;
  value: any;

  constructor(p: { type: string; label: string; keyword: string | null; value: any }) {
    this.type = p.type;
    this.label = p.label;
    this.keyword = p.keyword;
    this.value = p.value;
  }
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
      let keyword = null;
      let value = '';
console.log(inCode)
      if (kw.keywordAnyTypes.includes(inCode)) {
        label = inCode;
        keyword = inCode;
        value = inCode;
      } else {
        if (!isNaN(Number(inCode))) {
          label = 'num';
          keyword = null;
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
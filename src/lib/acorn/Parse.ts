import kw from './schema-keywordType.js'
class SourcePosition {
  constructor(
    public line: number,
    public column: number
  ) {}
}

class SourceLocation {
  constructor(
    public start: SourcePosition,
    public end: SourcePosition
  ) {}
}

class TokenType {
  constructor(
    public label: string,
    public keyword: string = ''
  ) {}
}

class Token {
  constructor(
    public type: TokenType,
    public value: any,
    public start: number,
    public end: number,
    public loc: SourceLocation
  ) {}
}
export default class Tokenizer {
  private position: number = 0
  private line: number = 1
  private column: number = 0

  private contextTokens: Set<string> = new Set([
    '.',
    ',',
    '=',
    '(',
    '{',
    '<',
    '>',
    '}',
    '[',
    ']',
    '${',
    ';',
    '===',
    '<=',
    '>=',
    '+=',
    '-=',
    '*=',
    '/=',
    '&&',
    '||',
  ])

  public keyword = kw.keywordAnyTypes

  constructor(private input: string) {
    this.eof = new Token(
      new TokenType('eof'),'',0,0,new SourceLocation(new SourcePosition(0,0),new SourcePosition(0,0)))
  }

  private isContextToken(value: string): boolean {
    return this.contextTokens.has(value)
  }

  private readWord(): { value: string; start: number; end: number } | null {
    let start = this.position
    let currentWord = ''

    while (this.position < this.input.length) {
      const char = this.input[this.position]
      const isSeparator = /\s|,|\(|\)|{|}|\n/.test(char)

      // Update line and column when new line is encountered
      if (char === '\n') {
        this.line++
        this.column = 0
      }

      if (isSeparator || this.isContextToken(char)) {
        if (currentWord) {
          return { value: currentWord, start, end: this.position }
        }

        if (char.trim()) {
          // Return single-character token
          this.position++ // Move position forward
          return {
            value: char,
            start,
            end: this.position,
          }
        }

        // Skip whitespace or separators
        this.position++
        start = this.position
        continue
      }

      currentWord += char
      this.position++
      this.column++
    }

    if (currentWord) {
      // Return last word at the end of input
      return { value: currentWord, start, end: this.input.length }
    }

    return null // No more tokens
  }

  private createToken(value: string, start: number, end: number): Token {
    const loc = new SourceLocation(
      new SourcePosition(this.line, this.column - (end - start)),
      new SourcePosition(this.line, this.column)
    )

    if (this.isContextToken(value)) {
      return this.readContextToken(value, start, end, loc)
    } else if (this.keyword.includes(value)) {
      return this.readKeywordToken(value, start, end, loc)
    } else if (/^["'].*["']$/.test(value)) {
      return this.readStringToken(value, start, end, loc)
    } else if (!isNaN(Number(value))) {
      return this.readNumberToken(value, start, end, loc)
    } else if (/^#\w+$/.test(value)) {
      return this.readPrivateIdentifierToken(value, start, end, loc)
    } else if (/^\/.*\/[gimsuy]*$/.test(value)) {
      return this.readRegExpToken(value, start, end, loc)
    } else if (/^`.*`$/.test(value)) {
      return this.readTemplateToken(value, start, end, loc)
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
      return this.readIdentifierToken(value, start, end, loc)
    } else {
      return this.readSymbolToken(value, start, end, loc)
    }
  }

  public getTokens(): Token[] {
    const tokens: Token[] = []

    while (this.position < this.input.length) {
      const rawToken = this.readWord()
      if (!rawToken) break
        

      const { value, start, end } = rawToken

      // Handle line breaks (if any)
      if (value === '\n') {
        this.line++
        this.column = 0
        continue
      }

      const token = this.createToken(value, start, end)
      tokens.push(token)
    }

    return tokens
  }

  public [Symbol.iterator]() {
      const tokens = this.getTokens();
      let index = 0;

      // รีเซ็ต this.position ก่อนที่จะเริ่มวนลูป
      this.position = 0;

      console.log('Tokens in iterator:', tokens); // ตรวจสอบว่ามีค่า tokens หรือไม่

      return {
          next: (): IteratorResult<Token> => {
              if (index < tokens.length) {
                  console.log(`Returning token at index ${index}:`, tokens[index]);
                  return { value: tokens[index++], done: false };
              }
              return { value: null as any, done: true };
          },
      };
  }

  private readContextToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('context', value)
    return new Token(type, value, start, end, loc)
  }

  private readKeywordToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('keyword', value)
    return new Token(type, value, start, end, loc)
  }

  private readStringToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('string')
    return new Token(type, value, start, end, loc)
  }

  private readNumberToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('num')
    let numValue: number | bigint

    if (value.endsWith('n')) {
      numValue = BigInt(value.slice(0, -1))
    } else {
      numValue = parseFloat(value)

      if (isNaN(numValue)) {
        throw new Error(`Invalid number: ${value}`)
      }
    }

    return new Token(type, numValue, start, end, loc)
  }

  private readPrivateIdentifierToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('privateId')
    return new Token(type, value, start, end, loc)
  }

  private readRegExpToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const match = /^\/(.*?)\/([gimsuy]*)$/.exec(value)
    if (!match) throw new Error(`Invalid RegExp: ${value}`)
    const type = new TokenType('regexp')
    return new Token(
      type,
      {
        pattern: match[1],
        flags: match[2],
        value: new RegExp(match[1], match[2]),
      },
      start,
      end,
      loc
    )
  }

  private readTemplateToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('template')
    return new Token(type, value, start, end, loc)
  }

  private readIdentifierToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('identifier')
    return new Token(type, value, start, end, loc)
  }

  private readSymbolToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType('symbol')
    return new Token(type, value, start, end, loc)
  }
}


// const pp = Tokenize.prototype
// if (typeof Symbol !== 'undefined') {
//   ;(pp as any)[Symbol.iterator] = function () {
//     return {
//       next: () => {
//         const token = this.getTokens()
//         return {
//           done: token.type === this.eof.type,
//           value: token,
//         }
//       },
//     }
//   }
// }

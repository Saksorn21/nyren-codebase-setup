import kw from './schema-keywordType.js'
class Position {
  constructor(
    public line: number,
    public column: number
  ) {}
}

class SourceLocation {
  constructor(
    public start: Position,
    public end: Position
  ) {}
}

class TokenType {
  constructor(
    public label: string,
    public keyword: string | undefined = undefined
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
const eof = new Token(
    new TokenType('eof', 'eof'),
    'eof',
    0,
    0,
    new SourceLocation(new Position(0, 0), new Position(0, 0))
  )
export default class Tokenizer {
  private position: number = 0
  private line: number = 1
  private startLoc: number = 0
  private endLoc: number = 0
  private lineStart: number = 0
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
 ch!: number
  public keyword = kw.keywordAnyTypes
  readonly eof: Token = eof

  constructor(private input: string) {
 this.input = String(input)
  }

  private isContextToken(value: string): boolean {
    return this.contextTokens.has(value)
  }

  private readWord(): { value: string; start: number; end: number } | null {
    let start = this.position
    let currentWord = ''
    let inString = false // ระบุว่ากำลังอ่าน string อยู่หรือไม่
    let stringDelimiter = '' // เก็บตัวแบ่ง string เช่น ' หรือ "

    while (this.position < this.input.length) {
      const char = this.input[this.position]
      this.ch = this.input.charCodeAt(this.position)
      let ch = this.input.charAt(this.position)
console.log(char, this.ch, ch)
      // ตรวจจับจุดเริ่มต้นและจุดสิ้นสุดของ string
      if ((char === '"' || char === "'" || char === '`') && !inString) {
        inString = true
        stringDelimiter = char
        currentWord += char
        this.position++
        continue
      } else if (inString && char === stringDelimiter) {
        // สิ้นสุด string
        inString = false
        currentWord += char
        this.position++
        return { value: currentWord, start, end: this.position }
      } else if (inString) {
        // ถ้ายังอยู่ใน string ให้สะสมตัวอักษร
        currentWord += char
        this.position++
        continue
      }

      // เช็คตัวแยก
      const isSeparator = /\s|,|\(|\)|{|}|\n|:|=/.test(char)

      if ((char === ':' || char === '=') && currentWord) {
        // ถ้ามีคำแล้วและเจอ : หรือ =
        return { value: currentWord, start, end: this.position }
      }

      if (isSeparator || this.isContextToken(char)) {
        
        if (currentWord) {
          return { value: currentWord, start, end: this.position }
        }
if(this.ch === 10 || this.ch === 8232 || this.ch === 8233){ ++this.line
  this.lineStart = this.position
                                      }
        if (this.ch === 13) if (this.input.charCodeAt(this.position + 1) === 10) {
          ++this.position
        }

        if(this.ch === 32 || this.ch === 160){
          this.column++
         //this.position
        }
        if (char.trim()) {
          console.log('trim',char,this.ch)
          this.position++
          return {
            value: char,
            start,
            end: this.position,
          }
        }

        this.position++
        start = this.position
        continue
      }

      currentWord += char
      this.position++
      this.column++
    }

    if (currentWord) {
      return { value: currentWord, start, end: this.input.length }
    }

    return null // No more tokens
  }

  private createToken(value: string, start: number, end: number): Token {
    const loc = new SourceLocation(
      new Position(this.line, this.column - (end - start)),
      new Position(this.line,  this.column )
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

  public nextToken(): Token {
    while (this.position < this.input.length) {
      const rawToken = this.readWord()
      if (!rawToken) break

      const { value, start, end } = rawToken
      const lineBreak = /\r\n?|\n|\u2028|\u2029/
      // Handle line breaks
      console.log(value)
      if (lineBreak.test(value)) {
        console.log('line break',value)
      //  this.line++
        this.column = 0
        continue
      }

      return this.createToken(value, start, end)
    }

    return this.eof
  }

  public getToken(): Token {
    return this.nextToken()
  }

  public [Symbol.iterator]() {
    return {
      next: (): IteratorResult<Token> => {
        const token = this.getToken()
        if (token.type.label === 'eof') {
          return { value: null as any, done: true }
        }
        return { value: token, done: false }
      },
    }
  }
  public toArray(): Token[]{
    return [...this]
  }
  private readContextToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType(value)
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

    // ตรวจสอบว่ามีเครื่องหมายคำพูดจริงหรือไม่
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      // ตัดเครื่องหมายคำพูดออก
      value = value.slice(1, -1)
    } else {
      throw new Error(`Invalid string format: ${value}`)
    }

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
    const type = new TokenType('name')
    return new Token(type, value, start, end, loc)
  }

  private readSymbolToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): Token {
    const type = new TokenType(value)
    return new Token(type, value, start, end, loc)
  }
}

// const pp = Tokenizer.prototype
// pp.toArray = () =>{ return [...this] }

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

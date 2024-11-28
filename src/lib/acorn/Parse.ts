import kw from './schema-keywordType.js'
import keywordTypes from './keywordTypes.js'
import {
  tokContexts, tokTypes as tt, TokenType, isIdentifierChar,
  isIdentifierStart,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace
} from 'acorn'
class Position {
  constructor(
    public line: number,
    public column: number
  ) { }
}

class SourceLocation {
  constructor(
    public start: Position,
    public end: Position
  ) { }
}



class Token {
  type: TokenType
  value: any
  start: number
  end: number
  loc: SourceLocation
  constructor(p: {
    type: TokenType
    value: any
    start: number
    end: number
    startLoc: Position
    endLoc: Position
  },
  ) {
    this.type = p.type
    this.value = p.value
    this.start = p.start
    this.end = p.end
    this.loc = new SourceLocation(p.startLoc, p.endLoc)
  }
}
const eof = { type: tt.eof, value: null, start: 0, end: 0, }

const lineBreak = /\r\n?|\n|\u2028|\u2029/
const lineBreakG = new RegExp(lineBreak.source, 'g')
const isNewline = (code: string) => lineBreak.test(code)
export default class Tokenizer {
  private pos: number = 0
  curLine: number = 1
  type!: TokenType
  value: any
  start: number
  end: number
  startLoc: Position
  endLoc: Position
  lineStart: number = 0
  column: number = 0
  ch!: number
  public keyword = kw.keywordAnyTypes
  readonly eof: Token = new Token({
    type: tt.eof,
    value: 'eof',
    start: 0,
    end: 0,
    startLoc: new Position(0, 0),
    endLoc: new Position(0, 0)
  })
  context: tokContexts = tokContexts.none
  containsEsc: boolean
  options: { ecmaVersion: number }
  constructor(private input: string) {

    this.input = String(input)
    this.start = this.end = this.pos
    this.startLoc = this.endLoc = this.curPosition()
    this.context = this.initialContext()
    this.containsEsc = false
    this.options = { ecmaVersion: 12 }
  }

  private isContextToken(value: string): boolean {
    return this.contextTokens.has(value)
  }
  readWord1(): string {
    this.containsEsc = false
    let word = ""
    let first = true
    let chunkStart = this.pos
    let astral = this.options.ecmaVersion >= 6

    while (this.pos < this.input.length) {
      let ch = this.fullCharCodeAtPos()
      
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2
      } else if (ch === 92) { // "\\"
        this.containsEsc = true
        word += this.input.slice(chunkStart, this.pos)
        
        if (this.input.charCodeAt(++this.pos) !== 117) { // "u"
          ++this.pos // ข้ามตัวที่ไม่ใช่ Unicode escape sequence
          continue
        }
        ++this.pos
        let esc = this.readCodePoint()
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
          continue // ข้ามตัวที่ไม่ใช่ valid identifier character
        }
        word += codePointToString(esc)
        chunkStart = this.pos
      } else {
        break
      }
      first = false
    }

    return word + this.input.slice(chunkStart, this.pos)
  }
  private readWord() {
    let word = this.readWord1()
    
    let type = tt.name
    if (this.keyword.includes(word)) {
      type = keywordTypes.get(word)
      
    }
    console.log(word)
    return this.finishToken(type, word)
  }
  readToken(code: number) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    console.log(code)
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      return this.readWord()

    return this.getTokenFromCode(code)
  }
  private curPosition() {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
  getTokenFromCode(code: number) {
    
    switch (code) {
        
      case 46: // '.'
        return this.readToken_dot()

      case 40: ++this.pos; return this.finishToken(tt.parenL)
      case 41: ++this.pos; return this.finishToken(tt.parenR)
      case 59: ++this.pos; return this.finishToken(tt.semi)
      case 44: ++this.pos; return this.finishToken(tt.comma)
      case 91: ++this.pos; return this.finishToken(tt.bracketL)
      case 93: ++this.pos; return this.finishToken(tt.bracketR)
      case 123: ++this.pos; return this.finishToken(tt.braceL)
      case 125: ++this.pos; return this.finishToken(tt.braceR)
      case 58: ++this.pos; return this.finishToken(tt.colon)

        case 34: case 39: // '"', "'"
        
        return this.readString(code)

      case 47: // '/'
        return this.readToken_slash()
      case 61: case 33: // '=!'
        return this.readToken_eq_excl(code)
      default:
        ++this.pos
        return this.finishToken(tt.name, this.readWord1())
    }

  }
  readCodePoint(): number {
    let ch = this.input.charCodeAt(this.pos)
    let code: number

    if (ch === 123) { // '{'
      let codePos = ++this.pos
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos)
      ++this.pos
      if (code > 0x10FFFF) return 0 // กำหนดค่าเริ่มต้นเมื่อเกินขอบเขต
    } else {
      code = this.readHexChar(4)
    }
    return code
  }

  readHexChar(len: number): number {

    let n = this.readInt(16, len)
    return n ?? 0 // กำหนดค่าเริ่มต้นเป็น 0 หากไม่มีค่า
  }

  readInt(radix: number, len?: number): number | null {
    const allowSeparators = this.options.ecmaVersion >= 12 && len === undefined

    let start = this.pos
    let total = 0
    let lastCode = 0

    for (let i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
      let code = this.input.charCodeAt(this.pos)
      let val: number

      if (allowSeparators && code === 95) { // ข้าม `_` ที่เป็น separator
        lastCode = code
        continue
      }

      if (code >= 97) val = code - 97 + 10 // a
      else if (code >= 65) val = code - 65 + 10 // A
      else if (code >= 48 && code <= 57) val = code - 48 // 0-9
      else val = Infinity
      if (val >= radix) break

      lastCode = code
      total = total * radix + val
    }

    if (this.pos === start || (len != null && this.pos - start !== len)) return null
    return total
  }

  private finishToken(type: TokenType, val?: string | number | object) {
    this.end = this.pos
    this.endLoc = this.curPosition()
    this.type = type
    this.value = val
  }

  public nextToken() {
    let curContext = this.curContext()
    if (!curContext || !curContext.preserveSpace) this.skipSpace()
    this.start = this.pos
    this.startLoc = this.curPosition()
    if (this.pos >= this.input.length) {
      return this.finishToken(tt.eof)
    }
     this.readToken(this.fullCharCodeAtPos())
  }

  public getToken() {
    this.nextToken()
    return new Token(this)
  }

  public [Symbol.iterator]() {
    return {
      next: (): IteratorResult<Token> => {
        const token = this.getToken()
        if (token.type === tt.eof) {
          return { value: null as any, done: true }
        }
        return { value: token, done: false }
      },
    }
  }
  readString(quote) {
    let out = "", chunkStart = ++this.pos
    for (;;) {
      
      let ch = this.input.charCodeAt(this.pos)
      
      if (ch === quote) break
  if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos)
        out += this.readEscapedChar(false)
        chunkStart = this.pos
      } else if (ch === 0x2028 || ch === 0x2029) {
        ++this.pos
        this.curLine++
        this.lineStart = this.pos
      } else if (isNewLine(ch)) {
        ++this.pos
      } else {
        // ตัวอักษรทั่วไป
        ++this.pos
      }
    }
    out += this.input.slice(chunkStart, this.pos++)
    return this.finishToken(tt.string, out)
  }
  readToken_dot() {
    let next = this.input.charCodeAt(this.pos + 1)
    if (next >= 48 && next <= 57) return //this.readNumber(true)
    let next2 = this.input.charCodeAt(this.pos + 2)
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3
      return this.finishToken(tt.ellipsis)
    } else {
      ++this.pos
      return this.finishToken(tt.dot)
    }
  }

  readToken_slash() { // '/'
    let next = this.input.charCodeAt(this.pos + 1)
    //if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.slash, 1)
  }

  readToken_eq_excl(code) { // '=!'
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2)
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2
      return this.finishToken(tt.arrow)
    }
    return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1)
  }
  finishOp(type, size) {
    let str = this.input.slice(this.pos, this.pos + size)
    this.pos += size
    return this.finishToken(type, str)
  }
  public toArray(): Token[] {
    return [...this]
  }
  readEscapedChar(inTemplate) {
    let ch = this.input.charCodeAt(++this.pos)
    ++this.pos
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos // '\r\n'
    case 10: // ' \n'

      return ""
    case 56:
    case 57:
      if (inTemplate) {
        const codePos = this.pos - 1

        
      }
    default:
      if (ch >= 48 && ch <= 55) {
        let octalStr = this.input.substring(this.pos - 1, 3).match(/^[0-7]+/)?.[0]
        let octal = parseInt(octalStr, 8)
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1)
          octal = parseInt(octalStr, 8)
        }
        this.pos += octalStr.length - 1
        ch = this.input.charCodeAt(this.pos)
        
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
this.lineStart = this.pos; ++this.curLine 
        return ""
      }
      return String.fromCharCode(ch)
    }
  }

  skipBlockComment() {
    
    let start = this.pos, end = this.input.indexOf("*/", this.pos += 2)
    
    this.pos = end + 2

      for (let nextBreak, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
        ++this.curLine
        pos = this.lineStart = nextBreak
      }
    
  }

  skipLineComment (startSkip) {
    
    let ch = this.input.charCodeAt(this.pos += startSkip)
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos)
    }
    
  }
  initialContext () {
    return [tokContexts.b_stat]
  }
  
  curContext () {
    return this.context[this.context.length - 1]
  }
  skipSpace() {
    loop: while (this.pos < this.input.length) {
      let ch = this.input.charCodeAt(this.pos)
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos
        }
      case 10: case 8232: case 8233:
        ++this.pos
        
          ++this.curLine
          this.lineStart = this.pos
        
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment()
          break
        case 47:
          this.skipLineComment(2)
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos
        } else {
          break loop
        }
      }
    }
  }

  private readContextToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {
    console.log('Punctuation', value)

    return this.finishToken(value, value)
  }

  private readKeywordToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {
    let type = keywordTypes.get(value)


    return this.finishToken(type, value)
  }

  private readStringToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {


    // ตรวจสอบว่ามีเครื่องหมายคำพูดจริงหรือไม่
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      // ตัดเครื่องหมายคำพูดออก
      // value = value.slice(1, -1)
    } else {
      throw new Error(`Invalid string format: ${value}`)
    }

    return this.finishToken(types.name, value)
  }

  private readNumberToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {

    let numValue: number | bigint

    if (value.endsWith('n')) {
      numValue = BigInt(value.slice(0, -1))
    } else {
      numValue = parseFloat(value)

      if (isNaN(numValue)) {
        throw new Error(`Invalid number: ${value}`)
      }
    }

    return this.finishToken(types.num, numValue)
  }

  private readPrivateIdentifierToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {

    return this.finishToken(types.privateId, value)
  }

  private readRegExpToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {
    const match = /^\/(.*?)\/([gimsuy]*)$/.exec(value)
    if (!match) throw new Error(`Invalid RegExp: ${value}`)

    const val = {
      pattern: match[1],
      flags: match[2],
      value: new RegExp(match[1], match[2]),
    }
    return this.finishToken(types.regexp, val)
  }

  private readTemplateToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {

    return this.finishToken(types.template, value)
  }

  private readIdentifierToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {

    return this.finishToken(types.name, value)
  }

  private readSymbolToken(
    value: string,
    start: number,
    end: number,
    loc: SourceLocation
  ): void {
    const type = new TokenType(value)
    return this.finishToken(value, value)
  }
  fullCharCodeAtPos() {
    let code = this.input.charCodeAt(this.pos)
    if (code <= 0xd7ff || code >= 0xdc00) return code
    let next = this.input.charCodeAt(this.pos + 1)
    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  }

}
export function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code)
  code -= 0x10000
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}
function nextLineBreak(code, from, end = code.length) {
  for (let i = from; i < end; i++) {
    let next = code.charCodeAt(i)
    if (isNewLine(next))
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1
  }
  return -1
}
const pp: any = Tokenizer.prototype
pp.readPunctuator = function(code: any) {
  let next = this.input.charCodeAt(this.pos + 1)
  switch (code) {
    case 40: return this.finishToken(tt.parenL)
    case 41: return this.finishToken(tt.parenR)
    case 59: return this.finishToken(tt.semi)
    case 44: return this.finishToken(tt.comma)
    case 91: return this.finishToken(tt.bracketL)
    case 93: return this.finishToken(tt.bracketR)
    case 123: return this.finishToken(tt.braceL)
    case 125: return this.finishToken(tt.braceR)
    case 58: return this.finishToken(tt.colon)
    case 46: return this.finishToken(tt.dot)
    case 61: case 33:
      if (next === 62) {
        return this.finishToken(tt.arrow)
      }
      else return this.finishToken(tt.eq)
    default:
      return
    // case 34: case 39: // '"', "'"
    // return this.readStringToken(code)
  }
}


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

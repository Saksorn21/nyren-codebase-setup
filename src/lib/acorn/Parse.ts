import kw from './schema-keywordType.js'
import keywordTypes from './keywordTypes.js'
import {
  tokContexts as types,TokContext, tokTypes as tt, TokenType, isIdentifierChar,
  isIdentifierStart,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace,
  type Options
} from 'acorn'
import {getOptions} from './options.js'
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
  inTemplateElement: boolean = false
  context: types 
  containsEsc: boolean
  options: { ecmaVersion: number }
  lastTokEndLoc: Position | null
  lastTokStartLoc: Position | null
  lastTokStart: number 
  lastTokEnd: number
  constructor(private input: string,opts: Options) {

    this.input = String(input)
    this.start = this.end = this.pos
    this.startLoc = this.endLoc = this.curPosition()
    this.context = this.initialContext()
    this.containsEsc = false
    this.options = opts = getOptions(opts)
    this.lastTokEndLoc = this.lastTokStartLoc = null
    this.lastTokStart = this.lastTokEnd = this.pos
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
        case 96: // '`'
        if (this.options.ecmaVersion < 6) break
        ++this.pos
        return this.finishToken(tt.backQuote)
        case 48: // '0'
        let next = this.input.charCodeAt(this.pos + 1)
        if (next === 120 || next === 88) return this.readRadixNumber(16) // '0x', '0X' - hex number
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) return this.readRadixNumber(8) // '0o', '0O' - octal number
          if (next === 98 || next === 66) return this.readRadixNumber(2) // '0b', '0B' - binary number
        }
        
        case 34: case 39: // '"', "'"
        return this.readString(code)
        case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
        return this.readNumber(false)
      case 47: // '/'
        return this.readToken_slash()
        case 37: case 42: // '%*'
          return this.readToken_mult_modulo_exp(code)

        case 124: case 38: // '|&'
          return this.readToken_pipe_amp(code)

        case 94: // '^'
          return this.readToken_caret()

        case 43: case 45: // '+-'
          return this.readToken_plus_min(code)

        case 60: case 62: // '<>'
          return this.readToken_lt_gt(code)

        case 61: case 33: // '=!'
          return this.readToken_eq_excl(code)

        case 63: // '?'
          return this.readToken_question()

        case 126: // '~'
          return this.finishOp(tt.prefix, 1)

        case 35: // '#'
          return this.readToken_numberSign()
      default:
        ++this.pos
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
    let prevType = this.type
    this.type = type
    this.value = val

    this.updateContext(prevType)
  }
 next(){
   this.lastTokEnd = this.end
   this.lastTokStart = this.start
   this.lastTokEndLoc = this.endLoc
   this.lastTokStartLoc = this.startLoc
   this.nextToken()
 }
  public nextToken() {
    let curContext = this.curContext()
    if (!curContext || !curContext.preserveSpace) this.skipSpace()
    this.start = this.pos
    this.startLoc = this.curPosition()
    if (this.pos >= this.input.length) {
      return this.finishToken(tt.eof)
    }
    if (curContext.override) return curContext.override(this)
    else this.readToken(this.fullCharCodeAtPos())
  }

  public getToken() {
    this.next()
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
  readRadixNumber(radix: any) {
    let start = this.pos
    this.pos += 2 // 0x
    let val: any = this.readInt(radix)
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos))
      ++this.pos
    } 
    return this.finishToken(tt.num, val)
  }

  // Read an integer, octal integer, or floating-point number.

  readNumber(startsWithDot) {
    let start = this.pos
    if (!startsWithDot && this.readInt(10, undefined) === null) throw new TypeError( "Invalid number")
    let octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48
    
    let next = this.input.charCodeAt(this.pos)
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      let val = stringToBigInt(this.input.slice(start, this.pos))
      ++this.pos
      return this.finishToken(tt.num, val)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) octal = false
    if (next === 46 && !octal) { // '.'
      ++this.pos
      this.readInt(10)
      next = this.input.charCodeAt(this.pos)
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos)
      if (next === 43 || next === 45) ++this.pos // '+-'
    }


    let val = stringToNumber(this.input.slice(start, this.pos), octal)
    return this.finishToken(tt.num, val)
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
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
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
  readToken_mult_modulo_exp (code) { // '%*'
    let next = this.input.charCodeAt(this.pos + 1)
    let size = 1
    let tokentype = code === 42 ? tt.star : tt.modulo

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size
      tokentype = tt.starstar
      next = this.input.charCodeAt(this.pos + 2)
    }

    if (next === 61) return this.finishOp(tt.assign, size + 1)
    return this.finishOp(tokentype, size)
  }

readToken_pipe_amp (code) { // '|&'
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        let next2 = this.input.charCodeAt(this.pos + 2)
        if (next2 === 61) return this.finishOp(tt.assign, 3)
      }
      return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2)
    }
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1)
  }

  readToken_caret () { // '^'
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.bitwiseXOR, 1)
  }

  readToken_plus_min (code) { // '+-'
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === code) {
      if (next === 45 && !true && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3)
        this.skipSpace()
        return this.nextToken()
      }
      return this.finishOp(tt.incDec, 2)
    }
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.plusMin, 1)
  }

  readToken_lt_gt (code) { // '<>'
    let next = this.input.charCodeAt(this.pos + 1)
    let size = 1
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2
      if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1)
      return this.finishOp(tt.bitShift, size)
    }
    if (next === 33 && code === 60 && !true && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4)
      this.skipSpace()
      return this.nextToken()
    }
    if (next === 61) size = 2
    return this.finishOp(tt.relational, size)
  }

  

  readToken_question() { // '?'
    const ecmaVersion = this.options.ecmaVersion
    if (ecmaVersion >= 11) {
      let next = this.input.charCodeAt(this.pos + 1)
      if (next === 46) {
        let next2 = this.input.charCodeAt(this.pos + 2)
        if (next2 < 48 || next2 > 57) return this.finishOp(tt.questionDot, 2)
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          let next2 = this.input.charCodeAt(this.pos + 2)
          if (next2 === 61) return this.finishOp(tt.assign, 3)
        }
        return this.finishOp(tt.coalesce, 2)
      }
    }
    return this.finishOp(tt.question, 1)
  }

  readToken_numberSign () { // '#'
    const ecmaVersion = this.options.ecmaVersion
    let code = 35 // '#'
    if (ecmaVersion >= 13) {
      ++this.pos
      code = this.fullCharCodeAtPos()
      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
        return this.finishToken(tt.privateId, this.readWord1())
      }
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
    return [types.b_stat]
  }
  
  curContext () {
    return this.context[this.context.length - 1]
  }
  

  braceIsBlock(prevType) {
    let parent = this.curContext()
    if (parent === types.f_expr || parent === types.f_stat)
      return true
    if (prevType === tt.colon && (parent === types.b_stat || parent === types.b_expr))
      return !parent.isExpr

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === tt._return || prevType === tt.name && this.exprAllowed)
      return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
    if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR || prevType === tt.arrow)
      return true
    if (prevType === tt.braceL)
      return parent === types.b_stat
    if (prevType === tt._var || prevType === tt._const || prevType === tt.name)
      return false
    return !this.exprAllowed
  }

  inGeneratorContext() {
    for (let i = this.context.length - 1; i >= 1; i--) {
      let context = this.context[i]
      if (context.token === "function")
        return context.generator
    }
    return false
  }

  updateContext (prevType) {
    let update, type = this.type
    if (type.keyword && prevType === tt.dot)
      this.exprAllowed = false
    else if (update = type.updateContext)
      update.call(this, prevType)
    else
      this.exprAllowed = type.beforeExpr
  }

  // Used to handle edge cases when token context could not be inferred correctly during tokenization phase

  overrideContext(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx
    }
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

  readRegexp() {
    let escaped, inClass, start = this.pos;
    for (;;) {
      let ch = this.input.charAt(this.pos);

      if (!escaped) {
        if (ch === "[") inClass = true;
        else if (ch === "]" && inClass) inClass = false;
        else if (ch === "/" && !inClass) break;
        escaped = ch === "\\";
      } else {
        escaped = false;
      }
      ++this.pos;
    }

    let pattern = this.input.slice(start, this.pos);
    ++this.pos;
    let flagsStart = this.pos;
    let flags = this.readWord1();

    // ตรวจสอบความถูกต้องของ pattern และ flags
    let isValidPattern = isValidRegexpPattern(pattern);
    let isValidFlags = isValidRegexpFlags(flags);

    // สร้างค่า `value` หรือกำหนดเป็น `null` หากไม่ผ่านการตรวจสอบ
    let value = null;
    if (isValidPattern && isValidFlags) {
      try {
        value = new RegExp(pattern, flags); // ตรวจสอบเพิ่มเติมในกรณีที่ซับซ้อน
      } catch {
        console.warn(`Invalid regular expression: /${pattern}/${flags}`);
      }
    } else {
      console.warn(`Invalid pattern or flags: /${pattern}/${flags}`);
    }

    // คืนค่า token พร้อมข้อมูล
    return this.finishToken(tt.regexp, { pattern, flags, value });
  }
  // Reads template string tokens.
  tryReadTemplateToken() {
    this.inTemplateElement = true;

    try {
      this.readTmplToken();
    } catch {
      // หากเกิดข้อผิดพลาด ให้ใช้ readInvalidTemplateToken แทน
      this.readInvalidTemplateToken();
    }

    this.inTemplateElement = false;
  }

  readTmplToken() {
    let out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) {
        // หากถึงจุดสิ้นสุดของ input โดยไม่มีการปิด template
        return this.finishToken(tt.invalidTemplate, out + this.input.slice(chunkStart));
      }

      let ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || (ch === 36 && this.input.charCodeAt(this.pos + 1) === 123)) { // '`', '${'
        if (this.pos === this.start && (this.type === tt.template || this.type === tt.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(tt.dollarBraceL);
          } else {
            ++this.pos;
            return this.finishToken(tt.backQuote);
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(tt.template, out);
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
          case 10:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }

        ++this.curLine;
        this.lineStart = this.pos;
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  }

  // อ่าน template token โดยไม่ตรวจสอบ escape sequences และหลีกเลี่ยง error
  readInvalidTemplateToken() {
    let chunkStart = this.start;

    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
        case "\\":
          ++this.pos; // ข้ามตัวถัดไป
          break;

        case "$":
          if (this.input[this.pos + 1] !== "{") break;
          // fall through
        case "`":
          return this.finishToken(tt.invalidTemplate, this.input.slice(chunkStart, this.pos));

        case "\r":
          if (this.input[this.pos + 1] === "\n") ++this.pos;
          // fall through
        case "\n": case "\u2028": case "\u2029":
          ++this.curLine;
          this.lineStart = this.pos + 1;
          break;
      }
    }

    // หากอ่านจนหมด input โดยไม่มีการปิด
    return this.finishToken(tt.invalidTemplate, this.input.slice(chunkStart));
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
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8)
  }

  // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  return parseFloat(str.replace(/_/g, ""))
}

  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8)
    }

    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
    return parseFloat(str.replace(/_/g, ""))
  }

function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null
    }

    // `BigInt(value)` throws syntax error if the string contains numeric separators.
    return BigInt(str.replace(/_/g, ""))
  }
function isValidRegexpPattern(pattern) {
  // ตรวจสอบว่ามีอักขระที่ปิดไม่สมบูรณ์ เช่น [ หรือ ( ไม่มีคู่ปิด
  let unmatchedBrackets = /[\[\](){}]/.test(pattern) &&
                          (pattern.split("[").length !== pattern.split("]").length ||
                           pattern.split("(").length !== pattern.split(")").length ||
                           pattern.split("{").length !== pattern.split("}").length);

  // ตรวจสอบว่ามี escape sequence (\) ที่ผิด
  let invalidEscape = /\\[^bBdDwWsS0-9]/.test(pattern);

  return !unmatchedBrackets && !invalidEscape;
}
function isValidRegexpFlags(flags) {
  // ตรวจสอบว่า flags ประกอบด้วยอักขระที่อนุญาตเท่านั้น (g, i, m, s, u, y)
  return /^[gimsuy]*$/.test(flags) && new Set(flags).size === flags.length;
}
const pp: any = Tokenizer.prototype

tt.parenR.updateContext = tt.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true
    return
  }
  let out = this.context.pop()
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop()
  }
  this.exprAllowed = !out.isExpr
}

tt.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr)
  this.exprAllowed = true
}

tt.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl)
  this.exprAllowed = true
}

tt.parenL.updateContext = function(prevType) {
  let statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while
  this.context.push(statementParens ? types.p_stat : types.p_expr)
  this.exprAllowed = true
}

tt.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
}

tt._function.updateContext = tt._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== tt._else &&
      !(prevType === tt.semi && this.curContext() !== types.p_stat) &&
      !(prevType === tt._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat))
    this.context.push(types.f_expr)
  else
    this.context.push(types.f_stat)
  this.exprAllowed = false
}

tt.colon.updateContext = function() {
  if (this.curContext().token === "function") this.context.pop()
  this.exprAllowed = true
}

tt.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    this.context.pop()
  else
    this.context.push(types.q_tmpl)
  this.exprAllowed = false
}

tt.star.updateContext = function(prevType) {
  if (prevType === tt._function) {
    let index = this.context.length - 1
    if (this.context[index] === types.f_expr)
      this.context[index] = types.f_expr_gen
    else
      this.context[index] = types.f_gen
  }
  this.exprAllowed = true
}

tt.name.updateContext = function(prevType) {
  let allowed = false
  if (this.options.ecmaVersion >= 6 && prevType !== tt.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      allowed = true
  }
  this.exprAllowed = allowed
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

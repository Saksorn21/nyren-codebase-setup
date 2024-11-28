import Tokenizer from './Parse.js'
import kw from './schema-keywordType.js'
import keywordTypes from './keywordTypes.js'
import { Parser, tokContexts, tokTypes as tt , TokenType , isIdentifierChar,
         isIdentifierStart,
         isNewLine,
         lineBreak,
         lineBreakG,
         nonASCIIwhitespace
} from 'acorn'
const { isIdentifierChar,
     isIdentifierStart,
     isNewLine,
     lineBreak,
     lineBreakG,
     nonASCIIwhitespace } = Parser.acorn
class ParseCharCodeAt{
  input: string
  pos: number
  ch: number
  constructor(code: string) {
    this.input = String(code)
    this.pos = this.ch = 0
  }
  parse(ch: number, pos: number){
    this.ch = this.input.charCodeAt(pos)
    this.pos = pos
  }
  readWord1(){
    while (this.pos < this.input.length) {
       ;
    }
    

}
const pp: any = Tokenizer.prototype

pp.readPunctuator = function(code: any){
  
  switch (code){
      case 40: ++this.pos; return this.finishToken(tt.parenL)
      case 41: ++this.pos; return this.finishToken(tt.parenR)
      case 59: ++this.pos; return this.finishToken(tt.semi)
      case 44: ++this.pos; return this.finishToken(tt.comma)
      case 91: ++this.pos; return this.finishToken(tt.bracketL)
      case 93: ++this.pos; return this.finishToken(tt.bracketR)
      case 123: ++this.pos; return this.finishToken(tt.braceL)
      case 125: ++this.pos; return this.finishToken(tt.braceR)
      case 58: ++this.pos; return this.finishToken(tt.colon)
  }
  const type = tt.punctuator[value]
  if (type) {
    this.pos++
    return this.finishToken(type, ch)
  }
  return this.finishToken(tt.eof, ch)
}
import { Token,tokContexts, tokTypes  } from 'acorn'
import type { Position } from 'acorn'
import ColorizeSyntax, { type KeywordType} from '../ColorizeSyntax.js'
import kwTypes  from '../keywordTypes.js'
import utils from '../../utils/main.js'

/**
 *@ interface SyntaxHighlight 
 *@ dscription - Acorn's Token class doesn't have a property value, so we need to create one.
 * of acorn Token {
type: TokenType
start: number
end: number
loc?: SourceLocation
range?: [number, number]
}
 */
interface CustomRegExp {
  pattern: string
  flags: string
  value: RegExp
}
interface CustomToken extends Token {
  value: string | CustomRegExp 
}
//const taxi = utils.taxi
class Labels {
  static formatEscapes(str: String) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\x08/g, '\\b')
      .replace(/\f/g, '\\f')
  }
  //acorn changes \r to \n , requires replaceCR and revertCR functions.
  static revertCR(tokenValue: string) {
    return typeof tokenValue === 'string'
      ? tokenValue.replace(/\[CR\]/g, '\r')
      : tokenValue
  }
  static replaceCR(code: string) {
    return code.replace(/\r/g, '[CR]')
  }

  public readonly controlCharRe: RegExp = /[\x0A\x0D\x09\x0C\x08]/ // \x0A = \n, \x0D = \r, \x09 = \t, \x0C = \f, \x08 = backspac
  private kwTypes: typeof kwTypes = kwTypes
  prevToken: CustomToken | null
  nextToken: CustomToken | null
  result!: CustomToken[] 
  constructor(private readonly tok: CustomToken[]) {
    this.result = []
    this.prevToken = null
    this.nextToken = null
    
  }
  build() {
    let currentLine = 1
    let currentColumn = 0
    let keysword = [...kwTypes.getKeys()]
    const keywordType = this.kwTypes.emit()
    let isCustomtolen = false
console.log(utils.color.red('build'))
    this.tok.forEach((token: CustomToken, index: number) => {
      const cloneToken = utils.clone(token)
      this.nextToken = this.tok[index + 1] || null
      const parse = new ParseLabels(cloneToken, this.nextToken, this.prevToken)
      switch (token.type.label) {
        case 'name':
          if(typeof token.value === 'string'){
                    if (!token.type.keyword && keysword.includes(token.value)){
                      this.result.push(parse.normalizedKeyword(token.value))
              }else {
                if (this.prevToken){ 
                        if (this.prevToken.value === '('){
                          this.result.push(parse.keywordUndefined('property'))
      }
                                         }
                      this.result.push(parse.keywordUndefined('variable'))

           }   
          }
          else this.result.push(parse.property('property'))
          console.log(utils.color.white('parse: name'))
          break
        case 'num':
          console.log(utils.color.white('parse: num'))
          break
        case 'string':
          console.log(utils.color.white('parse: string'))
          break
        case 'template':
          break
        case 'regexp':
          //value ? pattern flags value | string | undefined
          console.log(utils.color.white('parse: regexp'))
          break
        case 'privateId': case 'privateldentifier':
          console.log(utils.color.white('parse: privateId'))
          break
        case 'eof':  //End of File
          console.log(utils.color.white('parse: eof'))
          break
        default:
          console.log(utils.color.white('parse: default'))
          
          if(token.value !== undefined){
            if(typeof token.value === 'string'){
              if(keywordType[token.value]){ this.result.push(parse.normalizedKeyword(token.value))
                                    }
              if (!token.type.keyword && keysword.includes(token.value)){
                this.result.push(parse.keywordUndefined(token.value))
        }else{
                
        }
    }
          }else{
            console.log(utils.color.white.dim('parse: value undefined'))
            this.result.push(parse.valueUndefined('operator'))
          }
          break
      }
      this.prevToken = token
    })
  }
  public on(keyword: string, label?: string) {
    const bus = taxi.on('label:' + keyword, me => {})
  }
  
}
class ParseLabels {
  value: string | CustomRegExp | undefined
  kw: string | undefined 
  label: string
  constructor(
    private tok: CustomToken,
    private readonly prevToken: CustomToken,
  private readonly nextToken: CustomToken , ) {
    this.kw = this.tok.type.keyword
    this.label = this.tok.type.label
    this.value = this.tok.value
  }
  property(k: string){
    if (this.prevToken.value === '('){

    this.tok.type.label = k
      }
    return this.tok
  }
  normalizedKeyword(k: string){
    if (this.kw !== k) this.tok.type.keyword = k as string
    if(this.label !== k) {
      this.tok.type.label = k as string
      
    }
    return this.tok
  }
  keywordUndefined(keyword: KeywordType){
    if (this.kw === undefined) {
      this.tok.type.keyword = keyword as string
      }
    return this.tok
  }
  valueUndefined(keyword: KeywordType) {
    if (this.value === undefined) {
      if(this.kw === undefined){
        this.tok.type.keyword = keyword as string
      }
      this.tok.value = this.tok.type.label 
     } 
    return this.tok
  }
}
export default Labels

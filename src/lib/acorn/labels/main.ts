import type { Token, TokenType } from 'acorn'
import keywordTypes from './keywordTypes.js'
import utils from '../../utils/main.js'
interface LabelsTypes {
  [key: string]: string
}
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
const taxi = utils.taxi
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
  private kw: string | undefined
  private lb: string
  prevToken: CustomToken | null
  nextToken: CustomToken | null
  customToken!: CustomToken[] | null
  constructor(private readonly tok: CustomToken[]) {
    const { type } = this.tok
    this.kw = type.keyword
    this.lb = type.label
    this.prevToken = null
    this.nextToken = null
  }
  get keyword(): string | undefined {
    return this.kw
  }
  get label(): string {
    return this.lb
  }
  build() {
    let currentLine = 1
    let currentColumn = 0
    let keyword = [...newType.getKeysName()]

    this.tok.forEach((token: CustomToken, index: number) => {
      const cloneToken = utils.clone(token)
      this.nextToken = this.tok[index + 1] || null
      switch (token.type.label) {
        case 'name':
          break
        case 'num':
          break
        case 'string':
          break
        case 'regexp':
          //value ? pattern flags value | string | undefined
          break
        case 'privateId': case 'privateldentifier':
          break
     
        case 'eof':  //End of File
          break
        default:
          break
      }
    })
  }
  public on(keyword: string, label?: string) {
    const bus = taxi.on('label:' + keyword, me => {})
  }
}

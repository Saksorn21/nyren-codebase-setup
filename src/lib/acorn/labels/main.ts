import { Token, tokContexts, tokTypes } from 'acorn'
import type { Position } from 'acorn'
import ColorizeSyntax, { type KeywordType } from '../ColorizeSyntax.js'
import kwTypes from '../keywordTypes.js'
import utils from '../../utils/main.js'

import createDebug from 'debug'
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
type ContractType = 'data' | 'error'
export const debug = createDebug(process.env.DEBUG || 'nyren:acorn-labels')
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
  private listeners: {
    [key in ContractType]?: ((data: CustomToken[]) => void)[]
  } = {}

  private transformer: CompositeTransformer
  readonly debug: typeof debug = debug
  constructor(private readonly rawToken: CustomToken[]) {
    this.result = []
    this.prevToken = null
    this.nextToken = null
    this.transformer = new CompositeTransformer()
  }
  build() {

    debug(utils.color.white('<<<===Parses Token===>>>'))
    this.rawToken.forEach((token: CustomToken, index: number) => {
      let cloneToken = utils.clone(token)
      //   cloneToken.value = Labels.replaceCR(cloneToken.value)
      // console.log(cloneToken)
      this.discontinue(cloneToken)
      debug(utils.color.red('rawToken: ') + '%o', {
        label: token.type.label,
        keyword: token.type.keyword || null,
        value: token.value || null,
      })
      this.prevToken = this.rawToken[index - 1] || null
      this.nextToken = this.rawToken[index + 1] || null

      cloneToken = this.transformer.pasesToken(
        cloneToken,
        this.prevToken,
        this.nextToken
      )

      this.result.push(cloneToken)
    })
  }

  discontinue(token: any) {
    delete token.type.isLoop 
    delete token.type.binop
    delete token.type.prefix
    delete token.type.postfix
    delete token.type.updateContext
  }
}

import TFKeyword from './keywords.js'
import TFName from './name.js'
import TFNumbers from './numbers.js'
import TFString from './strings.js'
import TFTemplate from './template.js'
import TFBoolean from './boolean.js'
import TFPrivateId from './privateId.js'
import TFRegexp from './regexp.js'
import TFOperators from './operators.js'
class CompositeTransformer {
  private transformers: any[] = []

  constructor() {
    this.transformers.push(new TFKeyword())
    this.transformers.push(new TFName())
    this.transformers.push(new TFPrivateId())
    this.transformers.push(new TFBoolean())
    this.transformers.push(new TFNumbers())
    this.transformers.push(new TFString())
    this.transformers.push(new TFTemplate())
    this.transformers.push(new TFRegexp())
    this.transformers.push(new TFOperators())
  }

  pasesToken(
    token: CustomToken,
    prevToken: CustomToken | null,
    nextToken: CustomToken
  ): CustomToken {
    for (const transformer of this.transformers) {
      
      token = transformer.parse(token, prevToken, nextToken)
    }

    return token
  }
}

export default Labels

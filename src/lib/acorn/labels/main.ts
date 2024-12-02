import { Token, tokContexts, tokTypes } from 'acorn'
import type { Position } from 'acorn'
import ColorizeSyntax, { type KeywordType } from '../ColorizeSyntax.js'
import kwTypes from '../keywordTypes.js'
import utils from '../../utils/main.js'
import Tokenizer from '../Tokenizer.js'
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
class Labels extends Tokenizer {
  static extend(Parser: Tokenizer) {
    return this.Parser
  }
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
  prevTok: CustomToken | null
  nextTok: CustomToken | null
  result!: CustomToken[]

  private transformer: CompositeTransformer
  rawTokens: CustomToken[]
  readonly debug: typeof debug = debug
  constructor(code: string, opts: any) {
    super(code, opts)

    this.rawTokens = super.toArray()
    this.validateTokens()
    this.result = []
    this.prevTok = null
    this.nextTok = null
    this.transformer = new CompositeTransformer()
  }

  validateTokens() {
    if (!utils.isArray(this.rawTokens))
      throw new TypeError('rawTokens is not an array')
    const tokensToCheck = [
      this.rawTokens[0],
      this.rawTokens[this.rawTokens.length - 1],
    ]
    for (const token of tokensToCheck) {
      // ตรวจสอบว่ามีคีย์ 'type' ใน token หรือไม่
      if (!('type' in token)) throw new SyntaxError('Token type is not defined')

      const { type } = token

      // ตรวจสอบว่ามีคีย์ 'label' ใน type หรือไม่
      if (!('label' in type))
        throw new SyntaxError('Token type.label is not defined')
      if (!('keyword' in type))
        throw new SyntaxError('Token type.keyword is not defined')

      if (
        !(
          'value' in token &&
          'start' in token &&
          'end' in token &&
          'loc' in token
        )
      )
        throw new SyntaxError(
          'Token must have at least one of value, start, end, or loc defined'
        )
    }
  }
  build() {
    debug(utils.color.white('<<<===Parses Token===>>>'))
    this.rawTokens.forEach((token: CustomToken, index: number) => {
      let cloneToken = utils.clone(token)
      //   cloneToken.value = Labels.replaceCR(cloneToken.value)
      // console.log(cloneToken)
      this.discontinue(cloneToken)
      debug(utils.color.red('rawToken: ') + '%o', {
        label: token.type.label,
        keyword: token.type.keyword || null,
        value: token.value || null,
      })
      this.prevTok = this.rawTokens[index - 1] || null
      this.nextTok = this.rawTokens[index + 1] || null

      cloneToken = this.transformer.pasesToken(
        cloneToken,
        this.prevTok,
        this.nextTok
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

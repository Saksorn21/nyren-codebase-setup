import { Token, tokContexts, tokTypes } from 'acorn'
import type { Position } from 'acorn'
import keywordTypes from '../keywordTypes.js'
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
export interface CustomToken extends Token {
  value: string | CustomRegExp
}
export type KeywordType =
  | 'keyword'
  | 'operator'
  | 'punctuation'
  | 'constants'
  | 'comment'
  | 'string'
  | 'numbers'
  | 'boolean'
  | 'types'
  | 'typeAssertion'
  | 'variable'
  | 'property'
  | 'method'
  | 'object'
  | 'regex'
  | 'class'
  | 'interface'
  | 'typeAnnotation'

abstract class TokenTransformer {
  abstract parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken
  debug = createDebug('nyren:parse')
  transform(token: CustomToken, keyword: string): CustomToken {
    // สามารถใช้การแปลงที่เหมือนกันในหลายๆ คลาสลูก

    const value = this.valueToString(token.value)
    const kwType = keywordTypes.emit()[value]
    if (kwType && this.isKeyword(keywordTypes, value)) {
      if (token.type.label === 'class') {
        this.debug(
          this.utils.color.green('newToken: ') +
            this.utils.color.amber('keyword:') +
            `${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('Classes')}${this.utils.color.green("'")}`
        )
        return token
      } else if (token.type.keyword === undefined) {
        if (kwType.keyword === 'TsKeyword') {
          this.debug(
            this.utils.color.green('newToken: ') +
              this.utils.color.deepBlue('TSkeyword:') +
              `${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('%s')}${this.utils.color.green("'")}`,
            value
          )
          token.type.label = kwType.keyword
        } else {
          this.debug(
            this.utils.color.green('newToken: ') +
              this.utils.color.amber('keyword:') +
              `${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('%s')}${this.utils.color.green("'")}`,
            value
          )
          token.type.label = 'keyword'
        }
        token.type.keyword = kwType.label
      } else {
        if (kwType.keyword === 'TsKeyword') {
          this.debug(
            this.utils.color.green('newToken: ') +
              this.utils.color.deepBlue('TSkeyword:') +
              `${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('%s')}${this.utils.color.green("'")}`,
            value
          )
          token.type.label = kwType.keyword
        } else {
          this.debug(
            this.utils.color.green('newToken: ') +
              this.utils.color.green('keyword:') +
              `${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('%s')}${this.utils.color.green("'")}`,
            value
          )
          token.type.label = 'keyword'
        }
        token.type.keyword = kwType.label
      }
      return token
    } else {
      this.debug(
        `${this.utils.color.green('newToken:')} ${this.utils.color.lightSteelBlue.visible('%s:')} ${this.utils.color.green("'")}${this.utils.color.chalk.greenBright.bold('%s')}${this.utils.color.green("'")}`,
        keyword,
        token.value
      )

      token.type.label = keyword

      return token
    }
  }
  get utils() {
    return utils
  }
  get keywordType(): typeof keywordTypes {
    return keywordTypes
  }
  isKeyword(keywordType: typeof keywordTypes, value: string): boolean {
    return [...keywordType.getKeys()].includes(value)
  }
  isValue(token: CustomToken): boolean {
    return typeof token.value === 'string'
  }
  // แปลง token เป็น string
  valueToString(value: string | CustomRegExp): string {
    if (typeof value === 'string') return value
    else if (typeof value === 'object') return value.pattern
    else return ''
  }
}
export default TokenTransformer

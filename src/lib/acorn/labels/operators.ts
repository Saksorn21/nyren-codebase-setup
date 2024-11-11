import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'
import { tokContexts, tokTypes } from 'acorn'
const operators = [
  // Arithmetic Operators
  '+',
  '-',
  '*',
  '/',
  '%',
  '**',

  // Assignment Operators
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',

  // Comparison Operators
  '==',
  '!=',
  '===',
  '!==',
  '>',
  '<',
  '>=',
  '<=',

  // Logical Operators
  '&&',
  '||',
  '!',

  // Bitwise Operators
  '&',
  '|',
  '^',
  '~',
  '<<',
  '>>',
  '>>>',

  // Other Operators
  'typeof',
  'instanceof',
  'in',
  'delete',
  'new',
  '...',
]

const punctuation = [
  // Grouping and Accessing
  '.',
  '[',
  ']',
  '(',
  ')',
  '{',
  '}',

  // Separators
  ',',

  // Other Punctuation
  ';',
  ':',
  '?',
  '=>',
]
const booleans = ['true', 'false']
class TFOperators extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    //const context = [tokTypes, tokContexts]
    if (!token.value) {
      token.value = token.type.label
    }
    if (
      prevToken &&
      prevToken.type.label === ')' &&
      token.type.label === '=>'
    ) {
      this.transform(token, 'arrow')
    }
    if (token.value === '${') {
      this.transform(token, 'templateExpressionStart')
    }
    if (
      typeof token.value === 'string' &&
      token.type.keyword &&
      booleans.includes(token.value) &&
      booleans.includes(token.type.label) &&
      booleans.includes(token.type.keyword)
    ) {
      this.transform(token, 'boolean')
    }
    if (operators.includes(token.type.label)) {
      this.transform(token, 'operator')
    } else if (punctuation.includes(token.type.label)) {
      this.transform(token, 'punctuation')
    }

    return token
  }
}

export default TFOperators

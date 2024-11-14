import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFString extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'privateId' || token.type.label === 'privateIdentifier') {
 token.value = this.valueToString(token.value).replace(/^\./, '#')

      this.transform(token, 'privateId')
    }
    return token
  }
}

export default TFString

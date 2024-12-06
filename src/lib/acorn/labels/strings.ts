import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFString extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'string') {
      this.transform(token, 'string')
    }
    return token
  }
}

export default TFString

import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFBoolean extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'boolean') {
      if (token.value && !token.value) {
        this.transform(token, 'boolean')
      }
    }
    return token
  }
}

export default TFBoolean

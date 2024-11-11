import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFNumbers extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'num') {
      if (token.start !== 0 && token.loc?.start.column !== 0) {
        this.transform(token, 'number')
      }
    }
    return token
  }
}

export default TFNumbers

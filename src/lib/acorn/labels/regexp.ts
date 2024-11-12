import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFRegexp extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'regexp') {
      if (token.value === '${') {
        this.transform(token, 'templateExpressionStart')
      }
    }
    return token
  }
}

export default TFRegexp
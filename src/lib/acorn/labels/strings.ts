import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFString extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'string') {
      console.log(this.utils.color.red('string' + '| ' + token.value))
      if (typeof token.value === 'string') {
        token.value === "'" + token.value + "'"
      }
      this.transform(token, 'string')
    }
    return token
  }
}

export default TFString

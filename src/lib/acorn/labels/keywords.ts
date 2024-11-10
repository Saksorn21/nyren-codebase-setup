import TokenTransformer, {KeywordType, CustomToken } from './abstract.js'

class TFKeyword extends TokenTransformer {
  parse(token: CustomToken, prevToken: CustomToken, nextToken: CustomToken): CustomToken{
    if(this.isValue(token)){
    if(this.isKeyword(this.keywordType, this.valueToString(token.value))){
      
      this.transform(token, token.value)
    }
    
  }
    return token
  }
}
export default TFKeyword
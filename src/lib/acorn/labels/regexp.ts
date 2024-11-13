import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFRegexp extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'regexp') {
      console.log('regexp',token)
      if(typeof token.value !=='string'){
        //console.log('regexp',token)
        //token.value.pat.replace(/\[CR\]/g, '\r')
      //  token.value = '/' +token.value.pattern + '/' + token.value.flags
        }
      
        this.transform(token, 'regexp')
      
    }
    return token
  }
}

export default TFRegexp
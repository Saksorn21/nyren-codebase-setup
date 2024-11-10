import TokenTransformer, {KeywordType, CustomToken } from './abstract.js'

class TFTemplate extends TokenTransformer {
  parse(token: CustomToken, prevToken: CustomToken, nextToken: CustomToken): CustomToken{
    const templateDelimiters = [
      "templateStart",           // เริ่มต้นของ template literal: backtick (`)
      "templateExpressionStart",  // เริ่มต้นของ expression ใน template literal: ${
      "templateExpressionEnd",    // จบ expression ใน template literal: }
      "templateEnd"               // จบ template literal: backtick (`)
    ];
    if(token.type.label === 'template'){
      if (token.value === '${'){
        this.transform(token, 'templateExpressionStart')
      }
      }
    return token
    }
  
}

export default TFTemplate
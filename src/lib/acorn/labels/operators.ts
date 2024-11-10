import TokenTransformer, {KeywordType, CustomToken } from './abstract.js'
import { tokContexts, tokTypes  } from 'acorn'
const operators = [
  // Arithmetic Operators
  '+', '-', '*', '/', '%', '**',

  // Assignment Operators
  '=', '+=', '-=', '*=', '/=', '%=',

  // Comparison Operators
  '==', '!=', '===', '!==', '>', '<', '>=', '<=',

  // Logical Operators
  '&&', '||', '!',

  // Bitwise Operators
  '&', '|', '^', '~', '<<', '>>', '>>>',

  // Other Operators
  'typeof', 'instanceof', 'in', 'delete', 'new', '...'
];

const punctuation = [
  // Grouping and Accessing
  '.', '[', ']', '(', ')', '{', '}',

  // Separators
  ',',

  // Other Punctuation
  ';', ':', '?', '=>'
];
class TFOperators extends TokenTransformer {
  parse(token: CustomToken, prevToken: CustomToken, nextToken: CustomToken): CustomToken{
    //const context = [tokTypes, tokContexts]
if(!token.value){
  token.value = token.type.label
}
    if (token.value === '${'){
      this.transform(token, 'templateExpressionStart')
    }
    if(operators.includes(token.type.label)){
      
      this.transform(token, 'operator')
    }else if(punctuation.includes(token.type.label)){
      this.transform(token, 'punctuation')
    }
    
    return token

    }
}

export default TFOperators
import TokenTransformer, {KeywordType, CustomToken } from './abstract.js'

class TFName extends TokenTransformer {
  prevContext: string[] =['(', '[', '{', '.',',']
  nextContext: string[] = ['(', '[', '{',',', '=']
  parse(token: CustomToken, prevToken: CustomToken, nextToken: CustomToken): CustomToken{
    
    if(token.type.label === 'name'){
      
      if(prevToken){
        const { label: prevLabel } = prevToken.type
        const prevValue = this.valueToString(prevToken.value)
        console.log(this.utils.color.red('name: prevToken' + '| ' + prevToken.type.label))
      // this.transform(token, 'variable')
        if(prevLabel === 'keyword'){
          // !['const', 'class', 'var', 'let','function'].includes(prevValue)
          this.transform(token, 'variable')
        }else if(this.prevContext.includes(this.valueToString(prevToken.type.label))){
          this.transform(token, 'property')
        }else if(prevToken.type.label === ':'){
          const basicType = [
            'string',
            'number',
            'boolean',
            'symbol',
            'bigint',
            'undefined',
            'null',
            'unknown',
            'unique',
            'object',
            'string[]',
            'any',
            'any[]',
            'void',
            'never',
            'Array',
            'Function',
            'null[]',
            'boolean[]',
            'number[]',
            'symbol[]',
            'object[]',
            'unknown[]',
            'tuple',
            'record',
            'Map',
            'Set',
            'Promise',
            'Date',
            'RegExp',
          ]
          if (basicType.includes(token.value)) {
        this.transform(token, 'typeAnnotation')
   }
    }
        const { label: nextLabel } = nextToken.type
     
        
          console.log(this.utils.color.red('name: nextToken' + '| ' + nextToken.type.label))
          if(prevLabel !== ':' && this.nextContext.includes( nextToken.type.label)){
            this.transform(token, 'variable')
       }
        if(nextToken.type.label === '('){
      this.transform(token, 'method')
    }
            if(nextLabel === '.' && prevLabel === '.'){
              this.transform(token, 'property')
            }else if(nextLabel === '.'){
              this.transform(token, 'object')
            }
    
    }
  
    }
    return token
    }
  
}

export default TFName
import TokenTransformer, { KeywordType, CustomToken } from './abstract.js'

class TFName extends TokenTransformer {
  prevContext: string[] = ['(', '[', '{', '.', ',']
  nextContext: string[] = ['(', '[', '{', ',', '=']
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'name') {
      if (prevToken) {
        const { label: prevLabel } = prevToken.type

        if (prevLabel === 'keyword') {
          this.transform(token, 'variable')
        } else if (
          this.prevContext.includes(this.valueToString(prevToken.type.label))
        ) {
          if (prevLabel === '(') {
            this.transform(token, 'parameter')
          } else this.transform(token, 'property')
        } else if (prevLabel === ':') {
          this.typeAnnotation(token)
        }
        if (nextToken) {
          const { label: nextLabel } = nextToken?.type

          if (prevLabel !== ':' && this.nextContext.includes(nextLabel)) {
            this.transform(token, 'variable')
          }
          if (nextLabel === '(') {
            this.transform(token, 'method')
          }
          if (nextLabel === '.' && prevLabel === '.') {
            this.transform(token, 'property')
          } else if (nextLabel === '.') {
            this.transform(token, 'object')
          }
        }
      }
    }

    return token
  }
  typeAnnotation(token: CustomToken): void {
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
    if (basicType.includes(this.valueToString(token.value))) {
      this.transform(token, 'typeAnnotation')
    }
  }
}

export default TFName

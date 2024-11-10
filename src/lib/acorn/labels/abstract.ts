import { Token,tokContexts, tokTypes  } from 'acorn'
import type { Position } from 'acorn'
export type KeywordType = 'keyword' | 'operator' | 'punctuation' | 'constants' | 'comment' | 'string' | 'numbers' | 'boolean'| 'types' | 'typeAssertions'| 'variable' | 'property' | 'method' | 'other' | null

/**
 *@ interface SyntaxHighlight 
 *@ dscription - Acorn's Token class doesn't have a property value, so we need to create one.
 * of acorn Token {
type: TokenType
start: number
end: number
loc?: SourceLocation
range?: [number, number]
}
 */
interface CustomRegExp {
  pattern: string
  flags: string
  value: RegExp
}
interface CustomToken extends Token {
  value: string | CustomRegExp 
}
abstract class AbstractLabel {

  abstract result!: CustomToken[]
  constructor(
   private token: CustomToken,
   private readonly prevToken: CustomToken,
   private readonly nextToken: CustomToken,
  ){
    
  }
  normalized(token: Token, prevToken: Token, nextToken: Token){
    
  }
  undefined(token: Token, prevToken: Token, nextToken: Token){
    
  }
}
export default AbstractLabel
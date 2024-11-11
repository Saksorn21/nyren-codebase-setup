import TokenTransformer, {KeywordType, CustomToken } from './labels/abstract.js'
import type { Position } from 'acorn'
import Labels from './labels/main.js'
import Themes from './Themes.js'
import ColorizeSyntax from './ColorizeSyntax.js'

class HighlightSyntax {
 readonly result: Array<string> = []
  constructor(
    private readonly tokens: CustomToken[]
  ) {
    
  }
  parse(){
  this.tokens.forEach((token: CustomToken, index: number) => {
    const { label, keyword } = token.type
    const val = token.value
    let prev: CustomToken | null = null, prev2: CustomToken | null = this.tokens[index - 2]
    let next: CustomToken | null = this.tokens[index + 1], next2: CustomToken | null = this.tokens[index + 2]
    const collectData = new ColorizeSyntax(new Themes(), [])
    let currentLine = 1, currentColumn = 0

    const { line: startLine, column: startColumn } = token.loc?.start as Position
    const { line: endLine, column: endColumn } = token.loc?.end as Position

    this.whileLineAndColumn(startLine, startColumn, currentLine, currentColumn)

    let highlighted = false
    prev = token
  })

  whileLineAndColumn(startLine: number, startColumn: number, currentLine: number, currentColumn: number) {
    while (currentLine < startLine) {
      this.result.push('\n')
      currentLine++
      currentColumn = 0
    }

    while (currentColumn < startColumn) {
      this.result.push(' ')
      currentColumn++
    }
  }

}
export default HighlightSyntax
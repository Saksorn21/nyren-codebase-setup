import TokenTransformer, {
  KeywordType,
  CustomToken,
} from './labels/abstract.js'
import type { Position } from 'acorn'
import Labels from './labels/main.js'
import Themes from './Themes.js'
import ColorizeSyntax from './ColorizeSyntax.js'

class HighlightSyntax {
  readonly result: Array<string> = []
  constructor(private readonly tokens: CustomToken[]) {}
  parse() {
    const collectData = new ColorizeSyntax(new Themes(), [])
    const position = { currentLine: 1, currentColumn: 0 }
    this.tokens.forEach((token: CustomToken, index: number) => {
      const { label, keyword } = token.type
      const val = token.value
      let prev: CustomToken | null = this.tokens[index - 1],
        prev2: CustomToken | null = this.tokens[index - 2]
      let next: CustomToken | null = this.tokens[index + 1],
        next2: CustomToken | null = this.tokens[index + 2]
      let currentLine = 1
      let currentColumn = 0

      const { line: startLine, column: startColumn } = token.loc
        ?.start as Position
      const { line: endLine, column: endColumn } = token.loc?.end as Position

      // เรียกใช้ฟังก์ชัน whileLineAndColumn โดยส่งอ็อบเจกต์ position เข้าไป
      this.whileLineAndColumn(startLine, startColumn, position, collectData)
      // prev = token

      switch (label) {
        case 'keyword':
        case 'TsKeyword':
        case 'class':
          collectData.isBold = true
          collectData.on('keyword', val)
          break
        case 'variable':
        case 'name':
          if (prev.type.label === 'class') collectData.on('types', val)
          else collectData.on('variable', val)
          break
        case 'method':
          collectData.on('method', val)
          break
        case 'object':
          collectData.on('object', val)
          break
        case 'property':
          collectData.on('property', val)
          break
        case 'number':
          collectData.on('numbers', val)
          break
        case 'boolean':
          collectData.on('boolean', val)
          break
        case 'string':
          collectData.on('string', val.replace(/$/, "'").replace(/^/, "'"))
          break
        case 'operator':
          collectData.on('operator', val)
          break
        case 'punctuation':
          collectData.on('punctuation', val)
          break
        case 'constants':
          collectData.on('constants', val)
          break
        case 'typeAnnotation':
        case 'types':
          collectData.on('types', val)
          break
        default:
          collectData.on('other', val)
          break
      }

      let highlighted = false
      position.currentLine = endLine
      position.currentColumn = endColumn
      prev = token
    })
    this.result = collectData.emit()
  }
  whileLineAndColumn(
    startLine: number,
    startColumn: number,
    position: { currentLine: number; currentColumn: number },
    collectData: typeof ColorizeSyntax
  ) {
    // ตรวจสอบบรรทัดปัจจุบันกับบรรทัดที่ต้องการเริ่ม
    while (position.currentLine < startLine) {
      // this.result.push('\n');
      collectData.on('other', '\n')
      position.currentLine++
      position.currentColumn = 0
    }
    // ตรวจสอบคอลัมน์ปัจจุบันกับคอลัมน์ที่ต้องการเริ่ม
    while (position.currentColumn < startColumn) {
      // this.result.push(' ');
      collectData.on('other', ' ')
      position.currentColumn++
    }
  }
}
export default HighlightSyntax

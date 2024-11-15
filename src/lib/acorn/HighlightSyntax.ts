import TokenTransformer, {
  KeywordType,
  CustomToken,
} from './labels/abstract.js'
import type { Position } from 'acorn'
import Labels from './labels/main.js'
import Themes from './Themes.js'
import ColorizeSyntax from './ColorizeSyntax.js'

class HighlightSyntax {
   result: Array<string> = []
  constructor(private readonly tokens: CustomToken[]) {}
  parse() {
    const collectData = new ColorizeSyntax(new Themes(), [])
    const position = { currentLine: 1, currentColumn: 0 }
    this.tokens.forEach((token: CustomToken, index: number): void => {
      const { label, keyword } = token.type
      const val = typeof token.value === 'string' ? token.value : typeof token.value === 'number' ? token.value : (token.value.value as any)
      let prev: CustomToken | null = this.tokens[index - 1]

      const { line: startLine, column: startColumn } = token.loc
        ?.start as Position
      const { line: endLine, column: endColumn } = token.loc?.end as Position

      // เรียกใช้ฟังก์ชัน whileLineAndColumn โดยส่งอ็อบเจกต์ position เข้าไป
      this.whileLineAndColumn(startLine, startColumn, position, collectData)
      // prev = token
      collectData.isBold = true
      const collectMap = this.collectMap(collectData,val,prev?.type.label)

      if (collectMap.has(label)) {
        if(val === '^') return collectData.bold.on('error', val);
        
        collectMap.get(label)?.();
      } else {
        
        collectData.bold.on('other', val);
      }
      
      position.currentLine = endLine
      position.currentColumn = endColumn
      prev = token
    })
    

    this.result = collectData.emit() as Array<string>
  }
  whileLineAndColumn(
    startLine: number,
    startColumn: number,
    position: { currentLine: number; currentColumn: number },
    collectData: ColorizeSyntax
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
  collectMap(collectData: ColorizeSyntax,val: string,prevLabel: string): Map<string, ()=> void>{
    const map = new Map([
        ['keyword', () => collectData.bold.on('keyword', val)],
        ['TsKeyword', () => collectData.bold.on('keyword', val)],
        ['class', () => collectData.bold.on('keyword', val)],
        ['variable', () => prevLabel === 'class' ? collectData.on('types', val) : collectData.on('variable', val)],
        ['name', () => prevLabel === 'class' ? collectData.on('types', val) : collectData.on('variable', val)],
        ['method', () => collectData.on('method', val)],
        ['object', () => collectData.on('object', val)],
        ['property', () => collectData.on('property', val)],
        ['number', () => collectData.bold.on('TFnumber', val)], 
        // Use includes to check for color values. In the purple color section, the keywords “number” and “boolean” affect variable coloring, so the values need to be changed to TFnumber and TFboolean to prevent incorrect coloring.
        ['boolean', () => collectData.bold.on('TFboolean', val)],
        ['string', () => collectData.bold.on('string', val.replace(/$/, "'").replace(/^/, "'"))],
        ['regexp', () => collectData.on('regexp', val)],
        ['operator', () => collectData.on('operator', val)],
        ['punctuation', () => collectData.on('punctuation', val)],
        ['constants', () => collectData.on('constants', val)],
        ['typeAnnotation', () => collectData.on('types', val)],
        ['types', () => collectData.on('types', val)],
        ['privateId', () => collectData.on('privateId', val.replace(/^/, "#"))]
      ]);
    return map
  }
}
export default HighlightSyntax

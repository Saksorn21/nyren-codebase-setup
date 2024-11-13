import { colorType } from '../acorn/Themes.js'
import Themes from './Themes.js'
import TokenTransformer, {
  KeywordType,
  CustomToken,
} from './labels/abstract.js'

class ColorizeSyntax {
  readonly syntaxColorPairs = {
    keyword: colorType.purple,
    operator: colorType.lightWhite,
    punctuation: colorType.lightWhite,
    constants: colorType.malibu,
    string: colorType.green,
    numbers: colorType.whiskey,
    boolean: colorType.whiskey,
    types: colorType.chalky,
    typeAssertions: colorType.chalky,
    variable: colorType.lightWhite,
    object: colorType.lightWhite,
    property: colorType.coral,
    method: colorType.malibu,
    other: colorType.lightDark,
  } as const
  isBold: boolean = false
  constructor(
    private hexColorsTheme: Themes,
    private result: Array<string>
  ) {}
  get bold(){
    this.isBold = true
    return this
  }
  private bulidColor(
    keywordType: KeywordType,
    colorName: string = 'lightDark'
  ) {
    if (keywordType === 'other' && colorName)
      return (this.hexColorsTheme as any)[colorName]

    for (const [kw, color] of Object.entries(this.syntaxColorPairs)) {
      if (kw === keywordType) {
        if (this.isBold) return (this.hexColorsTheme as any)[color + 'B']
        else return this.hexColorsTheme[color]
      }
      continue
    }
  }
  on(keywordType: KeywordType , newResult: string, colorName?: string) {
    if (!keywordType && !newResult)
      throw new TypeError('keywordType and message is required')
    if (keywordType !== 'other' && colorName)
      throw new TypeError('no need for the 3rd parameter', {
        cause: 'need keywordType and message',
      })
    let msg = ''
    if (colorName) msg = this.bulidColor(keywordType, colorName)(newResult)
    else msg = this.bulidColor(keywordType)(newResult)
    this.isBold = false
    this.result.push(msg)
    return this
  }
  emit(need: 'string' | 'array' = 'string'): string | Array<string> {
    if (need === 'string') {
      return this.result.join('') as string
    } else {
      return this.result as Array<string>
    }
  }
}

export default ColorizeSyntax

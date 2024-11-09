import { colorType } from '../acorn/Themes.js'


export type KeywordType = 'keyword' | 'operator' | 'punctuation' | 'constants' | 'comment' | 'string' | 'numbers' | 'boolean'| 'types' | 'typeAssertions'| 'variable' | 'property' | 'method' | 'other' | null
class ColorizeSyntax {
  readonly syntaxColorPairs = {
    keyword: colorType.purple,
    operator: colorType.lightWhite,
    punctuation: colorType.lightWhite,
    constants: colorType.malibu,
    string: colorType.green,
    numbers: colorType.whiskey,
    boolean: colorType.whiskey,
    types: colorType.coral,
    typeAssertions: colorType.chalky,
    variable: colorType .lightWhite,
    propety: colorType.coral,
    method: colorType.malibu,
    other: colorType.lightDark,
  } as const
  isBold: boolean = false
  constructor(
    private colorsTheme: Themes , 
    private result: Array<string>){

    }
  private bulidColor(keywordType: KeywordType, colorName: string = 'lightDark'){

    if (keywordType === 'other' && colorName) return (this.colorsTheme as any)[colorName]

    for (const [kw, color] of Object.entries(this.syntaxColorPairs)){
if (kw === keywordType) {
  if (this.isBold) return (this.colorsTheme as any)[color + 'B']
  else return this.colorsTheme[color]
 }
      continue
    }
  }
  on(keywordType: KeywordType = null, newResult: string, colorName?: string){ 
    if(!keywordType && !newResult) throw new TypeError('keywordType and message is required')
    if (keywordType !== 'other' && colorName) throw new TypeError('no need for the 3rd parameter',  {
          cause: 'need keywordType and message', 
        })
    let msg = ''
    if(colorName) msg = this.bulidColor(keywordType, colorName)(newResult) 
   else msg = this.bulidColor(keywordType)(newResult)

    this.result.push(msg)
    return this
  }
  emit(need: 'string' | 'array' = 'string'){
    if(need === 'string') return this.result.join('')
    else return this.result
  }
}

export default ColorizeSyntax


import { colorType as ct } from '../acorn/Themes.js'
import Themes from './Themes.js'
import TokenTransformer, {
  KeywordType,
  CustomToken,
} from './labels/abstract.js'
import {
  keywordAnyTypes,
  JSKeywordTypes,
  TSKeywordTypes,
} from './schema-keywordType.js'
import matchKeywords, {
  colorType ,
  ColorType,
  defaultTheme,
  ThemeSchema,
} from './schema-theme.js'
class ColorizeSyntax {
  
  isBold: boolean = false
  constructor(
    private theme: Themes,
    private result: Array<string>
  ) {}
  get bold() {
    this.isBold = true;
    return this
  }

  on(keywordType: KeywordType, newResult: string, colorName?: string) {
    if (!keywordType && !newResult) {
      throw new TypeError('keywordType and message is required');
    }

    let msg = '';
    if (colorName) {
      msg = this.parse(keywordType, colorName)(newResult);
    } else if (colorName === 'noColor'){
      msg = newResult
    } else {
      msg = this.parse(keywordType)(newResult);
    }

    this.result.push(msg);
    return this;
  }

  parse(keyword: KeywordType, colorName?: string) {
    if (colorName || keyword === 'other') return this.theme.white;

    for (let [_color, arr] of Object.entries(matchKeywords)) {
      const color: ColorType = _color as ColorType;
      if (arr.includes(keyword)) {
        const themeColor = this.isBold ? (this.theme as any)[color + 'B'] : (this.theme as any)[color];
        if(keyword === 'error') return themeColor.overline
        this.isBold = false; // Reset `isBold` here after usage in `parse`
        return themeColor;
      }
    }

    return this.theme.error;
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

import  { Token, Parser, defaultOptions, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts, tokTypes, tokenizer, version, parse } from 'acorn'
import type { ecmaVersion, Options } from 'acorn'
//ts-no-check
import classFields from 'acorn-class-fields'
import staticClassFeatures from 'acorn-static-class-features'
import privateClassElements from 'acorn-private-class-elements'

import tsPlugin from 'acorn-typescript'

const acorn = Parser
.extend(tsPlugin())
 // .extend(classFields)
 .extend(staticClassFeatures)
// .extend(privateClassElements)
const parseCode = {
  tokenizer: (code: string, options: Options) => tokenizer(code, options),
  parse: (code: string, options: Options) => acorn.parse(code, options)
  }
export { tokTypes, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts,Token}
export type { Options , ecmaVersion}
export default parseCode

import  { Node, Parser, defaultOptions, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts, tokTypes, tokenizer, version } from 'acorn'
//ts-no-check
import classFields from 'acorn-class-fields'
import staticClassFeatures from 'acorn-static-class-features'
import privateClassElements from 'acorn-private-class-elements'
//ts-check
import tsPlugin from 'acorn-typescript'

const acorn = Parser.extend(tsPlugin() as any);
const parseCode = (code: string, options: any) => tokenizer(code, options)
export { tokTypes, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts,}
export default parseCode

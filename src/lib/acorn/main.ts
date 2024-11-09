import  { TokContext, Token, TokenType, Parser, defaultOptions, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts, tokTypes, tokenizer, version, parse } from 'acorn'
import type { ecmaVersion, Options } from 'acorn'
//ts-no-check
import {importAttributes}  from 'acorn-import-attributes'
import classFields from 'acorn-class-fields'
import staticClassFeatures from 'acorn-static-class-features'
import privateClassElements from 'acorn-private-class-elements'

import tsPlugin from 'acorn-typescript'
//import * as acorn from 'acorn'
const acorn = Parser.extend(tsPlugin({ dts: true }))
 .extend(classFields)
 .extend(staticClassFeatures)

const parseCode = {
  tokenizer: (code: string, options: Options) => acorn.tokenizer(code, options),
  parse: (code: string, options: Options) => acorn.parse(code, options)
  }
class AddKeywordTypes {
  readonly variableName: string[] = []

  keyword: Object = {}
  private newKw: Record<string, any> = {} // ใช้ Record เพื่อให้รองรับ key-value แบบ dynamic

  constructor(private keywordTypes: Record<string, any>) {
    this.newKw = { ...keywordTypes } // เริ่มต้นด้วยการก็อปข้อมูลของ keywordTypes
  }
  get(type: string) {
    return this.newKw[type]
  }
  del(type: string) {
    // ลบ key จาก newKw ถ้ามี key นี้อยู่
    if (type in this.newKw) {
      delete this.newKw[type]
    }
    return this
  }
  on(...args: [string, Record<string, any>?] | any) {
    if (Array.isArray(args[0])) {
      throw new TypeError(
        "on() only accepts individual arguments. Try: on('of', 'if', { keyword: 'TsKeyword' })",
        {
          cause: 'Array is not allowed as input', // ค่าที่ใช้เพิ่มเติม
        }
      )
    }
    let options: any =
      args[args.length - 1] && typeof args[args.length - 1] === 'object'
        ? args.pop()!
        : {} // ใช้ options หากส่งมา

    // รับค่าที่ส่งมาเป็นหลายๆ type
    args.forEach((type: string) => {
      if (!this.keywordTypes[type]) {
        options = { keyword: type, ...options }
        this.newKw[type] = new TokenType(type, options || { keyword: type })
      }
    })

    return this // รองรับ chain
  }
  emit() {
    // ส่งคืน object ที่มี keywordTypes + newKw รวมกัน
    return this.newKw
  }
  getKeys() {
    ;[this.newKw].map(kw => this.variableName.push(...Object.keys(kw)))
    return this.variableName
  }
}
export {AddKeywordTypes, tokTypes, getLineInfo, isIdentifierChar, isIdentifierStart, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parse, parseExpressionAt, tokContexts,TokContext, Token, TokenType}
export type { Options , ecmaVersion}
export default parseCode

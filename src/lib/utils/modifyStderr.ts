import process from 'node:process'
import parseCode, {
  tokTypes,
  Token,
  isNewLine,
  keywordTypes as key,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace,
  tokContexts,
  TokContext,
  TokenType,
} from '../acorn/main.js'
import { clearAnsiCodes } from './main.js'
import type { Position, SourceLocation, Options } from 'acorn'
import color from './color.js'
import clone from './clone.js'
import Teme from '../acorn/Themes.js'

const colors = new ThemeOneDarkPro()
type KeywordType = 'keyword' | 'operator' | 'punctuation' | 'constants' | 'comment' | 'string' | 'numbers' | 'boolean'| 'types' | 'typeAssertions'| 'variable' | 'property' | 'method' | 'other' | null


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
    private colorsTheme: ThemeOneDarkPro , 
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
  emit(){
    return this.result.join('')
  }
}

const EvaDark = {
  white: color.chalk.white.visible,
  whiteB: color.white.visible,
  cyan: color.chalk.hex('5fd7d7').visible, // 5fd7d7 5fafaf
  cyanB: color.chalk.cyan.bold.visible,
  blue: color.chalk.hex('6495EE').visible,
  blueB: color.hex('6495EE').visible,
  green: color.chalk.hex('98C379').visible,
  greenB: color.hex('98C379').visible,
  orange: color.chalk.hex('FF9070').visible,
  orangeB: color.hex('FF9070').visible,
  purple: color.chalk.hex('A78CFA').visible,
  purpleB: color.hex('A78CFA').visible,
  red: color.chalk.hex('f14c4c').visible,
  redB: color.hex('f14c4c').visible,
  yellow: color.chalk.hex('E4BF7F').visible,
  yellowB: color.hex('E4BF7F').visible,
  fg: color.hex('B0B7C3').visible,
  lines: color.hex('454963').visible,
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
        this.newKw[type] = new TokenType(type, options || { keyword: type }) as any
      }
    })

    return this // รองรับ chain
  }
  emit() {
    // ส่งคืน object ที่มี keywordTypes + newKw รวมกัน
    return this.newKw
  }
  getKeysName() {
    ;[this.newKw].map(kw => this.variableName.push(...Object.keys(kw)))
    return this.variableName
  }
}
const startsExpr: boolean = true
const beforeExpr: boolean = true
const newType = new AddKeywordTypes(key)
  .on('let', { startsExpr })
  .on('from')
  .on('of', { isLoop: true })
  .del('true')
  .del('false')
newType.on(
  'as',
  'implements',
  'require',
  'infer',
  'keyof',
  'is',
  'typeof',
  'instanceof',
  'extends',
  {
    keyword: 'TsKeyword', // ระบุประเภทเป็นคีย์เวิร์ดของ TypeScript
  }
)
newType.on(
  'assert',
  'asserts',
  'global',
  'keyof',
  'readonly',
  'private',
  'protected',
  'public',
  'abstract',
  'namespace',
  'declare',
  'enum',
  'interface',
  'type',
  'unique',
  'static',
  {
    keyword: 'TsKeyword',
    startsExpr,
  }
)

let keywordTypes = newType.emit()

const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    let str = data.toString().split('\n')
    let cloneData = clone(str)
    str.forEach((item: string, index: number) => {
      if (item.includes('Bun')) {
        str.splice(index, str.length)
      }
    })
    //console.log(tokTypes)
    str = str.join('\n')
    //console.log(str)

    const optionsAcorn: Options = {
      ecmaVersion: 'latest',
      // sourceType: 'module',
      locations: true,
      preserveParens: true,
      checkPrivateFields: true,
      allowHashBang: true,
      allowReserved: true,
      allowAwaitOutsideFunction: true,
      onInsertedSemicolon: (lastTokEnd: number, lastTokEndLoc) =>
        console.log(lastTokEnd, lastTokEndLoc),
    }
    const code = `
  const ppp: string = 'nyrenx'
  let sos: boolean = false
  var jan = 'jan' as string
  `

    try {

      const codeWithPlaceholders = code.replace(/\r/g, '[CR]');
      const ast = [...parseCode.tokenizer(codeWithPlaceholders, optionsAcorn)]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
     // console.log('ast',ast)

      highlightSyntax(ast)
    } catch (error: unknown) {
      console.log(error)
      cloneData.forEach((item: string, index: number) => {
        if (item.includes('^')) {
          cloneData[index] = color.red(item)
        } else if (item.includes('error')) {
          let override = cloneData[index].split('error:')
          cloneData[index] = color.red('error:') + color.grey(override.slice(1))
        } else if (item.includes('at ')) {
          cloneData[index] = atPath(item)
        } else if (item.includes('Bun')) {
          cloneData.splice(index, cloneData.length)
        }

        const override = cloneData.join('\n').split(' ')
        override.forEach((item: string, index: number) => {
          if (keywordTypes[item]) {
            override[index] = color.hex('A78CFA')(item)
          }
        })
        str = override.join(' ')
      })
      console.log(str)
    }

    // console.log(str.join('\n'))
  })
// color for syntax by. Eva Dark

const escapeControlCharacters = (str: String) => str
    .replace(/\\/g, '\\\\')     // แทนที่ backslash (\\) ให้เป็น \\\\
    .replace(/\n/g, '\\n')      // แทนที่ newline ให้เป็น \\n
    .replace(/\r/g, '\\r')      // แทนที่ carriage return ให้เป็น \\r
    .replace(/\t/g, '\\t')      // แทนที่ tab ให้เป็น \\t
   .replace(/\x08/g, '\\b')  // ใช้ \\x08 เพื่อระบุ backspace ตัวจริง
    .replace(/\f/g, '\\f');     // แทนที่ form feed ให้เป็น \\f
const restoreControlCharacters = (tokenValue: string) => typeof tokenValue === 'string' ? tokenValue.replace(/\[CR\]/g, '\r') : tokenValue;
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
interface SyntaxHighlight extends Token {
  value: string
}
const highlightSyntax = (ast: SyntaxHighlight[]) => {
  const outputSyntax: Array<string> = []
  const collectData = new ColorizeSyntax(colors, [])
  let currentLine = 1
  let currentColumn = 0
  let keyword = [...newType.getKeysName()]
  let prevToken: SyntaxHighlight | null  = null
  ast.forEach((token: SyntaxHighlight, index: number) => {
    
    const nextToken: SyntaxHighlight | null = ast[index + 1] || null
    let { label } = token.type
    const { line: startLine, column: startColumn } = token.loc?.start as Position
    const { line: endLine, column: endColumn } = token.loc?.end as Position

    // แทรกการขึ้นบรรทัดใหม่หากบรรทัดเปลี่ยน
    while (currentLine < startLine) {
      outputSyntax.push('\n')
      collectData.on('other', '\n')
      currentLine++
      currentColumn = 0
    }

    // แทรกช่องว่างเพื่อให้คอลัมน์ตรงกับต้นฉบับ
    while (currentColumn < startColumn) {
      outputSyntax.push(' ')
      collectData.on('other', ' ')
      currentColumn++
    }

    let highlighted = false
    const kw = keywordTypes[token.value]

    if (
      label === 'name' &&
      prevToken &&
      keyword.includes(prevToken.value) &&
      !keywordTypes[prevToken.value].isLoop
    ) {
      console.log(token.value)
      // token.type.label = 'variableName'
      label = 'variableName'
    }
    if (keyword.includes(token.value)) {
      //token.type.keyword = kw.keyword
      label = token.value
      //token.type.label = token.value
    }

    // ตรวจสอบโทเค็นใน tokTypes และ tokContexts
    for (const [_, tokenType] of Object.entries({ ...tokTypes, ...tokContexts })) {
      const { label: tokLabel, keyword } = tokenType as TokenType
      if (tokLabel === token.value || keyword === token.value) {
        highlighted = true
        if (label === '^' && token.value !== undefined) {
          outputSyntax.push(colors.error.overline(token.value))
          collectData.on('other', token.value, 'error')
        } else if (label === '=' && token.value !== undefined){
          outputSyntax.push(colors.fountainBlueB(token.value))
          collectData.on('operator', token.value)
        } else  {
          highlighted = false
        }
        break
      }
    }

    const controlCharacterRegex = /[\x0A\x0D\x09\x0C\x08]/;  // \x0A = \n, \x0D = \r, \x09 = \t, \x0C = \f, \x08 = backspace
const tokenValue = restoreControlCharacters(token.value)
    if (!highlighted && label === 'template') {
      if (token.value && !controlCharacterRegex.test(tokenValue)) {
        outputSyntax.push(colors.greenB(token.value))
        collectData.on('string', token.value)
        highlighted = true
      } else highlighted = false
    }

    // ตรวจสอบการขึ้นบรรทัดใหม่และช่องว่าง non-ASCII

    
    if (!highlighted && controlCharacterRegex.test(tokenValue)) {

      outputSyntax.push(escapeControlCharacters(String(tokenValue)));
      collectData.on('other', escapeControlCharacters(String(tokenValue)))
      highlighted = true
    } else if (nonASCIIwhitespace.test(tokenValue)) {
      outputSyntax.push(' ')
      collectData.on('other', ' ')
      highlighted = true
    }

    // กำหนดสีสำหรับประเภทโทเค็นหลัก หากยังไม่ได้ไฮไลต์

    if (!highlighted) {
      // console.log(token)
      if (kw) {
        handledKeywordTypes(token, collectData)
      } else if (label === 'variableName') {
        if (prevToken && prevToken.value !== 'as') {
          if (prevToken.value === ':'){
            outputSyntax.push(colors.chalky(token.value))
            collectData.on('typeAssertions', token.value)}
          else if (prevToken.value === 'let' || prevToken.value === 'var'){
            console.log(token.value)
              outputSyntax.push(colors.chalky(token.value))
              collectData.on('other', token.value, 'coral')
            }else{
            outputSyntax.push(colors.malibuB(token.value))
        collectData.on('variable', token.value)
        }
                
       
        }else{
          
          outputSyntax.push(colors.chalky(token.value))
      collectData.on('typeAssertions', token.value)
        }
        
      } else if (label === 'privateId') {
        if (prevToken && prevToken.type.label === '.') {
          
            outputSyntax.push(colors.coralB('#' + token.value))
                    collectData.on('method', '#' + token.value)
            
          }else {
          if (nextToken.type.label === '('){
                    outputSyntax.push(colors.coralB('#' + token.value))
           collectData.on('method', '#' + token.value)
          }else {
                    outputSyntax.push(colors.coralB('#' + token.value))
                  collectData.on('propety', '#' + token.value)
          }
  }
        
    } else if (label === 'name') {
        const basicType = [
          'string',
          'number',
          'boolean',
          'symbol',
          'bigint',
          'undefined',
          'null',
          'unknown',
          'unique',
          'object',
          'string[]',
          'any',
          'any[]',
          'void',
          'never',
          'Array',
          'Function',
          'null[]',
          'boolean[]',
          'number[]',
          'symbol[]',
          'object[]',
          'unknown[]',
          'tuple',
          'record',
          'Map',
          'Set',
          'Promise',
          'Date',
          'RegExp',
        ]
        if (basicType.includes(token.value)) {
          outputSyntax.push(colors.chalky(token.value))
          collectData.on('typeAssertions', token.value)}
         else 
          // ตรวจสอบว่าโทเค็นก่อนหน้าเป็นจุด (.)
          if (prevToken && prevToken.type.label === '.') {
            if(nextToken.type.label === '.'){ outputSyntax.push(colors.chalkyB(token.value))
            
          collectData.on('propety', token.value)
   
              }else if (nextToken.type.label === '(') {
            outputSyntax.push(colors.malibuB(token.value))
                                                       collectData.on('method', token.value)
            
            }else{ outputSyntax.push(colors.coralB(token.value))
                  collectData.on('propety', token.value)
          }
            
          }else if (prevToken && prevToken.type.label === '{'){outputSyntax.push(color.hex('f14c4c')(token.value))
                                                               collectData.on('propety', token.value)
                                                              
         }else if (prevToken && prevToken.type.label === '['){
            outputSyntax.push(color.hex('f14c4c')(token.value))
                                                           collectData.on('propety', token.value)

     } else if (prevToken && prevToken.type.label === ':') {
            outputSyntax.push(color.hex('E4BF7F')(token.value))
                                                                collectData.on('constants', token.value)
           }else if (prevToken && prevToken.type.label === ',') {
            outputSyntax.push(color.hex('f14c4c')(token.value))
                                                                 collectData.on('propety', token.value)
           
           } else if (prevToken && prevToken.value === '('){ outputSyntax.push(colors.chalkyB(token.value))
                                                             collectData.on('method', token.value)
          }else {
            outputSyntax.push(colors.lightWhiteB(token.value))
                 collectData.on('other', token.value)
         } 
        
      } else if (label === 'string') {
        outputSyntax.push(colors.greenB("'" + token.value + "'"))
        collectData.on('string', "'" + token.value + "'")
      } else if (label === 'num') {
        if (token.start !== 0 && token.loc?.start.column !== 0) {
          outputSyntax.push(colors.whiskeyB(token.value))
          collectData.on('numbers', token.value)
        } else {
          outputSyntax.push(colors.lightWhite(token.value))
          collectData.on('other', token.value)
        }
      } else if (token.value === undefined) {
        if (label === ':' && token.type.beforeExpr) {
          outputSyntax.push(colors.invalidB(label))
          collectData.on('operator', label)
        } else {
          outputSyntax.push(colors.lightDarkB(label))
          collectData.on('operator', label)
        }
      } else {
        if (label === 'true' || label === 'false') {
          outputSyntax.push(colors.whiskeyB(token.value))
          collectData.on('boolean', token.value)
        } else {
          outputSyntax.push(colors.lightDark(token.value))
          collectData.on('other', token.value)
        }
      }
    }

    // อัปเดตตำแหน่งล่าสุดตามตำแหน่งสิ้นสุดของโทเค็นนี้
    currentLine = endLine
    currentColumn = endColumn

    // อัปเดต prevToken ให้เป็นโทเค็นปัจจุบัน
    prevToken = token
  })
console.log(collectData.emit())
  // แสดงผล
  return
  errorMessageAndPaths(outputSyntax)
}
const handledKeywordTypes = (token: SyntaxHighlight, outputSyntax) => {
  //console.log(token)
  const type = keywordTypes[token.value]
  outputSyntax.isBold = true

  if (type.keyword === 'TsKeyword') {
    outputSyntax.on('keyword',token.value)
  } else if (token.type.label !== 'name') {
    //console.log(token.value)
    outputSyntax.on('keyword',token.value)
  } else {
    outputSyntax.on('keyword',token.value)
  }
  outputSyntax.isBold = false
}
const atPath = (path: string) => {
  const match = path.match(/at\s+([^\s]+)?\s?([^\s:]+):(\d+):(\d+)/)

  if (match) {
    const method = match[1] || ' ' // กรณีไม่มีชื่อเมธอด
    const filePath = match[2]
    const line = color.chalk.yellow(parseInt(match[3]))
    const column = color.chalk.yellow(parseInt(match[4]))

    return `    as ${color.chalk.cyan(`${method} ${filePath}:${line}:${column}\n`)}`
  }

  return ''
}
const errorMessageAndPaths = (outputSyntax: Array<string>) => {
  let str: any = outputSyntax.join('')

  str = str.split('\n')

  str.forEach((item, index) => {
    // ตรวจจับเฉพาะ "error:" และทำสีโดยไม่กระทบสีที่ทำไฮไลต์ไว้
    if (item.includes(clearAnsiCodes('error'))) {
      const override = clearAnsiCodes(item).split(':') // ใช้ clearAnsiCodes แค่กับส่วนที่เป็น "error:"
      str[index] =
        color.red('error') +
        color.chalk.bold.visible(`:${override.slice(1).join(':')}`)
    } else if (
      /at\s+[^\s]+(?:\s?\([^\)]+\))?:\d+:\d+/.test(clearAnsiCodes(item))
    ) {
      str[index] = atPath(clearAnsiCodes(item))
    }
  })
  

  // รวมข้อความและแสดงผล
  process.stdout.write(str.join('\n'))
  console.log()
}

process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

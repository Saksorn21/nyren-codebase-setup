import process from 'node:process'
import parseCode, {
  tokTypes,
  Token,
  isNewLine,
  keywordTypes as key,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace,
  parseExpressionAt,
  tokContexts,
  TokContext,
  Token,
  TokenType,
} from '../acorn.js'
import { clearAnsiCodes } from './main.js'
import type { ecmaVersion, Options } from 'acorn'
import color from './color.js'
import clone from './clone.js'

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
    const code = `1 |
    // test
    const arr: Array<string> = []
    const arrp: string[] = []
    import nae, { test } from 'acorn'
    const { label: tokLabel, keyWord } = value.on.l as any
if(true){
for (let [_, value] of Object.entries({ ...tokTypes, ...tokContexts })) {
   ;
}
outputSyntax.push(\`\n\`)
}
let n = 1
var p = 1
  const plp: boolean = true as boolean
  const ppp: string = 'nyrenx';
  class sod{
  static b = 0
  readonly y = 1
  #home = 'home'
  namep: string = 'sod'
  constructor(private p: string){}
  #hgg(){
  return this.#home
  }
  // test - pppp
  const f = new sod(\`\r\`)
  f.namep as string
  const as = 'n'
  console.log(f.#hgg(),\`name\${sod.b}\`)
  }
  `

    try {
      const ast = [...parseCode.tokenizer(code, optionsAcorn)]
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
const colors = {
  white: color.chalk.white.visible,
  whiteB: color.white.visible,
  cyan: color.chalk.cyan.visible,
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
const escapeControlCharacters = (str: string) =>
  // ตรวจสอบค่าคำสั่งต่างๆ และแทนที่ให้เป็นรูปแบบที่แสดงในข้อความ
  str
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\t/g, '\\\\t')
    .replace(/\\b/g, '\\\\b')
    .replace(/\\f/g, '\\\\f')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f')
const highlightSyntax = (ast: Token[]) => {
  const outputSyntax: Array<string> = []
  let currentLine = 1
  let currentColumn = 0
  let keyword = [...newType.getKeysName()]
  let prevToken = null
  ast.forEach((token: any, index: number) => {
    const nextToken = ast[index + 1] || null
    let { label } = token.type
    const { line: startLine, column: startColumn } = token.loc?.start
    const { line: endLine, column: endColumn } = token.loc?.end

    // แทรกการขึ้นบรรทัดใหม่หากบรรทัดเปลี่ยน
    while (currentLine < startLine) {
      outputSyntax.push('\n')
      currentLine++
      currentColumn = 0
    }

    // แทรกช่องว่างเพื่อให้คอลัมน์ตรงกับต้นฉบับ
    while (currentColumn < startColumn) {
      outputSyntax.push(' ')
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
      // token.type.label = 'variableName'
      label = 'variableName'
    }
    if (keyword.includes(token.value)) {
      //token.type.keyword = kw.keyword
      label = token.value
      //token.type.label = token.value
    }

    // ตรวจสอบโทเค็นใน tokTypes และ tokContexts
    for (const [_, value] of Object.entries({ ...tokTypes, ...tokContexts })) {
      const { label: tokLabel, keyWord } = value as any
      if (tokLabel === token.value || keyWord === token.value) {
        highlighted = true
        if (label === '^' && token.value !== undefined) {
          outputSyntax.push(colors.redB.overline(token.value))
        } else if (keyWord !== undefined && keyWord === token.type.keyword) {
          outputSyntax.push(colors.green('"' + token.value + '"'))
        } else {
          highlighted = false
        }
        break
      }
    }

    if (!highlighted && label === 'template') {
      if (token.value && !lineBreak.test(token.value)) {
        outputSyntax.push(colors.greenB(token.value))
        highlighted = true
      } else highlighted = false
    }

    // ตรวจสอบการขึ้นบรรทัดใหม่และช่องว่าง non-ASCII

    
    if (lineBreak.test(token.value)) {
      
      outputSyntax.push(escapeControlCharacters(token.value))
      highlighted = true
    } else if (nonASCIIwhitespace.test(token.value)) {
      outputSyntax.push(' ')
      highlighted = true
    }

    // กำหนดสีสำหรับประเภทโทเค็นหลัก หากยังไม่ได้ไฮไลต์

    if (!highlighted) {
      // console.log(token)
      if (kw) {
        handledKeywordTypes(token, outputSyntax)
      } else if (label === 'variableName') {
        if (prevToken && prevToken.value !== 'as') {
          if (prevToken.value === ':')
            outputSyntax.push(colors.yellowB(token.value))
          else outputSyntax.push(colors.yellowB(token.value))
        } else {
          outputSyntax.push(colors.cyan(token.value))
        }
      } else if (label === 'privateId') {
        if (prevToken && prevToken.type.label === '.') {
          outputSyntax.push(colors.redB('#' + token.value))
        } else {
          outputSyntax.push(colors.blueB('#' + token.value))
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
          outputSyntax.push(colors.cyan(token.value))
        } else {
          // ตรวจสอบว่าโทเค็นก่อนหน้าเป็นจุด (.)
          if (prevToken && prevToken.type.label === '.') {
            if(nextToken.type.label === '.') outputSyntax.push(colors.redB(token.value))
            
            else outputSyntax.push(colors.blueB(token.value))
          } else if (prevToken && prevToken.type.label === '{') {
            outputSyntax.push(color.hex('f14c4c')(token.value))
          } else if (prevToken && prevToken.type.label === ':') {
            outputSyntax.push(color.hex('E4BF7F')(token.value))
          } else if (prevToken && prevToken.type.label === ',') {
            outputSyntax.push(color.hex('f14c4c')(token.value))
          } else {
            outputSyntax.push(colors.fg(token.value))
          }
        }
      } else if (label === 'string') {
        outputSyntax.push(color.hex('98C379').visible("'" + token.value + "'"))
      } else if (label === 'num') {
        if (token.start !== 0 && token.loc.start.column !== 0) {
          outputSyntax.push(colors.orangeB(token.value))
        } else {
          outputSyntax.push(colors.lines(token.value))
        }
      } else if (token.value === undefined) {
        if (label === ':' && token.type.beforeExpr) {
          outputSyntax.push(colors.lines(label))
        } else {
          outputSyntax.push(colors.lines(label))
        }
      } else {
        if (label === 'true' || label === 'false') {
          outputSyntax.push(colors.blueB(token.value))
        } else {
          outputSyntax.push(colors.fg(token.value))
        }
      }
    }

    // อัปเดตตำแหน่งล่าสุดตามตำแหน่งสิ้นสุดของโทเค็นนี้
    currentLine = endLine
    currentColumn = endColumn

    // อัปเดต prevToken ให้เป็นโทเค็นปัจจุบัน
    prevToken = token
  })

  // แสดงผล
  errorMessageAndPaths(outputSyntax)
}
const handledKeywordTypes = (token: Token, outputSyntax) => {
  //console.log(token)
  const type = keywordTypes[token.value]

  if (type.keyword === 'TsKeyword') {
    outputSyntax.push(colors.purpleB(token.value))
  } else if (token.type.label !== 'name') {
    console.log(token.value)
    outputSyntax.push(colors.purpleB(token.value))
  } else {
    outputSyntax.push(colors.purpleB(token.value))
  }
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

import process from 'node:process'
import parseCode, {
  AddKeywordTypes,
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
import Labels, { debug } from '../acorn/labels/main.js'
import { clearAnsiCodes } from './main.js'
import type { Position, SourceLocation, Options } from 'acorn'
import color from './color.js'
import clone from './clone.js'
import Themes, { colorType } from '../acorn/Themes.js'
import ColorizeSyntax, { type KeywordType } from '../acorn/ColorizeSyntax.js'
import kwTypes from '../acorn/keywordTypes.js'
const colors = new Themes()

let keywordTypes = kwTypes.emit()

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
      sourceType: 'module',
      locations: true,
      preserveParens: true,
      checkPrivateFields: true,
      allowHashBang: true,
      allowReserved: true,
      allowAwaitOutsideFunction: true,
      
    }
    const code = `
    class Sos {
    static boat(n: number){
    return n
    }
    public age: number = 21
    private readonly jan: string = 'jan'
    #home: string = 'home'
    
    }
  `
    
    try {
      const codeWithPlaceholders = code.replace(/\r/g, '[CR]').replace(/\t/g, '[TAB]').replace(/\f/g, '[FF]').replace(/\v/g, '[VT]')
      const tokens = 
        [...parseCode.tokenizer(codeWithPlaceholders, optionsAcorn)]
      // as SyntaxHighlight[]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
     // console.log(tokens)
      // สร้าง token iterator
      
      
      const labels = new Labels(tokens)
      labels.build()
      labels.debug(color.white('<<<===HighLight Syntax===>>>'))
      //console.log('yes',labels.result)

      highlightSyntax(labels.result)
    } catch (error: unknown) {
      debug(`Error caught: ${error.message}`)
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

const escapeControlCharacters = (str: String) =>
  str
    .replace(/\\/g, '\\\\') // แทนที่ backslash (\\) ให้เป็น \\\\
    .replace(/\n/g, '\\n') // แทนที่ newline ให้เป็น \\n
    .replace(/\r/g, '\\r') // แทนที่ carriage return ให้เป็น \\r
    .replace(/\t/g, '\\t') // แทนที่ tab ให้เป็น \\t
    .replace(/\x08/g, '\\b') // ใช้ \\x08 เพื่อระบุ backspace ตัวจริง
    .replace(/\f/g, '\\f') // แทนที่ form feed ให้เป็น \\f
const restoreControlCharacters = (tokenValue: string) =>
  typeof tokenValue === 'string'
    ? tokenValue.replace(/\[CR\]/g, '\r')
    : tokenValue
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
import HighlightSyntax from '../acorn/HighlightSyntax.js'

const highlightSyntax = (ast: SyntaxHighlight[]) => {
  const outputSyntax: Array<string> = []
  const collectData = new ColorizeSyntax(colors, [])
  let currentLine = 1
  let currentColumn = 0
  let keyword = [...kwTypes.getKeys()]
  let prevToken: SyntaxHighlight | null = null
  // ast.map(item => console.log(item))

  const highlight = new HighlightSyntax(ast)

  highlight.parse()
  console.log(highlight.result)
  return

  ast.forEach((token: SyntaxHighlight, index: number) => {
    const nextToken: SyntaxHighlight | null = ast[index + 1] || null
    let { label } = token.type
    const { line: startLine, column: startColumn } = token.loc
      ?.start as Position
    const { line: endLine, column: endColumn } = token.loc?.end as Position

    // แทรกการขึ้นบรรทัดใหม่หากบรรทัดเปลี่ยน
    while (currentLine < startLine) {
      // outputSyntax.push('\n')
      collectData.on('other', '\n')
      currentLine++
      currentColumn = 0
    }

    // แทรกช่องว่างเพื่อให้คอลัมน์ตรงกับต้นฉบับ
    while (currentColumn < startColumn) {
      // outputSyntax.push(' ')
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
    for (const [_, tokenType] of Object.entries({
      ...tokTypes,
      ...tokContexts,
    })) {
      const { label: tokLabel, keyword } = tokenType as TokenType
      if (tokLabel === token.value || keyword === token.value) {
        highlighted = true
        if (label === '^' && token.value !== undefined) {
          outputSyntax.push(colors.error.overline(token.value))
          collectData.on('other', token.value, 'error')
        } else if (label === '=' && token.value !== undefined) {
          outputSyntax.push(colors.fountainBlueB(token.value))
          collectData.on('operator', token.value)
        } else {
          highlighted = false
        }
        break
      }
    }

    const controlCharacterRegex = /[\x0A\x0D\x09\x0C\x08]/ // \x0A = \n, \x0D = \r, \x09 = \t, \x0C = \f, \x08 = backspace
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
      outputSyntax.push(escapeControlCharacters(String(tokenValue)))
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
          if (prevToken.value === ':') {
            outputSyntax.push(colors.chalky(token.value))
            collectData.on('typeAssertions', token.value)
          } else if (prevToken.value === 'let' || prevToken.value === 'var') {
            console.log(token.value)
            outputSyntax.push(colors.chalky(token.value))
            collectData.on('other', token.value, 'coral')
          } else {
            outputSyntax.push(colors.malibuB(token.value))
            collectData.on('variable', token.value)
          }
        } else {
          outputSyntax.push(colors.chalky(token.value))
          collectData.on('typeAssertions', token.value)
        }
      } else if (label === 'privateId') {
        if (prevToken && prevToken.type.label === '.') {
          outputSyntax.push(colors.coralB('#' + token.value))
          collectData.on('method', '#' + token.value)
        } else {
          if (nextToken.type.label === '(') {
            outputSyntax.push(colors.coralB('#' + token.value))
            collectData.on('method', '#' + token.value)
          } else {
            outputSyntax.push(colors.coralB('#' + token.value))
            collectData.on('property', '#' + token.value)
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
          collectData.on('typeAssertions', token.value)
        }
        // ตรวจสอบว่าโทเค็นก่อนหน้าเป็นจุด (.)
        else if (prevToken && prevToken.type.label === '.') {
          if (nextToken.type.label === '.') {
            outputSyntax.push(colors.chalkyB(token.value))

            collectData.on('property', token.value)
          } else if (nextToken.type.label === '(') {
            outputSyntax.push(colors.malibuB(token.value))
            collectData.on('method', token.value)
          } else {
            outputSyntax.push(colors.coralB(token.value))
            collectData.on('property', token.value)
          }
        } else if (prevToken && prevToken.type.label === '{') {
          outputSyntax.push(color.hex('f14c4c')(token.value))
          collectData.on('property', token.value)
        } else if (prevToken && prevToken.type.label === '[') {
          outputSyntax.push(color.hex('f14c4c')(token.value))
          collectData.on('property', token.value)
        } else if (prevToken && prevToken.type.label === ':') {
          outputSyntax.push(color.hex('E4BF7F')(token.value))
          collectData.on('constants', token.value)
        } else if (prevToken && prevToken.type.label === ',') {
          outputSyntax.push(color.hex('f14c4c')(token.value))
          collectData.on('property', token.value)
        } else if (prevToken && prevToken.value === '(') {
          outputSyntax.push(colors.chalkyB(token.value))
          collectData.on('method', token.value)
        } else {
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
  debug(
    color.chalk.bgGreen.bold.white.bold('Result:') + '%s',
    collectData.emit('string')
  )
  console.log(collectData.emit('string'))
  // แสดงผล
  return
  errorMessageAndPaths(outputSyntax)
}
const handledKeywordTypes = (token: SyntaxHighlight, outputSyntax) => {
  //console.log(token)
  const type = keywordTypes[token.value]
  outputSyntax.isBold = true

  if (type.keyword === 'TsKeyword') {
    outputSyntax.on('keyword', token.value)
  } else if (token.type.label !== 'name') {
    //console.log(token.value)
    outputSyntax.on('keyword', token.value)
  } else {
    outputSyntax.on('keyword', token.value)
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

    return `    at ${color.chalk.cyan(`${method} ${filePath}:${line}:${column}\n`)}`
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

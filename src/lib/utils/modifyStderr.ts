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
import HighlightSyntax from '../acorn/HighlightSyntax.js'
import color from './color.js'
import clone from './clone.js'
import Themes, { colorType } from '../acorn/Themes.js'
import ColorizeSyntax, { type KeywordType } from '../acorn/ColorizeSyntax.js'
import kwTypes from '../acorn/keywordTypes.js'
import ErrorLogManager, { type ErrorAndPath } from '../acorn/ErrorLogManager.js'
import Fusion from '../acorn/Fusion.js'
const colors = new Themes()

let keywordTypes = kwTypes.emit()

const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    const rawData = data.toString()
    // ลบ ANSI codes แล้วแยกเป็นบรรทัด

    const errorManager = new ErrorLogManager()
    errorManager.process(rawData)

    // Debug ข้อมูล
    errorManager.debug()
    const parseError = ''

    // รับผลลัพธ์ที่ประมวลผลแล้ว
    const { errorPathBlocks, arrRawData, modifiedData } = errorManager.results
    //console.log(...errorPathBlocks);
    //str = str.join('\n')
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
    const obj = {
  name: 'John',
  age: 30,
  city: 'New York',
  loc: {
    lat: 40.7128,
    lng: -74.0060,
    map: (l: string) => {throw new Error(l)
                        }
  }
}
obj.name
obj.loc.map('ppp')
  `

    try {
      const codeWithPlaceholders = code
        .replace(/\r/g, '[CR]')
        .replace(/\t/g, '[TAB]')
        .replace(/\f/g, '[FF]')
        .replace(/\v/g, '[VT]')
      const tokens = [
        ...parseCode.tokenizer(modifiedData.join('\n'), optionsAcorn),
      ]
      // as SyntaxHighlight[]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
      // console.log(tokens)
      // สร้าง token iterator

      const labels = new Labels(tokens)
      labels.build()
      labels.debug(color.white('<<<===HighLight Syntax===>>>'))
      //console.log('yes',labels.result)

      const outputSyntax: Array<string> = []
      console.log('true highlight')
      const highlight = new HighlightSyntax(labels.result)

      highlight.parse()
      console.log(highlight.result.emit())
      const tokenColored: Array<string> = (
        highlight.result.emit() as string
      ).split('\n') as Array<string>
      const combo = new Fusion()
      combo.process(tokenColored, errorManager.results.errorPathBlocks)
      console.log(tokenColored.join('\n'))
      //outputSyntax.push(...errorPathBlocks)

      //errorMessageAndPaths(...errorPathBlocks)
    } catch (error) {
      let str = ''
      debug(`Error caught: ${error.message}`)
      console.log(error)
      arrRawData.forEach((item: string, index: number) => {
        if (item.includes('^')) {
          arrRawData[index] = color.red(item)
        } else if (item.includes('error')) {
          let override = arrRawData[index].split('error:')
          arrRawData[index] =
            color.red('error:') + color.grey(override.slice(1))
        } else if (item.includes('at ')) {
          arrRawData[index] = atPath(item)
        } else if (item.includes('Bun')) {
          arrRawData.splice(index, arrRawData.length)
        }

        const override = arrRawData.join('\n').split(' ')
        override.forEach((item: string, index: number) => {
          if (keywordTypes[item]) {
            override[index] = color.hex('A78CFA')(item)
          }
        })
        str = override.join(' ')
      })
      console.log('error', str)
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

const atPath = (path: string) => {
  const match = path.match(/at\s+([^\s]+)?\s?([^\s:]+):(\d+):(\d+)/)

  if (match) {
    const method = match[1] || ' ' // กรณีไม่มีชื่อเมธอด
    const filePath = match[2]
    const line = color.chalk.yellow(parseInt(match[3]))
    const column = color.chalk.yellow(parseInt(match[4]))

    return `    ${color.hex('#ABB2BF')('at')} ${color.chalk.cyan(`${method} ${filePath}:${line}:${column}\n`)}`
  }

  return ''
}
const errorMessageAndPaths = (
  errorTypes: Array<string>,
  errorPaths: ErrorAndPath[]
) => {
  let str: any = errorPaths

  str.forEach((blockObj, blockIndex) => {
    blockObj.block.forEach(({ line, index }) => {
      console.log(
        utils.color.amber(
          `Index ${utils.color.white(index) + ':'} ${utils.color.white(line)}`
        )
      )

      // ตรวจจับเฉพาะ "error:" และทำสีโดยไม่กระทบสีที่ทำไฮไลต์ไว้
      if (
        line.includes(clearAnsiCodes('error')) ||
        line.includes(clearAnsiCodes('TypeError'))
      ) {
        const override = clearAnsiCodes(item).split(':') // ใช้ clearAnsiCodes แค่กับส่วนที่เป็น "error:"
        str[index] =
          color.hex('#F44747')(override[0]) +
          color.hex('#7F848E').visible(`:${override.slice(1).join(':')}`)
      } else if (
        /at\s+[^\s]+(?:\s?\([^\)]+\))?:\d+:\d+/.test(clearAnsiCodes(item))
      ) {
        str[index] = atPath(clearAnsiCodes(item))
      }
    })
  })

  // รวมข้อความและแสดงผล
  process.stdout.write(str.join('\n'))
  console.log()
}

process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

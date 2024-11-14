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
import errorTypes from '../acorn/errorType.js'
const colors = new Themes()

let keywordTypes = kwTypes.emit()

                  const modifyStderr = (stderr: typeof process.stderr) =>
                    stderr.on('data', data => {
                      const rawData = data.toString(); 
                      console.log('Raw Data:', rawData.replace(/\n/g, '[CR]\n')); // แสดงข้อมูลที่มี newline

                      const lines = clearAnsiCodes(rawData).split('\n'); // แยกข้อมูลเป็นบรรทัดหลังลบ ANSI codes
                      console.log('Cleaned Lines:', lines);

                      let currentErrorBlock: { line: string; index: number }[] = []; // เก็บบล็อกข้อมูลแต่ละชุดพร้อมตำแหน่ง
                      let collecting = false; // ติดตามสถานะการรวบรวมข้อมูลของชุด
                      const allBlocks: { block: { line: string; index: number }[] }[] = []; // เก็บบล็อกข้อมูลทั้งหมด

                      lines.forEach((line, index) => {
                        const errorTypeMatch = line.match(/(?:^|\s)(error|[a-zA-Z]+)(?=:)/); // จับประเภทข้อผิดพลาด

                        if (errorTypeMatch && errorTypes.includes(errorTypeMatch[0])) {
                          // เมื่อพบประเภทข้อผิดพลาดใหม่ เริ่มต้นบล็อกข้อมูลใหม่
                          if (collecting && currentErrorBlock.length > 0) {
                            allBlocks.push({ block: [...currentErrorBlock] }); // บันทึกบล็อกข้อมูลชุดก่อนหน้า
                            currentErrorBlock = []; // รีเซ็ตบล็อกข้อมูลสำหรับชุดถัดไป
                          }

                          collecting = true; // เริ่มการรวบรวมข้อมูลสำหรับชุดใหม่
                          currentErrorBlock.push({ line, index }); // เพิ่มบรรทัดประเภทข้อผิดพลาดในบล็อกข้อมูลพร้อมตำแหน่ง
                        } else if (collecting && line.includes('at ')) {
                          // เมื่อเจอบรรทัดที่มี 'at path' ในขณะที่กำลังรวบรวมข้อมูลอยู่
                          currentErrorBlock.push({ line, index }); // เพิ่มบรรทัดนี้ในบล็อกข้อมูลพร้อมตำแหน่ง
                          allBlocks.push({ block: [...currentErrorBlock] }); // บันทึกบล็อกข้อมูลชุดที่สมบูรณ์
                          currentErrorBlock = []; // รีเซ็ตบล็อกข้อมูลสำหรับชุดถัดไป
                          collecting = false; // จบการรวบรวมสำหรับชุดนี้
                        } else if (collecting) {
                          // เพิ่มบรรทัดในบล็อกข้อมูลตราบเท่าที่ยังไม่เจอ 'at path'
                          currentErrorBlock.push({ line, index });
                        }
                      });

                      // บันทึกบล็อกข้อมูลสุดท้ายที่อาจไม่มี 'at path' ในตอนท้าย
                      if (currentErrorBlock.length > 0) {
                        allBlocks.push({ block: [...currentErrorBlock] });
                      }

                      // แสดงบล็อกข้อมูลแต่ละชุด
                      allBlocks.forEach((blockObj, blockIndex) => {
                        console.log(`Error Block ${blockIndex + 1}:`);
                        blockObj.block.forEach(({ line, index }) => {
                          console.log(`Index ${index}: ${line}`);
                        });
                      });
                    
    //console.log(tokTypes)
    //str = str.join('\n')
    //console.log(str)
return
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
    public age: number = 25
    private isSos: boolean = true
    
    private readonly jan: string = 'jan'
    #home: string = 'home'
    
    }
  `
    
    try {
      const codeWithPlaceholders = code.replace(/\r/g, '[CR]').replace(/\t/g, '[TAB]').replace(/\f/g, '[FF]').replace(/\v/g, '[VT]')
      const tokens = 
        [...parseCode.tokenizer(str, optionsAcorn)]
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
      console.log('error',str)
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
console.log('true highlight')
  const highlight = new HighlightSyntax(ast)

  highlight.parse()
 // console.log(highlight.result)
  outputSyntax.push(
                    ...highlight.result)
  

  
  errorMessageAndPaths(outputSyntax)
}
const handledKeywordTypes = (token: SyntaxHighlight, outputSyntax: Array<string>) => {
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

    return `    ${color.hex('#ABB2BF')('at')} ${color.chalk.cyan(`${method} ${filePath}:${line}:${column}\n`)}`
  }

  return ''
}
const errorMessageAndPaths = (outputSyntax: Array<string>) => {
  let str: any = outputSyntax.join('')

  str = str.split('\n')

  str.forEach((item, index) => {
    // ตรวจจับเฉพาะ "error:" และทำสีโดยไม่กระทบสีที่ทำไฮไลต์ไว้
    if (item.includes(clearAnsiCodes('error')) || item.includes(clearAnsiCodes('TypeError'))) {
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

  // รวมข้อความและแสดงผล
  process.stdout.write(str.join('\n'))
  console.log()
}

process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

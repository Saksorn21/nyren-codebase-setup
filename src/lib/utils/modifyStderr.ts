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
   if(Array.isArray(args[0])){
    throw new TypeError('on() only accepts individual arguments. Try: on(\'of\', \'if\', { keyword: \'TsKeyword\' })', {
        cause: 'Array is not allowed as input',  // ค่าที่ใช้เพิ่มเติม
      });
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
  getKeywordNames() {
    [this.newKw].map(kw => {
      for (const key in kw) {
        this.variableName.push(key)
      }
      
    })
    return this.variableName
  }
}

const newType = new AddKeywordTypes(key)
  .on('let')
  .on('from')
  .on('of', { isLoop: true })
  .del('true')
  .del('false')
  newType.on(
  'as', 'implements', 'declare', 'readonly', 'private', 'protected', 'public', 'abstract',
  'namespace', 'module', 'require', 'infer', 'keyof', 'is', 'asserts', 'type',
  'interface', 'enum', 'unique', 'readonly', 'override','static',
  {
    keyword: 'TsKeyword', // ระบุประเภทเป็นคีย์เวิร์ดของ TypeScript
  }
);

// คีย์เวิร์ดสำหรับการจัดการประเภทข้อมูล
  newType.on(
  'infer', 'keyof', 'typeof', 'instanceof', 'extends',
  {
    keyword: 'TsKeyword', // TypeManipulation
  }
);
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
      ecmaVersion: 2022,
     // sourceType: 'module',
      locations: true,
      preserveParens: true,
      allowAwaitOutsideFunction: true,
    }
    const code = `1 |
    import type { ecmaVersion, Options } from 'acorn'
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
  constructor(p: string){}
  #hgg(){
  return this.#home
  }
  // test - pppp
  const f = new sod('sod')
  f.namep as string
  const as = 'n'
  console.log(f.#hgg(),\`\${sod.b}\`)
  }
  `
    
    try {
      const ast = [...parseCode.tokenizer(code, optionsAcorn)]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
      //console.log('ast',ast)

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
const highlightSyntax = (ast: Token[]) => {
  const outputSyntax: Array<string> = []
  let currentLine = 1 // เริ่มบรรทัดที่ 1
  let currentColumn = 0 // เริ่มคอลัมน์ที่ 0
  let prevToken = null

  let keyword = [...newType.getKeywordNames()]
  
  ast.forEach((token: any) => {
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
    if (label === 'name') {
      
      if (prevToken && keyword.includes(prevToken.value) && !keywordTypes[prevToken.value].isLoop){
        
        if(true){
        
    label = 'variableName'
          }
        }
      

      if (keyword.includes(token.value) ){

        token.type.keyword = token.value
        //label = item
       // console.log(token)
      }
    }
   
    // ตรวจสอบโทเค็นใน tokTypes และ tokContexts
    for (const [_, value] of Object.entries({ ...tokTypes, ...tokContexts })) {
      
      const { label: tokLabel, keyWord } = value as any
      if (tokLabel === token.value || keyWord === token.value) {
        highlighted = true
        if (label === '^' && token.value !== undefined) {
          outputSyntax.push(color.hex('f14c4c')(token.value))
        } else if (keyWord !== undefined && keyWord === token.type.keyword) {
          outputSyntax.push(color.green('"' + token.value + '"'))
        } else {
          highlighted = false
        }
        break
      }
    }

    if (!highlighted && (token.value === '""' || token.value === "''")) {
      outputSyntax.push(color.deepBlue(token.value))
      highlighted = true
    }

    // ตรวจสอบการขึ้นบรรทัดใหม่และช่องว่าง non-ASCII
    if (lineBreak.test(token.value)) {
      outputSyntax.push('\\n')
      highlighted = true
    } else if (nonASCIIwhitespace.test(token.value)) {
      outputSyntax.push(' ')
      highlighted = true
    }

    // กำหนดสีสำหรับประเภทโทเค็นหลัก หากยังไม่ได้ไฮไลต์
    
    if (!highlighted) {
      const kw = keywordTypes[token.value]
      
     
     // console.log(token)
      if (kw) {
        handledKeywordTypes(token, outputSyntax)
        
      } else if (label === 'variableName'){
        if(prevToken && prevToken.value !== 'as' ){
        if(prevToken.value === ':') outputSyntax.push(color.hex('E4BF7F')(token.value))
          else outputSyntax.push(color.hex('E4BF7F')(token.value))
      }else{
          outputSyntax.push(color.chalk.cyan.bold(token.value))
          }
      }else if (label === 'privateId') {
        if (prevToken && prevToken.type.label === '.') {
          outputSyntax.push(color.hex('f14c4c')('#' + token.value))
        } else {
          outputSyntax.push(color.hex('6495EE')('#' + token.value))
        }
      } else if (label === 'name') {
        const basicType = [
          'string', 'number', 'boolean', 'symbol', 'bigint', 'undefined', 'null', 
          'unknown', 'unique', 'object', 'string[]', 'any', 'any[]', 'void', 'never', 
          'Array', 'Function', 'null[]', 'boolean[]', 'number[]', 'symbol[]', 
          'object[]', 'unknown[]', 'tuple', 'record', 'Map', 'Set', 'Promise', 
          'Date', 'RegExp'
        ];
          if (basicType.includes(token.value)) {
            outputSyntax.push(color.chalk.cyan.bold(token.value));
          
        } else {
          // ตรวจสอบว่าโทเค็นก่อนหน้าเป็นจุด (.)
          if (prevToken && prevToken.type.label === '.') {
            outputSyntax.push(color.hex('6495EE')(token.value))
          } else if (prevToken && prevToken.type.label === '{') {
            outputSyntax.push(color.hex('f14c4c')(token.value))
          }else if (prevToken && prevToken.type.label === ':') {
              outputSyntax.push(color.hex('E4BF7F')(token.value))
            }else if (prevToken && prevToken.type.label === ',') {
            outputSyntax.push(color.hex('f14c4c')(token.value))
          } else {
            outputSyntax.push(color.hex('B0B7C3')(token.value))
          }
        }
      } else if (label === 'string') {
        outputSyntax.push(color.hex('98C379').visible("'" + token.value + "'"))
      } else if (label === 'num') {
        if (token.start !== 0 && token.loc.start.column !== 0) {
          outputSyntax.push(color.hex('FF9070')(token.value))
        } else {
          outputSyntax.push(color.chalk.bold.visible(token.value))
        }
      } else if (token.value === undefined) {
        if (label === ':' && token.type.beforeExpr) {
          outputSyntax.push(color.hex('454963')(label))
        } else {
          outputSyntax.push(color.hex('454963')(label))
        }
      } else {
        if (label === 'true' || label === 'false'){
        outputSyntax.push(color.hex('6495EE').visible(token.value))
        }else{
          outputSyntax.push(color.chalk.bold.visible(token.value))
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
const handledKeywordTypes =(token: Token,outputSyntax) => {
  //console.log(token)
  const type = keywordTypes[token.value]
  
  
  if (type.keyword === 'TsKeyword'){
  outputSyntax.push(color.hex('A78CFA')(token.value));

    }else if (token.type.label !== 'name'){
    console.log(token.value)
    outputSyntax.push(color.hex('A78CFA')(token.value));
  }else{
    outputSyntax.push(color.hex('A78CFA')(token.value));
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

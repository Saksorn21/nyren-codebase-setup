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

import kwTypes from '../acorn/keywordTypes.js'
import ErrorLogManager, { type ErrorAndPath } from '../acorn/ErrorLogManager.js'
import Fusion from '../acorn/Fusion.js'
import Parser from '../acorn/Parse.js'

const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    const rawData = data.toString()
    // ลบ ANSI codes แล้วแยกเป็นบรรทัด

    const errorManager = new ErrorLogManager()
    errorManager.process(rawData)

    const parseError = ''

    // รับผลลัพธ์ที่ประมวลผลแล้ว
    const { errorPathBlocks,  arrRawData, modifiedData } = errorManager.results
    const c = new Parser(rawData)
    const parse = c.parse()
    console.log(c.getToken())
    
    //str = str.join('\n')
    //console.log(str)

    const optionsAcorn: Options = {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      preserveParens: true,
      //checkPrivateFields: true,
      //allowHashBang: true,
      //allowReserved: true,
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
    const combo = new Fusion()
    try {
      
      const tokens = [
        ...parseCode.tokenizer(modifiedData.join('\n'), optionsAcorn),
      ] as C
      // as SyntaxHighlight[]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
      // console.log(tokens)
      // สร้าง token iterator

      const labels = new Labels(tokens)
      labels.build()
      labels.debug(color.white('<<<===HighLight Syntax===>>>'))
      //console.log('yes',labels.result)

      const outputSyntax = process.argv
      console.log(outputSyntax)
      const highlight = new HighlightSyntax(labels.result)
      highlight.parse()
      
      
      combo.process(highlight.result.emit() as string, errorManager.processColorize())
      console.log(combo.toString())
      //outputSyntax.push(...errorPathBlocks)

      //errorMessageAndPaths(...errorPathBlocks)
    } catch (error) {
      let str = ''
      debug(`Error caught: ${error.message}`)
      //console.log(error)
      
      modifiedData.forEach((item: string, index: number) => {
        if (item.includes('^')) {
            modifiedData[index] = color.red(item)
        }  else if (item.includes('Bun')) {
          modifiedData.splice(index, modifiedData.length)
        }
        
      str = modifiedData.join('\n')
    // console.log(str.join('\n'))
  })
      const lastResult = combo.process(str, errorManager.processColorize())
      console.log(lastResult.toString())
      }
  })
// color for syntax by. Eva Dark



process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

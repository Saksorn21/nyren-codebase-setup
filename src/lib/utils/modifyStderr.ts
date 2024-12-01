import process from 'node:process'
import parseCode from '../acorn/main.js'
import Labels, { debug } from '../acorn/labels/main.js'
import type { Options } from 'acorn'
import HighlightSyntax from '../acorn/HighlightSyntax.js'
import color from './color.js'

import type { KeywordType, CustomToken } from '../acorn/labels/abstract.js'
import types from '../acorn/schema-keywordType.js'
import ErrorLogManager, { type ErrorAndPath } from '../acorn/ErrorLogManager.js'
import Fusion from '../acorn/Fusion.js'
import Tokenizer from '../acorn/Parse.js'
import clearAnsiCodes from '../utils/clearAnsi.js'
class ManagerFactory {
  rawCode!: string
  codeStr!: string
  codeArr!: Array<string>
  opts: Options
  tokens!: CustomToken[]
  constructor(options: Options){
    this.opts = options
  }
  parseCode(code: string | Array<string>){
    if(Array.isArray(code)) { 
      this.rawCode = this.codeStr = code.join('\n')
      this.codeArr = code
       }
    else {
      this.rawCode = this.codeStr = code
      this.codeArr = [code]
      
      
      }
    return this
  }
  parseErrorLog(){
    const errorManager = new ErrorLogManager().process(this.codeStr)
    this.codeArr = errorManager.results.modifiedData
    this.codeStr = errorManager.results.modifiedData.join('\n')
    return this
  }
  buildTokens(){
    const tokens = new Labels(this.code,this.opts)
    tokens.build()
    this.tokens = tokens.result
    return this
  }
}
const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    const rawData = data.toString()

    const errorManager = new ErrorLogManager().process(rawData)
    const parseError = errorManager.results.modifiedData.join('\n')
  

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
    const combo = new Fusion()
      try {

        const tokenizer = new Labels(parseError,optionsAcorn)
            tokenizer.build()
      
             tokenizer.debug(color.white('<<<===HighLight Syntax===>>>'))

      const highlight = new HighlightSyntax(tokenizer.result)
        highlight.parse()
       
        combo.process(highlight.result.emit() as string, errorManager.processColorize())
        process.stderr.write(combo.toString())
        console.log()
;
      } catch (error: unknown) {
         console.error('Error parsing code:', error);
      }

  })

process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

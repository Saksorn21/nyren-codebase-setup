import process from 'node:process'
import parseCode from '../acorn/main.js'
import Labels, { debug } from '../acorn/labels/main.js'
import type { Options } from 'acorn'
import HighlightSyntax from '../acorn/HighlightSyntax.js'
import color from './color.js'

import type { KeywordType, CustomToken } from '../acorn/labels/abstract.js'
import types from '../acorn/schema-keywordType.js'
import ErrorLogManager, {
  type ErrorAndPath,
  type ResultErrorTypeAndPaths,
} from '../acorn/ErrorLogManager.js'
import Fusion from '../acorn/Fusion.js'
import Tokenizer from '../acorn/Parse.js'
import clearAnsiCodes from '../utils/clearAnsi.js'
class ManagerFactory {
  rawCode!: string
  codeStr!: string
  codeArr!: Array<string>
  opts: Options
  tokens!: CustomToken[]
  errorLogAndPatns!: ResultErrorTypeAndPaths[]
  fusion!: Fusion
  constructor(options: Options) {
    this.opts = options
  }
  parseCode(code: string | Array<string>) {
    if (Array.isArray(code)) {
      this.rawCode = this.codeStr = code.join('\n')
      this.codeArr = code
    } else {
      this.rawCode = this.codeStr = code
      this.codeArr = [code]
    }
    return this
  }
  parseErrorLog() {
    const errorManager = new ErrorLogManager().process(this.codeStr)
    this.codeArr = errorManager.results.modifiedData
    this.codeStr = errorManager.results.modifiedData.join('\n')
    this.errorLogAndPatns = errorManager.processColorize()
    return this
  }
  buildTokens() {
    const tokens = new Labels(this.codeStr, this.opts)
    tokens.build()
    this.tokens = tokens.result
    return this
  }
  highlightSyntax() {
    const highlight = new HighlightSyntax(this.tokens)
    highlight.parse()
    this.codeStr = highlight.result.emit() as string
    return this
  }
  totalResult() {
    this.fusion = new Fusion()
    this.fusion.process(this.codeStr, this.errorLogAndPatns)
    return this
  }
  get lastResult(): string {
    return this.fusion.toString() ?? this.rawCode
  }
  writeLog(str: string) {
    process.stderr.write(str)
    console.log()
  }
}
const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
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
    const dataWarehouse = new ManagerFactory(optionsAcorn)
    dataWarehouse
      .parseCode(data.toString())
      .parseErrorLog()
      .buildTokens()
      .highlightSyntax()
      .totalResult()
      .writeLog(dataWarehouse.lastResult)
  })

process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

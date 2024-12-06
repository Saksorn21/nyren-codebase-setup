import process from 'node:process'
import Labels from '../acorn/labels/main.js'
import type { Options } from 'acorn'
import HighlightSyntax from '../acorn/HighlightSyntax.js'
import type { CustomToken } from '../acorn/labels/abstract.js'
import ErrorLogManager, {
  type ResultErrorTypeAndPaths,
} from '../acorn/ErrorLogManager.js'
import Fusion from '../acorn/Fusion.js'

class CodeProcessor {
  originalCode!: string
  formattedCode!: string
  codeLines!: Array<string>
  options: Options
  parsedTokens!: CustomToken[]
  errorLogs!: ResultErrorTypeAndPaths[]
  fusionResult!: Fusion

  constructor(options: Options) {
    this.options = options
  }

  initializeCode(code: string | Array<string>) {
    if (Array.isArray(code)) {
      this.originalCode = this.formattedCode = code.join('\n')
      this.codeLines = code
    } else {
      this.originalCode = this.formattedCode = code
      this.codeLines = [code]
    }
    return this
  }

  processErrorLog() {
    const errorManager = new ErrorLogManager().process(this.formattedCode)
    this.codeLines = errorManager.results.modifiedData
    this.formattedCode = this.codeLines.join('\n')
    this.errorLogs = errorManager.processColorize()
    return this
  }

  generateTokens() {
    const tokens = new Labels(this.formattedCode, this.options)
    tokens.build()
    this.parsedTokens = tokens.result
    return this
  }

  applySyntaxHighlighting() {
    const highlight = new HighlightSyntax(this.parsedTokens)
    highlight.parse()
    this.formattedCode = highlight.result.emit() as string
    return this
  }

  processFinalResult() {
    this.fusionResult = new Fusion()
    this.fusionResult.process(this.formattedCode, this.errorLogs)
    return this
  }

  get finalOutput(): string {
    return this.fusionResult.toString() ?? this.originalCode
  }

  outputLog(str: string) {
    process.stderr.write(str)
    console.log()
  }
}

const enhanceErrorLogging = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    const acornOptions: Options = {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      preserveParens: true,
      checkPrivateFields: true,
      allowHashBang: true,
      allowReserved: true,
      allowAwaitOutsideFunction: true,
    }
    const codeProcessor = new CodeProcessor(acornOptions)
    codeProcessor
      .initializeCode(data.toString())
      .processErrorLog()
      .generateTokens()
      .applySyntaxHighlighting()
      .processFinalResult()
      .outputLog(codeProcessor.finalOutput)
  })
console.log('Terminal width:', process.stdout.columns)

export default enhanceErrorLogging

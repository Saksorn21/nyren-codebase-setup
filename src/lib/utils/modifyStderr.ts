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
const modifyStderr = (stderr: typeof process.stderr) =>
  stderr.on('data', data => {
    const rawData = data.toString()

    const errorManager = new ErrorLogManager().process(rawData)
    const parseError = errorManager.results.modifiedData.join('\n')
    // รับผลลัพธ์ที่ประมวลผลแล้ว
    const { errorPathBlocks,  arrRawData, modifiedData } = errorManager.results
    

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

        const labels = new Labels(parseError,optionsAcorn)
          labels.build()
           labels.debug(color.white('<<<===HighLight Syntax===>>>'))

      const highlight = new HighlightSyntax(labels.result)
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

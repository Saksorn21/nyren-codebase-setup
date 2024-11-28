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
    // ลบ ANSI codes แล้วแยกเป็นบรรทัด

    const errorManager = new ErrorLogManager().process(rawData)
    const parseError = errorManager.results.modifiedData
    // รับผลลัพธ์ที่ประมวลผลแล้ว
    const { errorPathBlocks,  arrRawData, modifiedData } = errorManager.results
    
    
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
    const combo = new Fusion()
    const code = `function nyren(v: string) {
       if(typeof v !== 'string') throw new TypeError('v must be a string');
       return v.split('').reverse().join('')
    }
    nyren('hello')
    `
    try {
  
      //modifiedData.join('\n')
      const tokens = [
        ...parseCode.tokenizer(modifiedData.join('\n'), optionsAcorn),
      ] as CustomToken[]
      console.log(...tokens)
      // as SyntaxHighlight[]
      // const ast = full(parseCode.parse(code,optionsAcorn), node => console.log(node))
       
      // สร้าง token iterator

      const labels = new Labels(tokens)
      labels.build()
      labels.debug(color.white('<<<===HighLight Syntax===>>>'))
      //console.log('yes',labels.result)
console.log('true')
      const highlight = new HighlightSyntax(labels.result)
        highlight.parse()
      
      
      combo.process(highlight.result.emit() as string, errorManager.processColorize())
      process.stderr.write(combo.toString())
      console.log()
      //outputSyntax.push(...errorPathBlocks)

      //errorMessageAndPaths(...errorPathBlocks)
    } catch (error) {
      let str = ''
      debug(`Error caught: ${error.message}`)
     // console.log(error)
      console.log('error')
      try {
        console.log('start Tokenizer');
        const tokenizer = new Tokenizer(code);

        // ทดสอบ getTokens()
//const tokenizer = new Tokenizer("let x = 42;");
const token = tokenizer.toArray()
        console.log(...token)
        const labels = new Labels(token)
              labels.build()
              labels.debug(color.white('<<<===HighLight Syntax===>>>'))
              //console.log('yes',labels.result)
        
              const highlight = new HighlightSyntax(labels.result)
                highlight.parse()
       
        combo.process(highlight.result.emit() as string, errorManager.processColorize())
        process.stderr.write(combo.toString())
        console.log()
        // for (const token of tokenizer) {
        //   console.log(token);
        //  }

        // // หรือทีละโทเค็น
        // let token;
        // do {
        //   token = tokenizer.getToken();
        //  console.log(token);
        // } while (token.type.label !== 'eof');
      } catch (error: unknown) {
         console.error('Error parsing code:', error);
      }
      
      
      
      return
      modifiedData.forEach((item: string, index: number) => {
        if (item.includes('^')) {
            modifiedData[index] = color.red(item)
        } else{
          const chunk = clearAnsiCodes(item).split(' ')
          
          chunk.forEach((word: string, idx: number) =>{
            
            const normal = word.replace(/[^\w\s]/gi, '')
            let prev = chunk[idx - 1], next = chunk[idx + 1]
            //console.log(nom)
          if(types.keywordAnyTypes.includes(word)) chunk[idx] = color.hex('C678DD')(word)
            else if (typeof word === 'string' && word.includes('\'') || word.includes('\"')) chunk[idx] = color.hex('98C379')(word)
              else if (!isNaN(Number(normal)) && parseInt(normal) && next !== '|') chunk[idx] = color.hex('D19A66')(word)
                else if (next === '(') chunk[idx] = color.hex('61AFEF')(word)
  else chunk[idx] = color.hex('ABB2BF0')(word)
          })
          modifiedData[index] = chunk.join(' ')
          const chunk2 = modifiedData[index].split('')
          chunk2.forEach((chunk: string, idx: number) =>{
            if(chunk === ',') chunk2[idx] = color.hex('ABB2BF0')(chunk)
          })
          modifiedData[index] = chunk2.join('')
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

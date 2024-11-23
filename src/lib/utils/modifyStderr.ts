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
import Parser from '../acorn/Parse.js'
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
    try {
      const code = `
          const obj = 
        name: 'John',
        age: 30,
        city: 'New York',
        loc: {
          lat: 40.7128,
          lng: -74.0060
          map: (l: string) => {throw new Error(l)
                              }
        }
      
      obj.name
      obj.loc.map('ppp')
        `
      const tokens = [
        ...parseCode.tokenizer(modifiedData.join('\n'), optionsAcorn),
      ] as CustomToken[]
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
      const parseError = processTokens(modifiedData.join('\n'))
      console.log(parseError)
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

function processTokens(data: string) {
  const tokens: string[] = [];
  let currentToken = '';
  let str = '';

  // Loop through each character in the input string
  for (let i = 0; i < data.length; i++) {
      const char = data[i];
      const nextChar = data[i + 1] ?? ''; // Lookahead for the next character

      // Check for word boundaries or separators
      if (/\s/.test(char) || char === ',' || char === '(' || char === ')' || char === '\n') {
          if (currentToken) {
              tokens.push(currentToken); // Push the current token
              currentToken = ''; // Reset the token
          }

          // Handle the separators explicitly (e.g., include them as tokens)
          if (char.trim() !== '') {
              tokens.push(char);
          }
      } else {
          currentToken += char; // Build the token
      }
  }

  // If there's any remaining token at the end of the loop, add it
  if (currentToken) tokens.push(currentToken);

  // Process tokens with coloring logic
  const coloredTokens = tokens.map((token, idx) => {
      const next = tokens[idx + 1] ?? '';
      const prev = tokens[idx - 1] ?? '';
      const normal = token.replace(/[^\w\s]/gi, '');

      if (types.keywordAnyTypes.includes(token)) {
          return color.hex('C678DD')(token); // Keyword coloring
      } else if (typeof token === 'string' && (token.includes('\'') || token.includes('\"'))) {
          return color.hex('98C379')(token); // String coloring
      } else if (!isNaN(Number(normal)) && parseInt(normal) && next !== '|') {
          return color.hex('D19A66')(token); // Number coloring
      } else if (next === '(') {
          return color.hex('61AFEF')(token); // Function call coloring
      } else if (token === ',') {
          return color.hex('ABB2BF0')(token); // Separator coloring
      } else {
          return color.hex('ABB2BF0')(token); // Default coloring
      }
  });

  // Combine tokens back into a single string
  str = coloredTokens.join('');
  return str;
}

// Usage
const input = `const sum = (a, b) => a + b;`;
const result = processTokens(input)
console.log('process',result)
process.stdout.on('data', data => console.log(data.toString()))
process.stderr.on('data', data => console.log(data.toString()))
export default modifyStderr

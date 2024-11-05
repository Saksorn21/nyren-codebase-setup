import process from 'node:process'
import parseCode, { tokTypes, isIdentifierChar, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parseExpressionAt, tokContexts,} from '../acorn.js'

import color from './color.js'
import clone from './clone.js'
if (process.stderr.setRawMode) {
  process.stderr.setRawMode(true); // เปิดใช้งาน raw mode
}

const modifyStderr = (stderr: typeof process.stderr) => stderr.on('data', data => {
  let str = data.toString().split('\n')
  str.forEach((item: string, index: number) => {
 if (item.includes('Bun')) {
      str.splice(index, str.length)
    }else if (item.includes('error:')){
   //str.splice(index, str.length)
    }
   
  })
  //console.log(tokTypes)
  str = str.join('\n')
  console.log(str)
  
  
  const optionsAcorn = {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
    preserveParens: true,
    //allowAwaitOutsideFunction: true,
    //onToken: handleToken,
    onComment: (block, text, start, end) => console.log(text)
  }
    try {
    const ast = [...parseCode(str,optionsAcorn)]
    //console.log(ast);
      highlightSyntax(ast)

      console.log();
  } catch (error: unknown) {
     console.log(error)
  }
  
  // console.log(str.join('\n'))
})
const highlightSyntax = (ast) => {
  const outputSyntax: Array<string> = []
    let currentLine = 1;  // เริ่มบรรทัดที่ 1
    let currentColumn = 0;  // เริ่มคอลัมน์ที่ 0

    ast.forEach(token => {
        const { label } = token.type;
        const { line: startLine, column: startColumn } = token.loc.start;
        const { line: endLine, column: endColumn } = token.loc.end;

        // แทรกการขึ้นบรรทัดใหม่หากบรรทัดเปลี่ยน
        while (currentLine < startLine) {
              outputSyntax.push('\n');
            currentLine++;
            currentColumn = 0;
        }

        // แทรกช่องว่างเพื่อให้คอลัมน์ตรงกับต้นฉบับ
        while (currentColumn < startColumn) {
              outputSyntax.push(' ');
            currentColumn++;
        }

        let highlighted = false;

        // ตรวจสอบโทเค็นใน tokTypes และ tokContexts
        for (const [_, value] of Object.entries({ ...tokTypes, ...tokContexts })) {
            if (value.label === token.value || value.token === token.value) {
                highlighted = true;
                if (value.label === '^' && token.value !== undefined) {
                      outputSyntax.push(color.grey(token.value));
                } else if (value.token) {
                      outputSyntax.push(color.green('"' + token.value + '"'));
                } else {
                  highlighted = false
                    //process.stdout.write(color.white(label));
                }
                break;
            }
        }
      if (!highlighted && (token.value === '""' || token.value === "''")) {
          outputSyntax.push(color.deepBlue(token.value));
        highlighted = true;
        }

        // ตรวจสอบการขึ้นบรรทัดใหม่และช่องว่าง non-ASCII
        if (lineBreak.test(token.value)) {
              outputSyntax.push('\n');
            highlighted = true;
        } else if (nonASCIIwhitespace.test(token.value)) {
              outputSyntax.push(' ');
            highlighted = true;
        }

        // กำหนดสีสำหรับประเภทโทเค็นหลัก หากยังไม่ได้ไฮไลต์
        if (!highlighted) {
            if (keywordTypes[token.value]) {
                  outputSyntax.push(color.purple(token.value));
            } else if (label === 'name') {
                  outputSyntax.push(color.reset.style(color.grey(token.value)))
            } else if (label === 'string') {
              
                  outputSyntax.push( color.deepBlue('"' +token.value + '"'));
            } else if (label === 'num') {
                  outputSyntax.push(color.amber(token.value) );
            } else if (token.value === undefined) {
                  outputSyntax.push(color.amber(label));
            } else {
              console.log(token.value)
                  outputSyntax.push(token.value);  // ใช้สีปกติสำหรับโทเค็นอื่นๆ
            }
        }

        // อัปเดตตำแหน่งล่าสุดตามตำแหน่งสิ้นสุดของโทเค็นนี้
        currentLine = endLine;
        currentColumn = endColumn;
    });
  //process.stdout.write(outputSyntax.join(''))
errorMessageAndPaths(outputSyntax)
      // เพิ่มบรรทัดใหม่หลังจากจบการแสดงผล
};
const errorMessageAndPaths = (outputSyntax: Array<string>) =>{
  console.log(color.white('Error:'));
  let msg = '', str = outputSyntax.join('')
  const match = str.match(/at (.+):(\d+):(\d+)/);
  if (match) {
      const [filePath, line, column] = match;
    msg = `at ${color.hex('5fafaf')(color.reset.style(`${filePath}:${parseInt(line)}:${parseInt(column)}\n`))}`;
    }
      str = str.split('\n')
  
        str.forEach((item: string, index: number) => {
       if (item.includes('Bun')) {
            str.splice(index, str.length)
         
          }else if (item.includes(color.red('error'))){
         //str.splice(index, str.length)
         const override = str[index].split('error')
         //console.log(override)
         str[index] =
           
           color.red('error:') + color.grey(override.slice())
          }
    })
      process.stdout.write(str.join('\n'))
    console.log()
}

process.stdout.on('data',(data)=>console.log(data.toString()))
process.stderr.on('data',(data)=>console.log(data.toString()))
export default modifyStderr
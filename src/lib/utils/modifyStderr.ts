import process from 'node:process'
import parseCode, { tokTypes, Token, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parseExpressionAt, tokContexts,} from '../acorn.js'
import { clearAnsiCodes } from './main.js'

import color from './color.js'
import clone from './clone.js'


const modifyStderr = (stderr: typeof process.stderr) => stderr.on('data', data => {
  let str = data.toString().split('\n')
  let cloneData = clone(str)
  str.forEach((item: string, index: number) => {
 if (item.includes('Bun')) {
      str.splice(index, str.length)
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
    allowAwaitOutsideFunction: true,

  }
    try {
    const ast: Token[] = [...parseCode(str,optionsAcorn)]
    
    //console.log(ast);
      highlightSyntax(ast)

  } catch (error: unknown) {
     //console.log(error)
       cloneData.forEach((item: string, index: number) => {
         
         if (item.includes('^')) {
           cloneData[index] = color.red(item)
         } else if (item.includes('error')) {
           const override = cloneData[index].split('error:')
           cloneData[index] =
             color.red('error:') + color.grey(override.slice(1))
         } else if (item.includes('at ')){
           cloneData[index] = atPath(item)
         }else if (item.includes('Bun')) {
             cloneData.splice(index, cloneData.length)
         }
         
           const override = cloneData.join('\n').split(' ')
            override.forEach((item: string, index: number) =>{
            if (keywordTypes[item]){
              
              override[index] = color.hex('A78CFA')(item)
            }
          })
           cloneData = override.join(' ')
         
        })
      console.log(cloneData.join('\n'))
  }
  
  // console.log(str.join('\n'))
})
const highlightSyntax = (ast: Token[]) => {
  const outputSyntax: Array<string> = []
    let currentLine = 1;  // เริ่มบรรทัดที่ 1
    let currentColumn = 0;  // เริ่มคอลัมน์ที่ 0

    ast.forEach((token: any) => {
        const { label } = token.type;
        const { line: startLine, column: startColumn } = token.loc?.start;
        const { line: endLine, column: endColumn } = token.loc?.end;

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
          const {label: tokLabel, token: tok } = value as any
            if (tokLabel === token.value || tok === token.value) {
                highlighted = true;
                if (label === '^' && token.value !== undefined) {
                  
                      outputSyntax.push(color.hex('f14c4c')(token.value));
                } else if (tok) {
                  
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
                  outputSyntax.push(color.hex('A78CFA')(token.value));
            } else if (label === 'name') {
                  outputSyntax.push(color.grey(token.value))
            } else if (label === 'string') {
              
                  outputSyntax.push( color.lightSteelBlue.dim('"' +token.value + '"'));
            } else if (label === 'num') {
                  outputSyntax.push(color.amber.italic(token.value) );
            } else if (token.value === undefined) {
                  outputSyntax.push(color.chalk.green.bold(label));
            } else {
              //console.log(token.value)
              outputSyntax.push(color.chalk.green.bold.visible(token.value))  // ใช้สีปกติสำหรับโทเค็นอื่นๆ
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
const atPath = (path: string) =>{ 
   const match = path.match(/at (.+)/);
  if (match) {
      const [filePath] = match;
    const path = filePath.split(':')
    const line = color.chalk.yellow(parseInt(path[1]))
    const column = color.chalk.yellow(parseInt(path[2]))

    // parseInt
  return  `    ${color.chalk.cyan.visible(`${path[0]}:${line}:${column}\n`)}`;
    }
  return
  }
const errorMessageAndPaths = (outputSyntax: Array<string>) =>{

  let str: any = outputSyntax.join('')
  
      str = str.split('\n')
  
str.forEach((item, index) => {
  // ตรวจจับเฉพาะ "error:" และทำสีโดยไม่กระทบสีที่ทำไฮไลต์ไว้
  if (item.includes(clearAnsiCodes("error"))) {
    const override = clearAnsiCodes(item).split(':'); // ใช้ clearAnsiCodes แค่กับส่วนที่เป็น "error:"
    str[index] = color.red('error') + color.chalk.bold.visible(`:${override.slice(1).join(':')}`);

  // ตรวจจับเฉพาะ "at" และจัดการ path โดยไม่กระทบไฮไลต์ที่เหลือ
  } else if (item.includes(clearAnsiCodes("at"))) {
    str[index] = atPath(clearAnsiCodes(item));
  }
});

// รวมข้อความและแสดงผล
process.stdout.write(str.join('\n'));
console.log();
};

process.stdout.on('data',(data)=>console.log(data.toString()))
process.stderr.on('data',(data)=>console.log(data.toString()))
export default modifyStderr
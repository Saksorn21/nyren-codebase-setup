import process from 'node:process'
import parseCode, { tokTypes, Token, isNewLine, keywordTypes, lineBreak, lineBreakG, nonASCIIwhitespace, parseExpressionAt, tokContexts,} from '../acorn.js'
import { clearAnsiCodes } from './main.js'
import type { ecmaVersion, Options } from 'acorn'
import color from './color.js'
import clone from './clone.js'
import {full} from 'acorn-walk'

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
  //console.log(str)
  
  
  const optionsAcorn: Options = {
    ecmaVersion: 2022,
    sourceType: 'module',
    locations: true,
    preserveParens: true,
    allowAwaitOutsideFunction: true,
  }
  const code = `
  
  
  const ppp: string = 'nyrenx';
  class sod{
  #home = 'home'
  namep: string = 'sod'
  constructor(p: string){}
  #hgg(){
  return this.#home
  }
  }
  `
    try {
    const ast = [...parseCode.tokenizer(code,optionsAcorn)]
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
           str = override.join(' ')
         
        })
      console.log(str)
  }
  
  // console.log(str.join('\n'))
})
const highlightSyntax = (ast: Token[]) => {
  const outputSyntax: Array<string> = [];
  let currentLine = 1;  // เริ่มบรรทัดที่ 1
  let currentColumn = 0;  // เริ่มคอลัมน์ที่ 0
  let prevToken = null;

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
      const { label: tokLabel, keyWord } = value as any;
      if (tokLabel === token.value || keyWord === token.value) {
        highlighted = true;
        if (label === '^' && token.value !== undefined) {
          outputSyntax.push(color.hex('f14c4c')(token.value));
        } else if (keyWord !== undefined && keyWord === token.type.keyword) {
          outputSyntax.push(color.green('"' + token.value + '"'));
        } else {
          highlighted = false;
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
      } else if (label === 'privateId') {
        if (prevToken && prevToken.type.label === '.') {
          outputSyntax.push(color.hex('f14c4c')('#' + token.value));
        } else {
        outputSyntax.push(color.hex('6495EE')('#' + token.value));
      }
      } else if (label === 'name') {
        // ตรวจสอบว่าโทเค็นก่อนหน้าเป็นจุด (.)
        if (prevToken && prevToken.type.label === '.') {
          outputSyntax.push(color.hex('f14c4c')(token.value));
        } else {
          outputSyntax.push(color.grey(token.value));
        }
      } else if (label === 'string') {
        outputSyntax.push(color.hex('98C379').visible('"' + token.value + '"'));
      } else if (label === 'num') {
        outputSyntax.push(color.amber.italic(token.value));
      } else if (token.value === undefined) {
        outputSyntax.push(color.chalk.green.bold(label));
      } else {
        outputSyntax.push(color.chalk.bold.visible(token.value));
      }
    }

    // อัปเดตตำแหน่งล่าสุดตามตำแหน่งสิ้นสุดของโทเค็นนี้
    currentLine = endLine;
    currentColumn = endColumn;

    // อัปเดต prevToken ให้เป็นโทเค็นปัจจุบัน
    prevToken = token;
  });

  // แสดงผล
  errorMessageAndPaths(outputSyntax);
};
const atPath = (path: string) => { 
  const match = path.match(/at\s+([^\s]+)?\s?([^\s:]+):(\d+):(\d+)/);

  if (match) {
    const method = match[1] || ' '; // กรณีไม่มีชื่อเมธอด
    const filePath = match[2];
    const line = color.chalk.yellow(parseInt(match[3]));
    const column = color.chalk.yellow(parseInt(match[4]));

    return `    as ${color.chalk.cyan(`${method} ${filePath}:${line}:${column}\n`)}`;
  }

  return '';
};
const errorMessageAndPaths = (outputSyntax: Array<string>) =>{

  let str: any = outputSyntax.join('')
  
      str = str.split('\n')
  
str.forEach((item, index) => {
  // ตรวจจับเฉพาะ "error:" และทำสีโดยไม่กระทบสีที่ทำไฮไลต์ไว้
  if (item.includes(clearAnsiCodes("error"))) {
    const override = clearAnsiCodes(item).split(':'); // ใช้ clearAnsiCodes แค่กับส่วนที่เป็น "error:"
    str[index] = color.red('error') + color.chalk.bold.visible(`:${override.slice(1).join(':')}`);


  } else if (/at\s+[^\s]+(?:\s?\([^\)]+\))?:\d+:\d+/.test(clearAnsiCodes(item))) {
    
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
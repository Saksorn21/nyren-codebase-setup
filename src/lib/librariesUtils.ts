import {
  createJsonFile,
  createFile,
  createDirectory,
} from './fileSystem.js'
import { resolvePath } from './pathHelper.js'
import { parseTemplate, fetchTemplateCode, type ParseObj } from './templateUtils.js'
import { checkBoxForLibraries } from './prompts.js'
import { fetchToJson } from './utils.js'


export async function libsProcessor(target: string) {
  const contentsLibs: ParseObj<any> = await fetchTemplateCode('contentsLibraries.json');
  let raw: ParseObj<any> = {};
  // ตรวจสอบว่า target อยู่ในไฟล์ contentsLibraries.json หรือไม่
  if (contentsLibs[target]) {
    // วนลูปผ่านแพ็กเกจใน target
    for (const pkg of contentsLibs[target]) {
      // เพิ่มแพ็กเกจลงใน raw
      raw[pkg.pkgname] = pkg;
      // ถ้ามีแพ็กเกจย่อย ให้เพิ่มลงใน raw เช่นกัน
      
    }
  } else {
    console.error(`Target '${target}' not found in contentsLibraries.json`);
  }
  console.log(raw);
  return raw
}




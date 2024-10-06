import { 
  cp as fsCopyDirectory,
  readFile as fsReadFile,
  writeFile as fsWriteFile,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readFile = async (path: string) => await fsReadFile(path, 'utf-8')

async function createJsonFile(filePath: string, data: object): Promise<{ success: boolean, error?: Error }> {
  try {
    const src = resolve(filePath, 'package.json')
    const jsonData = JSON.stringify(data, null, 2); // แปลง object เป็น JSON ที่อ่านง่าย (มี indent 2 ช่อง)
    await fsWriteFile(src, jsonData, 'utf-8'); // เขียนข้อมูล JSON ลงในไฟล์
    
    
    return { success: true }
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

async function copyRepo(src: string, dest: string): Promise<boolean> {
  try {
     await fsCopyDirectory(src, dest, { 
       recursive: true 
     });
    return true;
  } catch (error: unknown) {
     return false
  }
  
  
 // console.log(`Copied directory from ${src} to ${dest}`);
}

export { copyRepo, readFile, readFileSync, createJsonFile }
//copyDirectory('source-folder', 'destination-folder');
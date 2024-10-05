import { 
  cp as fsCopyDirectory,
  readFile as fsReadFile,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs';
const readFile = async (path: string) => await fsReadFile(path, 'utf-8')


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

export { copyRepo, readFile, readFileSync }
//copyDirectory('source-folder', 'destination-folder');
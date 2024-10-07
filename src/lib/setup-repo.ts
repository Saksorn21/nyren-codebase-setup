
import { readFile, createJsonFile, createFile, type ResultFs } from './fileSystem.js'
import process from 'node:process'
import { getDirname, resolvePath } from './pathHelper.js';

const __dirname = getDirname(import.meta.url)

export async function setPrettierJson(target: string, src: string = process.cwd()): Promise<ResultFs> {
  
  const repoPath = resolvePath(__dirname, '../../repo-templates/.prettierrc.json')
   const dataPrettier = await readFile(repoPath)
  const parsedData = JSON.parse(dataPrettier);
  if (parsedData.hasOwnProperty('parser')) {
    parsedData.parser = target;
  }
const {success, error } = await createJsonFile(resolvePath(src, '.prettierrc.json'), parsedData);
  if (error) {
    return { success, error: error as Error }
  }
  return { success }
}
export async function createFileMain(target: string, path: string, basePath: string = process.cwd()) {
  const basePathUser = resolvePath(basePath, `${path}/index${path !== 'src' ? '.test.' : '.'}${target === 'typescript' ? 'ts' : 'js'}`)
   const dataMain = `
   import { tools } from '@nyren/codebase-setup';
   tools.log(tools.success, tools.textGreen('Hello, nyren!'));
   `
    await createFile(basePathUser, dataMain)
  
}


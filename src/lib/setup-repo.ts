
import { readFile, createJsonFile, createFile, type ResultFs } from './fileSystem'
import { resolve } from 'node:path'

export async function setPrettierJson(target: string, src: string = process.cwd()): Promise<ResultFs> {
  
  const repoPath = './repo-templates/.prettierrc.json'
   const dataPrettier = await readFile(repoPath)
  const parsedData = JSON.parse(dataPrettier);
  if (parsedData.hasOwnProperty('parser')) {
    parsedData.parser = target;
  }
const {success, error } = await createJsonFile(src, parsedData);
  if (error) {
    return { success, error: error as Error }
  }
  return { success }
}
export async function createFileMain(target: string, path: string, src: string = process.cwd()) {
  const basePath = resolve(src, `${path}/index${path !== 'src' ? '.test.' : '.'}${target === 'typescript' ? 'ts' : 'js'}`)
   const dataMain = `
   import { tools } from '@nyren/codebase-setup/tools';
   tools.log(tools.success, tools.textGreen('Hello, nyren!'));
   `
    await createFile(basePath, dataMain)
  
}


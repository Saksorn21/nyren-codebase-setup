
import { readFile, createJsonFile, createFile, resolvePath, type ResultFs } from './fileSystem.js'


export async function setPrettierJson(target: string, src: string = process.cwd()): Promise<ResultFs> {
  
  const repoPath = './repo-templates/.prettierrc.json'
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
export async function createFileMain(target: string, path: string, src: string = process.cwd()) {
  const basePath = resolvePath(src, `${path}/index${path !== 'src' ? '.test.' : '.'}${target === 'typescript' ? 'ts' : 'js'}`)
   const dataMain = `
   import { tools } from '@nyren/codebase-setup/tools';
   tools.log(tools.success, tools.textGreen('Hello, nyren!'));
   `
    await createFile(basePath, dataMain)
  
}


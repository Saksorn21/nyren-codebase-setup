import { readFile, createJsonFile, createFile, createDirectory } from './fileSystem.js'
import { getDirname, resolvePath } from './pathHelper.js'
const __dirname = getDirname(import.meta.url)
async function parseTemplate(target: string): Promise<string> {
   const language = target === 'typescript' ? 'ts' : 'js'
  const repoPath = resolvePath(__dirname, '../..', 'repo-templates', language, 'template.json')
  const readJson = await readFile(repoPath)
   
  return JSON.parse((readJson) as string);
}

async function buildTemplateFiles(target: string,userDiretoryName: string) {
  const templateProcessor = await parseTemplate(target)
  const userdir = resolvePath(process.cwd(), userDiretoryName)
  //console.log(templateCode.files)
  for (const file of templateProcessor.files) {
    const filePath = resolvePath(userdir, file.path)
     await createDirectory(filePath)
    if (file.path.endsWith('.json')){
      file.content = JSON.parse(file.content)
    await createJsonFile(filePath, file.content)
    }else{

    await createFile(filePath, file.content)
    }
  }
}

(async () => await buildTemplateFiles('typescript', 'my-project'))()

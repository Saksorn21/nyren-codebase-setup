import { readFile, createJsonFile, createFile, createDirectory } from './fileSystem.js'
import { getDirname, resolvePath } from './pathHelper.js'
const __dirname = getDirname(import.meta.url)
async function parseTemplate(target: string): Promise<Record<string, any>> {
   const language = target === 'typescript' ? 'ts' : 'js'
  const repoPath = resolvePath(__dirname, '../..', 'repo-templates', language, 'template.json')
  const readJson = await readFile(repoPath)
   
  return JSON.parse((readJson) as string);
}

async function buildTemplateFiles(userDiretory: string, baseDiretory: string, content: string | Record<string, any>): Promise<Record<string, any>>{
  const row: Record<string, any> = {}
  const fullPathUser = resolvePath(userDiretory, baseDiretory)
   await createDirectory(fullPathUser)
  
  if (!baseDiretory.endsWith('.json')){
    
    await createFile(fullPathUser, content as string)
  }else{
    const parsedContent = JSON.parse(content as string) // Parse content and store it in a new variable
      if (baseDiretory !== 'package.json') {
        
        await createJsonFile(fullPathUser, parsedContent)
      }
      
        row.contentPackage = parsedContent
  }
  
  row.fullPathUser = fullPathUser
  return row
}
async function templateProcessor(target: string,userDiretoryName: string) {
  const processor = await parseTemplate(target)
  const userdir = resolvePath(process.cwd(), userDiretoryName)
  //console.log(templateCode.files)
  let row = {}
  const fileNames: Set<any> = new Set([])
  for (const file of processor.files) {
     row =
await buildTemplateFiles(userdir, file.path, file.content)
    fileNames.add(file.path)
    
  }
  
}

(async () => await templateProcessor('typescript', 'my-project'))()

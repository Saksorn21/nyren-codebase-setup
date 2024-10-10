import { readFile, createJsonFile, createFile, createDirectory } from './fileSystem.js'
import { getDirname, resolvePath } from './pathHelper.js'
import { processSpinner } from '../main.js'
interface ParseObj<T> {
  [name: string]: T | Record<string, T>
}
const __dirname = getDirname(import.meta.url)
async function presetSpinnerTemplate(callFn: Function, diretoryName: string) {
   return {
     start: `Creating the ${diretoryName}`,
       success: `${diretoryName} creation completed successfully`,
       fail: `${diretoryName} creation failed!`,
    callAction: callFn(),
  }
}

 async function fetchTemplateCode(templateName: string): Promise<ParseObj<any>>{
   try {
     const url = `https://unpkg.com/@nyren/repo-templates/${templateName}-template.json`;
     const response: ParseObj<any> = await fetch(url);
     const templateCode: ParseObj<any> = await response.json()
     return templateCode;

   } catch (e) {
     return {}
   }
};
async function parseTemplate(target: string): Promise<ParseObj<any>> {
   const language = target === 'typescript' ? 'ts' : 'js'
   
  return fetchTemplateCode(language)
}

async function buildTemplateFiles(userDiretory: string, baseDiretory: string, content: string | string[] | ParseObj<any> ): Promise<void>{
  
  const fullPathUser = resolvePath(userDiretory, baseDiretory)
   await createDirectory(fullPathUser)

    await createFile(fullPathUser, content as string)

}
async function templateProcessor(target: string,userDiretoryName: string): Promise<ParseObj<any>> {
  const processor = await parseTemplate(target)
  const userdir = resolvePath(process.cwd(), userDiretoryName)
  
  let raw: ParseObj<any> = {}
  raw.userDiretory = userdir
  const filsStorage: Set<string> = new Set([])
  for (const file of processor.files) {
    const baseDiretory = file.path
    const content = file.content
    
      filsStorage.add(file.path)
    
    //TODO: Take the "package.json" file and customize it later.
    filsStorage.delete('package.json')
    raw.baseFilesName = [...filsStorage]
      
    if (!baseDiretory.endsWith('.json')){
      // General files
        raw[baseDiretory] = content
    }else{
      // json files
      const parsedContent = JSON.parse(content as string) 
        if (baseDiretory === 'package.json') raw.contentPackage = parsedContent
          //TODO: The rest of the json files
        else raw[baseDiretory] = parsedContent
     } 
  }
  
  
  return raw
}

(async () => await templateProcessor('typescript', 'my-project'))
export { templateProcessor, buildTemplateFiles, presetSpinnerTemplate }
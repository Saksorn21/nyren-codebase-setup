import {
  createJsonFile,
  createFile,
  createDirectory,
} from './fileSystem.js'
import { resolvePath } from './pathHelper.js'

import { fetchToJson } from './utils.js'
export interface ParseObj<T> {
  [name: string]: T | T[]
}
const fetchTemplateCode = async (templateName: string) => await fetchToJson(`https://unpkg.com/@nyren/repo-templates/${templateName}-template.json`)


async function parseTemplate(target: string): Promise<ParseObj<any>> {
  const language = target === 'typescript' ? 'ts' : 'js'

  return fetchTemplateCode(language)
}

async function buildTemplateFiles(templateCode: ParseObj<any>): Promise<void> {
  const { userDiretory, baseFilesName, ...templatesCode } = templateCode
  await createDirectory(userDiretory)
  for (const [key, value] of Object.entries(templatesCode)) {
    for (const file of baseFilesName) {
      if (file.includes(key)) {
        const fullPathUser = resolvePath(userDiretory, key)
        await createDirectory(fullPathUser)
        if (key.endsWith('.json'))
          await createJsonFile(fullPathUser, value)
        else await createFile(fullPathUser, value as string)
      }
    }
  }
}
async function templateProcessor(
  target: string
): Promise<ParseObj<any>> {
  const processor = await parseTemplate(target)

  let raw: ParseObj<string> = {}
  const filsStorage: Set<string> = new Set([])
  for (const file of processor.files) {
    const baseDiretory = file.path
    const content = file.content

    filsStorage.add(file.path)

    //TODO: Take the "package.json" file and customize it later.
    filsStorage.delete('package.json')
    raw.baseFilesName = [...filsStorage]

    if (!baseDiretory.endsWith('.json')) {
      // General files
      raw[baseDiretory] = content
    } else {
      // json files
      const parsedContent = JSON.parse(content as string)
      if (baseDiretory === 'package.json') raw.contentPackage = parsedContent
      //TODO: The rest of the json files
      else raw[baseDiretory] = parsedContent
    }
  }

  return raw
}


export { templateProcessor, buildTemplateFiles }

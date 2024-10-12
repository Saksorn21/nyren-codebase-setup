  import {
    createJsonFile,
    createFile,
    createDirectory,
  } from './fileSystem.js'
  import { libsProcessor } from './librariesUtils.js'
  import { parseTemplate, fetchTemplateCode, type ParseObj } from './templateUtils.js'
  import { checkBoxForLibraries } from './prompts.js'
  import { fetchToJson } from './utils.js' 

export async function matchLibrary(target: string) {
  const storesLibrary = await libsProcessor(target)
   const userLibrary = await checkBoxForLibraries(Object.keys(storesLibrary))
  let raw: ParseObj<any> = {}
  for (const pkg of userLibrary){
    if (storesLibrary[pkg]){
      const {pkgname,version, configfile} = storesLibrary[pkg]
      raw[pkg] = {pkgname, version, configfile}
      if (storesLibrary[pkg].sublib) {
        for (const subPkg of storesLibrary[pkg].sublib) {
          raw[subPkg.pkgname] = subPkg
        }
      }
    }
  }
  
  return raw
}

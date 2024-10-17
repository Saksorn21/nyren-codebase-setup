import { tools } from '../lib/help.js'
interface Examples<T> {
  [fnname: string]: () => T
}
const examples: Examples<string> = {}

examples.init = function () {
   return `
   ${tools.textOrange(`${tools.info}Examples${tools.info}`)}
   $ nyrenx init
   ${tools.textOrange(`${tools.info}Options${tools.info}`)} 
   -n, --project-name [project-name]
   -t, --target [target]
   -m, --module [module]
   -d, --directory [directory]
   --fix <project-name> ${tools.fast}
   `
     
   
}
export default examples

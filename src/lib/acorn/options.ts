import utils from '../utils/main.js'
import { Options, defaultOptions } from 'acorn'
// A second argument must be given to configure the parser process.
// These options are recognized (only `ecmaVersion` is required):


let warnedAboutEcmaVersion = false

export function getOptions(opts: Options) {
  let options: any = {}

  for (let opt in defaultOptions)
    options[opt] = opts && utils.hasOwn(opts, opt) ? (opts as any)[opt] : (defaultOptions as any)[opt] as any

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.")
    }
    options.ecmaVersion = 11
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009
  }

  if (options.allowReserved == null)
    options.allowReserved = options.ecmaVersion < 5

  if (!opts || opts.allowHashBang == null)
    options.allowHashBang = options.ecmaVersion >= 14

  

  return options
}

import chalk from 'chalk'
import logSymbols from 'log-symbols'
export interface HelpFn<T> {
  [name: string]: () => Promise<T> | string
}
const textGreen = chalk.hex('#87ffaf').bold
const textRed = chalk.hex('#d7005f').bold
const textOrange = chalk.hex('#ffaf00').bold
const textDeepBlue = chalk.hex('#00afff').bold
const textWhit = chalk.hex('#ffffff').bold
const textGrey = chalk.hex('#626262').bold
let help: HelpFn<void> = {}
const info = logSymbols.info
const success = logSymbols.success
const warning = logSymbols.warning
const error = logSymbols.error
const log = console.log
help.warnOverWrite = async () => {
  log(warning, `${textOrange('The directory will be overwritten.')}`)
  log(
    warning,
    `${textOrange("If you're unsure, please read the documentation.")}`
  )
  log(
    warning,
    `${textOrange('For more information, see')}: ${textGrey.underline('https://github.com/Saksorn21/nyren-ts-setup/blob/main/README.md')}`
  )
}

help.libraryEx = async () => {
  log(
    info,
    `${textDeepBlue(`Example: ${textWhit('nyrenx @nyren/codebase-setup @nyren/ts256k1')}`)}`
  )
  log(
    info,
    `${textDeepBlue('The libraries you install will be added to the dependencies section.')}`
  )
  log(
    info,
    `${textDeepBlue(`To install a library as a devDependency, use the ${textWhit.underline('"-D"')} flag followed by the library name.`)}`
  )
}
help.buildProject = async () => {
  log(
    info,
    `${textDeepBlue("There is a default value. If you don't want to change it, just press Enter.")}`
  )
}
const tools = {
  info,
  success,
  warning,
  error,
  textOrange,
  textDeepBlue,
  textWhit,
  textGrey,
  textGreen,
  textRed,
  log,
}
export {
  help,
  info,
  warning,
  error,
  success,
  textOrange,
  textDeepBlue,
  textWhit,
  textGrey,
  textRed,
  textGreen,
  log,
  tools,
}
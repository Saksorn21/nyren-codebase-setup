import chalk from 'chalk'
import logSymbols from 'log-symbols'
export interface HelpFn<T1, T2 = string, T3 = string> {
  [name: string]: (arge?: T2, arge2?: T3) => T1 | string
}


const textSlateBlue3 = chalk.hex('#5f5faf').bold
const textGreen = chalk.hex('#87ffaf').bold
const textRed = chalk.hex('#d7005f').bold
const textOrange = chalk.hex('#ffaf00').bold
const textDeepBlue = chalk.hex('#00afff').bold
const textWhit = chalk.hex('#ffffff').bold
const textGrey = chalk.hex('#626262').bold
const prefixCli = `${textWhit('[')}${textSlateBlue3('nyrenx')}${textWhit(']')}`
let help: HelpFn<void> = {}
const info = logSymbols.info
const success = logSymbols.success
const warning = logSymbols.warning
const error = logSymbols.error
const log = console.log
help.warnOverWrite = () => {
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

help.libraryEx = () => {
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
help.buildProject = () =>
  log(
    info,
    `${textDeepBlue("There is a default value. If you don't want to change it, just press Enter.")}`
  )

help.notification = (target?: string, module?: string): void =>
  log(
    info,
    textSlateBlue3(
      `You will start the project using the language: ${tools.textOrange('[')}${textWhit(target === 'ts' ? 'TypeScript' : 'JavaScript')}${textOrange(']')}, with the module: ${textOrange('[')}${textWhit(module)}${textOrange(']')}.`
    )
  )
help.warnSettingCompleted = (projectName?: string, userDiretory?: string): void => tools.log(
    success,
    textGreen(
      `Successfully setting the project: ${textWhit(projectName)} to ${textWhit(userDiretory )}\n`
    )
  )
help.noticeNewVersion = (currentVersion?: string,latestVersion?: string): void => {
  
  const install = `${textDeepBlue.underline(`npm install -g @nyren/codebase-setup@latest@${latestVersion}`)}`
  log(prefixCli, info, textWhit(`New version available! ${textDeepBlue(currentVersion)} -> ${textOrange(latestVersion)}`))
  log(prefixCli, info, textWhit(`To update run: ${install} or nyrenx-codeup update` ))
}
function transformString(input: string): string {
  // Check if the input starts with '@' and contains '/'
  if (input.startsWith('@') && input.includes('/')) {
    // Remove '@' and replace '/' with '-'
    return input.replace(/^@/, '').replace('/', '-')
  }
  // If the input doesn't match the conditions, return the original input
  return input
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
  textSlateBlue3,
  log,
}
export { help, tools, transformString, prefixCli }

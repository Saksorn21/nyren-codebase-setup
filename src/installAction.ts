import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { processSpinner } from './lib/spinner.js'
import { executeCommand } from './lib/executeCommand.js'
import examples from './cli/examples.js'
import { help, tools as t } from './lib/help.js'
interface Libraries {
  deps: string | undefined
  devDeps: string | undefined
}
export async function installAction(args: string[]): Promise<void> {
  const commandIndex = process.argv.indexOf('--')
  if (commandIndex === -1 || commandIndex === process.argv.length - 1) {
    help.libraryEx()
    t.log(t.textRed(`${t.idea} missing command after ${t.textWhit.dim(`[nyrenx install --]`)}`))
    t.log(t.textRed(` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx i --help]`)}`))
    t.log(t.textRed(` ${t.info}    or try: ${t.textWhit.dim(`[nyrenx i --nyren --d @types/nyren]`)}`))
    process.exit(1)
  }else{
    if (args[0] === 'npm'){ 
       t.log(t.textRed(` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx install --help]`)}`))
      return 
    }
  await handleLibraryInstallation(args.join(' '))
  }
  
}

async function handleLibraryInstallation(
  input: string
): Promise<void> {
  const baseCommand = `npm install `
  const devDepsCommand = 'npm install --save-dev '
  const { deps, devDeps } = await analyzeLibraries(input)
  const commandDev: string | undefined = devDeps && devDepsCommand + devDeps
  const commands: Libraries = { deps: undefined, devDeps: undefined}
  commands.deps = baseCommand + deps
  commands.devDeps = commandDev
  
  if (commands.devDeps) {
    await processSpinner({
      start: `Installing libraries: ${t.textWhit(deps)}${devDeps ? ` and dev libraries: ${t.textWhit(devDeps)}` : ''}`,
      success: `Libraries: ${t.textWhit(deps)}${devDeps ? ` and dev libraries: ${t.textWhit(devDeps)}` : ''} installed successfully!`,
      fail: 'Library installation failed!',
      callAction: async () => {
        await executeCommand((commands.deps ?? '').split(' '))
      devDeps ? await executeCommand((commands.devDeps ?? '').split(' ') || []) : ''
      },
    })
  } else {
    await processSpinner({
      start: `Libraries: ${t.textWhit(deps)} installed`,
      success: `Libraries: ${t.textWhit(deps)} installed successfully!`,
      fail: 'Library installation failed!',
      callAction: executeCommand((commands.deps ?? '').split(' ')),
    })
  }
}
async function analyzeLibraries(libraries: string) {
  let deps = ''
  let devDeps: string | undefined = undefined
  const args = libraries.trim().split(' ')

  const isDevArgument = (arg: string) =>
    arg.toLowerCase() === '--d' ||
    arg.toLowerCase() === '--dev' ||
    arg.toLowerCase() === '--save-dev'

  const devFlagIndex = args.findIndex(arg => isDevArgument(arg))

  const normalLibs =
    devFlagIndex === -1
      ? args.filter(arg => !arg.startsWith('-'))
      : args.slice(0, devFlagIndex).filter(arg => !arg.startsWith('-'))

  if (devFlagIndex !== -1) {
    const devLibs = args.slice(devFlagIndex + 1)

    deps = normalLibs.length > 0 ? normalLibs.join(' ') : deps
    devDeps = devLibs.length > 0 ? devLibs.join(' ') : devDeps
  } else {
    deps = normalLibs.join(' ')
  }
  return { deps, devDeps }
}

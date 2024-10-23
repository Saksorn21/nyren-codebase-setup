import { executeCommand } from './lib/executeCommand.js'
import { type Command } from 'commander'
import { processSpinner_ } from './lib/spinner.js'
import { validUserDirectoryPath } from './lib/utils.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import { getPackageManager } from './lib/packageManagers.js'
import { help, tools as t } from './lib/help.js'
interface Libraries {
  deps: string | undefined
  devDeps: string | undefined
}
export async function installAction(this: Command): Promise<void> {
  const args = this.args
  const opts = this.opts()
  const commandIndex = process.argv.indexOf('--')
  if (commandIndex === -1 || commandIndex === process.argv.length - 1) {
    help.libraryEx()
    t.log(
      t.textRed(
        `${t.idea} missing command after ${t.textWhit.dim(`[nyrenx install --]`)}`
      )
    )
    t.log(
      t.textRed(
        ` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx help install]`)}`
      )
    )
    t.log(
      t.textRed(
        ` ${t.info}    or try: ${t.textWhit.dim(`[nyrenx i --prefix my-project -- nyren --d @types/nyren]`)}`
      )
    )
    process.exit(1)
  } else {
    if (args[0] === 'npm') {
      t.log(
        t.textRed(
          ` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx install --help]`)}`
        )
      )
      return
    }

    await handleLibraryInstallation(args.join(' '), opts)
  }
}
//process.chdir
export async function handleLibraryInstallation(
  input: string,
  opts: any
): Promise<void> {
  const { name, cli } = await getPackageManager()
  const baseCommand = `${name} ${cli.install} `
  const devDepsCommand = `${name} ${cli.install} ${cli.saveDevFlag}`
  const messageParts = []
  let projectName: string = ''
  try {
    projectName = readPackageJson(
      validUserDirectoryPath(process.cwd(), opts.prefix) + '/package.json'
    ).name as string
  } catch (error: unknown) {
    t.log(
      t.textRed(` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx install --help]`)}
    ${t.idea} ${t.textWhit.dim(`- Check project files`)}
      `)
    )
    process.exit(1)
  }
  const { deps, devDeps } = await analyzeLibraries(input)
  const commandDev: string | undefined = devDeps && devDepsCommand + devDeps
  const commands: Libraries = { deps: undefined, devDeps: undefined }
  commands.deps = baseCommand + deps
  commands.devDeps = commandDev

  if (deps && deps.length > 0) {
    messageParts.push(`${t.textWhit(deps)}`)
  }

  if (devDeps && devDeps.length > 0) {
    messageParts.push(
      `including the following dev libraries: ${t.textWhit(devDeps)}`
    )
  }
  console.log(messageParts.join(' '))
  const notifyInstall = `Installing libraries in the project "${t.textWhit(projectName)}": ${messageParts.join(', ')}`

  await processSpinner_({
    start: deps
      ? deps.length > 0
        ? `Starting installation of libraries: ${t.textWhit(deps)}${devDeps && devDeps.length > 0 ? ` and dev libraries: ${t.textWhit(devDeps)}` : ''}...`
        : `Starting installation of dev libraries: ${t.textWhit(devDeps)}...`
      : 'installAction a project',
    success: `${(deps && deps.length > 0) || (devDeps && devDeps.length > 0) ? notifyInstall : ''} installation completed successfully!`,
    fail: 'Failed to install the specified libraries. Please check for errors.',
    callAction: async spinner => {
      spinner.stopAndPersist({
        text: t.textLightSteelBlue1(notifyInstall),
        symbol: t.idea,
      })

      spinner.start()
      //spinner.text = t.textLightSteelBlue1(notifyInstall);
      if ((deps && deps.length > 0) || (devDeps && devDeps.length > 0)) {
        await Promise.all([
          deps
            ? executeCommand((commands.deps ?? '').split(' '), opts)
            : Promise.resolve(),
          devDeps
            ? executeCommand((commands.devDeps ?? '').split(' '), opts)
            : Promise.resolve(),
        ])
      } else {
        await executeCommand(['npm', 'install'], opts)
      }
    },
  })
}
async function analyzeLibraries(libraries: string) {
  let deps: string | undefined = undefined
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

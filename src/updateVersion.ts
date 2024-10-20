import execa, { ExecaError } from './lib/exec.js'
import { checkForUpdate } from './lib/checkVersion.js'
import { processSpinner_ } from './lib/spinner.js'
import { tools as t } from './lib/help.js'
import { resolvePath } from './lib/pathHelper.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import which from 'which'
export async function updateLatestVersion() {
  const latestVersion = await checkForUpdate()
  if (latestVersion === undefined) {
    t.log(
      t.toolIcon,
      t.textGreen('You’re already using the latest version! No updates needed.')
    )
    process.exit(0)
  }
  const packageJson = readPackageJson()
  const packageName = packageJson.name.toString().trim()
  const whichCommand = await which('npm')
  const fileNpm = resolvePath(whichCommand)

  await processSpinner_({
    start: `Fetching the latest version of ${packageName}...`,
    success: `${t.textNyren(packageName)} updated successfully to version ${t.textWhit(latestVersion)}.`,
    fail: `Failed to update ${packageName}. Please try again.`,
    spinner: {
      interval: 120,
      frames: await randomVersion(),
    },
    callAction: async spinner => {
      spinner.start()
      spinner.stopAndPersist({
        text: t.textLightSteelBlue1(
          'Updating to the latest version... Please wait.'
        ),
        symbol: t.toolIcon,
      })
      spinner.start()
      try {
        await execa(fileNpm, [
          'install',
          '-g',
          `${packageName}@${latestVersion}`,
        ])
      } catch (error: unknown) {
        if (error instanceof ExecaError) throw ExecaError
      }
    },
  })
}
const timeout = (ms: number, msg?: string): Promise<void> =>
  new Promise(resolve =>
    setTimeout(() => {
      t.log(msg || '')
      resolve()
    }, ms)
  )

function randomVersion(): Promise<string[]> {
  return new Promise(resolve => {
    const generateRandom = () => Math.floor(Math.random() * 11)
    const mockVersion: string[] = []
    const max = 10

    for (let i = 0; i < max; i++) {
      const version = `${generateRandom()}.${generateRandom()}.${generateRandom()}`
      mockVersion.push(version)
    }
    resolve(mockVersion)
  })
}

import execa from './exec.js'
import which from 'which'
import { help, tools as t } from './help.js'
import { readPackageJson } from './packageJsonUtils.js'
import { resolvePath } from './pathHelper.js'
import { clearAnsiCodes } from './utils.js'
import { gt as semverGt, parse as semverParse, satisfies as semverSatisfies } from 'semver'

const packageJson = readPackageJson()

export function chackNodeVersion(wanted: string, pkg: string) {
  const nodeVersionOfUser = process.version
 if(!semverSatisfies(process.version,wanted, { includePrerelease: true })){
   t.log(
     t.prefixCli, 
      t.toolIcon, 
        t.text('#F46036')(
          `You are using Node ${nodeVersionOfUser}, but this version of ${pkg} requires Node ${wanted}.\nPlease upgrade your Node version.`))
   process.exit(1)
 }
}
export async function checkForUpdate(): Promise<string | undefined> {
  
  try {
    const packageName = packageJson.name.toString().trim()
    const currentVersion: string = packageJson.version.toString()
    const fileNpm = resolvePath(await which('npm'))
    const { stdout } = await execa(fileNpm, ['show', packageName, 'version'])

    const latestVersion = clearAnsiCodes(stdout?.toString().trim() as string)
    if (semverGt(latestVersion, currentVersion as string)) {
      const current = semverParse(currentVersion)!
      const latest = semverParse(latestVersion)!

      let updateLog: string = ''

      if (latest.major > current.major) {
        updateLog = 'major'
      } else if (latest.minor > current.minor) {
        updateLog = 'minor'
      } else if (latest.patch > current.patch) {
        updateLog = 'patch'
      }

      await help.noticeNewVersion(currentVersion, latestVersion, updateLog)
      return `${latestVersion}`
    } else {
      return undefined
    }
  } catch (e: unknown) {
    return undefined
  }
}

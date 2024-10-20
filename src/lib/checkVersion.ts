import execa from './exec.js'
import which from 'which'
import { help } from './help.js'
import { readPackageJson } from './packageJsonUtils.js'
import { resolvePath } from './pathHelper.js'
import { gt as semverGt, parse as semverParse } from 'semver'

export async function checkForUpdate(): Promise<string | undefined> {
  const packageJson = readPackageJson()
  try {
    const packageName = packageJson.name.toString().trim()
    const currentVersion: string = packageJson.version.toString()
    const fileNpm = resolvePath(await which('npm'))
    const { stdout } = await execa(fileNpm, ['show', packageName, 'version'])

    const latestVersion = stdout?.toString().trim() as string
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

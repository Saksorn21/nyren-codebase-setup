import { runCommand } from './exec.js'
import { tools, help } from './help.js'
import { readPackageJson } from './packageJsonUtils.js'
import { gt as semverGt, parse as semverParse } from 'semver'
const packageName = '@nyren/codebase-setup'

export async function checkForUpdate(): Promise<string> {
  try {
    const currentVersion: string = readPackageJson().version.toString()
    const { output, error } = await runCommand(
      `npm show ${packageName} version`
    )
    const latestVersion: string = output.toString().trim()
    if (error) throw error
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
      return `npm install -g @nyren/codebase-setup@${latestVersion}`
    } else {
      return ''
    }
  } catch (e: unknown) {
    tools.log(tools.error, tools.textRed(e as Error))
    return ''
  }
}

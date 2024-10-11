import { runCommand } from './exec.js'
import { tools, prefixCli } from './help.js'
import { readPackageJson } from './packageJsonUtils.js'
import { gt as semverGt, parse as semverParse  } from 'semver'
const packageName = '@nyren/codebase-setup';

export async function checkForUpdate() {
   try {
     const currentVersion: string = readPackageJson().version.toString()
     const {output, error } = await runCommand(`npm show ${packageName} version`)
     const latestVersion: string = output.toString().trim();
     if (error) throw error
     if (semverGt(latestVersion, currentVersion as string)) {
       const current = semverParse(currentVersion)!;
       const latest = semverParse(latestVersion)!;

       const updateLog: string[] = [];

       if (latest.major > current.major) {
         updateLog.push('Major version updated');
       } else if (latest.minor > current.minor) {
         updateLog.push('Minor version updated');
       } else if (latest.patch > current.patch) {
         updateLog.push('Patch version updated');
       }

       console.log(`มีเวอร์ชันใหม่: ${latestVersion} สำหรับ ${packageName}.`);
       console.log('รายละเอียดการอัปเดต:', updateLog.join(', '));
     } else {
       console.log(`คุณกำลังใช้เวอร์ชันล่าสุด: ${currentVersion}`);
     }
      
   } catch (e: unknown) {
      tools.log(
        tools.error,
          tools.textRed(e as Error)
        )
   }
   
}

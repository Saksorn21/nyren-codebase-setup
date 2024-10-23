import { readdir } from './fileSystem.js'

const PACKAGEMANAGER =  {
   NPM: 'npm',
   YARN: 'yarn',
   PNPM: 'pnpm',
   BUN: 'bun',
} as const;
interface PackageManagerResult {
   name: string;
   cli: {
      install: string
      add: string
      update: string
      remove: string
      saveFlag: string
      saveDevFlag: string
      silentFlag: string
   }
}
export async function getPackageManager(): Promise<PackageManagerResult> {
   const packageManager = await findLockFile();
let instanceRunners;
   switch (packageManager) {
      case PACKAGEMANAGER.YARN:
         instanceRunners = new Yarn();
         break
      case PACKAGEMANAGER.PNPM:
         instanceRunners = new Pnpm();
         break
      case PACKAGEMANAGER.BUN:
            instanceRunners = new Bun();
         break
      default:
         instanceRunners = new Npm();
         break
   }
   return { name: instanceRunners.name, cli: instanceRunners.cli }
}
;(async () =>console.log(await getPackageManager()))()
async function findLockFile() {
   const DEFAULT_PACKAGE_MANAGER = PACKAGEMANAGER.NPM;

   try {
      const files = await readdir(process.cwd());

      const hasLockFile = (lockFile: string) =>
         files.some(file => file.isFile() && file.name === lockFile);

      if (hasLockFile('bun.lockb')) {
         return PACKAGEMANAGER.BUN;
      }
      if (hasLockFile('yarn.lock')) {
         return PACKAGEMANAGER.YARN;
      }
      if (hasLockFile('pnpm-lock.yaml')) {
         return PACKAGEMANAGER.PNPM;
      }

      return DEFAULT_PACKAGE_MANAGER;
   } catch {
      return DEFAULT_PACKAGE_MANAGER;
   }
}
class CreatePackageManager {
   #install: string = 'install'
   #add: string = ''
   #remove: string = 'uninstall'
   #update: string = 'update'
   #saveFlag: string = '--save'
   #saveDevFlag: string = '--save-dev'
   #silentFlag: string = '--silent'
   constructor(private packageManager: string) {}
   set install(value: string) {
      this.#install = value
   }
   set add(value: string) {
      this.#add = value
   }
   set update(value: string) {
      this.#update = value
   }
   set remove(value: string) {
      this.#remove = value
   }
   set saveFlag(value: string) {
      this.#saveFlag = value
   }
   set saveDevFlag(value: string) {
      this.#saveDevFlag = value
   }
   set silentFlag(value: string) {
      this.#silentFlag = value
   }
   get cli (){
      return {
         install: this.#install,
         add: this.#add,
         update: this.#update,
         remove: this.#remove,
         saveFlag: this.#saveFlag,
         saveDevFlag: this.#saveDevFlag,
         silentFlag: this.#silentFlag,
      }
   }
   get name () {
   return this.packageManager.toUpperCase()
  }
}
class Npm extends CreatePackageManager {
   constructor() {
      super(PACKAGEMANAGER.NPM)
      this.add = 'install'
   }
}
class Yarn extends CreatePackageManager {
   constructor(){
      super(PACKAGEMANAGER.YARN);
      this.add = 'add';
      this.silentFlag = '--silent';
   }
}

class Bun extends CreatePackageManager {
   constructor(){
      super(PACKAGEMANAGER.BUN);
      this.install = 'bun install';
      this.add = 'bun install';
      this.silentFlag = '--quiet';
   }
}
class Pnpm extends CreatePackageManager {
   constructor(){
      super(PACKAGEMANAGER.PNPM)
      this.install = 'install --strict-peer-dependencies=false'
      this.add = 'install --strict-peer-dependencies=false'
      this.silentFlag = '--reporter=silent'
   }
}
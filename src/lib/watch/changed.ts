import { EventEmitter } from 'events'
import { getIgnorePatterns } from './fileWatcher.js'
import { readdir, readFile, exists } from '../fileSystem.js'
import { validExtensionsFile } from '../utils.js'
import { tools as t } from '../help.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
import { watch as watchFiles } from 'chokidar'
let watchedFiles: string[] = []
export async function watch(dirs: string[]) {
  const ignored = await getIgnorePatterns();
  
  
  const watchOptions = {
    ignorePermissionErrors: true,
    ignored: ignored,
    persistent: true,
    usePolling: false,
    interval: 100,
  };

  const promise = new Promise((resolve) => {
    const watcher = watchFiles(dirs, watchOptions);
    watcher.ready = false;

    var total = 0;
    watcher.on('change', filterAndRestart);
    watcher.on('unlink', filterAndRestart);
    watcher.on('add', function (file) {

      watchedFiles.push(file);
      
      
    });
    watcher.on('ready', function () {
      watchedFiles = Array.from(new Set(watchedFiles)); // ensure no dupes
      total = watchedFiles.length;
      watcher.ready = true;
      resolve(total);
    });
  });
  return promise.catch(e => {
      // this is a core error and it should break nodemon - so I have to break
      // out of a promise using the setTimeout
      setTimeout(() => {
        throw e;
      });
    }).then(function () {
      t.log(`watching ${watchedFiles.length} file${
        watchedFiles.length === 1 ? '' : 's'}`);
      return watchedFiles;
    });
  

}
function filterAndRestart(files) {
  let cwd = process.cwd();
  if (!Array.isArray(files)) {
    files = [files];
  }

  if (files.length) {
      cwd = cwd
    t.log(`files triggering change check: ${files.map((file: string) => trimCwd(file)).join(', ')}`);
   }
}



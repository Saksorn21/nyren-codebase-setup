import { EventEmitter } from 'events'
import { getIgnorePatterns } from './fileWatcher.js'
import { readdir, readFile, exists } from '../fileSystem.js'
import { validExtensionsFile } from '../utils.js'
import filterFilesByMonitorRulesfrom from'./match.js'
import { tools as t } from '../help.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
import { watch as watchFiles } from 'chokidar'
let watchedFiles: string[] = []
let watchers: any[] = []
let nodemonConfig: any = {}
export function resetWatchers() {
  watchers.forEach(watcher => watcher.close());
  watchers = [];
  watchedFiles = [];
  console.log("All watchers have been reset.");
}
export async function watch(dirs: string[], config) {
  const ignored = await getIgnorePatterns();
  
    nodemonConfig = config
  const watchOptions = {
    ignorePermissionErrors: true,
    ignored: nodemonConfig.options.ignored,
    persistent: true,
    usePolling: false,
    interval: 100,
  };
  

  const promise = new Promise((resolve) => {
    const watcher = watchFiles(nodemonConfig.dirs, watchOptions);
    watcher.ready = false;

    var total = 0;
    watcher.on('change', (file) => filterAndRestart(file, nodemonConfig));
    watcher.on('unlink', (file) => filterAndRestart(file, nodemonConfig));
    watcher.on('add', function (file) {
      if (watcher.ready) {
             return filterAndRestart(file,nodemonConfig);
          }
      watchedFiles.push(file);
      
      
    });
    watcher.on('ready', function () {
      watchedFiles = Array.from(new Set(watchedFiles)); // ensure no dupes
      total = watchedFiles.length;
      watcher.ready = true;
      resolve(total);
    });

    watcher.on('error', function (error) {
      if (error.code === 'EINVAL') {
        t.log(
          'Internal watch failed. Likely cause: too many ' +
          'files being watched (perhaps from the root of a drive?\n' +
          'See https://github.com/paulmillr/chokidar/issues/229 for details'
        );
      } else {
        t.log('Internal watch failed: ' + error.message);
        process.exit(1);
      }
    });
    
    watchers.push(watcher);
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
const config = (config) => config
import path from 'path'
function filterAndRestart(files,config) {
  
  let cwd = process.cwd();
  if (!Array.isArray(files)) {
    files = [files];
  }

  if (files.length) {
      cwd = cwd
    t.log(`files triggering change check: ${files.map((file: string) => trimCwd(file)).join(', ')}`);

    files = files.filter(Boolean).map(file => {
      return path.relative(process.cwd(), path.relative(cwd, file));
    });

    if (process.platform === 'win32') {
      // ensure the drive letter is in uppercase (c:\foo -> C:\foo)
      files = files.map(f => {
        if (f.indexOf(':') === -1) { return f; }
        return f[0].toUpperCase() + f.slice(1);
      });
    }
    
    let matched = filterFilesByMonitorRulesfrom(
      files,
      config.options.monitor,
      config.options
      .execOptions
      .ext
    )
    
    if (config.options.execOptions && config.options.execOptions.script) {
      const script = path.resolve(config.options.execOptions.script);
      if (matched.result.length === 0 && script) {
        const length = script.length;
        files.find(file => {
          if (file.substr(-length, length) === script) {
            matched = {
              result: [file],
              total: 1,
            };
            return true;
          }
        });
      }
    }

    t.log(
      'changes after filters (before/after): ' +
      [files.length, matched.result.length].join('/')
    );

    if(matched.result.length){
      t.log('restarting due to changes...');
      matched.result.map(file => {
        t.log(path.relative(process.cwd(), file));
      })
    }
    }
}



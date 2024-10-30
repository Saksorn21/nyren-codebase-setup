
import { getIgnorePatterns } from './fileWatcher.js'
import log from '../utils/log.js'
import taxi from '../utils/taxi.js'
import { validExtensionsFile } from '../utils.js'
import { config as config} from 'nodemon'
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
export function watch() {

  const promise = new Promise((resolve) => {
    const watchOptions = {
      ignorePermissionErrors: true,
      ignored: config.options.ignored,
      persistent: true,
      usePolling: false,
      interval: 100,
    }; 
    if(process.platform === 'win32'){
      watchOptions.disableGlobbing = true
    }
    const watcher = watchFiles(config.dirs, watchOptions);
    watcher.ready = false;

    var total = 0;
    watcher.on('change',filterAndRestart);
    watcher.on('unlink', filterAndRestart);
    watcher.on('add', function (file) {
      if (watcher.ready) {
             return filterAndRestart(file);
          }
      watchedFiles.push(file);
      taxi.emit('watching', file)
      
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
      
        throw e;
      
    }).then(function () {
      log.info(`watching ${watchedFiles.length} file${
        watchedFiles.length === 1 ? '' : 's'}`);
      return watchedFiles;
    });
  

}

import path from 'path'
function filterAndRestart(files) {
  
  let cwd = process.cwd();
  if (!Array.isArray(files)) {
    files = [files];
  }

  if (files.length) {
      cwd = cwd
    log.trace(`files triggering change check: ${files.map((file: string) => trimCwd(file)).join(', ')}`);

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

    log.trace(
      'changes after filters (before/after): ' +
      [files.length, matched.result.length].join('/')
    );

    if(matched.result.length){
      log.trace('restarting due to changes...');
      matched.result.map(file => {
        log.trace(path.relative(process.cwd(), file));
      })
    }
    }
}






import utils from '../utils/main.js'
import { config } from 'nodemon'
import  {filterFilesByMonitorRules
  ,generateWatchRules} from'./match.js'

import { trimCwd, resolvePath } from '../pathHelper.js'
import { watch as watchFiles, type WatchOptions } from 'chokidar'
let watchedFiles: string[] = []
let watchers: any[] = []
let nodemonConfig: any = config


export function resetWatchers() {
  watchers.forEach(watcher => watcher.close());
  watchers = [];
  watchedFiles = [];
  console.log("All watchers have been reset.");
}

export function watch() {
  const dirs: string[] = [].slice.call(nodemonConfig.dirs);
 
  const rootIgnores = nodemonConfig.options.ignore
  let watchReady: boolean = false
  
  const promise = new Promise((resolve) => {
    const dotFilePattern = /[/\\]\./;

    const ignored: any[] = generateWatchRules(
      [], // not needed
      Array.from(rootIgnores),
      config
    ).map(pattern => pattern.slice(1));
  const addDotFile = dirs.filter(dir => dir.match(dotFilePattern));

  // don't ignore dotfiles if explicitly watched.
  if (addDotFile.length === 0) {
    
      ignored.push(dotFilePattern);
  }
  const watchOptions: WatchOptions = {

    ignorePermissionErrors: true,
      ignored,
    persistent: true,
    usePolling: nodemonConfig.options.legacyWatch || false,
    interval: nodemonConfig.options.pollingInterval
  }; 


    if(utils.isWindows){
      watchOptions.disableGlobbing = true
    }
    
    const watcher = watchFiles(dirs, watchOptions);
    

    var total = 0;
    
    watcher.on('change',filterAndRestart);
    watcher.on('unlink', filterAndRestart);
    watcher.on('add', function (file: string) {
      if (watchReady) {
             return filterAndRestart(file);
          }
      
      watchedFiles.push(file);
      utils.taxi.emit('watching', file)
      
    });
    
    watcher.on('ready', function () {
      watchedFiles = Array.from(new Set(watchedFiles)); // ensure no dupes
      total = watchedFiles.length;
        watchReady = true;
      resolve(total);
    });

    watcher.on('error', (error: any) => {
      if (error.code === 'EINVAL') {
        utils.log.error(
          'Internal watch failed. Likely cause: too many ' +
          'files being watched (perhaps from the root of a drive?\n' +
          'See https://github.com/paulmillr/chokidar/issues/229 for details'
        );
      } else {
        utils.log.error('Internal watch failed: ' + error.message);
        process.exit(1);
      }
    });
    
    watchers.push(watcher);
  });
  
  
  return promise.catch(e => {
      // this is a core error and it should break nodemon - so I have to break
      // out of a promise using the setTimeout
      setTimeout(() => {throw e})
      
      
    }).then(function () {
      utils.log.trace(`watching ${watchedFiles.length} file${
        watchedFiles.length === 1 ? '' : 's'}`);
      return watchedFiles;
    });
  

}

import  {relative } from 'path'
function filterAndRestart(files: string | string[]) {
  
  let cwd = process.cwd();
  if (!Array.isArray(files)) {
    files = [files];
  }

  if (files.length) {
      cwd = cwd
    utils.log.trace(`files triggering change check: ${files.map((file: string) => trimCwd(file)).join(', ')}`);

    files = files.filter(Boolean).map((file: string) => {
      return relative(process.cwd(), relative(cwd, file));
    });

    if (utils.isWindows) {
      // ensure the drive letter is in uppercase (c:\foo -> C:\foo)
      files = files.map((f: string) => {
        if (f.indexOf(':') === -1) { return f; }
        return f[0].toUpperCase() + f.slice(1);
      });
    }
    
    let matched: any = filterFilesByMonitorRules(
      files,
      config.options.monitor,
      config.options
      .execOptions
      .ext
    )
    
    if (config.options.execOptions && config.options.execOptions.script) {
      const script = resolvePath(config.options.execOptions.script);
      if (matched.result.length === 0 && script) {
        const length = script.length;
        files.find((file: string) => {
          if (file.substring(-length, length) === script) {
            matched = {
              result: [file],
              total: 1,
            };
            return true;
          }
          return false
        });
      }
    }

    utils.log.trace(
      'changes after filters (before/after): ' +
      [files.length, matched.result.length].join('/')
    );

    if(matched.result.length){
      utils.log.trace('restarting due to changes...');
      matched.result.map((file: string) => {
        utils.log.trace(relative(process.cwd(), file));
      })
    }
    }
}




import path,{ sep } from 'node:path'
import fs from 'node:fs'
import { minimatch, type MinimatchOptions } from 'minimatch'

import log from '../utils/log.js'
import type {NodemonSettings} from 'nodemon'
import { resolvePath, dirname, trimCwd, basename } from '../pathHelper.js'


type MonitorResult = {
  result: string[];
  ignored: number;
  watched: number;
  total: number;
};




export function generateWatchRules(
  watchPaths: string | string[], 
  ignorePaths: string | string[], 
  config: NodemonSettings
): string[] {
  let monitorPatterns: string[] = [];

  const watchList = Array.isArray(watchPaths) ? watchPaths : watchPaths ? [watchPaths] : [];
  const ignoreList = Array.isArray(ignorePaths) ? ignorePaths : ignorePaths ? [ignorePaths] : [];

  // Add watch paths to monitor patterns
  if (watchList.length) {
    monitorPatterns = [...watchList];
  }

  // Add ignore paths to monitor patterns
  for (let i = 0; i < ignoreList.length; i++) {
    monitorPatterns.push(`!${ignoreList[i]}`);
  }

  const currentDir = process.cwd();

  // Update monitor patterns to expand directories to include all files
  monitorPatterns = monitorPatterns.map((pattern) => {
    const isNegated = pattern.startsWith('!');
    let rule = isNegated ? pattern.slice(1) : pattern;

    if (rule === '.' || rule === '.*') {
      rule = '*.*';
    }

    const resolvedPath = path.resolve(currentDir, rule);

    try {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        rule = `${resolvedPath.endsWith('/') ? resolvedPath : resolvedPath + '/'}**/*`;

        if (!isNegated) {
          config.dirs.push(resolvedPath);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      const baseDir = findBaseDirectory(resolvedPath);
      if (!isNegated && baseDir && !config.dirs.includes(baseDir)) {
        config.dirs.push(baseDir);
      }
    }

    if (rule.endsWith('/')) {
      rule += '*';
    }

    if (rule.endsWith('*') && !rule.endsWith('**/*') && !rule.includes('*.*')) {
      if (!rule.endsWith('**')) {
        rule += '/*';
      }
    }

    return isNegated ? `!${rule}` : rule;
  });

  return monitorPatterns;
}

function findBaseDirectory(dir: string): string | false {
  try {
    if (/[?*\{\[]+/.test(dir)) {
      const baseDir = path.dirname(dir.replace(/([?*\{\[]+.*$)/, 'foo'));
      const stat = fs.statSync(baseDir);
      if (stat.isDirectory()) {
        return baseDir;
      }
    } else {
      const stat = fs.statSync(dir);
      if (stat.isFile() || stat.isDirectory()) {
        return dir;
      }
    }
  } catch (error) {
    // Error handling left empty intentionally
  }
  return false;
}

function filterFilesByMonitorRules(files: string[], monitor: string[], ext: string): MonitorResult {
  const cwd = process.cwd();
  const rules = monitor
    .sort((a, b) => {
      const r = b.split(path.sep).length - a.split(path.sep).length;
      const aIsIgnore = a.startsWith('!');
      const bIsIgnore = b.startsWith('!');

      if (aIsIgnore || bIsIgnore) {
        return aIsIgnore ? -1 : 1;
      }

      return r === 0 ? b.length - a.length : r;
    })
    .map((s) => {
      const prefix = s.charAt(0);

      if (prefix === '!') {
        if (s.startsWith('!' + cwd)) {
          return s;
        }

        if (s.startsWith('!.')) {
          return '!' + resolvePath(cwd, s.substring(1));
        }

        return '!**' + (prefix !== sep ? sep : '') + s.slice(1);
      }

      if (s.startsWith('.')) {
        return resolvePath(cwd, s);
      }

      if (s.startsWith(cwd)) {
        return s;
      }

      return '**' + (prefix !== sep ? sep : '') + s;
    });

  let good: string[] = [];
  const whitelist: string[] = [];
  let ignored = 0;
  let watched = 0;
  const usedRules: string[] = [];
  const minimatchOpts: MinimatchOptions = { dot: true };

  if (process.platform === 'win32') {
    minimatchOpts.nocase = true;
  }

  for (let i = 0; i < files.length; i++) {
    let file = resolvePath(cwd, files[i]);
    let matched = false;

    for (const rule of rules) {
      if (rule.startsWith('!')) {
        if (!minimatch(file, rule, minimatchOpts)) {
          ignored++;
          matched = true;
          break;
        }
      } else {
        if (minimatch(file, rule, minimatchOpts)) {
          watched++;

          if (!usedRules.includes(rule)) {
            usedRules.push(rule);
            log.trace('matched rule: ' + rule);
          }

          if (rule !== '**' + sep + '*.*' && rule.endsWith('*.*')) {
            whitelist.push(file);
          } else if (basename(file) === basename(rule)) {
            whitelist.push(file);
          } else {
            good.push(file);
          }
          matched = true;
        }
      }
    }
    if (!matched) {
      ignored++;
    }
  }

  if (ext) {
    ext = ext.includes(',') ? `**/*.{${ext}}` : `**/*.${ext}`;
    good = good.filter((file) => minimatch(basename(file), ext as string, minimatchOpts));
  }

  let result = good.concat(whitelist);

  if (process.platform === 'win32') {
    result = result.map((file) => file.charAt(0).toLowerCase() + file.slice(1));
  }

  return {
    result,
    ignored,
    watched,
    total: files.length,
  };
}

export default filterFilesByMonitorRules;
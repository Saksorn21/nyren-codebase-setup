import nodemon from 'nodemon'
import { resolvePath, dirname, basename } from './pathHelper.js'
import { readdir, readFile, exists } from './fileSystem.js'
import { validExtensionsFile } from './utils.js'
import { tools as t } from './help.js'
async function findIgnore(
  filePath: string,
){
   
     const chackFile = await exists(filePath)
  if (chackFile){
    
  }
   
  
}
// ignores supports files .nyrenxignore or .gitignore
async function getIgnorePatterns() {
  let patterns: string[] = [];
try {
    const content = await readFile(resolvePath(process.cwd(), '.nyrenignore'));
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    patterns = patterns.concat(lines);
  } catch (err: any) {
  
  if (err.code === 'ENOENT') {
    const content = await readFile(resolvePath(process.cwd(), '.gitignore'));
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    patterns = patterns.concat(lines);
    
      } 
    } 
  
  return patterns;
}

export async function monitorChanges(scriptPath: string): Promise<void> {
  const fullPath = resolvePath(process.cwd(),scriptPath)
  
  const chackedPathes = await readdir(dirname(fullPath)).then(files => files.map(file => resolvePath(dirname(fullPath),file.name)).filter(path => path.includes(fullPath)))
 if(chackedPathes.length > 0 && validExtensionsFile(scriptPath)){
   t.log(t.prefixCli, t.toolIcon, t.text('#F46036').dim(`The project will be run in the directory: ${t.textWhit(chackedPathes[0])}.`))
 }else {
   t.log( t.textRed(`error`),t.textWhit.dim(`: file not found "${scriptPath}" please check the path.`))
   process.exit(2)
 }

  nodemon({
    script: fullPath,
    ignore: await getIgnorePatterns(),
    execMap: { ts: 'bun', js: 'node' },
    //watch: ['src/**/*.js'],
    ext: 'js,json',
  });

return new Promise((resolve, reject) => {
  nodemon.on('start', () => {
    console.log('Nodemon has started');
    resolve(); // เมื่อ Nodemon เริ่มทำงาน ให้ส่งค่า resolve
  }).on('quit', () => {
    console.log('Nodemon has quit');
    process.exit();
  }).on('restart', (files) => {
    console.log('Nodemon restarted due to: ', files);
  }).on('crash', () => {
    console.error('Application has crashed!');
     // ส่งค่า reject ถ้ามีข้อผิดพลาด
  });
});
}

// การใช้งานฟังก์ชัน
(async () => {
try {
  await getIgnorePatterns()
  await monitorChanges('indexjs.js'); // รอให้ฟังก์ชัน trackChanges เสร็จสิ้น
  console.log('Tracking changes...');
} catch (error) {
  console.error('Failed to start tracking: ', error);
}
})();

import { tools } from './lib/help.js'
import {createWriteStream, existsSync, readdirSync } from 'node:fs'
import archiver from 'archiver';

async function createArchive(sourceDir: string, outputFile: string) {
  const output = createWriteStream(outputFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archive has been finalized and the output file descriptor has closed.');
      resolve(null);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    if (existsSync(sourceDir) && readdirSync(sourceDir).length > 0) {
      archive.directory(sourceDir, false); 
      archive.finalize();
    } else {
      reject(new Error('Source directory is empty or does not exist.'));
    }
  });
}

(async () => {
  try {
    tools.log(tools.info,tools.textDeepBlue('Compressing template typescript'))
    await createArchive('./repo-templates/ts', './repo-templates/ts.zip');
    tools.log(tools.info,tools.textDeepBlue('Compressing template javascript'))
    await createArchive('./repo-templates/js', './repo-templates/js.zip');
    tools.log(tools.success,'Archive created successfully!');
  } catch (err) {
    tools.log(tools.error,'Error creating archive:', err);
  }
})();
import { createReadStream, createWriteStream, existsSync, readdirSync } from 'node:fs';
import { createDirectory } from './fileSystem.js'
import unzipper from 'unzipper';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import archiver from 'archiver';
const pipelinePromise = promisify(pipeline);

async function extractArchive(sourcePath: string, destPath: string) {
  try {
    console.log(`Starting extraction from ${sourcePath} to ${destPath}`);

    // สร้างไดเรกทอรีปลายทาง


    // รัน pipeline เพื่อคลายไฟล์
    await pipelinePromise(
      createReadStream(sourcePath),
      unzipper.Extract({ path: destPath })
    );

    console.log('Archive extracted successfully');
    return true;
  } catch (error) {
    console.error('Error extracting archive:', error);
    return false;
  }
}




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

    // ตรวจสอบว่าไดเรกทอรีไม่ว่าง
    if (existsSync(sourceDir) && readdirSync(sourceDir).length > 0) {
      // สังเกตว่าเราใช้ `sourceDir` เพื่อบีบอัดทั้งหมด
      archive.directory(sourceDir, false); // false หมายถึงไม่ต้องใช้ prefix
      archive.finalize();
    } else {
      reject(new Error('Source directory is empty or does not exist.'));
    }
  });
}

// การใช้งาน

//extractArchive('repo.zip', '/path/to/destination');
export { createArchive, extractArchive }
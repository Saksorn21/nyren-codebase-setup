import { createReadStream } from 'node:fs';
import { createDirectory, type ResultFs } from './fileSystem.js'

import unzipper from 'unzipper';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';


const pipelinePromise = promisify(pipeline);

async function extractArchive(sourcePath: string, destPath: string): Promise<ResultFs> {
  try {
    
await createDirectory(destPath)
    await pipelinePromise(
      createReadStream(sourcePath),
      unzipper.Extract({ path: destPath })
    );
    
    return { success: true };
  } catch (error) {
    
    return { success: false, error: error as Error };
  }
}






export { extractArchive }
import { tools } from './help.js'
import { resolvePath } from './pathHelper.js'
export async function fetchToJson(
  url: string
): Promise<Record<string, string>> {
  try {
    const response = await fetch(url)
    const templateCode = await response.json()
    return templateCode as Record<string, string>
  } catch (e) {
    tools.log(
      tools.error,
      tools.textRed(
        `Failed to unable to connect: ${tools.textWhit((e as Error).message)}`
      )
    )
    return {}
  }
}

export const validUserDirectoryPath = (path: string = process.cwd(), directoryName?: string): string => directoryName ? resolvePath(path, directoryName) : path


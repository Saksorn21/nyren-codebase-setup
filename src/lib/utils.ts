import { tools } from './help.js'
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

export const presetSpinnerCreateFiles = (
  callFn: Promise<void>,
  diretoryName: string
) => ({
  start: `Creating the ${diretoryName}`,
  success: `${tools.textLightSteelBlue1(diretoryName)} creation completed successfully`,
  fail: `${diretoryName} creation failed!`,
  callAction: callFn,
})

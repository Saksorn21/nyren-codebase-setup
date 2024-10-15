import { tools, prefixCli } from './help.js'
import { oraPromise, type Ora, type PromiseOptions } from 'ora'

export interface SpinnerInput<T> extends PromiseOptions<T> {
  start: string
  success: string
  fail: string
  callAction: PromiseLike<T> | ((spinner: Ora) => PromiseLike<T>)
}

export async function processSpinner<T>(opts: SpinnerInput<T>): Promise<T> {
  const { start, success, fail, callAction, ...remaining } = opts

  try {
    const result = await oraPromise(callAction, {
      color: 'white',
      prefixText: prefixCli,
      spinner: 'toggle13',
      text: tools.textGrey(start),
      successText: tools.textGreen(success),
      failText: tools.textRed(fail),
      ...remaining,
    })
    return result
  } catch (error) {
    throw error
  }
}

export const presetSpinnerCreateFiles = async <T>(
  callFn: PromiseLike<T>,
  diretoryName: string
) =>
  await processSpinner({
    start: `Creating the ${diretoryName}`,
    success: `${tools.textLightSteelBlue1(diretoryName)} creation completed successfully`,
    fail: `${diretoryName} creation failed!`,
    callAction: callFn,
  })

import { tools, prefixCli } from './help.js'
import { oraPromise, type Ora, type PromiseOptions } from 'ora'

export interface SpinnerInput<T> extends PromiseOptions<T> {
  start: string
  success: string
  fail: string
  callAction: PromiseLike<T> | ((spinner: Ora) => PromiseLike<T>)
}
export interface SpinnerInput_<T> extends PromiseOptions<T> {
  start: string
  success: string
  fail: string
  callAction: (spinner: Ora) => PromiseLike<T>
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
export async function processSpinner_<T>(
  opts: SpinnerInput_<T>
): Promise<void> {
  const { start, success, fail, callAction, ...remaining } = opts

  try {
    await oraPromise(
      (spinner: Ora) => {
        spinner.text = tools.textGrey(start || 'Processing...')

        return callAction(spinner)
      },
      {
        color: 'cyan',
        prefixText: prefixCli || '',
        spinner: 'toggle13',
        successText: tools.textGreen(success || 'Success!'),
        failText: tools.textRed(fail || 'Failed!'),
        ...remaining,
      }
    )
  } catch (error) {
    console.error(error)
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

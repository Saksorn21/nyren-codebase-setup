export enum colorType {
  chalky = 'chalky',
  coral = 'coral',
  dark = 'dark',
  error = 'error',
  fountainBlue = 'fountainBlue',
  green = 'green',
  invalid = 'invalid',
  lightDark = 'lightDark',
  lightWhite = 'lightWhite',
  malibu = 'malibu',
  purple = 'purple',
  whiskey = 'whiskey',
  deepRed = 'deepRed',
}
const textColors = {
  chalky: '#e5c07b',
  coral: '#e06c75',
  dark: '#5c6370',
  error: '#f44747',
  fountainBlue: '#56b6c2',
  green: '#98c379',
  invalid: '#ffffff',
  lightDark: '#7f848e',
  lightWhite: '#abb2bf',
  malibu: '#61afef',
  purple: '#c678dd',
  whiskey: '#d19a66',
  deepRed: '#BE5046',
}
import { supportsColorStderr, supportsColor, chalkStderr } from 'chalk'
class Themes {
  textColors: typeof textColors = textColors
  chalky!: ReturnType<typeof chalkStderr.hex>
  chalkyB!: ReturnType<typeof chalkStderr.hex>
  coral!: ReturnType<typeof chalkStderr.hex>
  coralB!: ReturnType<typeof chalkStderr.hex>
  dark!: ReturnType<typeof chalkStderr.hex>
  darkB!: ReturnType<typeof chalkStderr.hex>
  error!: ReturnType<typeof chalkStderr.hex>
  errorB!: ReturnType<typeof chalkStderr.hex>
  fountainBlue!: ReturnType<typeof chalkStderr.hex>
  fountainBlueB!: ReturnType<typeof chalkStderr.hex>
  green!: ReturnType<typeof chalkStderr.hex>
  greenB!: ReturnType<typeof chalkStderr.hex>
  invalid!: ReturnType<typeof chalkStderr.hex>
  invalidB!: ReturnType<typeof chalkStderr.hex>
  lightDark!: ReturnType<typeof chalkStderr.hex>
  lightDarkB!: ReturnType<typeof chalkStderr.hex>
  lightWhite!: ReturnType<typeof chalkStderr.hex>
  lightWhiteB!: ReturnType<typeof chalkStderr.hex>
  malibu!: ReturnType<typeof chalkStderr.hex>
  malibuB!: ReturnType<typeof chalkStderr.hex>
  purple!: ReturnType<typeof chalkStderr.hex>
  purpleB!: ReturnType<typeof chalkStderr.hex>
  whiskey!: ReturnType<typeof chalkStderr.hex>
  whiskeyB!: ReturnType<typeof chalkStderr.hex>
  deepRed!: ReturnType<typeof chalkStderr.hex>
  deepRedB!: ReturnType<typeof chalkStderr.hex>
  constructor() {
    for (const [colorName, hexColor] of Object.entries(this.textColors)) {
      ;(this as any)[colorName] = chalkStderr.hex(hexColor as string).visible
      ;(this as any)[colorName + 'B'] = chalkStderr.hex(
        hexColor as string
      ).bold.visible
    }

    return this
  }
}
const color = chalkStderr
const EvaDark = {
  white: color.white.visible,
  whiteB: color.white.visible,
  cyan: color.hex('5fd7d7').visible, // 5fd7d7 5fafaf
  cyanB: color.cyan.bold.visible,
  blue: color.hex('6495EE').visible,
  blueB: color.hex('6495EE').visible,
  green: color.hex('98C379').visible,
  greenB: color.hex('98C379').visible,
  orange: color.hex('FF9070').visible,
  orangeB: color.hex('FF9070').visible,
  purple: color.hex('A78CFA').visible,
  purpleB: color.hex('A78CFA').visible,
  red: color.hex('f14c4c').visible,
  redB: color.hex('f14c4c').visible,
  yellow: color.hex('E4BF7F').visible,
  yellowB: color.hex('E4BF7F').visible,
  fg: color.hex('B0B7C3').visible,
  lines: color.hex('454963').visible,
}
export default Themes

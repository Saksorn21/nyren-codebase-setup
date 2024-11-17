import { supportsColorStderr, supportsColor, chalkStderr } from 'chalk'

import { defaultTheme, ThemeSchema, colorType } from './schema-theme.js'


class Themes {
  constructor(private schemaTheme?: ThemeSchema) {
    this.validate()
    this.build()
  }
  get() {
    return this
  }
  private build() {
    for (const [colorName, hexColor] of Object.entries(
      this.schemaTheme?.colors || {}
    )) {
      ;(this as any)[colorName] = chalkStderr.hex(hexColor as string).visible
      ;(this as any)[colorName + 'B'] = chalkStderr.hex(
        hexColor as string
      ).bold.visible
    }

    return this
  }

  private validate(): void | undefined | Error {
    if (this.schemaTheme === undefined) this.schemaTheme = defaultTheme
    if (this.schemaTheme.name === 'Nyren Pro') {
      return
    } else {
      if (this.schemaTheme.isDefault)
        throw new Error(
          "The 'isDefault' property is reserved and cannot be set by the user. Please remove or avoid modifying this property."
        )
      if (!this.schemaTheme.colors) {
        throw new TypeError('colors is required')
      } else {
        for (const [colorName, hexColor] of Object.entries(
          this.schemaTheme.colors
        )) {
          if (!(colorName in colorType))
            throw new TypeError(`${colorName} is not a valid color type`)

          if (!hexColor) throw new TypeError('hexColor is required')
          if (!/^#[0-9a-fA-F]{6}$/.test(hexColor))
            throw new TypeError('hexColor must be 7 characters including #')
        }
      }
    }
  }
  white!: ReturnType<typeof chalkStderr.hex>
  whiteB!: ReturnType<typeof chalkStderr.hex>
  dark!: ReturnType<typeof chalkStderr.hex>
  darkB!: ReturnType<typeof chalkStderr.hex>
  purple!: ReturnType<typeof chalkStderr.hex>
  purpleB!: ReturnType<typeof chalkStderr.hex>
  yellow!: ReturnType<typeof chalkStderr.hex>
  yellowB!: ReturnType<typeof chalkStderr.hex>
  blue!: ReturnType<typeof chalkStderr.hex>
  blueB!: ReturnType<typeof chalkStderr.hex>
  green!: ReturnType<typeof chalkStderr.hex>
  greenB!: ReturnType<typeof chalkStderr.hex>
  orange!: ReturnType<typeof chalkStderr.hex>
  orangeB!: ReturnType<typeof chalkStderr.hex>
  red!: ReturnType<typeof chalkStderr.hex>
  redB!: ReturnType<typeof chalkStderr.hex>
  error!: ReturnType<typeof chalkStderr.hex>
  errorB!: ReturnType<typeof chalkStderr.hex>
  noColor!: ReturnType<typeof chalkStderr.hex>
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

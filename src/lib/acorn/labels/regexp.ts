import TokenTransformer, { CustomToken } from './abstract.js'
const escapeControlCharacters = (str: String) =>
  str
    .replace(/\\/g, '\\\\') // แทนที่ backslash (\\) ให้เป็น \\\\
    .replace(/\n/g, '\\n') // แทนที่ newline ให้เป็น \\n
    .replace(/\r/g, '\\r') // แทนที่ carriage return ให้เป็น \\r
    .replace(/\t/g, '\\t') // แทนที่ tab ให้เป็น \\t
    .replace(/\x08/g, '\\b') // ใช้ \\x08 เพื่อระบุ backspace ตัวจริง
    .replace(/\f/g, '\\f') // แทนที่ form feed ให้เป็น \\f
class TFRegexp extends TokenTransformer {
  parse(
    token: CustomToken,
    prevToken: CustomToken,
    nextToken: CustomToken
  ): CustomToken {
    if (token.type.label === 'regexp') {
      if (typeof token.value === 'object') {
        //console.log('regexp',token)
        let pat = token.value.pattern
          .replace(/\[CR\]/g, '\r')
          .replace(/\[FF\]/g, '\f')
          .replace(/\[LF\]/g, '\n')
          .replace(/\[TAB\]/g, '\t')
          .replace(/\[BS\]/g, '\b')
          .replace(/\[VT\]/g, '\v')
        if (!token.value.value) {
          token.value.value = new RegExp(
            escapeControlCharacters(token.value.pattern),
            token.value.flags
          )
        }
      }

      this.transform(token, 'regexp')
    }
    return token
  }
}

export default TFRegexp

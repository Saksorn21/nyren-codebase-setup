// Credit via http://stackoverflow.com/a/728694/22617
function clone<T>(obj: T): T {
  let copy: T

  // Handle the 3 simple types, and null or undefined
  if (obj === null || typeof obj !== 'object') return obj

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date(obj.getTime()) as T
    return copy
  }

  // Handle Array
  if (Array.isArray(obj)) {
    copy = [] as unknown as T
    for (let i = 0, len = obj.length; i < len; i++) {
      ;(copy as unknown as T[])[i] = clone(obj[i])
    }
    return copy
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {} as T
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        ;(copy as any)[attr] = clone((obj as any)[attr])
      }
    }
    return copy
  }

  throw new Error("Unable to copy obj! Its type isn't supported.")
}

export default clone

class Option {
  flags: string;
  required: boolean;
  optional: boolean;
  variadic: boolean;
  description: string;
  defaultValue: string | undefined;
  defaultValueDescription: string | undefined;
  short?: string;
  long?: string;
  negate: boolean;

  constructor(flags: string, description: string) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<'); // ต้องการค่าเสมอ
    this.optional = flags.includes('['); // ค่าเป็นตัวเลือก
    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // รองรับค่าแบบหลายตัว
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = this.defaultValueDescription = undefined;
  }

  // ตั้งค่า Default Value
  default(value: string, description?: string) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  // ชื่อของ option
  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short?.replace(/^-/, '') || '';
  }

  // เช็คว่าตรงกับ flag ที่ส่งเข้ามาหรือไม่
  is(arg: string) {
    return this.short === arg || this.long === arg;
  }

  // เช็คว่า option เป็น boolean หรือไม่
  isBoolean() {
    return !this.required && !this.optional;
  }

  // สร้างชื่อ attribute ที่จะใช้ใน parsed options
  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }
}

// Utility Function: Camelcase แปลงชื่อเป็น camelCase
function camelcase(str: string) {
  return str
    .split('-')
    .reduce((str, word) => str + word[0].toUpperCase() + word.slice(1));
}

// Utility Function: แยก short/long flags ออกจากกัน
function splitOptionFlags(flags: string) {
  let shortFlag, longFlag;
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) {
    shortFlag = flagParts.shift();
  }
  longFlag = flagParts.shift();
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

export { splitOptionFlags, camelcase }
export default Option
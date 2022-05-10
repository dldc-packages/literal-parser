import { BACKTICK, DOUBLE_QUOTE, SINGLE_QUOTE } from "./constants.ts";

export const Serializer = {
  serialize,
};

function serialize(obj: unknown): string {
  try {
    JSON.stringify(obj);
  } catch (error) {
    throw new Error(`Value not compatible with JSON.stringify`);
  }

  return root();

  function root() {
    if (obj === null) {
      return "null";
    }
    if (obj === undefined) {
      return "undefined";
    }
    if (obj === true) {
      return "true";
    }
    if (obj === false) {
      return "false";
    }
    if (typeof obj === "string") {
      return serializeString(obj);
    }
    if (typeof obj === "number") {
      if (Number.isFinite(obj)) {
        return obj.toString();
      }
    }
    if (Array.isArray(obj)) {
      return `[${obj.map((item) => serialize(item)).join(", ")}]`;
    }
    if (isPlainObject(obj)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return serializeObject(obj as any);
    }
    console.log(obj);
    throw new Error(`Unsuported type ${typeof obj}`);
  }

  function serializeObject(obj: Record<any, any>) {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return `{}`;
    }
    return `{ ${keys.map((key) => `${serializeKey(key)}: ${serialize(obj[key])}`).join(", ")} }`;
  }

  function serializeKey(key: string | number): string {
    if (typeof key === "number") {
      return key.toString();
    }
    if (key.match(/^[A-Za-z0-9][A-Za-z0-9_]+$/)) {
      return key;
    }
    return serializeString(key);
  }

  function serializeString(obj: string) {
    const hasSingle = obj.indexOf(SINGLE_QUOTE) >= 0;
    // remove quote char
    if (!hasSingle) {
      return `'${obj}'`;
    }
    const hasDouble = obj.indexOf(DOUBLE_QUOTE) >= 0;
    if (!hasDouble) {
      return `"${obj}"`;
    }
    const hasBacktick = obj.indexOf(BACKTICK) >= 0;
    if (!hasBacktick) {
      return "`" + obj + "`";
    }
    return `'${obj.replace(/'/g, `\\'`)}'`;
  }
}

function isObject(val: any): boolean {
  return val != null && typeof val === "object" && Array.isArray(val) === false;
}

function isObjectObject(o: any) {
  return isObject(o) === true && Object.prototype.toString.call(o) === "[object Object]";
}

function isPlainObject(o: any): boolean {
  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor !== "function") return false;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

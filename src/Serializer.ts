import { BACKTICK, DOUBLE_QUOTE, SINGLE_QUOTE } from './constants';

export const Serializer = {
  serialize,
};

export type FormatObj =
  | { mode: 'line' }
  | { mode: 'compact' }
  | { mode: 'indent'; space?: number }
  | { mode: 'pretty'; threshold?: number; space?: number };

export type Format = 'line' | 'compact' | 'pretty' | 'indent' | number | FormatObj;

type PrintItem =
  | string
  | { type: 'Line' }
  | { type: 'IndentObj' }
  | { type: 'DedentObj' }
  | { type: 'IndentArr' }
  | { type: 'DedentArr' }
  | { type: 'Space' }
  | { type: 'Group'; items: PrintItems };

type PrintItems = readonly PrintItem[];

function serialize(obj: unknown, format: Format = 'line'): string {
  try {
    JSON.stringify(obj);
  } catch (error) {
    throw new Error(`Value not compatible with JSON.stringify`);
  }
  const formatObj = resolveFormatObj(format);

  const items = printItems(obj);
  return formatPrintItems(items, formatObj, 0);

  function printItems(obj: unknown): PrintItems {
    if (obj === null) {
      return ['null'];
    }
    if (obj === undefined) {
      return ['undefined'];
    }
    if (obj === true) {
      return ['true'];
    }
    if (obj === false) {
      return ['false'];
    }
    if (typeof obj === 'string') {
      return [serializeString(obj)];
    }
    if (typeof obj === 'number') {
      if (Number.isFinite(obj)) {
        return [obj.toString()];
      }
    }
    if (Array.isArray(obj)) {
      const items: PrintItem[] = [];
      items.push('[');
      if (obj.length === 0) {
        items.push(']');
        return items;
      }
      items.push({ type: 'IndentArr' });
      obj.forEach((item, index) => {
        if (index > 0) {
          items.push(',');
          items.push({ type: 'Line' });
        }
        items.push(...printItems(item));
      });
      items.push({ type: 'DedentArr' });
      items.push(']');
      return [{ type: 'Group', items }];
    }
    if (isPlainObject(obj)) {
      return objectPrintItems(obj as Record<any, any>);
    }
    console.log(obj);
    throw new Error(`Unsuported type ${typeof obj}`);
  }

  function objectPrintItems(obj: Record<any, any>): PrintItems {
    const items: PrintItem[] = [];
    items.push('{');
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      items.push('}');
      return items;
    }
    items.push({ type: 'IndentObj' });
    keys.forEach((key, index) => {
      if (index > 0) {
        items.push(',');
        items.push({ type: 'Line' });
      }
      items.push(serializeKey(key));
      items.push(':');
      items.push({ type: 'Space' });
      items.push(...printItems(obj[key]));
    });
    items.push({ type: 'DedentObj' });
    items.push('}');
    return [{ type: 'Group', items }];
  }

  function serializeKey(key: string | number): string {
    if (typeof key === 'number') {
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
      return '`' + obj + '`';
    }
    return `'${obj.replace(/'/g, `\\'`)}'`;
  }
}

function formatPrintItems(items: readonly PrintItem[], format: FormatObj, baseDepth: number) {
  let result: string = '';
  let depth = baseDepth;
  items.forEach((item) => {
    if (typeof item === 'string') {
      result += item;
      return;
    }
    if (format.mode === 'compact') {
      if (item.type === 'Group') {
        result += formatPrintItems(item.items, format, depth);
        return;
      }
      return;
    }
    if (format.mode === 'line') {
      switch (item.type) {
        case 'Group':
          result += formatPrintItems(item.items, format, depth);
          return;
        case 'Line':
        case 'Space':
          result += ' ';
          return;
        case 'IndentArr':
        case 'DedentArr':
          return;
        case 'IndentObj':
        case 'DedentObj':
          result += ' ';
          return;
        default:
          return;
      }
    }
    if (format.mode === 'indent') {
      const { space = 2 } = format;
      const padding = ' '.repeat(space);
      switch (item.type) {
        case 'Group':
          result += formatPrintItems(item.items, format, depth);
          return;
        case 'Line':
          result += '\n' + padding.repeat(depth);
          return;
        case 'IndentArr':
        case 'IndentObj':
          depth += 1;
          result += '\n' + padding.repeat(depth);
          return;
        case 'DedentArr':
        case 'DedentObj':
          depth -= 1;
          result += '\n' + padding.repeat(depth);
          return;
        case 'Space':
          result += ' ';
          return;
        default:
          return;
      }
    }
    if (format.mode === 'pretty') {
      const { space = 2, threshold = 80 } = format;
      const padding = ' '.repeat(space);
      switch (item.type) {
        case 'Group':
          const line = formatPrintItems(item.items, { mode: 'line' }, depth);
          if (line.length <= threshold) {
            result += line;
            return;
          }
          result += formatPrintItems(item.items, format, depth);
          return;
        case 'Line':
          result += '\n' + padding.repeat(depth);
          return;
        case 'IndentArr':
        case 'IndentObj':
          depth += 1;
          result += '\n' + padding.repeat(depth);
          return;
        case 'DedentArr':
        case 'DedentObj':
          depth -= 1;
          result += '\n' + padding.repeat(depth);
          return;
        case 'Space':
          result += ' ';
          return;
        default:
          return;
      }
    }
    throw new Error(`Unsuported format ${format as any}`);
  });

  return result;
}

function isObject(val: any): boolean {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

function isObjectObject(o: any) {
  return isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o: any): boolean {
  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

function resolveFormatObj(format: Format): FormatObj {
  if (typeof format === 'number') {
    return { mode: 'indent', space: format };
  }
  if (format === 'compact') {
    return { mode: 'compact' };
  }
  if (format === 'indent') {
    return { mode: 'indent', space: 2 };
  }
  if (format === 'line') {
    return { mode: 'line' };
  }
  if (format === 'pretty') {
    return { mode: 'pretty', threshold: 80, space: 2 };
  }
  return format;
}

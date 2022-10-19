import { InputStream } from './InputStream';
import { BACKTICK, DOUBLE_QUOTE, SINGLE_QUOTE } from './constants';

export const Parser = {
  parse,
  parseOne,
};

interface ParseOneResult {
  length: number;
  value: any;
}

function parseOne(file: string): ParseOneResult {
  const input = InputStream(file);
  const res = parseInternal(input);
  return {
    value: res,
    length: input.position(),
  };
}

function parse(file: string): any {
  const input = InputStream(file);

  const res = parseInternal(input);

  if (input.eof()) {
    return res;
  }
  input.croak(`Expected EOF`);
}

function parseInternal(input: InputStream): any {
  return root();

  function root() {
    skipWhitespacesAndComments();
    const expr = parseExpression();
    skipWhitespacesAndComments();
    return expr;
  }

  function parseExpression(): any {
    const ch = input.peek();
    if (ch === '{') {
      return parseObject();
    }
    if (ch === '[') {
      return parseArray();
    }
    if (ch === '-') {
      input.next();
      return parseNumber(true);
    }
    if (ch === SINGLE_QUOTE || ch === DOUBLE_QUOTE || ch === BACKTICK) {
      return parseString(ch);
    }
    if (isDigit(ch)) {
      return parseNumber();
    }
    if (isIdentifier('true')) {
      skipIdentifier('true');
      return true;
    }
    if (isIdentifier('false')) {
      skipIdentifier('false');
      return false;
    }
    if (isIdentifier('null')) {
      skipIdentifier('null');
      return null;
    }
    if (isIdentifier('undefined')) {
      skipIdentifier('undefined');
      return undefined;
    }
    if (input.eof()) {
      return input.croak(`Unexpected empty string`);
    }
    return input.croak(`Unexpected "${ch}"`);
  }

  function skipIdentifier(identifier: string): string {
    const next = input.next(identifier.length);
    if (next !== identifier) {
      input.croak(`Expected identifier "${identifier}" got "${next}"`);
    }
    return next;
  }

  function isIdentifier(identifier: string): boolean {
    if (input.peek(identifier.length) === identifier) {
      const after = input.peek(identifier.length + 1)[identifier.length];
      return after === undefined || isNameChar(after) === false;
    }
    return false;
  }

  function isDigit(ch: string): boolean {
    return /[0-9]/i.test(ch);
  }

  function isNameStart(ch: string): boolean {
    return /[a-zA-Z_]/i.test(ch);
  }

  function isNameChar(ch: string): boolean {
    return isNameStart(ch) || '0123456789_'.indexOf(ch) >= 0;
  }

  function skipWhitespacesAndComments() {
    let didSomething: boolean;
    do {
      didSomething = skipComment() || skipWhitespaces();
    } while (didSomething);
  }

  function skipComment(): boolean {
    if (input.peek(2) === '//') {
      input.next();
      input.next();
      skipUntil('\n');
      return true;
    }
    if (input.peek(2) === '/*') {
      input.next();
      input.next();
      skipUntil('*/');
      input.next();
      input.next();
      return true;
    }
    return false;
  }

  function isWhitspace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n';
  }

  function skipWhitespaces(): boolean {
    if (!isWhitspace(input.peek())) {
      return false;
    }
    while (!input.eof() && isWhitspace(input.peek())) {
      input.next();
    }
    return true;
  }

  function skipUntil(condition: string) {
    while (!input.eof() && input.peek(condition.length) !== condition) {
      input.next();
    }
  }

  function parseNumber(negative = false): number {
    let hasDot = false;
    const number = readWhile((ch) => {
      if (ch === '.') {
        if (hasDot) {
          return false;
        }
        hasDot = true;
        return true;
      }
      return isDigit(ch);
    });
    return parseFloat(number) * (negative ? -1 : 1);
  }

  function parseArray(): Array<any> {
    skip('[');
    const arr: Array<any> = [];
    skipWhitespacesAndComments();
    if (input.peek() === ']') {
      skip(']');
      return arr;
    }
    while (!input.eof() && input.peek() !== ']') {
      const value = parseExpression();
      skipWhitespacesAndComments();
      arr.push(value);

      const foundComma = maybeSkip(',');
      if (!foundComma) {
        break;
      }
      skipWhitespacesAndComments();
    }
    skip(']');
    return arr;
  }

  function parseObject(): Record<string, any> {
    skip('{');
    const obj: Record<string, any> = {};
    skipWhitespacesAndComments();
    if (input.peek() === '}') {
      skip('}');
      return obj;
    }
    while (!input.eof() && input.peek() !== '}') {
      const key = parseKey();
      skip(':');
      skipWhitespacesAndComments();
      const value = parseExpression();
      skipWhitespacesAndComments();
      obj[key] = value;
      const foundComma = maybeSkip(',');
      if (!foundComma) {
        break;
      }
      skipWhitespacesAndComments();
    }
    skip('}');
    return obj;
  }

  function parseKey(): string | number {
    const next = input.peek();
    if (isDigit(input.peek())) {
      const res = parseNumber();
      return res;
    }
    if (next === SINGLE_QUOTE || next === DOUBLE_QUOTE) {
      return parseString(next);
    }
    if (input.peek() === '[') {
      skip('[');
      const expr = parseExpression();
      skip(']');
      return expr;
    }
    if (isNameStart(input.peek())) {
      return readWhile(isNameChar);
    }
    return input.croak(`Unexpected "${input.peek()}"`);
  }

  function readWhile(predicate: (ch: string) => boolean): string {
    let str = '';
    while (!input.eof() && predicate(input.peek())) {
      str += input.next();
    }
    return str;
  }

  function parseString(end: "'" | '"' | '`'): string {
    let escaped = false;
    let str = '';
    input.next();
    while (!input.eof()) {
      const ch = input.next();
      if (end !== BACKTICK && ch === '\n') {
        break;
      }
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch === end) {
        break;
      } else if (ch === '\\') {
        escaped = true;
      } else {
        str += ch;
      }
    }
    return str;
  }

  // function skipUntil(condition: string) {
  //   let val: string = '';
  //   while (input.peek(condition.length) !== condition) {
  //     val += input.next();
  //   }
  //   return val;
  // }

  function skip(char: string) {
    if (input.peek() !== char) {
      input.croak(`Expected ${char} got ${input.peek()}`);
    }
    input.next();
  }

  function maybeSkip(char: string): boolean {
    if (input.peek() === char) {
      input.next();
      return true;
    }
    return false;
  }
}

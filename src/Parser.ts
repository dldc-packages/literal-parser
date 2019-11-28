import { InputStream } from './InputStream';

export const Parser = {
  parse,
};

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';
const BACKTICK = '`';

function parse(file: string): any {
  const input = InputStream(file);

  return root();

  function root() {
    skipWhitespacesAndComments();
    const expr = parseExpression();
    skipWhitespacesAndComments();
    if (input.eof()) {
      return expr;
    }
    input.croak(`Expected EOF`);
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
    if (nextIsBooleanTrue()) {
      input.next();
      input.next();
      input.next();
      input.next();
      return true;
    }
    if (nextIsBooleanFalse()) {
      input.next();
      input.next();
      input.next();
      input.next();
      input.next();
      return false;
    }
    return input.croak(`Unexpected "${ch}"`);
  }

  function nextIsBooleanTrue(): boolean {
    if (input.peek(4) === 'true') {
      const after = input.peek(5)[4];
      return after === undefined || isNameChar(after) === false;
    }
    return false;
  }

  function nextIsBooleanFalse(): boolean {
    if (input.peek(5) === 'false') {
      const after = input.peek(6)[5];
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

  function parseNumber(negative: boolean = false): number {
    let hasDot = false;
    const number = readWhile(ch => {
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
    let arr: Array<any> = [];
    while (!input.eof() && input.peek() !== ']') {
      skipWhitespacesAndComments();
      maybeSkip(',');
      skipWhitespaces();
      const value = parseExpression();
      skipWhitespaces();
      arr.push(value);
    }
    skipWhitespacesAndComments();
    skip(']');
    return arr;
  }

  function parseObject(): Record<string, any> {
    skip('{');
    let obj: Record<string, any> = {};
    while (!input.eof() && input.peek() !== '}') {
      skipWhitespacesAndComments();
      maybeSkip(',');
      skipWhitespaces();
      const key = parseKey();
      skip(':');
      skipWhitespaces();
      const value = parseExpression();
      skipWhitespaces();
      obj[key] = value;
    }
    skipWhitespacesAndComments();
    skip('}');
    return obj;
  }

  function parseKey(): string | number {
    const next = input.peek();
    if (next === SINGLE_QUOTE || next === DOUBLE_QUOTE) {
      return parseString(next);
    }
    if (isDigit(input.peek())) {
      return parseNumber();
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

  function maybeSkip(char: string) {
    if (input.peek() === char) {
      input.next();
    }
  }
}

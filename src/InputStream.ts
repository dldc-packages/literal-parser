export interface InputStream {
  next(): string;
  peek(length?: number): string;
  eof(): boolean;
  croak(msg: string): never;
}

export function InputStream(input: string): InputStream {
  let pos = 0;
  let line = 1;
  let col = 0;

  return {
    next,
    peek,
    eof,
    croak,
  };

  function next(): string {
    const ch = input.charAt(pos++);
    if (ch === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
    return ch;
  }

  function peek(length: number = 1): string {
    if (length === 1) {
      return input.charAt(pos);
    }
    let val: string = '';
    for (let i = 0; i < length; i++) {
      val += input.charAt(pos + i);
    }
    return val;
  }

  function eof(): boolean {
    return peek() === '';
  }

  function croak(msg: string): never {
    throw new Error(msg + ' (' + line + ':' + col + ')');
  }
}

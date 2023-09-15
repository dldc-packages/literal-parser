<p align="center">
  <img src="https://raw.githubusercontent.com/etienne-dldc/literal-parser/main/design/logo.svg" width="700" alt="literal-parser logo">
</p>

# 🔎 literal-parser

> A small library to parse and serialize JavaScript array/object literal.

This is like a `JSON.parse` / `JSON.serialize` but for JavaScript object instead of JSON objects.

## Gist

```js
import Parser from '@dldc/literal-parser';

Parser.parse('{ some: ["object", { literal: true }] }');
// return an object { some: ["object", { literal: true }] }
```

## Supported features

Take a look at the tests see what is supported.

## API

### `Parser.parse(str)`

Parse the string, expect the string to contain only one expression and throw otherwise.

Return the parsed object.

### `Parser.parseOne(str)`

Parse one expression then stop.

Returns a object with `{ value, length }` where `value` is the parsed expression and `length` is the number of character parsed.

```js
Parser.parseOne('{ props: true }} something="else" />');
// { value: { props: true }, length: 15 }
```

### `Serializer.serialize(obj, format?)`

Print an object.

`format` can be one of the following:

| Option                                                   | Shortcut               | Description                                                                                                                                                                 | Defaults                                          |
| -------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `{ mode: 'line' }`                                       | `'line'`               | Print on a single line with spaces                                                                                                                                          |                                                   |
| `{ mode: 'compact' }`                                    | `'compact'`            | Print on a single line without any spces                                                                                                                                    |                                                   |
| `{ mode: 'indent'; space?: number }`                     | `'indent'` or `number` | Similar to `JSON.stringify(obj, null, indent)`.                                                                                                                             | By default `space` is `2`                         |
| `{ mode: 'pretty'; threshold?: number; space?: number }` | `'pretty'`             | Inspired by prettier, this mode will try to print objects and arrays on a single line, if the result is bigger than the `threshold` then it's splitted into multiple lines. | By default `space` is `2` and `threshold` is `80` |

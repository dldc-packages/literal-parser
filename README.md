# literal-parser

> A small library to parse JavaScript array/object literal.

This is like a `JSON.parse` but for JavaScript object instead of JSON objects.

## Gist

```js
import Parser from 'literal-parser';

Parser.parse('{ some: ["object", { literal: true }] }');
// return an object { some: ["object", { literal: true }] }
```

## Supported features

Take a look at the test folder see what is supported.

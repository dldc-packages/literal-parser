import { Parser } from '../src';

describe('parseOne get correct length', () => {
  const SHAPES: Array<[string, number]> = [
    ['{}', 2],
    [`'foo'`, 5],
    [`'john\\'s'`, 9],
    ['{ foo: {} }', 11],
    ['{ "foo-bar": {} }', 17],
    [`{ 'foo-bar': {} }`, 17],
    ['{ foo: {}, bar: {} }', 20],
    ['{ foo: { bar: { baz: {} } } }', 29],
    ['{ foo: 45 }', 11],
    ['{ foo: 45.566 }', 15],
    ['{ foo: -45.566 }', 16],
    ['{ foo: -.566 }', 14],
    ['{ foo: "bar" }', 14],
    [`{ foo: 'bar' }`, 14],
    [`{ ['foo']: 'bar' }`, 18],
    [`{ 45: 'bar' }`, 13],
    [`[0, 1, 5]`, 9],
    [`1234`, 4],
    [`12.34`, 5],
    [`true`, 4],
    [`false`, 5],
    [`{ foo: true }`, 13],
    [`{ foo: false }`, 14],
    [`{ foo: 'l\\'orage' }`, 19],
    [`null`, 4],
    [`undefined`, 9],
  ];

  SHAPES.forEach(([str, res]) => {
    test(`Parse ${str}`, () => {
      expect(Parser.parseOne(str).length).toEqual(res);
    });
  });
});

describe('parseOne ignore stuff after', () => {
  const SHAPES: Array<[string, any]> = [
    [`{ foo: 'l\\'orage' }{}`, { foo: "l'orage" }],
    [`null}some other stuff`, null],
    [`undefined}yoloooo`, undefined],
  ];

  SHAPES.forEach(([str, res]) => {
    test(str, () => {
      expect(Parser.parseOne(str).value).toEqual(res);
    });
  });
});

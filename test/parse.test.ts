import { Parser, Serializer } from '../src';

describe('parse all sort of shape', () => {
  const SHAPES: Array<[string, any]> = [
    ['{}', {}],
    [`'foo'`, 'foo'],
    [`'john\\'s'`, "john's"],
    ['{ foo: {} }', { foo: {} }],
    ['{ "foo-bar": {} }', { 'foo-bar': {} }],
    [`{ 'foo-bar': {} }`, { 'foo-bar': {} }],
    ['{ foo: {}, bar: {} }', { foo: {}, bar: {} }],
    ['{ foo: { bar: { baz: {} } } }', { foo: { bar: { baz: {} } } }],
    ['{ foo: 45 }', { foo: 45 }],
    ['{ foo: 45.566 }', { foo: 45.566 }],
    ['{ foo: -45.566 }', { foo: -45.566 }],
    ['{ foo: -.566 }', { foo: -0.566 }],
    ['{ foo: "bar" }', { foo: 'bar' }],
    [`{ foo: 'bar' }`, { foo: 'bar' }],
    [`{ ['foo']: 'bar' }`, { foo: 'bar' }],
    [`{ 45: 'bar' }`, { 45: 'bar' }],
    [`[0, 1, 5]`, [0, 1, 5]],
    [`1234`, 1234],
    [`12.34`, 12.34],
    [`true`, true],
    [`false`, false],
    [`{ foo: true }`, { foo: true }],
    [`{ foo: false }`, { foo: false }],
    [`{ foo: 'l\\'orage' }`, { foo: `l'orage` }],
    [`null`, null],
    [`undefined`, undefined],
  ];

  SHAPES.forEach(([str, res]) => {
    test(`Parse ${str}`, () => {
      expect(Parser.parse(str)).toEqual(res);
    });
  });
});

describe('parse then serialize should return the same', () => {
  const SHAPES: Array<string> = [
    '{}',
    `'foo'`,
    `"john's"`,
    '{ foo: {} }',
    `{ 'foo-bar': {} }`,
    '{ foo: {}, bar: {} }',
    '{ foo: { bar: { baz: {} } } }',
    '{ foo: 45 }',
    '{ foo: 45.566 }',
    '{ foo: -45.566 }',
    '{ foo: -0.566 }',
    `{ foo: 'bar' }`,
    `{ 45: 'bar' }`,
    `[0, 1, 5]`,
    `1234`,
    `12.34`,
    `true`,
    `false`,
    `{ foo: true }`,
    `{ foo: false }`,
    `{ foo: "l'orage" }`,
    `null`,
    `undefined`,
  ];

  SHAPES.forEach(str => {
    test(`Parse the serialize ${str}`, () => {
      expect(Serializer.serialize(Parser.parse(str))).toEqual(str);
    });
  });
});

test('parse complex object', () => {
  expect(
    Parser.parse(`{
      type: 'Root',
      version: 1,
      course: [],
      slides: []
    }`)
  ).toEqual({
    type: 'Root',
    version: 1,
    course: [],
    slides: [],
  });
});

test('throw when more than one expression', () => {
  expect(() => Parser.parse('{}{}')).toThrow();
});

test('throw when empty', () => {
  expect(() => Parser.parse('')).toThrow('Unexpected empty string');
});

test('parse trailing commas', () => {
  expect(Parser.parse('{ foo: true, }')).toEqual({ foo: true });
});

test('parse trailing commas in array', () => {
  expect(Parser.parse('[true, false, ]')).toEqual([true, false]);
});

test('throw on invalid key', () => {
  expect(() => Parser.parse('{ -45: 55 }')).toThrow();
});

test('throw when invalid', () => {
  expect(() => Parser.parse('!')).toThrow();
});

test('string does not support multiline', () => {
  expect(() => Parser.parse(`'foo\nbar'`)).toThrow();
});

test('parse empty string', () => {
  expect(Parser.parse('""')).toEqual('');
});

describe('comments', () => {
  test('line comment', () => {
    expect(Parser.parse('{}// test 2 {}')).toEqual({});
  });

  test('inside comments', () => {
    expect(Parser.parse('/* test */{}/* test 2 */')).toEqual({});
  });

  test('multi-line comments', () => {
    expect(Parser.parse('/* \n */{}/* test 2 */')).toEqual({});
  });
});

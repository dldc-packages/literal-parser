import Parser from '../src';

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
  expect(() => Parser.parse('{}a')).toThrow();
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

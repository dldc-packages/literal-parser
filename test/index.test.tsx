import { Parser } from '../src';

describe('parse all sort of shape', () => {
  const SHAPES: Array<[string, any]> = [
    ['{}', {}],
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
    [`[0, 1, 5]`, [0, 1, 5]],
    [`1234`, 1234],
    [`true`, true],
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

test('throw when invalid', () => {
  expect(() => Parser.parse('!')).toThrow();
});

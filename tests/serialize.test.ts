import { expect, test } from 'vitest';
import { Serializer } from '../src/Serializer';

test('Handle quote in string when serialize', () => {
  expect(() => Serializer.serialize('"')).not.toThrow();
  expect(() => Serializer.serialize("'")).not.toThrow();

  expect(Serializer.serialize('"')).toEqual(`'"'`);
  expect(Serializer.serialize("'")).toEqual(`"'"`);
});

test('Handle escaped quote in string', () => {
  // prettier-ignore
  expect(() => Serializer.serialize("\"")).not.toThrow();
  // prettier-ignore
  expect(Serializer.serialize("\"")).toEqual(`'"'`);
});

test('Handle recursive object', () => {
  const a: any = {};
  const b: any = {};
  a.b = b;
  b.a = a;

  expect(() => Serializer.serialize(a)).toThrow('Value not compatible with JSON.stringify');
});

test('Serialize complex object', () => {
  const obj = { bool: true, num: 1, str: 'foo', arr: [1, 2, 3], obj: { foo: 'bar' } };

  expect(Serializer.serialize(obj)).toEqual(`{ bool: true, num: 1, str: 'foo', arr: [1, 2, 3], obj: { foo: 'bar' } }`);

  expect(Serializer.serialize(obj, 'compact')).toEqual(`{bool:true,num:1,str:'foo',arr:[1,2,3],obj:{foo:'bar'}}`);

  expect(Serializer.serialize(obj, 2).split('\n')).toEqual([
    '{',
    '  bool: true,',
    '  num: 1,',
    "  str: 'foo',",
    '  arr: [',
    '    1,',
    '    2,',
    '    3',
    '  ],',
    '  obj: {',
    "    foo: 'bar'",
    '  }',
    '}',
  ]);

  expect(Serializer.serialize(obj, 'pretty').split('\n')).toEqual([
    `{ bool: true, num: 1, str: 'foo', arr: [1, 2, 3], obj: { foo: 'bar' } }`,
  ]);

  expect(Serializer.serialize(obj, { mode: 'pretty', threshold: 20 }).split('\n')).toEqual([
    '{',
    '  bool: true,',
    '  num: 1,',
    "  str: 'foo',",
    '  arr: [1, 2, 3],',
    "  obj: { foo: 'bar' }",
    '}',
  ]);
});

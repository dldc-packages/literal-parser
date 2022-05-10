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

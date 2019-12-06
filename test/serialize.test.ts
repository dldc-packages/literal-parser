import { Serializer } from '../src';

test('Handle quote in string when serialize', () => {
  expect(() => Serializer.serialize('"')).not.toThrow();
  expect(() => Serializer.serialize("'")).not.toThrow();

  expect(Serializer.serialize('"')).toEqual(`'"'`);
  expect(Serializer.serialize("'")).toEqual(`"'"`);
});

test('Handle escaped quote in string', () => {
  // eslint-disable-next-line prettier/prettier
  // prettier-ignore
  expect(() => Serializer.serialize("\"")).not.toThrow();
  // eslint-disable-next-line prettier/prettier
  // prettier-ignore
  expect(Serializer.serialize("\"")).toEqual(`'"'`);
});

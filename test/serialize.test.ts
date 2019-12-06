import { Serializer } from '../src';

test('Handle escaped characteres in serialize', () => {
  expect(() => Serializer.serialize('"')).not.toThrow();
  expect(() => Serializer.serialize("'")).not.toThrow();

  expect(Serializer.serialize('"')).toEqual(`'"'`);
  expect(Serializer.serialize("'")).toEqual(`"'"`);
});

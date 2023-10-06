const memIndex = require('../../src/model/data/memory/index');

describe('memory/index', () => {
  describe('writeFragment()', () => {
    test('writeFragment to the memory db, return nothing/undefined', async () => {
      const fragment = {
        ownerId: 'abc',
        id: 'abcd',
        data: { value: 123 },
      };
      const result = await memIndex.writeFragment(fragment);
      expect(result).toBeUndefined(); // expect the result to be undefined as put() returns nothing
    });

    test('writeFragment invalid fragment, throw error', async () => {
      const fragment = {
        ownerId: 'abc',
        id: 1, // this will throw an error as only strings are allowed
        data: { value: 123 },
      };

      expect(() => {
        memIndex.writeFragment(fragment);
      }).toThrowError(
        `primaryKey and secondaryKey strings are required, got primaryKey=${fragment.ownerId}, secondaryKey=${fragment.id}`
      );
    });
  });

  describe('readFragment()', () => {
    test('readFragment returns what we writeFragment ', async () => {
      const fragment = {
        ownerId: 'abc',
        id: 'abcd',
        data: { value: 123 },
      };
      await memIndex.writeFragment(fragment);
      const result = await memIndex.readFragment(fragment.ownerId, fragment.id);
      expect(result).toEqual(fragment);
    });

    test('readFragment invalid fragment, throw error', async () => {
      const fragment = {
        ownerId: 'abc',
        id: 1, // this will throw an error as only strings are allowed
        data: { value: 123 },
      };

      await expect(() => {
        memIndex.readFragment(fragment.ownerId, fragment.id);
      }).toThrowError(
        `primaryKey and secondaryKey strings are required, got primaryKey=${fragment.ownerId}, secondaryKey=${fragment.id}`
      );
    });

    test('readFragment without writing, return undefined', async () => {
      // make sure the fragment was not written/saved before, so we can test the readFragment in failure case
      const fragment = {
        ownerId: 'cba',
        id: 'dcba',
        data: { value: 123 },
      };
      const result = await memIndex.readFragment(fragment.ownerId, fragment.id);
      expect(result).toBeUndefined();
    });
  });

  describe('writeFragmentData()', () => {
    test('writeFragmentData to the memory db, return nothing/undefined', async () => {
      const ownerId = 'abc';
      const id = 'abcd';
      const data = { value: 123 };

      const result = await memIndex.writeFragmentData(ownerId, id, data);
      expect(result).toBeUndefined(); // expect the result to be undefined as put() returns nothing
    });

    test('writeFragmentData invalid fragment, throw error', async () => {
      const ownerId = 1; // this will throw an error as only strings are allowed
      const id = 'abc';
      const data = { value: 123 };

      await expect(() => {
        memIndex.writeFragmentData(ownerId, id, data);
      }).toThrowError(
        `primaryKey and secondaryKey strings are required, got primaryKey=${ownerId}, secondaryKey=${id}`
      );
    });
  });

  describe('readFragmentData()', () => {
    test('readFragmentData returns what we writeFragmentData ', async () => {
      const ownerId = 'abc';
      const id = 'abcd';
      const data = { value: 123 };

      await memIndex.writeFragmentData(ownerId, id, data);
      const result = await memIndex.readFragmentData(ownerId, id);
      expect(result).toEqual(data);
    });

    test('readFragmentData invalid fragment, throw error', async () => {
      const ownerId = 1; // this will throw an error as only strings are allowed
      const id = 'abc';

      await expect(() => {
        memIndex.readFragmentData(ownerId, id);
      }).toThrowError(
        `primaryKey and secondaryKey strings are required, got primaryKey=${ownerId}, secondaryKey=${id}`
      );
    });
  });

  describe('listFragments()', () => {
    test('listFragments invalid ownerId, throw error', async () => {
      const ownerId = 1; // this will throw an error as only strings are allowed

      await expect(memIndex.listFragments(ownerId)).rejects.toThrowError(
        `primaryKey string is required, got primaryKey=${ownerId}`
      );
    });

    test('listFragments without writing, return empty array', async () => {
      // make sure the fragment was not written/saved before,
      //so we can test the readFragment in failure case
      const ownerId = 'cba';
      const result = await memIndex.listFragments(ownerId);
      expect(result).toEqual([]);
    });

    test('listFragments with expand = true, return empty array', async () => {
      // make sure the fragment was not written/saved before,
      //so we can test the readFragment in failure case
      const ownerId = 'cba';
      const result = await memIndex.listFragments(ownerId, true);
      expect(result).toEqual([]);
    });

    test('listFragments with valid return and expand = false, return single of id', async () => {
      const ownerId = 'abc';
      const id = 'abcd';
      const data = { value: 123 };

      await memIndex.writeFragmentData(ownerId, id, data);
      const result = await memIndex.listFragments(ownerId);
      expect(result).toEqual([id]);
    });

    test('listFragments with valid return and expand = false, return multiple of ids', async () => {
      const ownerId = 'abc';
      const fragment1 = {
        ownerId: ownerId,
        id: 'abcd',
        data: { value: 123 },
      };
      const fragment2 = {
        ownerId: ownerId,
        id: 'abcde',
        data: { value: 321 },
      };
      // test both writeFragment and writeFragmentData at the same time
      await memIndex.writeFragmentData(fragment1.ownerId, fragment1.id, fragment1.data);
      await memIndex.writeFragment(fragment2);
      const result = await memIndex.listFragments(ownerId);
      expect(result).toEqual([fragment1.id, fragment2.id]);
    });
  });

  describe('deleteFragment()', () => {
    test('deleteFragment invalid fragment, throw error', async () => {
      const ownerId = 1; // this will throw an error as only strings are allowed
      const id = 'abc';

      await expect(memIndex.deleteFragment(ownerId, id)).rejects.toThrowError(
        `primaryKey and secondaryKey strings are required, got primaryKey=${ownerId}, secondaryKey=${id}`
      );
    });

    test('deleteFragment without writing, throw error', async () => {
      // make sure the fragment was not written/saved before,
      //so we can test the deleteFragment in failure case
      const ownerId = 'cba';
      const id = 'dcba';
      await expect(memIndex.deleteFragment(ownerId, id)).rejects.toThrowError(
        `missing entry for primaryKey=${ownerId} and secondaryKey=${id}`
      );
    });

    test('deleteFragment deletes fragment correctly, return undefined', async () => {
      const ownerId = 'abc';
      const id = 'abcd';
      const data = { value: 123 };

      await memIndex.writeFragmentData(ownerId, id, data);
      await memIndex.deleteFragment(ownerId, id);
      const result = await memIndex.readFragmentData(ownerId, id);

      // Try to read the deleted fragment
      expect(result).toBeUndefined();
    });
  });
});

const storage = new Map();

module.exports = {
  getItem: jest.fn(async key => storage.get(key) ?? null),
  removeItem: jest.fn(async key => {
    storage.delete(key);
  }),
  setItem: jest.fn(async (key, value) => {
    storage.set(key, value);
  }),
};

const doc = {
  collection: jest.fn(() => doc),
  doc: jest.fn(() => doc),
  get: jest.fn(async () => ({ docs: [] })),
  id: 'mock-cloud-id',
  orderBy: jest.fn(() => doc),
  set: jest.fn(async () => undefined),
};

function firestore() {
  return {
    collection: jest.fn(() => doc),
  };
}

firestore.FieldValue = {
  serverTimestamp: jest.fn(() => 'serverTimestamp'),
};

module.exports = firestore;

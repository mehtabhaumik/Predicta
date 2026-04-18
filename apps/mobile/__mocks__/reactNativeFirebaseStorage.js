const ref = () => ({
  getDownloadURL: jest.fn(() =>
    Promise.resolve('https://example.com/report.pdf'),
  ),
  putFile: jest.fn(() => Promise.resolve()),
});

const storage = () => ({
  ref,
});

export default storage;

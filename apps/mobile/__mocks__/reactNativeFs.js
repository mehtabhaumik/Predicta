const RNFS = {
  DocumentDirectoryPath: '/tmp/predicta-mobile-documents',
  writeFile: jest.fn(async () => undefined),
};

module.exports = RNFS;
module.exports.default = RNFS;

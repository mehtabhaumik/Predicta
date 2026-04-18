module.exports = {
  generatePDF: jest.fn(async () => ({
    filePath: '/tmp/pridicta.pdf',
    numberOfPages: 13,
  })),
};

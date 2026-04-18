class SoundMock {
  static setCategory = jest.fn();

  constructor(_source, callback) {
    callback?.(null);
  }

  play(callback) {
    callback?.(true);
  }

  release() {}

  setVolume() {}
}

module.exports = SoundMock;

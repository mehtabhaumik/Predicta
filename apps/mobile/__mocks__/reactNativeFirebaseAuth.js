function auth() {
  return {
    currentUser: null,
    signInWithCredential: jest.fn(async () => ({ user: null })),
    signOut: jest.fn(async () => undefined),
  };
}

auth.GoogleAuthProvider = {
  credential: jest.fn(() => ({})),
};

module.exports = auth;

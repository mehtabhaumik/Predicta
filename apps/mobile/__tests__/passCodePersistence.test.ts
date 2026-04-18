import { redeemPassCodeWithFirebase } from '../src/services/firebase/passCodePersistence';

describe('pass code Firebase persistence', () => {
  it('fails safely when Firebase redemption is unavailable', async () => {
    const result = await redeemPassCodeWithFirebase({
      code: 'PRID-ICTA-TEST-2026',
      deviceId: 'device-1',
      userId: 'user-1',
    });

    expect(result.status).toBe('NETWORK_ERROR');
    if (result.status !== 'SUCCESS') {
      expect(result.message).toContain('internet connection');
    }
  });
});

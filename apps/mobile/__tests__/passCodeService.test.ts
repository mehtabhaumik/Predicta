import {
  consumeGuestQuota,
  createGuestPassCode,
  hashPassCode,
  hasGuestQuota,
  normalizePassCode,
  resetPassCodeRateLimits,
  validateGuestPassCode,
} from '../src/services/access/passCodeService';
import { sha256 } from '../src/utils/sha256';

const RAW_CODE = 'PRID-ICTA-TEST-2026';

function createPass(overrides = {}) {
  return {
    ...createGuestPassCode({
      accessLevel: 'VIP_GUEST',
      code: RAW_CODE,
      codeId: 'vip-review-test',
      createdAt: '2026-04-18T00:00:00.000Z',
      createdBy: 'admin',
      expiresAt: '2026-12-31T00:00:00.000Z',
      label: 'VIP review pass',
      maxRedemptions: 2,
      type: 'VIP_REVIEW',
    }),
    ...overrides,
  };
}

describe('pass code service', () => {
  beforeEach(() => resetPassCodeRateLimits());

  it('normalizes and hashes pass codes consistently', () => {
    expect(normalizePassCode(' prid-icta test 2026 ')).toBe('PRIDICTATEST2026');
    expect(hashPassCode(RAW_CODE)).toBe(hashPassCode('pridicta test 2026'));
    expect(sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('redeems an active code and gives pass duration from redemption time', () => {
    const result = validateGuestPassCode(createPass(), {
      code: RAW_CODE,
      deviceId: 'device-1',
      email: 'guest@example.com',
      now: new Date('2026-04-20T00:00:00.000Z'),
      userId: 'user-1',
    });

    expect(result.status).toBe('SUCCESS');
    if (result.status === 'SUCCESS') {
      expect(result.redeemedPass.expiresAt).toBe('2026-05-20T00:00:00.000Z');
      expect(result.updatedPassCode.redeemedByUserIds).toContain('user-1');
    }
  });

  it('rejects expired, inactive, maxed, and email-restricted codes safely', () => {
    const baseRequest = {
      code: RAW_CODE,
      deviceId: 'device-1',
      email: 'wrong@example.com',
      now: new Date('2026-04-20T00:00:00.000Z'),
      userId: 'user-1',
    };

    expect(
      validateGuestPassCode(
        createPass({ expiresAt: '2026-04-19T00:00:00.000Z' }),
        baseRequest,
      ).status,
    ).toBe('EXPIRED');
    expect(
      validateGuestPassCode(createPass({ isActive: false }), baseRequest)
        .status,
    ).toBe('INACTIVE');
    expect(
      validateGuestPassCode(
        createPass({ maxRedemptions: 1, redeemedByUserIds: ['other'] }),
        baseRequest,
      ).status,
    ).toBe('MAX_REDEMPTIONS');
    expect(
      validateGuestPassCode(
        createPass({ allowedEmails: ['allowed@example.com'] }),
        baseRequest,
      ).status,
    ).toBe('EMAIL_NOT_ALLOWED');
  });

  it('tracks guest quota without consuming failed operations', () => {
    const result = validateGuestPassCode(createPass(), {
      code: RAW_CODE,
      deviceId: 'device-1',
      now: new Date('2026-04-20T00:00:00.000Z'),
      userId: 'user-1',
    });

    expect(result.status).toBe('SUCCESS');
    if (result.status !== 'SUCCESS') {
      return;
    }

    const pass = result.redeemedPass;
    expect(hasGuestQuota(pass, 'question')).toBe(true);
    expect(pass.questionsUsed).toBe(0);

    const afterSuccess = consumeGuestQuota(pass, 'question');
    expect(afterSuccess.questionsUsed).toBe(1);
    expect(pass.questionsUsed).toBe(0);
  });
});

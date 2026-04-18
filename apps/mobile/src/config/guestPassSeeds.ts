import { GUEST_ACCESS_LIMITS } from './guestAccessLimits';
import type { GuestPassCode, PassCodeType } from '../types/access';

const CREATED_AT = '2026-04-18T00:00:00.000Z';
const CODE_REDEMPTION_EXPIRES_AT = '2027-04-18T23:59:59.999Z';

type GuestPassSeed = {
  accessLevel: GuestPassCode['accessLevel'];
  codeHash: string;
  codeId: string;
  label: string;
  maxRedemptions: number;
  type: PassCodeType;
};

const GUEST_PASS_SEEDS: GuestPassSeed[] = [
  {
    accessLevel: 'GUEST',
    codeHash:
      'c6f063e83840803c1fc7e80f9ae8b6d903b487ba433301d28def0342b3967527',
    codeId: 'guest-trial-01',
    label: 'Family and friends guest trial',
    maxRedemptions: 10,
    type: 'GUEST_TRIAL',
  },
  {
    accessLevel: 'GUEST',
    codeHash:
      '6882a6b6a664525ddca5df3799aaa8f307f48548ffcfd29198bfbebc8f3ba86e',
    codeId: 'guest-trial-02',
    label: 'Family and friends guest trial',
    maxRedemptions: 10,
    type: 'GUEST_TRIAL',
  },
  {
    accessLevel: 'GUEST',
    codeHash:
      'f42c39daf63f9c31713b057fc4ac48963e73cc63a415842149b9fae6224b41b3',
    codeId: 'guest-trial-03',
    label: 'Family and friends guest trial',
    maxRedemptions: 10,
    type: 'GUEST_TRIAL',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      '781d22ec1f57fab5fc16bb881bb760ca34a6732045df44375e023e646bb5026c',
    codeId: 'vip-review-01',
    label: 'VIP review pass',
    maxRedemptions: 5,
    type: 'VIP_REVIEW',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      '11108693dec7a648eadeb6e5dc98b0acd80c8ff9569718a9a6c719055e67cd81',
    codeId: 'vip-review-02',
    label: 'VIP review pass',
    maxRedemptions: 5,
    type: 'VIP_REVIEW',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      'd6ebbc8a73ff19d38dee12c7848a7a3960db9dc9066d46afc6ed36bd54e92012',
    codeId: 'vip-review-03',
    label: 'VIP review pass',
    maxRedemptions: 5,
    type: 'VIP_REVIEW',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      '8efe04a978563f3683d1a8e603ad2ff36f340f936a749b226f7602149c6cb41d',
    codeId: 'investor-01',
    label: 'Investor review pass',
    maxRedemptions: 3,
    type: 'INVESTOR_PASS',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      'e79226202992f9faac7a8ee496e69572e6b45ed28cbb50e33c61463137df361c',
    codeId: 'investor-02',
    label: 'Investor review pass',
    maxRedemptions: 3,
    type: 'INVESTOR_PASS',
  },
  {
    accessLevel: 'VIP_GUEST',
    codeHash:
      'd9729bba29f4a8613cd45809608bd7710075a91c541fc37ade2d26b2312eacdd',
    codeId: 'investor-03',
    label: 'Investor review pass',
    maxRedemptions: 3,
    type: 'INVESTOR_PASS',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      'a23644d821f01eb462093c9797e3b84c12f78346728432550ece1e4c39e148c5',
    codeId: 'family-01',
    label: 'Family full-access pass',
    maxRedemptions: 2,
    type: 'FAMILY_PASS',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      '2cfe0c59a7a99fe5f7049f8192a6707b46037767b370548b691225c5f064375a',
    codeId: 'family-02',
    label: 'Family full-access pass',
    maxRedemptions: 2,
    type: 'FAMILY_PASS',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      '3b26c70cd0a6b931ac7779ac618fbad9c0346ad5634ff9d336fd6051b23f7b41',
    codeId: 'family-03',
    label: 'Family full-access pass',
    maxRedemptions: 2,
    type: 'FAMILY_PASS',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      '503b921d4785102d0dfc294015786954364446f02c605e373cd71b79061c6c82',
    codeId: 'internal-test-01',
    label: 'Internal test pass',
    maxRedemptions: 3,
    type: 'INTERNAL_TEST',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      '8b71053dce631019f072a217ae8bb4815d900b6e1ed970d9d7ee4afe1ffe0ee0',
    codeId: 'internal-test-02',
    label: 'Internal test pass',
    maxRedemptions: 3,
    type: 'INTERNAL_TEST',
  },
  {
    accessLevel: 'FULL_ACCESS',
    codeHash:
      'e5a129bf937166c71f320e65065f6a81f6f4b413c470bc54de30f29b270b72c4',
    codeId: 'internal-test-03',
    label: 'Internal test pass',
    maxRedemptions: 3,
    type: 'INTERNAL_TEST',
  },
];

export function getGuestPassSeedRecords(
  createdBy = 'admin-seed',
): GuestPassCode[] {
  return GUEST_PASS_SEEDS.map(seed => ({
    ...seed,
    createdAt: CREATED_AT,
    createdBy,
    deviceLimit: GUEST_ACCESS_LIMITS[seed.type].deviceLimit,
    expiresAt: CODE_REDEMPTION_EXPIRES_AT,
    isActive: true,
    redeemedByUserIds: [],
    redeemedDeviceIds: [],
    usageLimits: GUEST_ACCESS_LIMITS[seed.type].usageLimits,
  }));
}

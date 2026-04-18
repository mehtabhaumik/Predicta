import { getGuestPassSeedRecords } from '../src/config/guestPassSeeds';

describe('guest pass seeds', () => {
  it('creates hashed seed records without raw pass codes', () => {
    const seeds = getGuestPassSeedRecords('admin-test');

    expect(seeds).toHaveLength(15);
    expect(seeds.every(seed => seed.codeHash.length === 64)).toBe(true);
    expect(seeds.some(seed => seed.type === 'INVESTOR_PASS')).toBe(true);
    expect(JSON.stringify(seeds)).not.toContain('PRID-ICTA');
  });
});

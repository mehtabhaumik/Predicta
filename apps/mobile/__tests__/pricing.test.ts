import {
  formatInr,
  getDayPassProduct,
  getOneTimeProducts,
  getPricingPlans,
  getRecommendedPricingPlan,
  getPremiumPdfProduct,
} from '../src/config/pricing';

describe('pricing config', () => {
  it('formats INR and exposes recommended founder yearly plan', () => {
    expect(formatInr(1999)).toBe('₹1,999');
    expect(getRecommendedPricingPlan()).toMatchObject({
      id: 'YEARLY',
      priceInr: 1999,
      regularPriceInr: 2999,
    });
  });

  it('models subscription and one-time products', () => {
    expect(getPricingPlans()).toHaveLength(4);
    expect(getDayPassProduct()).toMatchObject({
      id: 'DAY_PASS',
      priceInr: 49,
    });
    expect(getPremiumPdfProduct()).toMatchObject({
      id: 'PREMIUM_PDF',
      priceInr: 249,
    });
    expect(getOneTimeProducts().map(product => product.id)).toContain(
      'FIVE_QUESTIONS',
    );
  });
});

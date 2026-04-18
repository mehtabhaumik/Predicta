import {
  detectIntent,
  selectOpenAIModelForIntent,
} from '../src/services/ai/aiRouter';

describe('aiRouter', () => {
  it('routes simple questions to the mini model', () => {
    const intent = detectIntent('What is my moon sign?');

    expect(intent).toBe('simple');
    expect(selectOpenAIModelForIntent({ intent, userPlan: 'FREE' })).toBe(
      'gpt-5.4-mini',
    );
  });

  it('keeps deep model for premium deep readings only', () => {
    const intent = detectIntent(
      'Predict my career and marriage for the next 5 years with dasha context.',
    );

    expect(intent).toBe('deep');
    expect(selectOpenAIModelForIntent({ intent, userPlan: 'FREE' })).toBe(
      'gpt-5.4-mini',
    );
    expect(selectOpenAIModelForIntent({ intent, userPlan: 'PREMIUM' })).toBe(
      'gpt-5.2',
    );
  });
});

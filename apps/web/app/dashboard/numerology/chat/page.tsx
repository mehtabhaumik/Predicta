import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function NumerologyPredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      prompt:
        'Read my number pattern and tell me what it means for my life right now.',
      school: 'NUMEROLOGY',
      sourceScreen: 'Numerology Predicta',
    },
    searchParams,
  });
}

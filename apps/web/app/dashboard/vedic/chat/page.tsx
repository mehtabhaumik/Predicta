import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function VedicPredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      prompt:
        'Read my Vedic chart and tell me what it means for my life right now.',
      school: 'PARASHARI',
      sourceScreen: 'Vedic Predicta',
    },
    searchParams,
  });
}

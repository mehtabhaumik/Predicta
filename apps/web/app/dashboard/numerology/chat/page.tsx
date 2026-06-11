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
        'Read my numerology profile from name number, birth number, destiny number, personal timing, and name rhythm.',
      school: 'NUMEROLOGY',
      sourceScreen: 'Numerology Predicta',
    },
    searchParams,
  });
}

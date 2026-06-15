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
      school: 'NUMEROLOGY',
      sourceScreen: 'Numerology Predicta',
    },
    searchParams,
  });
}

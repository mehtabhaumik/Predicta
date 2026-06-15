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
      school: 'PARASHARI',
      sourceScreen: 'Vedic Predicta',
    },
    searchParams,
  });
}

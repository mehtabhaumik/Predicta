import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function KpPredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      school: 'KP',
      sourceScreen: 'KP Predicta',
    },
    searchParams,
  });
}

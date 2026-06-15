import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function LegacyNadiPredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      school: 'JAIMINI',
      sourceScreen: 'Jaimini Predicta',
    },
    searchParams,
  });
}

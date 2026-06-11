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
      prompt:
        'Read my destiny direction, soul role, and current Jaimini life chapter.',
      school: 'JAIMINI',
      sourceScreen: 'Jaimini Predicta',
    },
    searchParams,
  });
}

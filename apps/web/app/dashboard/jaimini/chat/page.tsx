import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function JaiminiPredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      prompt:
        'Read my current Jaimini destiny chapter and tell me what it means for my life now.',
      school: 'JAIMINI',
      sourceScreen: 'Jaimini Predicta',
    },
    searchParams,
  });
}

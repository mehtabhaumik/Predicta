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
      prompt:
        'Use KP Predicta for my question. Keep the answer grounded in cusps, star lords, sub lords, significators, ruling planets, and KP timing.',
      school: 'KP',
      sourceScreen: 'KP Predicta',
    },
    searchParams,
  });
}

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
        'Answer my KP question clearly with timing, likely trigger, and what I should do next.',
      school: 'KP',
      sourceScreen: 'KP Predicta',
    },
    searchParams,
  });
}

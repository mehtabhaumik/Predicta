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
        'Read my Vedic chart using D1, varga support, dasha, gochar, remedies, and current life timing.',
      school: 'PARASHARI',
      sourceScreen: 'Vedic Predicta',
    },
    searchParams,
  });
}

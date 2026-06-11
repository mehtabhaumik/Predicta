import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../../_lib/legacy-chat-redirect';

export default async function SignaturePredictaChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      prompt:
        'Open Signature Predicta. Explain confirmed visible signature traits safely and reflectively.',
      school: 'SIGNATURE',
      sourceScreen: 'Signature Predicta',
    },
    searchParams,
  });
}

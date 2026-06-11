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
        'Read my confirmed signature traits safely and tell me what they reflect.',
      school: 'SIGNATURE',
      sourceScreen: 'Signature Predicta',
    },
    searchParams,
  });
}

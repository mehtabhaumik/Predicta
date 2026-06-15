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
      school: 'SIGNATURE',
      sourceScreen: 'Signature Predicta',
    },
    searchParams,
  });
}

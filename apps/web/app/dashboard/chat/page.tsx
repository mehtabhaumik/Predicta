import {
  redirectLegacyChatToAsk,
  type LegacyChatSearchParams,
} from '../_lib/legacy-chat-redirect';

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  return redirectLegacyChatToAsk({
    defaults: {
      prompt:
        'Start a direct Predicta reading. If I have a Kundli, use it and tell me the most useful thing to ask right now. If I do not, ask for birth details one by one.',
      sourceScreen: 'Ask Predicta',
    },
    searchParams,
  });
}

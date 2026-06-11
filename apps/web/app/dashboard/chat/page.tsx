import { redirect } from 'next/navigation';

type LegacyChatSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: LegacyChatSearchParams;
}): Promise<never> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (value !== undefined) {
      params.set(key, value);
    }
  }

  if (!params.has('sourceScreen')) {
    params.set('sourceScreen', 'Legacy Dashboard Chat');
  }

  redirect(`/ask?${params.toString()}`);
}

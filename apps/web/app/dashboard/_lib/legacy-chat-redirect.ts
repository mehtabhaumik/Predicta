import { redirect } from 'next/navigation';

export type LegacyChatSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type LegacyChatDefaults = {
  prompt?: string;
  school?: string;
  sourceScreen: string;
};

export async function redirectLegacyChatToAsk({
  defaults,
  searchParams,
}: {
  defaults: LegacyChatDefaults;
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
    params.set('sourceScreen', defaults.sourceScreen);
  }

  if (defaults.school && !params.has('school')) {
    params.set('school', defaults.school);
  }

  if (defaults.prompt && !params.has('prompt')) {
    params.set('prompt', defaults.prompt);
  }

  if (defaults.school && !params.has('handoffMode')) {
    params.set('handoffMode', 'room_safe');
  }

  redirect(`/ask?${params.toString()}`);
}

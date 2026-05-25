import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import type { ChartRenderTheme } from '@pridicta/astrology';

type ChartThemeNote = {
  eyebrow: string;
  title: string;
  body: string;
};

export function getChartThemeNote({
  language,
  theme,
  time,
}: {
  language: SupportedLanguage;
  theme: ChartRenderTheme;
  time?: string;
}): ChartThemeNote {
  const timeLabel = time?.trim() ? time.trim() : undefined;

  if (language === 'hi') {
    return getHindiThemeNote(theme, timeLabel);
  }

  if (language === 'gu') {
    return getGujaratiThemeNote(theme, timeLabel);
  }

  return getEnglishThemeNote(theme, timeLabel);
}

function getEnglishThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? `You were born at ${time}` : 'Your recorded birth time';

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: 'Birth-time theme',
      title: 'Afternoon chart light',
      body: `${timeLead}, so this chart uses Predicta's afternoon palette. Fun fact: afternoon charts feel clearer and more matter-of-fact, which suits charts where practical life delivery matters.`,
    },
    morning: {
      eyebrow: 'Birth-time theme',
      title: 'Morning chart light',
      body: `${timeLead}, so this chart uses Predicta's morning palette. Fun fact: morning charts often feel fresh, building, and growth-oriented because the day is still unfolding.`,
    },
    night: {
      eyebrow: 'Birth-time theme',
      title: 'Night chart light',
      body: `${timeLead}, so this chart uses Predicta's night palette. Fun fact: night charts naturally feel quieter and more inward, which makes hidden motives and inner timing easier to feel.`,
    },
    sunrise: {
      eyebrow: 'Birth-time theme',
      title: 'Sunrise chart light',
      body: `${timeLead}, so this chart uses Predicta's sunrise palette. Fun fact: sunrise charts tend to feel like first-light stories: emergence, visibility, and a life that keeps asking to begin again with clarity.`,
    },
    sunset: {
      eyebrow: 'Birth-time theme',
      title: 'Sunset chart light',
      body: `${timeLead}, so this chart uses Predicta's sunset palette. Fun fact: sunset charts often carry transition energy, where duty, closure, and ripening results become more visible.`,
    },
    unknown: {
      eyebrow: 'Birth-time theme',
      title: 'Default chart light',
      body: 'Predicta could not confidently place this chart into a sunrise, day, sunset, or night band, so it is using the neutral default palette.',
    },
  };

  return notes[theme];
}

function getHindiThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.1a87c6c217", [time]) : getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.081d316602");

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.8029bd8ebb"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.8b782d696a", [timeLead]),
    },
    morning: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.4459660554"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.6af0fa1139", [timeLead]),
    },
    night: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.57b72f3d97"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.e6295d61be", [timeLead]),
    },
    sunrise: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.8f3f51d874"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.245f2bdc59", [timeLead]),
    },
    sunset: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.16838f33ea"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0d2954b4d3", [timeLead]),
    },
    unknown: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.573f79a241"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.3d6f496629"),
      body: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.8ace7b3ccd"),
    },
  };

  return notes[theme];
}

function getGujaratiThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.1a8ab1bc99", [time]) : getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.a9733519b4");

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.b5e400e0ae"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.bd09dcec97", [timeLead]),
    },
    morning: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.60d1285d5f"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.e613465d7e", [timeLead]),
    },
    night: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.25dcaffdf9"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.65040fed3e", [timeLead]),
    },
    sunrise: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.e7afef4319"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.14a737360d", [timeLead]),
    },
    sunset: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.67e212896e"),
      body: formatNativeCopy("native.apps.web.lib.chart.theme.copy.ts.46e410ba6b", [timeLead]),
    },
    unknown: {
      eyebrow: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.0f20d10632"),
      title: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.8c43dcefbe"),
      body: getNativeCopy("native.apps.web.lib.chart.theme.copy.ts.1b5d519c01"),
    },
  };

  return notes[theme];
}

import type { ChatSafetyMeta, SupportedLanguage } from '@pridicta/types';

const SELF_HARM_PATTERN =
  /\b(kill myself|end my life|suicide|suicidal|want to die|do not want to live|don't want to live|self-harm|khudkushi|aatmahatya|atmahatya|marna chahta|mane marvu chhe|hu marva mangu chhu)\b/i;
const UNSAFE_INSTRUCTION_PATTERN =
  /\b(how to|teach me|steps to|best way to).*\b(kill|poison|stab|hurt|bomb|weapon|shoot)\b|\b(shoplift|steal|hack someone's|bypass security|fake id)\b/i;
const HIGH_STAKES_PATTERN =
  /\b(health|medical|medicine|doctor|surgery|pregnancy|disease|diagnosis|treatment|legal|court|lawsuit|contract|police|tax|finance|financial|invest|investing|investment|savings|stock|crypto|loan|debt|insurance|money|paise|paisa|dhan|karz|behavior|behaviour|criminal|crime|psychopath|mental illness|mental health|depression|anxiety|addiction|aggression|anger issue|abuse|violence|violent|emergency|unsafe)\b/i;

export function detectChatSafetyMeta(
  text: string,
  language: SupportedLanguage = 'en',
  response?: { safetyBlocked?: boolean; safetyCategories?: string[] },
): ChatSafetyMeta | undefined {
  const categories = response?.safetyCategories ?? [];

  if (response?.safetyBlocked || SELF_HARM_PATTERN.test(text)) {
    return {
      categories: categories.length ? categories : ['self-harm'],
      kind: SELF_HARM_PATTERN.test(text) ? 'crisis' : 'blocked',
      reportHref: getSafetyReportHref(),
      reportLabel: getSafetyReportLabel(language),
      title: getSafetyTitle('crisis', language),
      body: getSafetyBody('crisis', language),
    };
  }

  if (UNSAFE_INSTRUCTION_PATTERN.test(text)) {
    return {
      categories: ['unsafe-instructions'],
      kind: 'blocked',
      reportHref: getSafetyReportHref(),
      reportLabel: getSafetyReportLabel(language),
      title: getSafetyTitle('blocked', language),
      body: getSafetyBody('blocked', language),
    };
  }

  if (HIGH_STAKES_PATTERN.test(text)) {
    return {
      categories: categories.length ? categories : ['high-stakes'],
      kind: 'high-stakes',
      reportHref: getSafetyReportHref(),
      reportLabel: getSafetyReportLabel(language),
      title: getSafetyTitle('high-stakes', language),
      body: getSafetyBody('high-stakes', language),
    };
  }

  return undefined;
}

export function getCrisisSupportReply(language: SupportedLanguage = 'en'): string {
  if (language === 'hi') {
    return 'Main aapke saath hoon. Is pal astrology se zyada turant human support zaroori hai. Agar aap khud ko nuksan pahunchane ka soch rahe hain, abhi local emergency service, crisis helpline, ya kisi trusted person ko contact kijiye. US/Canada mein 988 call/text kar sakte hain. Agar immediate danger hai, emergency number call kijiye.';
  }

  if (language === 'gu') {
    return 'Hu tamari sathe chhu. Aa vakhate astrology karta turant human support vadhu jaruri chhe. Jo tame potane nuksan karva vichari rahya hoy, to have local emergency service, crisis helpline, athva trusted person ne contact karo. US/Canada ma 988 call/text kari shako. Immediate danger hoy to emergency number call karo.';
  }

  return 'I am with you. This moment needs immediate human support more than astrology. If you may hurt yourself, contact local emergency services, a crisis hotline, or a trusted person now. In the US/Canada, call or text 988. If there is immediate danger, call your local emergency number.';
}

export function getSafetyReportHref(): string {
  return 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report';
}

function getSafetyReportLabel(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Report karein';
  }
  if (language === 'gu') {
    return 'Report karo';
  }
  return 'Report issue';
}

function getSafetyTitle(
  kind: ChatSafetyMeta['kind'],
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return kind === 'crisis'
      ? 'Immediate support'
      : kind === 'blocked'
        ? 'Safety boundary'
        : 'Careful guidance';
  }
  if (language === 'gu') {
    return kind === 'crisis'
      ? 'Immediate support'
      : kind === 'blocked'
        ? 'Safety boundary'
        : 'Careful guidance';
  }
  return kind === 'crisis'
    ? 'Immediate support'
    : kind === 'blocked'
      ? 'Safety boundary'
      : 'Careful guidance';
}

function getSafetyBody(
  kind: ChatSafetyMeta['kind'],
  language: SupportedLanguage,
): string {
  if (kind === 'crisis') {
    return language === 'en'
      ? 'Predicta can stay with you and answer gently, while urgent human help comes first if you may hurt yourself.'
      : 'Predicta aapke saath rahegi aur gently answer karegi, par agar khud ko nuksan ka risk hai to urgent human help pehle aati hai.';
  }

  if (kind === 'blocked') {
    return language === 'gu'
      ? 'Predicta harm, illegal action, athva unsafe instructions ma madad nahi kare. Hu safe next step ma help karish.'
      : language === 'hi'
        ? 'Predicta harm, illegal action, ya unsafe instructions mein madad nahi karegi. Main safe next step mein help karungi.'
        : 'Predicta will not help with harm, illegal action, or unsafe instructions. I can help with a safe next step.';
  }

  return language === 'gu'
    ? 'Aa reflective Jyotish guidance chhe. Serious decision mate qualified professional ni salah sathe use karo.'
    : language === 'hi'
      ? 'Yeh reflective Jyotish guidance hai. Serious decision ke liye qualified professional ki salah ke saath use karein.'
      : 'This is reflective Jyotish guidance. Use it alongside qualified professional support for serious decisions.';
}

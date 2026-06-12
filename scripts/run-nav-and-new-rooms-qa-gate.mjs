import { existsSync, readFileSync } from 'node:fs';

const checks = [
  {
    label: 'web route exists for Vedic chat',
    path: 'apps/web/app/dashboard/vedic/chat/page.tsx',
  },
  {
    label: 'web route exists for KP chat',
    path: 'apps/web/app/dashboard/kp/chat/page.tsx',
  },
  {
    label: 'web route exists for Jaimini chat',
    path: 'apps/web/app/dashboard/jaimini/chat/page.tsx',
  },
  {
    label: 'web route exists for Numerology chat',
    path: 'apps/web/app/dashboard/numerology/chat/page.tsx',
  },
  {
    label: 'web route exists for Signature chat',
    path: 'apps/web/app/dashboard/signature/chat/page.tsx',
  },
  {
    label: 'web route exists for KP Predicta',
    path: 'apps/web/app/dashboard/kp/page.tsx',
  },
  {
    label: 'web route exists for Jaimini Predicta',
    path: 'apps/web/app/dashboard/jaimini/page.tsx',
  },
  {
    label: 'web route exists for Numerology Predicta',
    path: 'apps/web/app/dashboard/numerology/page.tsx',
  },
  {
    label: 'web route exists for Signature Predicta',
    path: 'apps/web/app/dashboard/signature/page.tsx',
  },
  {
    label: 'mobile screen exists for KP Predicta',
    path: 'apps/mobile/src/screens/KpPredictaScreen.tsx',
  },
  {
    label: 'mobile screen exists for Jaimini Predicta',
    path: 'apps/mobile/src/screens/JaiminiPredictaScreen.tsx',
  },
  {
    label: 'mobile screen exists for Numerology Predicta',
    path: 'apps/mobile/src/screens/NumerologyPredictaScreen.tsx',
  },
  {
    label: 'mobile screen exists for Signature Predicta',
    path: 'apps/mobile/src/screens/SignaturePredictaScreen.tsx',
  },
];

const sourceContracts = [
  {
    file: 'apps/web/components/DashboardShell.tsx',
    label: 'web dashboard nav exposes specialist rooms and the primary Ask Predicta action',
    mustContain: [
      '/ask',
      'askPredictaHref',
      'askFromPageHref',
      'dashboard-ask-dock',
      '/dashboard/vedic',
      '/dashboard/kp',
      '/dashboard/jaimini',
      '/dashboard/numerology',
      '/dashboard/signature',
      'labels.nav.numerologyPredicta',
      'labels.nav.signaturePredicta',
    ],
  },
  {
    file: 'apps/mobile/src/navigation/routes.ts',
    label: 'mobile route names include all specialist rooms',
    mustContain: [
      "KpPredicta: 'KpPredicta'",
      "JaiminiPredicta: 'JaiminiPredicta'",
      "NumerologyPredicta: 'NumerologyPredicta'",
      "SignaturePredicta: 'SignaturePredicta'",
      '[routes.NumerologyPredicta]: undefined',
      '[routes.SignaturePredicta]: undefined',
    ],
  },
  {
    file: 'apps/mobile/src/navigation/RootNavigator.tsx',
    label: 'mobile navigator registers new rooms',
    mustContain: [
      'JaiminiPredictaScreen',
      'NumerologyPredictaScreen',
      'SignaturePredictaScreen',
      'name={routes.JaiminiPredicta}',
      'name={routes.NumerologyPredicta}',
      'name={routes.SignaturePredicta}',
    ],
  },
  {
    file: 'apps/mobile/src/screens/HomeScreen.tsx',
    label: 'mobile home nav exposes new rooms',
    mustContain: [
      'labels.nav.jaimini',
      'routes.JaiminiPredicta',
      'labels.nav.numerologyPredicta',
      'routes.NumerologyPredicta',
      'labels.nav.signaturePredicta',
      'routes.SignaturePredicta',
    ],
  },
  {
    file: 'apps/mobile/src/screens/ChatScreen.tsx',
    label: 'mobile chat suggestions can navigate to new rooms',
    mustContain: [
      'suggestion.targetScreen === routes.NumerologyPredicta',
      'navigation.navigate(routes.NumerologyPredicta)',
      'suggestion.targetScreen === routes.SignaturePredicta',
      'navigation.navigate(routes.SignaturePredicta)',
    ],
  },
  {
    file: 'packages/config/src/language.ts',
    label: 'app shell label type includes Numerology Predicta',
    mustContain: ['numerologyPredicta: string;'],
  },
  {
    file: 'packages/config/src/translations/language.json',
    label: 'app shell translations include Numerology Predicta in all app languages',
    mustContain: [
      '"numerologyPredicta": "Numerology Predicta"',
      '"numerologyPredicta": "अंक प्रेडिक्टा"',
      '"numerologyPredicta": "અંક પ્રેડિક્ટા"',
    ],
  },
  {
    file: 'packages/astrology/src/chatFollowUps.ts',
    label: 'Predicta follow-ups hand off directly into Ask Predicta with specialist context',
    mustContain: [
      "buildSchoolHandoffHref('/dashboard/kp/chat', context)",
      "buildSchoolHandoffHref('/dashboard/jaimini/chat', context)",
      "buildSchoolHandoffHref('/dashboard/numerology/chat', context)",
      "return `/ask?${params.toString()}`;",
      "setHrefParam(params, 'school', context.predictaSchool)",
      "params.set('handoffMode', 'room_safe')",
      "targetScreen: 'NumerologyPredicta'",
    ],
  },
  {
    file: 'scripts/run-end-to-end-buyer-rejection-test.mjs',
    label: 'buyer rejection gate covers new rooms',
    mustContain: [
      "'/dashboard/numerology'",
      "'/dashboard/signature'",
    ],
  },
  {
    file: 'scripts/run-mobile-tablet-visual-proof-gate.mjs',
    label: 'visual proof gate covers new rooms',
    mustContain: [
      "'/dashboard/numerology'",
      "'/dashboard/signature'",
    ],
  },
];

const failures = [];

for (const check of checks) {
  if (!existsSync(check.path)) {
    failures.push(`${check.label}: missing ${check.path}`);
  }
}

for (const contract of sourceContracts) {
  if (!existsSync(contract.file)) {
    failures.push(`${contract.label}: missing ${contract.file}`);
    continue;
  }

  const source = readFileSync(contract.file, 'utf8');
  for (const expected of contract.mustContain) {
    if (!source.includes(expected)) {
      failures.push(`${contract.label}: missing "${expected}" in ${contract.file}`);
    }
  }
}

if (failures.length) {
  console.error('Nav and new rooms QA gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Nav and new rooms QA gate passed: Vedic, KP, Jaimini, Numerology, and Signature routes are present across web, mobile, nav, and QA coverage.');

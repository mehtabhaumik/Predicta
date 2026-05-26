import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const packageTargets = [
  'access',
  'ai',
  'config',
  'core',
  'firebase',
  'monetization',
  'pdf',
  'types',
  'ui-tokens',
  'utils',
];

const runtimeTargets = new Set([
  'access',
  'ai',
  'config',
  'core',
  'firebase',
  'monetization',
  'ui-tokens',
  'utils',
]);

const requestedTarget = process.argv[2] ?? 'all';
const targets =
  requestedTarget === 'all'
    ? packageTargets
    : requestedTarget.split(',').map(target => target.trim()).filter(Boolean);

for (const target of targets) {
  assert.ok(
    packageTargets.includes(target),
    `Unknown package meaningful-test target: ${target}`,
  );
}

await assertNoPlaceholderPackageTests();

const packageChecks = {
  access(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const passCode = requireFromRuntime(
      'packages/access/src/passCodeService.js',
    );
    const accessResolver = requireFromRuntime(
      'packages/access/src/accessResolver.js',
    );
    const accessControl = requireFromRuntime(
      'packages/access/src/accessControlService.js',
    );
    const monetization = requireFromRuntime(
      'packages/monetization/src/entitlementService.js',
    );

    assert.equal(accessControl.normalizeEmail('  User@Example.COM '), 'user@example.com');
    assert.equal(passCode.normalizePassCode(' pre-d1 cta '), 'PRED1CTA');
    assert.equal(passCode.formatPassCode('predicta2026'), 'PRED-ICTA-2026');
    assert.match(passCode.hashPassCode('predicta2026'), /^[a-f0-9]{64}$/);

    const createdAt = '2099-01-01T00:00:00.000Z';
    const guestPass = passCode.createGuestPassCode({
      accessLevel: 'VIP_GUEST',
      allowedEmails: ['Guest@Example.com', ' guest@example.com '],
      code: 'VIP-2026',
      codeId: 'pass_phase10',
      createdAt,
      createdBy: 'admin',
      label: 'Phase 10 VIP pass',
      maxRedemptions: 1,
      type: 'VIP_REVIEW',
    });

    assert.deepEqual(guestPass.allowedEmails, ['guest@example.com']);
    const redemption = passCode.validateGuestPassCode(guestPass, {
      code: 'vip 2026',
      deviceId: 'device-1',
      email: 'guest@example.com',
      now: new Date('2099-01-02T00:00:00.000Z'),
      userId: 'user-1',
    });

    assert.equal(redemption.status, 'SUCCESS');
    assert.equal(redemption.redeemedPass.accessLevel, 'VIP_GUEST');
    assert.equal(
      passCode.hasGuestQuota(
        redemption.redeemedPass,
        'question',
        new Date('2099-01-02T00:00:00.000Z'),
      ),
      true,
    );
    assert.equal(
      passCode.hasGuestQuota(
        {
          ...redemption.redeemedPass,
          questionsUsed: redemption.redeemedPass.usageLimits.questionsTotal,
        },
        'question',
        new Date('2099-01-02T00:00:00.000Z'),
      ),
      false,
    );

    const blockedRedemption = passCode.validateGuestPassCode(guestPass, {
      code: 'VIP-2026',
      deviceId: 'device-2',
      email: 'wrong@example.com',
      now: new Date('2099-01-02T00:01:00.000Z'),
      userId: 'user-2',
    });
    assert.equal(blockedRedemption.status, 'EMAIL_NOT_ALLOWED');

    const freeAccess = accessResolver.resolveAccess({
      auth: { email: 'free@example.com', userId: 'free' },
      monetization: monetization.createInitialMonetizationState(),
    });
    assert.equal(freeAccess.source, 'free');
    assert.equal(accessResolver.canSeeAdminRoute(freeAccess), false);

    const guestAccess = accessResolver.resolveAccess({
      auth: { email: 'guest@example.com', userId: 'user-1' },
      monetization: monetization.createInitialMonetizationState(),
      redeemedGuestPass: redemption.redeemedPass,
    });
    assert.equal(guestAccess.source, 'guest_pass');
    assert.equal(guestAccess.hasPremiumAccess, true);
  },

  ai(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const aiRouter = requireFromRuntime('packages/ai/src/aiRouter.js');
    const aiModels = requireFromRuntime('packages/config/src/aiModels.js');

    assert.equal(aiRouter.detectIntent('hi'), 'simple');
    assert.equal(
      aiRouter.detectIntent('Give me a deep dasha prediction report'),
      'deep',
    );
    assert.equal(
      aiRouter.selectOpenAIModelForIntent({
        intent: 'deep',
        userPlan: 'PREMIUM',
      }),
      aiModels.OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS,
    );
    assert.equal(
      aiRouter.selectOpenAIModelForIntent({
        intent: 'deep',
        userPlan: 'FREE',
      }),
      aiModels.OPENAI_MODELS.FREE_REASONING,
    );
    assert.equal(
      aiRouter.shouldConsumeDeepQuota(
        'deep',
        aiModels.OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS,
      ),
      true,
    );
    assert.equal(
      aiRouter.shouldConsumeDeepQuota('deep', aiModels.OPENAI_MODELS.FREE_REASONING),
      false,
    );

    const tokenOptimizerSource = readWorkspaceFile('packages/ai/src/tokenOptimizer.ts');
    assert.ok(tokenOptimizerSource.includes('history.slice(-maxTurns)'));
    assert.ok(tokenOptimizerSource.includes('turn.text.slice(0, 800)'));
    assert.ok(tokenOptimizerSource.includes('PREMIUM_MAX_OUTPUT_TOKENS'));
    assert.ok(tokenOptimizerSource.includes('FREE_MAX_OUTPUT_TOKENS'));
  },

  async config(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const config = requireFromRuntime('packages/config/src/index.js');
    const pricing = requireFromRuntime('packages/config/src/pricing.js');
    const language = requireFromRuntime('packages/config/src/language.js');
    const nativeCopy = requireFromRuntime('packages/config/src/nativeCopy.js');
    const uiTranslations = requireFromRuntime(
      'packages/config/src/uiTranslations.js',
    );

    assert.equal(config.OPENAI_MODELS.FREE_REASONING, 'gpt-5.4-mini');
    assert.equal(config.OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS, 'gpt-5.5');
    assert.equal(config.GEMINI_MODELS.FLASH_HELPER, 'gemini-2.5-flash');
    assert.equal(config.USAGE_LIMITS.FREE.questionsPerDay, 3);
    assert.ok(config.DAY_PASS_LIMITS.durationHours >= 24);

    assert.ok(pricing.SUBSCRIPTION_PRICING.monthly > 0);
    assert.ok(pricing.ONE_TIME_PRICING.premiumPdf > 0);
    assert.ok(
      pricing.getReportMarketplaceProducts().every(
        product =>
          product.title &&
          product.school &&
          product.freeIncludes.length > 0 &&
          product.premiumIncludes.length > 0,
      ),
    );

    assert.equal(language.normalizeLanguage('hi'), 'hi');
    assert.equal(language.normalizeLanguage('unknown'), 'en');
    assert.equal(language.getLanguageOption('gu').nativeName.includes('ગુજરાત'), true);
    assert.equal(language.getAppShellLabels('en').nav.reports, 'Reports');
    assert.notEqual(language.getAppShellLabels('hi').nav.reports, 'Reports');

    assert.equal(nativeCopy.getNativeCopy('missing.key'), 'missing.key');
    assert.match(nativeCopy.getNativeCopy('ui.signatureReady.phase9'), /Signature/i);

    const translated = uiTranslations.translateUiText('Birth', 'hi');
    assert.notEqual(translated, 'Birth');
    assert.equal(uiTranslations.translateUiText('Birth', 'en'), 'Birth');
    assert.equal(uiTranslations.getMissingUiTranslationKeys('hi').length, 0);
    assert.equal(uiTranslations.getMissingUiTranslationKeys('gu').length, 0);

    await assertJsonTranslationCompleteness('packages/config/src/translations/ui.json');
    await assertJsonTranslationCompleteness('packages/config/src/translations/language.json');
    await assertJsonTranslationCompleteness('packages/config/src/translations/nativeCopy.json');
  },

  core(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const core = requireFromRuntime('packages/core/src/index.js');

    assert.equal(typeof core.createInitialMonetizationState, 'function');
    assert.equal(typeof core.composeNumerologyFoundationModel, 'function');
    assert.equal(typeof core.composeSignatureAnalysisModel, 'function');
    assert.equal(core.createInitialMonetizationState().entitlement.plan, 'FREE');
  },

  firebase(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const firebase = requireFromRuntime('packages/firebase/src/index.js');

    assert.deepEqual(Object.keys(firebase.firebaseCollections).sort(), [
      'accessPassCodes',
      'analyticsEvents',
      'kundlis',
      'pdfs',
      'users',
    ]);
    assert.equal(firebase.userPath('user-1'), 'users/user-1');
    assert.equal(firebase.kundliPath('kundli-1'), 'kundlis/kundli-1');
    assert.equal(firebase.passCodePath('pass-1'), 'accessPassCodes/pass-1');
  },

  monetization(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const entitlement = requireFromRuntime(
      'packages/monetization/src/entitlementService.js',
    );
    const payment = requireFromRuntime(
      'packages/monetization/src/paymentWorkflow.js',
    );
    const usageDisplay = requireFromRuntime(
      'packages/monetization/src/usageDisplayService.js',
    );

    const initial = entitlement.createInitialMonetizationState();
    assert.equal(initial.entitlement.plan, 'FREE');
    assert.equal(entitlement.hasPremiumAccess(initial), false);

    const dayPass = entitlement.createDayPassEntitlement(
      'day-pass',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    assert.equal(
      entitlement.hasActiveDayPass(
        [dayPass],
        new Date('2026-01-01T01:00:00.000Z'),
      ),
      true,
    );
    assert.equal(
      entitlement.hasActiveDayPass(
        [dayPass],
        new Date('2026-01-03T00:00:00.000Z'),
      ),
      false,
    );

    const creditState = {
      ...initial,
      oneTimeEntitlements: [
        {
          productId: 'five-questions',
          productType: 'FIVE_QUESTIONS',
          purchasedAt: '2026-01-01T00:00:00.000Z',
          remainingUses: 2,
          source: 'mock',
        },
      ],
    };
    const consumed = entitlement.consumeOneTimeQuestionCreditFromState(creditState);
    assert.equal(consumed.consumed, true);
    assert.equal(consumed.state.oneTimeEntitlements[0].remainingUses, 1);

    const intent = payment.createPaymentWorkflowIntent({
      amountInr: 249,
      kind: 'ONE_TIME',
      productId: 'premium-pdf',
      productType: 'PREMIUM_PDF',
      userId: 'user-1',
    });
    assert.equal(intent.gateway, 'razorpay');
    assert.equal(intent.state, 'gateway_disabled');
    assert.equal(payment.isGatewayDisabled(intent.state), true);
    const pending = payment.transitionPaymentWorkflowIntent(intent, {
      state: 'payment_pending',
    });
    assert.equal(pending.state, 'payment_pending');
    const failed = payment.transitionPaymentWorkflowIntent(pending, {
      failureCode: 'DECLINED',
      failureMessage: 'Card declined',
      state: 'payment_failed',
    });
    assert.equal(payment.isTerminalPaymentState(failed.state), true);
    assert.equal(payment.assertNoPaymentSecrets({ safe: 'razorpay_order_id' }), true);
    assert.equal(payment.assertNoPaymentSecrets({ cvv: '123' }), false);

    const display = usageDisplay.buildUsageDisplay({
      monetization: initial,
      usage: { deepCallsToday: 0, pdfsThisMonth: 0, questionsToday: 1 },
      userPlan: 'FREE',
    });
    assert.match(display.questionsText, /guidance questions left today/);
    assert.match(display.statusText, /free guidance resets/);
  },

  pdf() {
    const pdfIndex = readWorkspaceFile('packages/pdf/src/index.ts');
    const reportDocument = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
    const reportLabels = readJson('packages/pdf/src/translations/reportLabels.json');

    assert.equal(reportLabels.version, 1);
    assert.ok(Object.keys(reportLabels.titleMap).length >= 15);
    assert.ok(Object.keys(reportLabels.eyebrowMap).length >= 8);
    assert.ok(reportLabels.titleMap['Birth and calculation foundation']);
    assert.notEqual(
      reportLabels.titleMap['Birth and calculation foundation'].hi,
      'Birth and calculation foundation',
    );
    assert.notEqual(
      reportLabels.titleMap['Birth and calculation foundation'].gu,
      'Birth and calculation foundation',
    );

    for (const requiredFragment of [
      'Prepared by Predicta @2026',
      'render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}',
      'PdfWatermark',
      'Predicta Devanagari',
      'Predicta Gujarati',
      'PdfCelestialSeal',
    ]) {
      assert.ok(
        reportDocument.includes(requiredFragment),
        `PDF renderer must include ${requiredFragment}`,
      );
    }

    assert.doesNotMatch(
      reportDocument,
      /\+\s*\{?\s*cell\.hiddenPlanetCount/,
      'PDF charts must not hide grahas behind overflow counters',
    );

    for (const requiredFragment of [
      'VEDIC_FOCUS_CHART_ORDER',
      "role: 'MOON'",
      'buildParashariChalitChart(kundli)',
      'buildMahadashaPhalaReportSection',
      'buildPdfHouseWisePlanetRows',
      'buildFriendshipTableSections',
      'buildBeneficMaleficReportSection',
      'buildChalitTableReportSections',
      'buildSignatureReportSection',
      'buildNumerologyReportSection',
      "case 'KP':",
      'buildNadiJyotishPlanSection',
    ]) {
      assert.ok(
        pdfIndex.includes(requiredFragment),
        `PDF composition must include ${requiredFragment}`,
      );
    }
  },

  types() {
    const index = readWorkspaceFile('packages/types/src/index.ts');
    const access = readWorkspaceFile('packages/types/src/access.ts');
    const subscription = readWorkspaceFile('packages/types/src/subscription.ts');
    const astrology = readWorkspaceFile('packages/types/src/astrology.ts');

    assert.ok(index.includes("export * from './access';"));
    assert.ok(index.includes("export * from './astrology';"));
    assert.ok(index.includes("export * from './subscription';"));
    assert.ok(access.includes("export type AccessLevel"));
    assert.ok(access.includes("export type ResolvedAccess"));
    assert.ok(subscription.includes("export type BillingProvider"));
    assert.ok(subscription.includes("export function createFreeEntitlement"));
    assert.ok(astrology.includes("export type KundliData"));
    assert.ok(astrology.includes("'D1'"));
    assert.ok(astrology.includes("'MOON'"));
  },

  'ui-tokens'(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const tokens = requireFromRuntime('packages/ui-tokens/src/index.js');

    assert.match(tokens.brandColors.background, /^#[0-9A-F]{6}$/i);
    assert.equal(tokens.brandColors.primaryText, '#FFFFFF');
    assert.equal(tokens.brandGradient.length, 3);
    assert.ok(tokens.brandGradient.every(color => /^#[0-9A-F]{6}$/i.test(color)));
    assert.ok(tokens.spacing.xs < tokens.spacing.sm);
    assert.ok(tokens.spacing.sm < tokens.spacing.md);
    assert.ok(tokens.radii.card > tokens.radii.button);
    assert.ok(tokens.layout.dashboardMaxWidth > tokens.layout.contentMaxWidth);
    assert.ok(tokens.motion.fastMs < tokens.motion.normalMs);
    assert.ok(tokens.motion.normalMs < tokens.motion.slowMs);
    assert.match(tokens.glass.background, /^rgba\(/);
  },

  utils(runtimeContext) {
    const requireFromRuntime = runtimeContext.requireFromRuntime;
    const format = requireFromRuntime('packages/utils/src/format.js');
    const sha = requireFromRuntime('packages/utils/src/sha256.js');
    const birth = requireFromRuntime('packages/utils/src/validateBirthDetails.js');

    assert.equal(format.formatPercent(0.673), '67%');
    assert.equal(
      sha.sha256('abc'),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    assert.equal(birth.isValidTimeZone('Asia/Kolkata'), true);
    assert.equal(birth.isValidTimeZone('Not/A_Timezone'), false);

    const valid = birth.validateBirthDetails({
      date: '1980-08-22',
      latitude: 19.076,
      longitude: 72.8777,
      name: 'Bhaumik',
      place: 'Mumbai',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    });
    assert.equal(valid.valid, true);

    const invalid = birth.validateBirthDetails({
      date: '22-08-1980',
      latitude: 120,
      longitude: 200,
      name: '',
      place: '',
      time: '25:99',
      timezone: 'Mars/Olympus',
    });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.length >= 5);
  },
};

async function assertNoPlaceholderPackageTests() {
  const packagesDir = path.join(repoRoot, 'packages');
  const packageNames = await readdir(packagesDir);
  const placeholders = [];

  for (const packageName of packageNames) {
    const packageJsonPath = path.join(packagesDir, packageName, 'package.json');

    try {
      await stat(packageJsonPath);
    } catch {
      continue;
    }

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const testScript = packageJson.scripts?.test ?? '';
    if (/no package-local tests|echo\s+["']?@pridicta\//i.test(testScript)) {
      placeholders.push(`${packageName}: ${testScript}`);
    }
  }

  assert.deepEqual(
    placeholders,
    [],
    `Placeholder package tests must be retired:\n${placeholders.join('\n')}`,
  );
}

function compileRuntimePackages() {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'predicta-package-tests-'));
  const outDir = path.join(tempRoot, 'dist');
  const tempConfig = path.join(tempRoot, 'tsconfig.json');
  const runtimePackageIncludes = [
    'access',
    'ai',
    'astrology',
    'config',
    'core',
    'firebase',
    'monetization',
    'types',
    'ui-tokens',
    'utils',
  ].flatMap(packageName => [
    path.join(repoRoot, `packages/${packageName}/src/**/*.ts`),
  ]);

  writeFileSync(
    tempConfig,
    JSON.stringify(
      {
        extends: path.join(repoRoot, 'tsconfig.base.json'),
        compilerOptions: {
          declaration: false,
          module: 'CommonJS',
          moduleResolution: 'Node',
          noEmit: false,
          outDir,
          rootDir: repoRoot,
        },
        include: runtimePackageIncludes,
      },
      null,
      2,
    ),
  );

  const compile = spawnSync(
    'corepack',
    ['pnpm', 'exec', 'tsc', '-p', tempConfig],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );

  if (compile.status !== 0) {
    process.stderr.write(compile.stdout);
    process.stderr.write(compile.stderr);
    process.exit(compile.status ?? 1);
  }

  const scopedNodeModules = path.join(outDir, 'node_modules/@pridicta');
  mkdirSync(scopedNodeModules, { recursive: true });
  for (const packageName of [
    'access',
    'ai',
    'astrology',
    'config',
    'core',
    'firebase',
    'monetization',
    'types',
    'ui-tokens',
    'utils',
  ]) {
    symlinkSync(
      path.join(outDir, `packages/${packageName}/src`),
      path.join(scopedNodeModules, packageName),
      'dir',
    );
  }

  const requireFromRuntime = createRequire(
    path.join(outDir, 'packages/config/src/index.js'),
  );

  return {
    cleanup() {
      rmSync(tempRoot, { force: true, recursive: true });
    },
    requireFromRuntime(relativeRuntimePath) {
      return requireFromRuntime(path.join(outDir, relativeRuntimePath));
    },
  };
}

async function runPackageTypecheck(packageName) {
  const typecheck = spawnSync(
    'corepack',
    ['pnpm', 'exec', 'tsc', '--noEmit', '-p', `packages/${packageName}/tsconfig.json`],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );

  if (typecheck.status !== 0) {
    process.stderr.write(typecheck.stdout);
    process.stderr.write(typecheck.stderr);
    process.exit(typecheck.status ?? 1);
  }
}

async function assertJsonTranslationCompleteness(relativePath) {
  const json = readJson(relativePath);

  if (json.entries) {
    for (const [key, entry] of Object.entries(json.entries)) {
      if ('en' in entry) {
        assert.ok(entry.en.trim(), `${relativePath}:${key} has English copy`);
        assert.ok(entry.hi?.trim(), `${relativePath}:${key} has Hindi copy`);
        assert.ok(entry.gu?.trim(), `${relativePath}:${key} has Gujarati copy`);
      }
    }
  }

  if (json.languageLabels) {
    assert.deepEqual(Object.keys(json.languageLabels).sort(), ['en', 'gu', 'hi']);
  }
}

function readWorkspaceFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readWorkspaceFile(relativePath));
}

function buildMinimalKundliFixture() {
  const birthDetails = {
    date: '1980-08-22',
    latitude: 19.076,
    longitude: 72.8777,
    name: 'Phase Ten Native',
    place: 'Mumbai',
    time: '06:30',
    timezone: 'Asia/Kolkata',
  };
  const d1Chart = {
    chartType: 'D1',
    housePlacements: {
      1: ['Sun'],
      2: [],
      3: [],
      4: [],
      5: ['Moon'],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
    },
    planetDistribution: [
      {
        house: 1,
        name: 'Sun',
        sign: 'Leo',
      },
      {
        house: 5,
        name: 'Moon',
        sign: 'Sagittarius',
      },
    ],
    supported: true,
  };

  return {
    ashtakavarga: {
      bav: [],
      sav: [],
    },
    birthDetails,
    calculationMeta: {
      ayanamsa: 'Lahiri',
      houseSystem: 'Whole Sign',
      nodeType: 'Mean',
      utcDateTime: '1980-08-22T01:00:00.000Z',
      zodiac: 'Sidereal',
    },
    charts: {
      D1: d1Chart,
    },
    dashas: {
      current: {
        antardasha: 'Moon',
        endsAt: '2027-01-01',
        mahadasha: 'Sun',
        startsAt: '2021-01-01',
      },
      sequence: [],
    },
    houses: [
      {
        house: 1,
        lord: 'Sun',
        sign: 'Leo',
      },
    ],
    lagna: {
      degree: 12,
      sign: 'Leo',
    },
    lifeTimeline: [],
    panchang: {
      karaṇa: 'Bava',
      nakshatra: 'Mula',
      paksha: 'Shukla',
      tithi: 'Ekadashi',
      vara: 'Friday',
      yoga: 'Siddha',
    },
    planets: [
      {
        degree: 5,
        house: 1,
        name: 'Sun',
        nakshatra: 'Magha',
        pada: 2,
        sign: 'Leo',
      },
      {
        degree: 11,
        house: 5,
        name: 'Moon',
        nakshatra: 'Mula',
        pada: 4,
        sign: 'Sagittarius',
      },
    ],
    yogas: [],
  };
}

async function main() {
  const runtime = targets.some(target => runtimeTargets.has(target))
    ? compileRuntimePackages()
    : undefined;

  try {
    for (const target of targets) {
      if (runtimeTargets.has(target)) {
        await runPackageTypecheck(target);
      }

      if (target === 'pdf' || target === 'types') {
        await runPackageTypecheck(target);
      }

      await packageChecks[target](runtime);
      console.log(`@pridicta/${target} meaningful package checks passed.`);
    }

    console.log(
      `Meaningful package test gate passed for ${targets.join(', ')}.`,
    );
  } finally {
    runtime?.cleanup();
  }
}

await main();

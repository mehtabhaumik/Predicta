import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 8 AI cost governance gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

async function importTsModule(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: sourcePath,
  }).outputText;
  const tmpPath = path.join(os.tmpdir(), `predicta-phase-8-${Date.now()}.mjs`);
  fs.writeFileSync(
    tmpPath,
    compiled.replace(
      "import { GEMINI_MODELS, OPENAI_MODELS } from './aiModels';",
      "const OPENAI_MODELS = { FREE_REASONING: 'gpt-5.4-mini', PREMIUM_DEEP_ANALYSIS: 'gpt-5.5' }; const GEMINI_MODELS = { FLASH_HELPER: 'gemini-2.5-flash', PRO_FUTURE: 'gemini-2.5-pro' };",
    ),
  );
  return import(pathToFileURL(tmpPath).href);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION/ai-cost-governance-audit.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION/phase-8-ai-cost-governance-manifest.json',
  'packages/config/src/aiCostGovernance.ts',
  'backend/astro_api/ai_cost_governance.py',
  'backend/astro_api/ai_routing_policy.py',
  'backend/astro_api/ai_validator.py',
  'backend/astro_api/report_ai_pipeline.py',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'packages/ai/src/aiRouter.ts',
  'apps/mobile/src/services/ai/aiRouter.ts',
  'packages/ai/src/tokenOptimizer.ts',
  'apps/mobile/src/services/ai/tokenOptimizer.ts',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
[
  'PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION',
  'Free AI uses OpenAI mini only.',
  'Free AI answer length and output token budget are capped.',
  'Free AI history is aggressively trimmed.',
  'No Gemini validator for free.',
  'Premium report pipeline is gated by paid entitlement.',
  'Spend threshold simulation blocks unsafe provider usage.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'monetization roadmap'));

const tsGovernance = read('packages/config/src/aiCostGovernance.ts');
[
  'AI_FREE_RUNTIME_POLICY',
  "allowedModel: OPENAI_MODELS.FREE_REASONING",
  'AI_PREMIUM_RUNTIME_POLICY',
  "allowedDeepModel: OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS",
  'AI_VALIDATOR_POLICY',
  "freeValidatorProvider: 'deterministic'",
  'AI_FEATURE_BUDGET_THRESHOLDS_USD',
  'AI_ABUSE_PROTECTION_LIMITS',
  'AI_TELEMETRY_REQUIRED_FIELDS',
  'assertFreeModelAllowed',
  'assertGeminiValidatorAllowed',
  'evaluateAiFeatureSpend',
].forEach(fragment => assertIncludes(tsGovernance, fragment, 'TypeScript AI cost governance'));

const webAsk = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'evaluateAiAbuseProtection',
  'AI_ABUSE_PROTECTION_LIMITS.perIpRequestsPerMinute',
  'AI_ABUSE_PROTECTION_LIMITS.perDeviceRequestsPerMinute',
  'AI_ABUSE_PROTECTION_LIMITS.freeUserRequestsPerMinute',
  'ai-abuse-rate-limit-exceeded-not-quota-authority',
  'MAX_FREE_SERVER_HISTORY_MESSAGES',
  'MAX_FREE_SERVER_MESSAGE_CHARS',
  'aiCostGovernance',
  'entitlementSource',
  'productCreditSource',
].forEach(fragment => assertIncludes(webAsk, fragment, 'web AI proxy cost and abuse gate'));

const sharedRouter = read('packages/ai/src/aiRouter.ts');
const mobileRouter = read('apps/mobile/src/services/ai/aiRouter.ts');
for (const [label, source] of [
  ['shared AI router', sharedRouter],
  ['mobile AI router', mobileRouter],
]) {
  ['assertFreeModelAllowed', 'OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS', 'OPENAI_MODELS.FREE_REASONING'].forEach(fragment =>
    assertIncludes(source, fragment, label),
  );
}

const sharedOptimizer = read('packages/ai/src/tokenOptimizer.ts');
const mobileOptimizer = read('apps/mobile/src/services/ai/tokenOptimizer.ts');
for (const [label, source] of [
  ['shared token optimizer', sharedOptimizer],
  ['mobile token optimizer', mobileOptimizer],
]) {
  ['AI_FREE_RUNTIME_POLICY.maxHistoryTurns', 'AI_FREE_RUNTIME_POLICY.maxOutputTokens', 'AI_PREMIUM_RUNTIME_POLICY.maxOutputTokens'].forEach(fragment =>
    assertIncludes(source, fragment, label),
  );
}

const pyGovernance = read('backend/astro_api/ai_cost_governance.py');
[
  'FREE_AI_MODEL = "gpt-5.4-mini"',
  'PREMIUM_AI_MODEL = "gpt-5.5"',
  'FREE_CHAT_MAX_OUTPUT_TOKENS = 420',
  'PREMIUM_CHAT_MAX_OUTPUT_TOKENS = 720',
  'AI_COST_THRESHOLDS_USD',
  'free_model_allowed',
  'gemini_validator_allowed',
  'evaluate_feature_spend',
  'entitlement_source_for_chat',
  'product_credit_source_for_chat',
].forEach(fragment => assertIncludes(pyGovernance, fragment, 'Python AI cost governance'));

const pyRouting = read('backend/astro_api/ai_routing_policy.py');
[
  'gemini_validator_allowed',
  'deterministic-validator-not-entitled',
  'gemini-validator-is-for-paid-premium-reports-only',
  'premium-report-validator-uses-gemini-pro',
].forEach(fragment => assertIncludes(pyRouting, fragment, 'Python routing policy'));

const pyTelemetry = read('backend/astro_api/ai_telemetry.py');
[
  'entitlement_source',
  'product_credit_source',
  'cacheHit=cache_state == "hit"',
].forEach(fragment => assertIncludes(pyTelemetry, fragment, 'Python AI telemetry enrichment'));

const tsCost = await importTsModule('packages/config/src/aiCostGovernance.ts');
assert(tsCost.assertFreeModelAllowed('gpt-5.4-mini').allowed, 'free mini must be allowed');
assert(!tsCost.assertFreeModelAllowed('gpt-5.5').allowed, 'free premium model must be blocked');
assert(
  !tsCost.assertGeminiValidatorAllowed({ paidPremiumReport: false, userPlan: 'FREE' }).allowed,
  'free Gemini validator must be blocked',
);
assert(
  tsCost.assertGeminiValidatorAllowed({ paidPremiumReport: true, userPlan: 'PREMIUM' }).allowed,
  'premium paid Gemini validator must be allowed',
);
assert(
  !tsCost.evaluateAiFeatureSpend({ estimatedCostUsd: 999, feature: 'freeChatAnswer' }).allowed,
  'free spend stop threshold must block',
);

const pythonProbe = `
import json
import os
import tempfile

os.environ["PRIDICTA_AI_TELEMETRY_STORE_PATH"] = tempfile.NamedTemporaryFile(delete=False).name
os.environ["PRIDICTA_AI_PRICING_JSON"] = json.dumps({
  "gpt-5.4-mini": {"inputPerMillion": 0.1, "outputPerMillion": 0.4},
  "gpt-5.5": {"inputPerMillion": 1.0, "outputPerMillion": 4.0},
  "gemini-2.5-flash": {"inputPerMillion": 0.1, "outputPerMillion": 0.4},
  "gemini-2.5-pro": {"inputPerMillion": 0.5, "outputPerMillion": 2.0},
})

from backend.astro_api.ai_cost_governance import evaluate_feature_spend, free_model_allowed, gemini_validator_allowed
from backend.astro_api.ai_telemetry import record_ai_telemetry_event
from backend.astro_api.ai_routing_policy import AIModelPins, AIRoutingRequest, route_ai_request
from backend.astro_api.release_governance import evaluate_release_readiness, evaluate_routing_assertions

pins = AIModelPins(
  free_reasoning="gpt-5.4-mini",
  premium_deep="gpt-5.5",
  gemini_free="gemini-2.5-flash",
  gemini_premium="gemini-2.5-pro",
)
free_chat = route_ai_request(AIRoutingRequest(active_school="PARASHARI", feature="chat", intent="deep", quality_tier="standard", user_plan="FREE"), pins)
free_validator = route_ai_request(AIRoutingRequest(active_school="PARASHARI", feature="report_validator", intent="deep", quality_tier="standard", user_plan="FREE"), pins)
premium_validator = route_ai_request(AIRoutingRequest(active_school="PARASHARI", feature="report_validator", intent="deep", quality_tier="premium", user_plan="PREMIUM"), pins)

assert free_chat.primary_model == "gpt-5.4-mini", free_chat
assert free_validator.primary_provider == "deterministic", free_validator
assert free_validator.validator_provider is None, free_validator
assert premium_validator.validator_provider == "gemini", premium_validator
assert premium_validator.validator_model == "gemini-2.5-pro", premium_validator
assert not free_model_allowed("gpt-5.5").allowed
assert not gemini_validator_allowed(user_plan="FREE", paid_premium_report=False).allowed
assert gemini_validator_allowed(user_plan="PREMIUM", paid_premium_report=True).allowed
assert not evaluate_feature_spend(feature="free_chat_answer", model="gpt-5.4-mini", input_tokens=999999999, output_tokens=999999999).allowed
assert evaluate_routing_assertions() == []

record_ai_telemetry_event(
  active_school="PARASHARI",
  cache_state="hit",
  entitlement_source="free_lifetime_ai_credit",
  estimated_input_tokens=100,
  estimated_output_tokens=20,
  fallback_reason=None,
  feature="chat",
  intent="moderate",
  latency_bucket_value="lt_1s",
  model="gpt-5.4-mini",
  provider="openai",
  provider_cached_input_tokens=40,
  route="/ask-pridicta",
  success=True,
  user_plan="FREE",
)
record_ai_telemetry_event(
  active_school="PARASHARI",
  cache_state="miss",
  entitlement_source="premium_subscription",
  estimated_input_tokens=500,
  estimated_output_tokens=120,
  fallback_reason=None,
  feature="chat",
  intent="deep",
  latency_bucket_value="1_3s",
  model="gpt-5.5",
  provider="openai",
  route="/ask-pridicta",
  success=True,
  user_plan="PREMIUM",
)
record_ai_telemetry_event(
  active_school="PARASHARI",
  cache_state="miss",
  entitlement_source="premium_subscription",
  estimated_input_tokens=1000,
  estimated_output_tokens=300,
  fallback_reason=None,
  feature="premium_report_draft",
  intent="deep",
  latency_bucket_value="1_3s",
  model="gpt-5.5",
  provider="openai",
  report_type="vedic",
  route="/ai/report/premium/draft",
  success=True,
  user_plan="PREMIUM",
)
record_ai_telemetry_event(
  active_school="PARASHARI",
  cache_state="miss",
  entitlement_source="premium_subscription",
  estimated_input_tokens=400,
  estimated_output_tokens=80,
  fallback_reason=None,
  feature="report_validator",
  intent="deep",
  latency_bucket_value="1_3s",
  model="gemini-2.5-pro",
  provider="gemini",
  report_type="vedic",
  route="/ai/validator/gemini",
  success=True,
  user_plan="PREMIUM",
)
required_ai_checks = {
  "Approved AI providers",
  "Model and prompt pins",
  "AI telemetry availability",
  "AI routing assertions",
  "Gemini validator availability policy",
  "Signature privacy assertion",
  "Method-boundary assertion",
  "Translation QA assertion",
  "AI profit-safety summary",
}
release_report = evaluate_release_readiness()
checks = {check.name: check.status for check in release_report.checks}
missing = required_ai_checks - set(checks)
failed = {name: status for name, status in checks.items() if name in required_ai_checks and status != "PASS"}
assert not missing, missing
assert not failed, failed
print("python-cost-governance-probe-pass")
`;

const py = spawnSync('python3', ['-c', pythonProbe], {
  cwd: root,
  encoding: 'utf8',
});
if (py.status !== 0) {
  fail(`Python cost governance probe failed.\nSTDOUT:\n${py.stdout}\nSTDERR:\n${py.stderr}`);
}

console.log(
  'Monetization Phase 8 AI cost governance gate passed: free AI is mini-only, Gemini validator is premium-paid only, abuse throttles are present, spend thresholds block unsafe use, telemetry is enriched, and release routing assertions are green.',
);

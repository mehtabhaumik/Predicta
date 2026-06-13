import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';

const roots = [
  'apps/web/app',
  'apps/web/components',
  'apps/mobile/src/components',
  'apps/mobile/src/screens',
];
const uiTranslationsPath = 'packages/config/src/translations/ui.json';
const uiTranslations = JSON.parse(readFileSync(uiTranslationsPath, 'utf8'));
const uiEnglishValues = new Set(
  Object.values(uiTranslations.entries ?? {}).map(entry =>
    normalizeCopy(entry?.en ?? ''),
  ),
);

const ignoredDirectories = new Set([
  '.next',
  '.turbo',
  '__tests__',
  'build',
  'dist',
  'node_modules',
]);
const ignoredAttributeNames = new Set([
  'action',
  'animationSurface',
  'aria-current',
  'aria-describedby',
  'aria-hidden',
  'aria-labelledby',
  'as',
  'autoCapitalize',
  'autoComplete',
  'autoCorrect',
  'chartRoleOverride',
  'checked',
  'className',
  'color',
  'ctaHref',
  'cx',
  'cy',
  'd',
  'data-testid',
  'defaultValue',
  'disabled',
  'download',
  'draggable',
  'fill',
  'fontFamily',
  'fontStyle',
  'height',
  'href',
  'htmlFor',
  'id',
  'inputMode',
  'insightProfile',
  'key',
  'keyboardType',
  'kind',
  'method',
  'mode',
  'moonPhase',
  'name',
  'path',
  'pathname',
  'presentation',
  'preserveAspectRatio',
  'r',
  'rel',
  'reportType',
  'role',
  'route',
  'rx',
  'ry',
  'school',
  'selected',
  'size',
  'sourceScreen',
  'src',
  'stroke',
  'strokeLinecap',
  'strokeLinejoin',
  'style',
  'surface',
  'tabIndex',
  'target',
  'testID',
  'textAnchor',
  'theme',
  'tone',
  'type',
  'value',
  'variant',
  'viewBox',
  'width',
  'x',
  'xmlns',
  'y',
]);
const auditedAttributeNames = new Set([
  'accessibilityLabel',
  'aria-label',
  'body',
  'centerLabel',
  'emptyLabel',
  'eyebrow',
  'label',
  'placeholder',
  'sectionTitle',
  'subtitle',
  'title',
]);
const allowedExactValues = new Set([
  'AI',
  'API',
  'D1',
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D20',
  'D30',
  'D60',
  'Google',
  'JPG',
  'JPEG',
  'KP',
  'PDF',
  'PNG',
  'Predicta',
  'Pridicta',
  'Rahu',
  'Ketu',
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'WebP',
]);

const failures = [];

for (const file of listSourceFiles(roots)) {
  const source = readFileSync(file, 'utf8');
  assertNoHardcodedNativeScript(file, source);
  assertNoDirectTranslationJsonImport(file, source);
  assertNoPricingPageLocalTranslationState(file, source);
  scanJsxCopy(file, source);
}

if (failures.length) {
  console.error('Global translation source coverage gate failed:');
  failures.slice(0, 160).forEach(failure => console.error(`- ${failure}`));
  if (failures.length > 160) {
    console.error(`...and ${failures.length - 160} more failures.`);
  }
  process.exit(1);
}

console.log(
  'Global translation source coverage gate passed: audited web/mobile JSX text, labels, placeholders, titles, hidden controls, and accessibility copy are registered in dedicated translation JSON.',
);

function scanJsxCopy(file, source) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function lineOf(node) {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  }

  function assertRegistered(node, rawValue, kind) {
    const value = normalizeCopy(rawValue);
    if (!isUserFacingCopy(value)) {
      return;
    }
    if (uiEnglishValues.has(value)) {
      return;
    }
    failures.push(`${file}:${lineOf(node)}: ${kind} is not registered in ${uiTranslationsPath}: ${JSON.stringify(value)}`);
  }

  function visit(node) {
    if (ts.isJsxText(node)) {
      assertRegistered(node, node.getText(), 'JSX text');
    }

    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) {
      assertRegistered(node.expression, node.expression.text, 'JSX expression text');
    }

    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = getJsxAttributeName(node.name);
      if (auditedAttributeNames.has(name) || (!ignoredAttributeNames.has(name) && looksLikeCopyAttribute(name))) {
        assertRegistered(node.initializer, node.initializer.text, `${name} attribute`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function listSourceFiles(scanRoots) {
  const files = [];
  for (const root of scanRoots) {
    walk(root, files);
  }
  return files.sort();
}

function walk(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if ((fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) && !fullPath.endsWith('.d.ts')) {
      files.push(relative(process.cwd(), fullPath).split(sep).join('/'));
    }
  }
}

function assertNoHardcodedNativeScript(file, source) {
  const lines = source
    .split(/\r?\n/)
    .map((line, index) => (/[\u0900-\u097F\u0A80-\u0AFF]/.test(line) ? index + 1 : undefined))
    .filter(Boolean);
  if (lines.length) {
    failures.push(`${file}: hardcoded Hindi/Gujarati script remains on lines ${lines.join(', ')}`);
  }
}

function assertNoDirectTranslationJsonImport(file, source) {
  if (
    /from\s+['"][^'"]*translations\/[^'"]+\.json['"]/.test(source) &&
    !file.startsWith('packages/config/src/') &&
    !file.startsWith('packages/pdf/src/')
  ) {
    failures.push(`${file}: imports translation JSON directly instead of using a localization adapter`);
  }
}

function assertNoPricingPageLocalTranslationState(file, source) {
  if (file !== 'apps/web/app/pricing/PricingPageRuntime.tsx') {
    return;
  }
  const forbiddenPatterns = [
    ['const pricingPageCopy', 'pricing page copy must live in packages/config/src/translations/pricingPage.json'],
    ['getNativeCopy(', 'pricing page must use the pricingPageCopy adapter instead of nativeCopy lookups'],
    ['PREMIUM_FEATURE_STORY', 'pricing premium story must be localized through pricingPageCopy'],
  ];
  for (const [pattern, message] of forbiddenPatterns) {
    if (source.includes(pattern)) {
      failures.push(`${file}: ${message}`);
    }
  }
}

function getJsxAttributeName(name) {
  if (ts.isIdentifier(name)) {
    return name.text;
  }
  if (ts.isStringLiteral(name)) {
    return name.text;
  }
  return name.getText();
}

function looksLikeCopyAttribute(name) {
  return /(label|title|body|copy|text|message|placeholder|description|empty|eyebrow|caption|summary|note|cta)$/i.test(name);
}

function normalizeCopy(value) {
  return String(value).trim().replace(/\s+/g, ' ');
}

function isUserFacingCopy(value) {
  if (!value || value.length < 2) {
    return false;
  }
  if (allowedExactValues.has(value)) {
    return false;
  }
  if (/^[-_./:#?=&%{}()[\]|,;@·]+$/.test(value)) {
    return false;
  }
  if (/^\d+[\d\s:./-]*$/.test(value)) {
    return false;
  }
  if (/^[a-z0-9_.@+-]+@[a-z0-9_.-]+$/i.test(value)) {
    return false;
  }
  if (/^[-\w]+\\.(com|in|app|dev)$/i.test(value)) {
    return false;
  }
  if (/^[A-Z0-9_./:-]+$/.test(value) && !value.includes(' ')) {
    return false;
  }
  if (/^(true|false|null|undefined|button|submit|reset|checkbox|radio|text|email|password|number|tel|url|search|date|time|datetime-local|primary|secondary|sm|md|lg|xl|free|premium|en|hi|gu|round|polite|off|page|none|middle)$/i.test(value)) {
    return false;
  }
  return /[A-Za-z][a-z]/.test(value) || /\s/.test(value);
}

import { getAppShellLabels } from '@pridicta/config/language';
import type { SupportedLanguage } from '@pridicta/types';

export function getLocalizedPredictaPageTitle(
  pathname: string | null,
  language: SupportedLanguage,
): string {
  const route = pathname ?? '/';
  const labels = getAppShellLabels(language);
  const titleMap: Record<string, string> = {
    '/': `${labels.groups.predicta} | ${labels.nav.holisticAstrology}`,
    '/accuracy-method': `${labels.nav.accuracyMethod} | ${labels.groups.predicta}`,
    '/checkout': `${labels.nav.premium} | ${labels.groups.predicta}`,
    '/dashboard': `${labels.nav.dashboard} | ${labels.groups.predicta}`,
    '/dashboard/admin': `${labels.nav.admin} | ${labels.groups.predicta}`,
    '/dashboard/birth-time': `${labels.nav.birthTime} | ${labels.groups.predicta}`,
    '/dashboard/charts': `${labels.nav.allCharts} | ${labels.groups.predicta}`,
    '/dashboard/chat': `${labels.actions.askPredicta} | ${labels.groups.predicta}`,
    '/dashboard/decision': `${labels.nav.decision} | ${labels.groups.predicta}`,
    '/dashboard/family': `${labels.nav.family} | ${labels.groups.predicta}`,
    '/dashboard/holistic': `${labels.nav.holisticAstrology} | ${labels.groups.predicta}`,
    '/dashboard/kp': `${labels.nav.kpPredicta} | ${labels.groups.predicta}`,
    '/dashboard/kp/chat': `${labels.nav.kpPredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/kundli': `${labels.nav.kundli} | ${labels.groups.predicta}`,
    '/dashboard/matchmaking': `${labels.nav.relationship} | ${labels.groups.predicta}`,
    '/dashboard/jaimini': `${labels.nav.jaiminiPredicta} | ${labels.groups.predicta}`,
    '/dashboard/jaimini/chat': `${labels.nav.jaiminiPredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/nadi': `${labels.nav.jaiminiPredicta} | ${labels.groups.predicta}`,
    '/dashboard/nadi/chat': `${labels.nav.jaiminiPredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/numerology': `${labels.nav.numerologyPredicta} | ${labels.groups.predicta}`,
    '/dashboard/numerology/chat': `${labels.nav.numerologyPredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/premium': `${labels.nav.premium} | ${labels.groups.predicta}`,
    '/dashboard/redeem-pass': `${labels.nav.redeemPass} | ${labels.groups.predicta}`,
    '/dashboard/relationship': `${labels.nav.relationship} | ${labels.groups.predicta}`,
    '/dashboard/remedies': `${labels.nav.remedies} | ${labels.groups.predicta}`,
    '/dashboard/report': `${labels.nav.reports} | ${labels.groups.predicta}`,
    '/dashboard/saved-kundlis': `${labels.nav.savedKundlis} | ${labels.groups.predicta}`,
    '/dashboard/settings': `${labels.nav.settings} | ${labels.groups.predicta}`,
    '/dashboard/signature': `${labels.nav.signaturePredicta} | ${labels.groups.predicta}`,
    '/dashboard/signature/chat': `${labels.nav.signaturePredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/timeline': `${labels.nav.timeline} | ${labels.groups.predicta}`,
    '/dashboard/vedic': `${labels.nav.vedicPredicta} | ${labels.groups.predicta}`,
    '/dashboard/vedic/chat': `${labels.nav.vedicPredicta} ${labels.nav.chat} | ${labels.groups.predicta}`,
    '/dashboard/wrapped': `${labels.nav.wrapped} | ${labels.groups.predicta}`,
    '/feedback': `${labels.nav.feedback} | ${labels.groups.predicta}`,
    '/founder': `${labels.nav.founderVision} | ${labels.groups.predicta}`,
    '/legal': `${labels.nav.legal} | ${labels.groups.predicta}`,
    '/pricing': `${labels.nav.premium} | ${labels.groups.predicta}`,
    '/safety': `${labels.nav.safetyPromise} | ${labels.groups.predicta}`,
  };

  return titleMap[route] ?? `${labels.groups.predicta} | ${labels.nav.holisticAstrology}`;
}

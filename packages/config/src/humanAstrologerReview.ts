import humanAstrologerReviewTranslations from './translations/humanAstrologerReview.json';

export type HumanAstrologerReviewAdminCopy = {
  body: string;
  checkoutCta: string;
  diffTitle: string;
  eyebrow: string;
  flowBody: string;
  flowTitle: string;
  hoursSuffix: string;
  packetBody: string;
  packetTitle: string;
  policyBody: string;
  policyTitle: string;
  profileTitle: string;
  redlineBody: string;
  redlineTitle: string;
  retryNotNeeded: string;
  retryReady: string;
  safetyPass: string;
  safetyRejected: string;
  slaLabel: string;
  title: string;
  transcriptTitle: string;
};

type HumanAstrologerReviewTranslations = {
  copy: {
    adminPanel: HumanAstrologerReviewAdminCopy;
  };
};

const HUMAN_REVIEW_TRANSLATIONS =
  humanAstrologerReviewTranslations as HumanAstrologerReviewTranslations;

export function getHumanAstrologerReviewAdminCopy(): HumanAstrologerReviewAdminCopy {
  return HUMAN_REVIEW_TRANSLATIONS.copy.adminPanel;
}

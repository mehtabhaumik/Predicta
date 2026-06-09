import {
  assignHumanReviewPacket,
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  buildHumanReviewTranscript,
  createHumanReviewPacket,
  createReadySupportLayer,
  markHumanReviewSent,
  refineEventQuestion,
  submitHumanReviewResponse,
  type HumanAstrologerProfile,
  type HumanReviewResponse,
} from '@pridicta/astrology';
import {
  getHumanAstrologerReviewAdminCopy,
  getOneTimeProduct,
} from '@pridicta/config';

const REVIEW_NOW = '2026-06-10T00:00:00.000Z';

export function WebAdminHumanReviewPanel(): React.JSX.Element {
  const copy = getHumanAstrologerReviewAdminCopy();
  const reviewProduct = getOneTimeProduct('HUMAN_ASTROLOGER_REVIEW');
  const sample = buildSampleHumanReviewFlow();

  return (
    <section className="admin-human-review-panel glass-panel">
      <div className="admin-human-review-head">
        <span className="section-title">{copy.eyebrow}</span>
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
        <a
          className="button secondary"
          href={`/checkout?productId=${reviewProduct.productId}`}
        >
          {copy.checkoutCta} · {reviewProduct.displayPrice}
        </a>
      </div>

      <div className="admin-human-review-grid">
        <article>
          <span>{copy.profileTitle}</span>
          {sample.profiles.map(profile => (
            <div className="admin-human-review-profile" key={profile.id}>
              <strong>{profile.displayName}</strong>
              <p>
                {profile.methods.join(' + ')} · {profile.languages.join(', ')} ·{' '}
                {profile.responseSlaHours} {copy.hoursSuffix} {copy.slaLabel}
              </p>
            </div>
          ))}
        </article>

        <article>
          <span>{copy.packetTitle}</span>
          <strong>{sample.sentPacket.refinedEventQuestion.suggestedPhrasing}</strong>
          <p>{copy.packetBody}</p>
          <em>{sample.sentPacket.confidence.label}</em>
        </article>

        <article>
          <span>{copy.flowTitle}</span>
          <p>{copy.flowBody}</p>
          <div className="admin-human-review-flow">
            {sample.sentPacket.auditTrail.map(entry => (
              <small key={`${entry.kind}-${entry.at}`}>
                {entry.kind}: {entry.toStatus}
              </small>
            ))}
          </div>
        </article>

        <article>
          <span>{copy.diffTitle}</span>
          <p>{sample.diff.predictaDraftSummary}</p>
          <strong>{sample.diff.reviewerSummary}</strong>
          <em>{sample.diff.changedFields.join(', ')}</em>
        </article>

        <article>
          <span>{copy.policyTitle}</span>
          <p>{copy.policyBody}</p>
          <strong>
            {copy.slaLabel} {sample.sentPacket.refundRetryPolicy.slaHours}{' '}
            {copy.hoursSuffix} ·{' '}
            {sample.sentPacket.refundRetryPolicy.retryEligible
              ? copy.retryReady
              : copy.retryNotNeeded}
          </strong>
        </article>

        <article>
          <span>{copy.redlineTitle}</span>
          <p>{copy.redlineBody}</p>
          <strong>
            {sample.validation.safe ? copy.safetyPass : copy.safetyRejected}
          </strong>
        </article>
      </div>

      <details className="admin-human-review-transcript">
        <summary>{copy.transcriptTitle}</summary>
        <pre>{sample.transcript}</pre>
      </details>
    </section>
  );
}

function buildSampleHumanReviewFlow() {
  const refinement = refineEventQuestion(
    'Will a foreign work opportunity open for me this year?',
    'foreign_travel',
  );
  const evidenceContract = buildEventOracleEvidenceContract({
    refinement,
    layers: {
      jaimini: createReadySupportLayer(
        'supports',
        'Jaimini destiny evidence supports a work-linked foreign opening.',
      ),
      kp: createReadySupportLayer(
        'supports',
        'KP event evidence supports foreign work travel timing.',
      ),
      numerology: createReadySupportLayer(
        'supports',
        'Numerology cycle supports movement and external opportunity.',
      ),
      vedic: createReadySupportLayer(
        'supports',
        'Vedic dasha and transit context support a practical foreign-work window.',
      ),
    },
  });
  const predictaDraft = buildEventOraclePredictionObject({
    evidenceContract,
    refinement,
    timing: {
      basis: 'Multiple evidence rooms support a practical work-linked timing window.',
      endDate: '2026-06-30',
      evidenceLayerIds: ['vedic', 'kp', 'jaimini'],
      label: 'March to June',
      precision: 'month_range',
      startDate: '2026-03-01',
    },
    trigger: {
      evidenceLayerIds: ['kp', 'vedic'],
      label: 'Workplace opening',
      summary:
        'The trigger is more likely through an existing company, team restructuring, senior recommendation, or role vacancy than random luck.',
    },
  });
  const profiles: HumanAstrologerProfile[] = [
    {
      categoriesHandled: ['foreign_travel', 'career_move', 'job_change'],
      displayName: 'Verified Jyotish Reviewer',
      id: 'astrologer_verified_foreign_work',
      languages: ['en', 'hi', 'gu'],
      methods: ['VEDIC', 'KP', 'JAIMINI'],
      ratingsByCategory: {
        career_move: 4.7,
        foreign_travel: 4.8,
      },
      responseSlaHours: 24,
      verificationStatus: 'verified',
    },
  ];
  const packet = createHumanReviewPacket({
    deterministicEvidence: evidenceContract,
    id: 'hr_phase9_foreign_work_sample',
    nowIso: REVIEW_NOW,
    predictaDraft,
    refinedEventQuestion: refinement,
    safetyNotes: [
      {
        id: 'no-guarantee',
        message: 'Do not present foreign movement as guaranteed or permanent.',
        severity: 'warning',
      },
    ],
    userQuestion: 'Will I get a UK work opportunity this year?',
  });
  const assignedPacket = assignHumanReviewPacket({
    astrologer: profiles[0],
    nowIso: '2026-06-10T00:05:00.000Z',
    packet,
  });
  const response: HumanReviewResponse = {
    actionPlan: [
      'Prepare documents and manager-facing proof before the window opens.',
      'Treat the first signal as a work transfer or travel opportunity, not immediate permanent settlement.',
    ],
    astrologerId: profiles[0].id,
    changedFields: ['trigger', 'actionPlan'],
    evidenceAcknowledgement:
      'The refinement keeps Predicta evidence intact and only sharpens the likely real-world trigger.',
    finalAnswer:
      'Likely: a foreign work opening is supported, especially through your current work network or an internal vacancy.',
    reviewerNote:
      'Evidence from Vedic, KP, and Jaimini agrees on work-linked movement, so the trigger and action plan were refined with evidence.',
    safetyBoundary:
      'This is guidance, not a guarantee. Do not resign, pay agents, or make immigration decisions without real paperwork.',
    submittedAt: '2026-06-10T01:00:00.000Z',
    timingAndTrigger:
      'Watch March to June; the trigger looks like team change, role vacancy, manager recommendation, or a colleague exit.',
  };
  const reviewed = submitHumanReviewResponse({
    nowIso: response.submittedAt,
    packet: assignedPacket,
    response,
  });
  const sentPacket = markHumanReviewSent({
    nowIso: '2026-06-10T01:10:00.000Z',
    packet: reviewed.packet,
  });

  return {
    diff: reviewed.diff,
    profiles,
    sentPacket,
    transcript: buildHumanReviewTranscript({
      packet: sentPacket,
      response,
    }),
    validation: reviewed.validation,
  };
}

import {
  buildCompatibilityReport,
  resolveCompatibilityAccess,
} from '@pridicta/astrology';
import Link from 'next/link';
import { Card, MetricCard } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import {
  demoAccess,
  demoKundli,
  demoPartnerKundli,
} from '../../../lib/demo-state';

export default function CompatibilityPage(): React.JSX.Element {
  const access = resolveCompatibilityAccess({
    hasFullAccess: demoAccess.hasPremiumAccess,
  });
  const report = buildCompatibilityReport({
    hasFullAccess: access.canViewFullReport,
    partnerKundli: demoPartnerKundli,
    primaryKundli: demoKundli,
  });
  const sections = [
    report.emotionalCompatibility,
    report.communicationPattern,
    report.familyLifeIndicators,
    report.timingConsiderations,
    report.cautionAreas,
    report.practicalGuidance,
  ];

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label="Compatibility" tone="premium" />
        <h1 className="gradient-text">Relationship intelligence without fear.</h1>
        <p>
          Compare two saved kundlis with emotional, communication, family-life,
          timing, caution, and practical guidance. Predicta never reduces a
          relationship to one number.
        </p>
      </div>

      <div className="metric-row">
        <MetricCard
          detail={`${report.primary.lagna} Lagna · ${report.primary.moonSign} Moon`}
          label="First profile"
          value={report.primary.name}
        />
        <MetricCard
          detail={`${report.partner.lagna} Lagna · ${report.partner.moonSign} Moon`}
          label="Second profile"
          value={report.partner.name}
        />
        <MetricCard
          detail={access.message}
          label="Report depth"
          value={report.depth}
        />
      </div>

      <div className="compatibility-dashboard-layout">
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">PAIR SUMMARY</div>
            <h2>{report.summary}</h2>
            <p>
              Current timing: {report.primary.currentDasha} and{' '}
              {report.partner.currentDasha}. Use this report as a relationship
              practice, not a verdict.
            </p>
            <div className="ashtakoota-panel">
              <span>GUNA MILAN</span>
              <strong>Verified score pending</strong>
              <p>{report.ashtakoota.unavailableReason}</p>
            </div>
          </div>
        </Card>

        <div className="report-section-list">
          {sections.map(section => (
            <Card key={section.title}>
              <div className="card-content">
                <div className="section-title">{section.title.toUpperCase()}</div>
                <h2>{section.summary}</h2>
                <ul className="quiet-list">
                  {section.indicators
                    .slice(0, access.canViewFullReport ? 3 : 2)
                    .map(indicator => (
                      <li key={indicator}>{indicator}</li>
                    ))}
                </ul>
              </div>
            </Card>
          ))}
          <div className="action-row">
            <Link className="button" href="/dashboard/chat">
              Ask about this pair
            </Link>
            {!access.canViewFullReport ? (
              <Link className="button secondary" href="/pricing">
                Unlock full report
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

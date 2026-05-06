import Link from 'next/link';
import { LEGAL_DOCUMENTS } from '@pridicta/config/legal';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';

export default function LegalPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <main className="legal-page">
        <div className="page-heading compact">
          <StatusPill label="Production policy draft" tone="premium" />
          <h1 className="gradient-text">Trust, safety, and terms.</h1>
          <p>
            Predicta keeps astrology reflective, privacy-first, and clearly
            separated from medical, legal, financial, or emergency advice.
          </p>
        </div>

        <div className="legal-nav">
          {LEGAL_DOCUMENTS.map(document => (
            <a href={`#${document.slug}`} key={document.slug}>
              {document.title}
            </a>
          ))}
        </div>

        <div className="legal-stack">
          {LEGAL_DOCUMENTS.map(document => (
            <Card className="glass-panel legal-document" key={document.slug}>
              <div className="card-content spacious" id={document.slug}>
                <div className="section-title">
                  Effective {document.effectiveDate}
                </div>
                <h2>{document.title}</h2>
                <p>{document.intro}</p>
                {document.sections.map(section => (
                  <section className="legal-section" key={section.heading}>
                    <h3>{section.heading}</h3>
                    {section.body.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="legal-footer-note">
          <p>
            These policies are a strong production draft, not a substitute for
            jurisdiction-specific legal review before public launch.
          </p>
          <Link className="button secondary" href="/pricing">
            Back to Pricing
          </Link>
        </div>
      </main>
      <WebFooter />
    </>
  );
}

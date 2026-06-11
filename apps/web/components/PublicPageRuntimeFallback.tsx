import Link from 'next/link';
import { LandingLightFooter } from './LandingLightFooter';
import { LandingLightHeader } from './LandingLightHeader';

export function PublicPageRuntimeFallback({
  body,
  ctaHref,
  ctaLabel,
  eyebrow,
  title,
}: {
  body: string;
  ctaHref: string;
  ctaLabel: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <>
      <LandingLightHeader />
      <main className="method-page">
        <section className="page-heading compact method-heading">
          <div className="section-title">{eyebrow}</div>
          <h1 className="gradient-text">{title}</h1>
          <p>{body}</p>
          <Link className="button" href={ctaHref}>
            {ctaLabel}
          </Link>
        </section>
      </main>
      <LandingLightFooter />
    </>
  );
}

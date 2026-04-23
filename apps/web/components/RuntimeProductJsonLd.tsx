'use client';

import { useEffect } from 'react';

export function RuntimeProductJsonLd(): null {
  useEffect(() => {
    const origin = window.location.origin;
    const hostname = window.location.hostname.toLowerCase();
    const scriptId = 'predicta-runtime-jsonld';
    const existingScript = document.getElementById(scriptId);

    if (hostname.endsWith('.web.app')) {
      existingScript?.remove();
      return;
    }

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@id': `${origin}/#organization`,
          '@type': 'Organization',
          founder: {
            '@type': 'Person',
            name: 'Bhaumik Mehta',
          },
          logo: `${origin}/predicta-logo.png`,
          name: 'Predicta',
          url: origin,
        },
        {
          '@id': `${origin}/#website`,
          '@type': 'WebSite',
          description:
            'Premium Vedic astrology intelligence for kundli creation, chart-aware guidance, and polished astrology reports.',
          inLanguage: 'en-IN',
          name: 'Predicta',
          publisher: {
            '@id': `${origin}/#organization`,
          },
          url: origin,
        },
        {
          '@id': `${origin}/#software`,
          '@type': 'SoftwareApplication',
          applicationCategory: 'LifestyleApplication',
          description:
            'Create a kundli, explore Vedic chart patterns, ask chart-aware questions, and generate polished astrology reports.',
          name: 'Predicta',
          operatingSystem: 'Web, iOS, Android',
          url: origin,
        },
      ],
    };

    let script = existingScript as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(productJsonLd);
  }, []);

  return null;
}

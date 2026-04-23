'use client';

import { useEffect } from 'react';

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(selector: string, attributes: Record<string, string>, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export function RuntimeMetadataSync(): null {
  useEffect(() => {
    const url = new URL(window.location.href);
    const hostname = url.hostname.toLowerCase();
    const isWebAppDomain = hostname.endsWith('.web.app');
    const isPrivateRoute = url.pathname.startsWith('/dashboard');
    const shouldNoIndex = isWebAppDomain || isPrivateRoute;
    const canonicalUrl = `${url.origin}${url.pathname}`;
    const imagePath = url.pathname.startsWith('/founder')
      ? '/founder-bhaumik-mehta.png'
      : '/predicta-logo.png';
    const imageUrl = `${url.origin}${imagePath}`;
    const robotsContent = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';
    const googleBotContent = shouldNoIndex
      ? 'noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    upsertLink("link[rel='canonical']", { rel: 'canonical' }, canonicalUrl);
    upsertMeta("meta[property='og:url']", { property: 'og:url' }, canonicalUrl);
    upsertMeta("meta[name='twitter:url']", { name: 'twitter:url' }, canonicalUrl);
    upsertMeta("meta[property='og:image']", { property: 'og:image' }, imageUrl);
    upsertMeta("meta[name='twitter:image']", { name: 'twitter:image' }, imageUrl);
    upsertMeta("meta[name='robots']", { name: 'robots' }, robotsContent);
    upsertMeta("meta[name='googlebot']", { name: 'googlebot' }, googleBotContent);
  }, []);

  return null;
}

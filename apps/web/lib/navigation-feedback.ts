'use client';

export const PREDICTA_NAVIGATION_FEEDBACK_EVENT =
  'predicta:navigation-feedback:start';

let navigationFeedbackTimeout: number | undefined;

function showImmediateNavigationFeedback(): void {
  const progress = document.querySelector('.predicta-route-progress');

  if (!(progress instanceof HTMLElement)) {
    return;
  }

  progress.classList.add('is-active');
  window.clearTimeout(navigationFeedbackTimeout);
  navigationFeedbackTimeout = window.setTimeout(() => {
    progress.classList.remove('is-active');
  }, 2400);
}

export function announcePredictaNavigation(href?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!href || !href.startsWith('/')) {
    return;
  }

  showImmediateNavigationFeedback();
  window.dispatchEvent(
    new CustomEvent(PREDICTA_NAVIGATION_FEEDBACK_EVENT, {
      detail: { href },
    }),
  );
}

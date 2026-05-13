'use client';

import { useEffect } from 'react';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../lib/language-preference';

type TranslationState = {
  lastValue: string;
  source: string;
};

const textSources = new WeakMap<Text, TranslationState>();
const attrSources = new WeakMap<Element, Map<string, TranslationState>>();
const translatedAttributes = ['aria-label', 'placeholder', 'title'] as const;
const excludedSelector = [
  '[data-no-auto-translate]',
  '.chat-thread',
  'script',
  'style',
  'noscript',
  'code',
  'pre',
  'svg',
  'canvas',
].join(',');

export function WebAppTranslationRuntime(): null {
  const { language } = useLanguagePreference();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = language;

    function applyTranslations(root: ParentNode = document.body) {
      translateTextNodes(root);
      translateElementAttributes(root);
    }

    applyTranslations();

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text);
            return;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            applyTranslations(node as Element);
          }
        });

        if (
          mutation.type === 'characterData' &&
          mutation.target.nodeType === Node.TEXT_NODE
        ) {
          translateTextNode(mutation.target as Text);
        }
      }
    });

    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();

    function translateTextNodes(root: ParentNode) {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return shouldTranslateTextNode(node as Text)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        },
      );

      let node = walker.nextNode();
      while (node) {
        translateTextNode(node as Text);
        node = walker.nextNode();
      }
    }

    function translateTextNode(node: Text) {
      if (!shouldTranslateTextNode(node)) {
        return;
      }

      const currentValue = node.nodeValue ?? '';
      const currentState = textSources.get(node);
      const source =
        currentState && currentValue === currentState.lastValue
          ? currentState.source
          : currentValue;
      const nextValue = translateUiText(source, language);

      if (node.nodeValue !== nextValue) {
        node.nodeValue = nextValue;
      }
      textSources.set(node, {
        lastValue: nextValue,
        source,
      });
    }

    function translateElementAttributes(root: ParentNode) {
      const elements =
        root instanceof Element
          ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
          : Array.from(document.body.querySelectorAll<HTMLElement>('*'));

      elements.forEach(element => {
        if (shouldSkipElement(element)) {
          return;
        }

        translatedAttributes.forEach(attribute => {
          const currentValue = element.getAttribute(attribute);

          if (!currentValue) {
            return;
          }

          const sourceMap =
            attrSources.get(element) ?? new Map<string, TranslationState>();
          const currentState = sourceMap.get(attribute);
          const source =
            currentState && currentValue === currentState.lastValue
              ? currentState.source
              : currentValue;
          const nextValue = translateUiText(source, language);
          sourceMap.set(attribute, {
            lastValue: nextValue,
            source,
          });
          attrSources.set(element, sourceMap);

          if (nextValue !== currentValue) {
            element.setAttribute(attribute, nextValue);
          }
        });
      });
    }
  }, [language]);

  return null;
}

function shouldTranslateTextNode(node: Text): boolean {
  if (!node.nodeValue?.trim()) {
    return false;
  }

  return !shouldSkipElement(node.parentElement);
}

function shouldSkipElement(element: Element | null): boolean {
  return Boolean(element?.closest(excludedSelector));
}

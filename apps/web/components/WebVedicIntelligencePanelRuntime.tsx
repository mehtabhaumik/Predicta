'use client';

import { demoAccess } from '../lib/demo-state';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebVedicIntelligencePanel } from './WebVedicIntelligencePanel';

export function WebVedicIntelligencePanelRuntime(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli } = useWebKundliLibrary();

  return (
    <WebVedicIntelligencePanel
      hasPremiumAccess={demoAccess.hasPremiumAccess}
      kundli={activeKundli}
      language={language}
    />
  );
}

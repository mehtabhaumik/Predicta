import React from 'react';
import { View } from 'react-native';
import { LEGAL_DOCUMENTS } from '@pridicta/config/legal';
import { AnimatedHeader, AppText, GlowCard, Screen } from '../components';

export function LegalScreen(): React.JSX.Element {
  return (
    <Screen>
      <AnimatedHeader eyebrow="TRUST AND TERMS" title="Legal" />
      <View className="mt-7 gap-5">
        {LEGAL_DOCUMENTS.map(document => (
          <GlowCard key={document.slug}>
            <AppText tone="secondary" variant="caption">
              Effective {document.effectiveDate}
            </AppText>
            <AppText className="mt-2" variant="subtitle">
              {document.title}
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {document.intro}
            </AppText>
            {document.sections.map(section => (
              <View className="mt-4" key={section.heading}>
                <AppText variant="caption">{section.heading}</AppText>
                {section.body.map(paragraph => (
                  <AppText
                    className="mt-2"
                    key={paragraph}
                    tone="secondary"
                    variant="caption"
                  >
                    {paragraph}
                  </AppText>
                ))}
              </View>
            ))}
          </GlowCard>
        ))}
      </View>
    </Screen>
  );
}

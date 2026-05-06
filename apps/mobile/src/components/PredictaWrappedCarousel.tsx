import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { PredictaWrapped, PredictaWrappedCard } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type PredictaWrappedCarouselProps = {
  onAskWrapped?: () => void;
  onCreateKundli?: () => void;
  wrapped: PredictaWrapped;
};

export function PredictaWrappedCarousel({
  onAskWrapped,
  onCreateKundli,
  wrapped,
}: PredictaWrappedCarouselProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 64, 340);

  async function shareWrapped() {
    await Share.share({
      message: wrapped.shareText,
      title: `${wrapped.year} Predicta Wrapped`,
    });
  }

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View>
        <AppText tone="secondary" variant="caption">
          PREDICTA WRAPPED
        </AppText>
        <AppText className="mt-1" variant="title">
          {wrapped.title}
        </AppText>
        <AppText className="mt-3" tone="secondary">
          {wrapped.subtitle}
        </AppText>
      </View>

      {wrapped.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : null}

      <ScrollView
        className="mt-5"
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={event => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / (cardWidth + 12),
          );
          setActiveIndex(index);
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
      >
        {wrapped.cards.map((card, index) => (
          <WrappedCard
            active={index === activeIndex}
            card={card}
            key={card.id}
            width={cardWidth}
          />
        ))}
      </ScrollView>

      {wrapped.cards.length ? (
        <View style={styles.dots}>
          {wrapped.cards.map((card, index) => (
            <View
              key={card.id}
              style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}

      <View className="mt-5 gap-3">
        {wrapped.status === 'ready' && onAskWrapped ? (
          <GlowButton label="Ask about my Wrapped" onPress={onAskWrapped} />
        ) : null}
        {wrapped.status === 'ready' ? (
          <GlowButton label="Share Wrapped" onPress={shareWrapped} />
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPrivacy(value => !value)}
        style={styles.privacyToggle}
      >
        <AppText className="font-bold text-[#4DAFFF]">
          {showPrivacy ? 'Hide privacy check' : 'Privacy check'}
        </AppText>
      </Pressable>

      {showPrivacy ? (
        <View style={styles.privacyPanel}>
          <AppText variant="caption">Share-safe export</AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {wrapped.privacyCheck.note}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            Birth time excluded:{' '}
            {wrapped.privacyCheck.excludesExactBirthTime ? 'yes' : 'no'} · Birth
            place excluded: {wrapped.privacyCheck.excludesBirthPlace ? 'yes' : 'no'}
          </AppText>
          <AppText className="mt-3" tone="secondary" variant="caption">
            {wrapped.shareText.replace(/\n/g, ' · ')}
          </AppText>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function WrappedCard({
  active,
  card,
  width,
}: {
  active: boolean;
  card: PredictaWrappedCard;
  width: number;
}): React.JSX.Element {
  return (
    <View style={[styles.card, active ? styles.cardActive : null, { width }]}>
      <AppText tone="secondary" variant="caption">
        {card.eyebrow}
      </AppText>
      <AppText className="mt-2" variant="title">
        {card.title}
      </AppText>
      <AppText className="mt-4" variant="subtitle">
        {card.value}
      </AppText>
      <AppText className="mt-3" tone="secondary">
        {card.body}
      </AppText>
      <View style={styles.guidancePanel}>
        <AppText tone="secondary" variant="caption">
          Do this
        </AppText>
        <AppText className="mt-1" variant="caption">
          {card.guidance}
        </AppText>
      </View>
      <View style={styles.evidencePanel}>
        {card.evidence.slice(0, 3).map(item => (
          <AppText className="mt-1" key={item} tone="secondary" variant="caption">
            {item}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    minHeight: 430,
    padding: 18,
  },
  cardActive: {
    borderColor: 'rgba(255, 195, 77, 0.54)',
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  dotActive: {
    backgroundColor: colors.gradient[0],
    width: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 14,
  },
  evidencePanel: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  guidancePanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  privacyPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  privacyToggle: {
    marginTop: 14,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
});

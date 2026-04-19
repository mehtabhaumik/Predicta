import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  buildLifeTimelineInsight,
  resolveLifeTimelineAccess,
} from '@pridicta/astrology';
import {
  getProductUpgradePrompt,
  hasLifeTimelineReportCredit,
} from '@pridicta/monetization';
import type { LifeEvent, LifeEventCategory } from '@pridicta/types';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { getLifeTimelineReportProduct } from '../config/pricing';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  loadLocalLifeEvents,
  saveLocalLifeTimelineInsight,
  upsertLocalLifeEvent,
} from '../services/storage/localLifeTimelineStorage';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const categories: LifeEventCategory[] = [
  'CAREER',
  'RELATIONSHIP',
  'MARRIAGE',
  'BUSINESS',
  'RELOCATION',
  'EDUCATION',
  'FINANCE',
  'HEALTH',
  'FAMILY',
  'SPIRITUAL',
  'OTHER',
];

export function LifeTimelineScreen({
  navigation,
}: RootScreenProps<typeof routes.LifeTimeline>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const auth = useAppStore(state => state.auth);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const monetization = useAppStore(state => state.monetization);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LifeEventCategory>('CAREER');
  const [approximateDate, setApproximateDate] = useState(false);
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const previewTrackedRef = useRef(false);
  const access = getResolvedAccess();
  const hasTimelineCredit = kundli
    ? hasLifeTimelineReportCredit(monetization.oneTimeEntitlements, kundli.id)
    : false;
  const timelineAccess = resolveLifeTimelineAccess({
    eventCount: events.length,
    hasPremiumAccess: access.hasPremiumAccess || hasTimelineCredit,
  });
  const timelineProduct = getLifeTimelineReportProduct();
  const timelinePrompt = getProductUpgradePrompt('LIFE_TIMELINE_REPORT');

  useEffect(() => {
    if (!kundli) {
      return;
    }

    loadLocalLifeEvents(kundli.id)
      .then(setEvents)
      .catch(() => {
        showGlassAlert({
          message: 'Saved life events could not be loaded from this device.',
          title: 'Timeline unavailable',
        });
      });
  }, [kundli, showGlassAlert]);

  const insight = useMemo(() => {
    if (!kundli) {
      return undefined;
    }

    return buildLifeTimelineInsight({ events, kundli });
  }, [events, kundli]);

  useEffect(() => {
    if (!insight || previewTrackedRef.current) {
      return;
    }

    previewTrackedRef.current = true;
    trackAnalyticsEvent({
      eventName: 'life_timeline_previewed',
      metadata: {
        eventCount: events.length,
        premiumDepth: timelineAccess.canViewFullTimeline,
      },
      userId: auth.userId,
    });
  }, [auth.userId, events.length, insight, timelineAccess.canViewFullTimeline]);

  function openTimelineOffer() {
    trackAnalyticsEvent({
      eventName: 'product_selected',
      metadata: {
        productId: timelinePrompt.productId ?? null,
        productType: timelinePrompt.productType ?? null,
        source: 'life_timeline',
      },
      userId: auth.userId,
    });
    navigation.navigate(routes.Paywall, {
      source: 'life_timeline',
      suggestedProductId: timelinePrompt.productId,
      title: timelinePrompt.title,
    });
  }

  async function handleAddEvent() {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    if (!timelineAccess.canAddMoreEvents) {
      showGlassAlert({
        actions: [
          { label: 'Keep Preview' },
          {
            label: `${timelineProduct.label} - ${timelineProduct.displayPrice}`,
            onPress: openTimelineOffer,
          },
        ],
        message:
          'Free timelines include three life events. Premium or a Life Timeline Report unlocks deeper pattern mapping.',
        title: 'Timeline depth',
      });
      return;
    }

    if (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      showGlassAlert({
        message: 'Add a title and date in YYYY-MM-DD format.',
        title: 'Complete event details',
      });
      return;
    }

    const now = new Date().toISOString();
    const event: LifeEvent = {
      approximateDate,
      category,
      createdAt: now,
      description: description.trim() || undefined,
      eventDate,
      id: `${kundli.id}-${Date.now()}`,
      kundliId: kundli.id,
      title: title.trim(),
      updatedAt: now,
    };

    try {
      const nextEvents = await upsertLocalLifeEvent(event);
      setEvents(nextEvents);
      const nextInsight = buildLifeTimelineInsight({
        events: nextEvents,
        kundli,
      });
      await saveLocalLifeTimelineInsight(nextInsight);
      setTitle('');
      setEventDate('');
      setDescription('');
      setApproximateDate(false);
    } catch {
      showGlassAlert({
        message: 'This event could not be saved locally. Please try again.',
        title: 'Save failed',
      });
    }
  }

  function askPredicta() {
    setActiveChartContext({
      selectedSection: 'Life Timeline',
      sourceScreen: 'Life Timeline',
    });
    navigation.navigate(routes.Chat);
  }

  if (!kundli) {
    return (
      <Screen>
        {glassAlert}
        <AnimatedHeader eyebrow="LIFE PATTERN MAP" title="Life Timeline" />
        <GlowCard style={styles.panelSpacing} delay={120}>
          <AppText variant="subtitle">Generate a kundli first</AppText>
          <AppText style={styles.copy} tone="secondary">
            Predicta needs a real calculated kundli before mapping important
            life events against dasha timing.
          </AppText>
          <View style={styles.buttonSpacing}>
            <GlowButton
              label="Generate Kundli"
              onPress={() => navigation.navigate(routes.Kundli)}
            />
          </View>
        </GlowCard>
      </Screen>
    );
  }

  const visibleEvents = timelineAccess.canViewFullTimeline
    ? insight?.mappedEvents ?? []
    : insight?.mappedEvents.slice(0, timelineAccess.maxFreeEvents) ?? [];

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="LIFE PATTERN MAP" title="Life Timeline" />

      <GlowCard style={styles.panelSpacing} delay={100}>
        <AppText tone="secondary" variant="caption">
          SIGNATURE FEATURE
        </AppText>
        <AppText style={styles.copy} variant="subtitle">
          Map real events against your dasha timing.
        </AppText>
        <AppText style={styles.copy} tone="secondary">
          {insight?.previewText}
        </AppText>
        {!timelineAccess.canViewFullTimeline ? (
          <AppText style={styles.upgradeCopy} tone="secondary" variant="caption">
            Free access: {timelineAccess.remainingFreeEvents} event
            {timelineAccess.remainingFreeEvents === 1 ? '' : 's'} remaining.
          </AppText>
        ) : null}
      </GlowCard>

      <GlowCard style={styles.panelSpacing} delay={180}>
        <AppText variant="subtitle">Add life event</AppText>
        <TextInput
          onChangeText={setTitle}
          placeholder="Career shift, marriage, relocation..."
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={title}
        />
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setEventDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={eventDate}
        />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Optional note about what changed"
          placeholderTextColor={colors.secondaryText}
          style={[styles.input, styles.textArea]}
          value={description}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map(item => (
            <Pressable
              accessibilityRole="button"
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryChip,
                category === item ? styles.categoryChipActive : null,
              ]}
            >
              <AppText variant="caption">{item.replace('_', ' ')}</AppText>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          onPress={() => setApproximateDate(value => !value)}
          style={styles.approxRow}
        >
          <View
            style={[
              styles.checkbox,
              approximateDate ? styles.checkboxActive : null,
            ]}
          />
          <AppText tone="secondary" variant="caption">
            This date is approximate
          </AppText>
        </Pressable>
        <GlowButton label="Add Event" onPress={handleAddEvent} />
      </GlowCard>

      <View style={styles.eventStack}>
        {visibleEvents.map((item, index) => (
          <GlowCard key={item.event.id} delay={260 + index * 70}>
            <AppText tone="secondary" variant="caption">
              {item.event.category} · {item.confidence.toUpperCase()} CONFIDENCE
            </AppText>
            <AppText style={styles.copy} variant="subtitle">
              {item.event.title}
            </AppText>
            <AppText style={styles.copy} tone="secondary">
              {item.mahadasha
                ? `${item.mahadasha} / ${item.antardasha ?? 'period'}`
                : 'Outside mapped dasha timeline'}
            </AppText>
            <AppText style={styles.copy} tone="secondary" variant="caption">
              Houses {item.relevantHouses.join(', ')} · Charts{' '}
              {item.relevantCharts.join(', ')}
            </AppText>
          </GlowCard>
        ))}
      </View>

      <GlowCard style={styles.panelSpacing} delay={420}>
        <AppText variant="subtitle">Ask from your timeline</AppText>
        <AppText style={styles.copy} tone="secondary">
          Predicta can use this timeline context to discuss patterns calmly,
          without treating any period as fixed destiny.
        </AppText>
        <View style={styles.buttonSpacing}>
          <GlowButton label="Ask Predicta" onPress={askPredicta} />
        </View>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  approxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  buttonSpacing: {
    marginTop: 22,
  },
  categoryChip: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    borderColor: colors.borderGlow,
  },
  categoryScroll: {
    marginBottom: 12,
    marginTop: 10,
  },
  checkbox: {
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 18,
    width: 18,
  },
  checkboxActive: {
    backgroundColor: colors.gradient[1],
    borderColor: colors.gradient[1],
  },
  copy: {
    marginTop: 8,
  },
  eventStack: {
    gap: 16,
    marginTop: 24,
  },
  input: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.primaryText,
    marginTop: 14,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  panelSpacing: {
    marginTop: 28,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  upgradeCopy: {
    marginTop: 14,
  },
});

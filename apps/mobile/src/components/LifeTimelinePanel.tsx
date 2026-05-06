import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { buildTrustProfile } from '@pridicta/config/trust';
import type {
  LifeTimelineEventView,
  LifeTimelinePresentation,
} from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';
import { TrustProofPanel } from './TrustProofPanel';

type LifeTimelinePanelProps = {
  onAskEvent?: (event: LifeTimelineEventView) => void;
  onCreateKundli?: () => void;
  presentation: LifeTimelinePresentation;
};

export function LifeTimelinePanel({
  onAskEvent,
  onCreateKundli,
  presentation,
}: LifeTimelinePanelProps): React.JSX.Element {
  const firstEvent = useMemo(
    () => presentation.sections.flatMap(section => section.events)[0],
    [presentation.sections],
  );
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(
    firstEvent?.id,
  );
  const selectedEvent =
    presentation.sections
      .flatMap(section => section.events)
      .find(event => event.id === selectedEventId) ?? firstEvent;

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View style={styles.header}>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            LIFE TIMELINE
          </AppText>
          <AppText className="mt-1" variant="title">
            {presentation.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {presentation.subtitle}
          </AppText>
        </View>
      </View>

      <View style={styles.periodRow}>
        <TimelineMetric label="Now" value={presentation.currentPeriod} />
        <TimelineMetric label="Next" value={presentation.upcomingPeriod} />
      </View>

      {presentation.caution ? (
        <View style={styles.cautionPanel}>
          <AppText tone="secondary" variant="caption">
            Timing note
          </AppText>
          <AppText className="mt-1" tone="secondary">
            {presentation.caution}
          </AppText>
        </View>
      ) : null}

      {presentation.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : null}

      <View style={styles.sectionStack}>
        {presentation.sections.map(section => (
          <View key={section.id} style={styles.section}>
            <AppText variant="subtitle">{section.title}</AppText>
            <AppText className="mt-1" tone="secondary" variant="caption">
              {section.description}
            </AppText>
            <View className="mt-3 gap-3">
              {section.events.length ? (
                section.events.map(event => (
                  <Pressable
                    accessibilityRole="button"
                    key={event.id}
                    onPress={() => setSelectedEventId(event.id)}
                    style={[
                      styles.eventCard,
                      event.id === selectedEvent?.id ? styles.eventCardActive : null,
                    ]}
                  >
                    <View style={styles.eventHeader}>
                      <AppText variant="subtitle">{event.title}</AppText>
                      <KindBadge kind={event.kind} />
                    </View>
                    <AppText className="mt-1" tone="secondary" variant="caption">
                      {event.dateWindow} · {event.confidence} confidence
                    </AppText>
                    <AppText className="mt-2" tone="secondary">
                      {event.summary}
                    </AppText>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <AppText tone="secondary" variant="caption">
                    No {section.title.toLowerCase()} events yet.
                  </AppText>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {selectedEvent ? (
        <View style={styles.drilldown}>
          <AppText tone="secondary" variant="caption">
            Chart proof
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {selectedEvent.title}
          </AppText>
          {selectedEvent.evidence.slice(0, 3).map(item => (
            <AppText className="mt-2" key={item} tone="secondary" variant="caption">
              {item}
            </AppText>
          ))}
          <View style={styles.actionPanel}>
            <AppText tone="secondary" variant="caption">
              Action
            </AppText>
            <AppText className="mt-1">{selectedEvent.action}</AppText>
          </View>
          <View className="mt-4">
            <TrustProofPanel
              trust={buildTrustProfile({
                evidence: selectedEvent.evidence,
                limitations:
                  selectedEvent.confidence === 'low'
                    ? ['This event has low confidence, so use it for broad reflection only.']
                    : [],
                query: selectedEvent.askPrompt,
                surface: 'timeline',
              })}
            />
          </View>
          {onAskEvent ? (
            <View className="mt-4">
              <GlowButton
                label="Ask from this event"
                onPress={() => onAskEvent(selectedEvent)}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
}

function TimelineMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.metric}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function KindBadge({
  kind,
}: {
  kind: LifeTimelineEventView['kind'];
}): React.JSX.Element {
  return (
    <View style={styles.kindBadge}>
      <AppText variant="caption">{kind}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  cautionPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  drilldown: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  emptyState: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  eventCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  eventCardActive: {
    borderColor: colors.gradient[1],
  },
  eventHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  kindBadge: {
    backgroundColor: 'rgba(77, 175, 255, 0.14)',
    borderColor: 'rgba(77, 175, 255, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    padding: 12,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  section: {
    gap: 2,
  },
  sectionStack: {
    gap: 18,
    marginTop: 18,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
});

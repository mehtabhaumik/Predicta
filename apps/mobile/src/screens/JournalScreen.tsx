import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  buildJournalInsight,
  getCurrentMonthKey,
  resolveJournalInsightAccess,
} from '@pridicta/astrology';
import type { JournalCategory, JournalEntry, JournalMood } from '@pridicta/types';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { saveJournalEntryForUser } from '../services/firebase/journalPersistence';
import {
  loadLocalJournalEntries,
  markJournalEntrySynced,
  saveLocalJournalInsight,
  upsertLocalJournalEntry,
} from '../services/storage/localJournalStorage';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const categories: JournalCategory[] = [
  'MOOD',
  'DECISION',
  'CAREER',
  'RELATIONSHIP',
  'FAMILY',
  'FINANCE',
  'HEALTH',
  'SPIRITUAL',
  'EVENT',
  'OTHER',
];

const moods: JournalMood[] = ['VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'VERY_GOOD'];

export function JournalScreen({
  navigation,
}: RootScreenProps<typeof routes.Journal>): React.JSX.Element {
  const auth = useAppStore(state => state.auth);
  const kundli = useAppStore(state => state.activeKundli);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<JournalCategory>('MOOD');
  const [mood, setMood] = useState<JournalMood>('NEUTRAL');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [relatedDecision, setRelatedDecision] = useState('');
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const access = getResolvedAccess();
  const insightAccess = resolveJournalInsightAccess({
    hasPremiumAccess: access.hasPremiumAccess,
  });
  const monthKey = getCurrentMonthKey(new Date(`${date}T00:00:00.000Z`));

  useEffect(() => {
    if (!kundli) {
      return;
    }

    loadLocalJournalEntries(kundli.id)
      .then(setEntries)
      .catch(() => {
        showGlassAlert({
          message: 'Your private journal could not be loaded from this device.',
          title: 'Journal unavailable',
        });
      });
  }, [kundli, showGlassAlert]);

  const insight = useMemo(() => {
    if (!kundli) {
      return undefined;
    }

    return buildJournalInsight({
      entries,
      hasPremiumAccess: insightAccess.canViewPremiumPatterns,
      kundli,
      monthKey,
    });
  }, [entries, insightAccess.canViewPremiumPatterns, kundli, monthKey]);

  async function addEntry() {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    if (!note.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      showGlassAlert({
        message: 'Add a date in YYYY-MM-DD format and a private note.',
        title: 'Complete journal entry',
      });
      return;
    }

    const now = new Date().toISOString();
    const entry: JournalEntry = {
      category,
      createdAt: now,
      date,
      id: `${kundli.id}-journal-${Date.now()}`,
      kundliId: kundli.id,
      mood,
      note: note.trim(),
      relatedDecision: relatedDecision.trim() || undefined,
      syncStatus: 'LOCAL_ONLY',
      tags: tags
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      updatedAt: now,
    };

    try {
      const nextEntries = await upsertLocalJournalEntry(entry);
      setEntries(nextEntries);
      await saveLocalJournalInsight(
        buildJournalInsight({
          entries: nextEntries,
          hasPremiumAccess: insightAccess.canViewPremiumPatterns,
          kundli,
          monthKey,
        }),
      );
      setNote('');
      setRelatedDecision('');
      setTags('');
    } catch {
      showGlassAlert({
        message: 'This journal entry could not be saved locally.',
        title: 'Save failed',
      });
    }
  }

  async function syncEntryToCloud(entry: JournalEntry) {
    if (!auth.userId) {
      showGlassAlert({
        actions: [
          { label: 'Keep Local' },
          { label: 'Sign In', onPress: () => navigation.navigate(routes.Login) },
        ],
        message:
          'Cloud sync is optional. Sign in only if you want this entry saved online.',
        title: 'Sign in for cloud sync',
      });
      return;
    }

    try {
      const result = await saveJournalEntryForUser({
        entry,
        explicitUserAction: true,
        userId: auth.userId,
      });
      const nextEntries = await markJournalEntrySynced({
        cloudId: result.cloudId,
        entryId: entry.id,
        kundliId: entry.kundliId,
      });
      setEntries(nextEntries);
      showGlassAlert({
        message: 'This journal entry is now saved to your cloud account.',
        title: 'Journal synced',
      });
    } catch {
      showGlassAlert({
        message:
          'Cloud sync failed. Your journal entry is still saved on this device.',
        title: 'Sync failed',
      });
    }
  }

  function askFromJournal() {
    setActiveChartContext({
      selectedSection: 'Private Journal',
      sourceScreen: 'Journal',
    });
    navigation.navigate(routes.Chat);
  }

  if (!kundli) {
    return (
      <Screen>
        {glassAlert}
        <AnimatedHeader eyebrow="PRIVATE JOURNAL" title="Journal" />
        <GlowCard style={styles.panelSpacing} delay={120}>
          <AppText variant="subtitle">Generate a kundli first</AppText>
          <AppText style={styles.copy} tone="secondary">
            Predicta maps journal entries against dasha timing only after a
            real calculated kundli is active.
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

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="PRIVATE JOURNAL" title="Journal Insights" />

      <GlowCard style={styles.panelSpacing} delay={100}>
        <AppText tone="secondary" variant="caption">
          LOCAL FIRST
        </AppText>
        <AppText style={styles.copy} variant="subtitle">
          Track moods, decisions, and outcomes privately.
        </AppText>
        <AppText style={styles.copy} tone="secondary">
          {insight?.basicReflection}
        </AppText>
        <AppText style={styles.upgradeCopy} tone="secondary" variant="caption">
          {insightAccess.message}
        </AppText>
      </GlowCard>

      <GlowCard style={styles.panelSpacing} delay={180}>
        <AppText variant="subtitle">Add journal entry</AppText>
        <TextInput
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={date}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.choiceRow}>
            {categories.map(item => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.choice,
                  category === item ? styles.choiceActive : undefined,
                ]}
              >
                <AppText variant="caption">{item}</AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.choiceRow}>
            {moods.map(item => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => setMood(item)}
                style={[styles.choice, mood === item ? styles.choiceActive : undefined]}
              >
                <AppText variant="caption">{item.replace('_', ' ')}</AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Write what happened, how it felt, or what you decided..."
          placeholderTextColor={colors.secondaryText}
          style={[styles.input, styles.noteInput]}
          value={note}
        />
        <TextInput
          onChangeText={setRelatedDecision}
          placeholder="Related decision, optional"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={relatedDecision}
        />
        <TextInput
          onChangeText={setTags}
          placeholder="Tags, comma separated"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={tags}
        />
        <View style={styles.buttonSpacing}>
          <GlowButton label="Save Privately" onPress={addEntry} />
        </View>
      </GlowCard>

      {insight?.premiumPatternSummary ? (
        <GlowCard style={styles.panelSpacing} delay={260}>
          <AppText tone="secondary" variant="caption">
            PREMIUM PATTERNS
          </AppText>
          <AppText style={styles.copy}>{insight.premiumPatternSummary}</AppText>
          <AppText style={styles.copy} tone="secondary">
            {insight.emotionalCycleInsight}
          </AppText>
          <AppText style={styles.copy} tone="secondary">
            {insight.monthlyReflection}
          </AppText>
        </GlowCard>
      ) : null}

      <GlowCard style={styles.panelSpacing} delay={340}>
        <AppText variant="subtitle">Recent private entries</AppText>
        {entries.slice(0, 6).map(entry => (
          <View key={entry.id} style={styles.entryRow}>
            <View style={styles.entryHeader}>
              <AppText>{entry.category}</AppText>
              <AppText tone="secondary" variant="caption">
                {entry.date} • {entry.syncStatus ?? 'LOCAL_ONLY'}
              </AppText>
            </View>
            <AppText style={styles.copy} tone="secondary">
              {entry.note}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => syncEntryToCloud(entry)}
              style={styles.inlineLink}
            >
              <AppText style={styles.inlineLinkText}>
                Save this entry to cloud
              </AppText>
            </Pressable>
          </View>
        ))}
        {entries.length === 0 ? (
          <AppText style={styles.copy} tone="secondary">
            No entries yet. Your first note stays on this device unless you
            choose cloud sync.
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={askFromJournal}
          style={styles.inlineLink}
        >
          <AppText style={styles.inlineLinkText}>
            Ask Predicta from journal context
          </AppText>
        </Pressable>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonSpacing: {
    marginTop: 18,
  },
  choice: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceActive: {
    borderColor: colors.borderGlow,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingRight: 18,
  },
  copy: {
    marginTop: 10,
  },
  entryHeader: {
    gap: 4,
  },
  entryRow: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 18,
  },
  inlineLink: {
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  inlineLinkText: {
    color: '#4DAFFF',
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.primaryText,
    fontSize: 15,
    marginTop: 16,
    padding: 16,
  },
  noteInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  panelSpacing: {
    marginTop: 24,
  },
  upgradeCopy: {
    marginTop: 16,
  },
});


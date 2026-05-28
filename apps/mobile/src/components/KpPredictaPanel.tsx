import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import type { ChalitBhavKpFoundation } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { FadeInView } from './FadeInView';
import { GlowCard } from './GlowCard';
import { GradientText } from './GradientText';
import { IntelligenceRhythmCard } from './IntelligenceRhythmCard';

type KpEventFocus = 'career' | 'money' | 'marriage' | 'property' | 'education' | 'travel' | 'custom';
type KpQuestionMode = 'preset' | 'custom' | 'guide';

const KP_EVENT_FOCUS: Array<{
  id: KpEventFocus;
  title: string;
  houses: number[];
  prompt: string;
}> = [
  {
    houses: [2, 6, 10, 11],
    id: 'career',
    prompt:
      'Using KP only, judge career and job movement from houses 2, 6, 10, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Career and job',
  },
  {
    houses: [2, 5, 8, 11],
    id: 'money',
    prompt:
      'Using KP only, judge money gains and financial stability from houses 2, 5, 8, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Money and gains',
  },
  {
    houses: [2, 7, 11],
    id: 'marriage',
    prompt:
      'Using KP only, judge marriage and partnership promise from houses 2, 7, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Marriage and partner',
  },
  {
    houses: [4, 11, 12],
    id: 'property',
    prompt:
      'Using KP only, judge home, property, and relocation from houses 4, 11, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Home and property',
  },
  {
    houses: [4, 5, 9, 11],
    id: 'education',
    prompt:
      'Using KP only, judge education, exam, certification, and learning outcomes from houses 4, 5, 9, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Education and exams',
  },
  {
    houses: [3, 9, 12],
    id: 'travel',
    prompt:
      'Using KP only, judge travel, foreign movement, and relocation readiness from houses 3, 9, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Travel and relocation',
  },
  {
    houses: [1, 6, 10, 11],
    id: 'custom',
    prompt:
      'Using KP only, help refine the user custom event into an exact question with event type, time window, current situation, and desired outcome before judging cusps and significators.',
    title: 'Custom exact question',
  },
];

const KP_QUESTION_PRESETS: Array<{
  focus: KpEventFocus;
  id: string;
  question: string;
  title: string;
}> = [
  {
    focus: 'career',
    id: 'job-change',
    question: 'Should I seriously prepare for a job change in the next six months?',
    title: 'Job change',
  },
  {
    focus: 'money',
    id: 'money-decision',
    question: 'Should I move carefully or actively around this money decision over the next three months?',
    title: 'Money decision',
  },
  {
    focus: 'marriage',
    id: 'marriage-timing',
    question: 'Is this period supportive for serious marriage or partnership progress?',
    title: 'Marriage timing',
  },
  {
    focus: 'property',
    id: 'property-deal',
    question: 'Should I move forward with property or home-related decisions in the next 90 days?',
    title: 'Property decision',
  },
  {
    focus: 'education',
    id: 'exam',
    question: 'Is this a supportive period for exam, certification, admission, or learning outcome?',
    title: 'Exam or admission',
  },
  {
    focus: 'travel',
    id: 'travel',
    question: 'Is this a supportive period for travel, relocation, or foreign movement?',
    title: 'Travel or relocation',
  },
];

type KpPredictaPanelProps = {
  foundation: ChalitBhavKpFoundation;
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  onAskKp?: (prompt: string) => void;
  onPremium?: () => void;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function KpPredictaPanel({
  foundation,
  handoffQuestion,
  hasPremiumAccess = false,
  onAskKp,
  onPremium,
  schoolCalculationStatus = 'idle',
}: KpPredictaPanelProps): React.JSX.Element {
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;
  const [selectedEvent, setSelectedEvent] = useState<KpEventFocus>('career');
  const [questionMode, setQuestionMode] = useState<KpQuestionMode>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(KP_QUESTION_PRESETS[0]?.id ?? '');
  const [customQuestion, setCustomQuestion] = useState('');
  const selectedFocus =
    KP_EVENT_FOCUS.find(item => item.id === selectedEvent) ?? KP_EVENT_FOCUS[0];
  const selectedPreset =
    KP_QUESTION_PRESETS.find(item => item.id === selectedPresetId) ??
    KP_QUESTION_PRESETS.find(item => item.focus === selectedEvent) ??
    KP_QUESTION_PRESETS[0];
  const questionDraft = useMemo(
    () =>
      buildKpQuestionDraft({
        customQuestion,
        focus: selectedFocus,
        mode: questionMode,
        presetQuestion: selectedPreset?.question,
      }),
    [customQuestion, questionMode, selectedFocus, selectedPreset?.question],
  );
  const [selectedCusp, setSelectedCusp] = useState<number>(
    selectedFocus.houses.at(-2) ?? selectedFocus.houses[0],
  );
  const selectedCuspData = kp.cusps.find(cusp => cusp.house === selectedCusp);
  const eventSignificators = useMemo(
    () =>
      kp.significators
        .filter(item =>
          item.signifiesHouses.some(house => selectedFocus.houses.includes(house)),
        )
        .slice(0, hasPremiumAccess ? 6 : 4),
    [hasPremiumAccess, kp.significators, selectedFocus.houses],
  );
  const askPrompt = handoffQuestion
    ? `KP Predicta question: ${handoffQuestion}. ${questionDraft.prompt}. ${selectedFocus.prompt}`
    : `${questionDraft.prompt}. ${selectedFocus.prompt}${
        selectedCuspData
          ? ` Selected event-support area ${selectedCuspData.house} has star lord ${selectedCuspData.lordChain.starLord}, sub lord ${selectedCuspData.lordChain.subLord}, and sub-sub lord ${selectedCuspData.lordChain.subSubLord}.`
          : ''
      }`;

  return (
    <View className="gap-5">
      <GlowCard delay={100}>
        <View style={styles.header}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              KP PREDICTA
            </AppText>
            <GradientText className="mt-1" variant="subtitle">
              A separate precision school
            </GradientText>
          </View>
          <View style={styles.badge}>
            <AppText variant="caption">KP world</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          KP Predicta stays inside Krishnamurti Paddhati: cusps, star lords,
          sub lords, significators, ruling planets, dasha support, and
          event-focused judgement.
        </AppText>
        <View style={styles.explainBox}>
          <AppText variant="caption">{kp.title}</AppText>
          <AppText className="mt-2" tone="secondary">
            {hasPremiumAccess
              ? kp.premiumSynthesis ?? kp.freeInsight
              : kp.freeInsight}
          </AppText>
        </View>
        {handoffQuestion ? (
          <View style={styles.handoffBox}>
            <AppText variant="caption">QUESTION RECEIVED</AppText>
            <AppText className="mt-2" tone="secondary">
              {handoffQuestion}
            </AppText>
          </View>
        ) : null}
        <View style={styles.explainBox}>
          <AppText variant="caption">EVENT VERDICT COMPASS</AppText>
          <AppText className="mt-2" variant="subtitle">
            {kp.eventJudgement.verdictLabel}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            {kp.eventJudgement.plainLanguage}
          </AppText>
          <View style={styles.metricGrid}>
            <Metric label="Promise" value={kp.eventJudgement.eventVerdictCompass.promise} />
            <Metric label="Block" value={kp.eventJudgement.eventVerdictCompass.block} />
            <Metric label="Timing" value={kp.eventJudgement.eventVerdictCompass.timing} />
            <Metric label="Confidence" value={kp.eventJudgement.eventVerdictCompass.confidence} />
          </View>
        </View>
      </GlowCard>

      <IntelligenceRhythmCard delay={118} school="KP" />

      {ruling ? (
        <GlowCard delay={140}>
          <AppText tone="secondary" variant="caption">
            RULING PLANETS
          </AppText>
          <View style={styles.metricGrid}>
            <Metric label="Day" value={ruling.dayLord} />
            <Metric label="Moon star" value={ruling.moonStarLord} />
            <Metric label="Moon sub" value={ruling.moonSubLord} />
            <Metric label="Lagna sub" value={ruling.lagnaSubLord} />
          </View>
        </GlowCard>
      ) : null}

      <GlowCard delay={160}>
        <AppText tone="secondary" variant="caption">
          KP JUDGEMENT PATH
        </AppText>
        <View style={styles.explainBox}>
          <AppText variant="caption">WHAT ARE YOU ASKING?</AppText>
          <AppText className="mt-2" tone="secondary">
            Choose the event first. KP works best with an exact question, a time
            window, the current situation, and the outcome you want to judge.
          </AppText>
        </View>
        <AppText className="mt-1" variant="subtitle">
          {selectedFocus.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Pick the event first. KP then checks houses, cusp sub lord,
          significators, ruling planets, and dasha support.
        </AppText>
        <View style={styles.eventGrid}>
          {KP_EVENT_FOCUS.map(item => {
            const active = item.id === selectedEvent;

            return (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => {
                  setSelectedEvent(item.id);
                  setSelectedCusp(item.houses.at(-2) ?? item.houses[0]);
                  const nextPreset = KP_QUESTION_PRESETS.find(preset => preset.focus === item.id);
                  if (nextPreset) {
                    setSelectedPresetId(nextPreset.id);
                  }
                }}
                style={[styles.eventCard, active ? styles.activeEventCard : undefined]}
              >
                <AppText variant="caption">{item.title}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  Houses {item.houses.join(', ')}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.questionComposer}>
          <AppText variant="caption">ASK KP QUESTION</AppText>
          <AppText className="mt-2" tone="secondary">
            Pick a ready question, write your own, or choose guide me. Predicta
            will refine vague questions before answering.
          </AppText>
          <View style={styles.modeGrid}>
            {[
              ['preset', 'Ready question'],
              ['custom', 'My own'],
              ['guide', 'Guide me'],
            ].map(([mode, label]) => {
              const active = questionMode === mode;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={mode}
                  onPress={() => setQuestionMode(mode as KpQuestionMode)}
                  style={[styles.modeButton, active ? styles.activeEventCard : undefined]}
                >
                  <AppText variant="caption">{label}</AppText>
                </Pressable>
              );
            })}
          </View>
          {questionMode === 'preset' ? (
            <View style={styles.presetGrid}>
              {KP_QUESTION_PRESETS.filter(
                item => item.focus === selectedEvent || selectedEvent === 'custom',
              ).map(item => {
                const active = selectedPresetId === item.id;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={item.id}
                    onPress={() => {
                      setSelectedPresetId(item.id);
                      setSelectedEvent(item.focus);
                    }}
                    style={[styles.presetCard, active ? styles.activeEventCard : undefined]}
                  >
                    <AppText variant="caption">{item.title}</AppText>
                    <AppText className="mt-1" tone="secondary" variant="caption">
                      {item.question}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {questionMode === 'custom' ? (
            <TextInput
              multiline
              onChangeText={setCustomQuestion}
              placeholder="Example: I am confused about changing my job soon."
              placeholderTextColor={colors.secondaryText}
              style={styles.questionInput}
              value={customQuestion}
            />
          ) : null}
          <View style={styles.refinedCard}>
            <AppText tone="secondary" variant="caption">
              {questionDraft.label}
            </AppText>
            <AppText className="mt-2" variant="caption">
              {questionDraft.refinedQuestion}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {questionDraft.guidance}
            </AppText>
            {onAskKp ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onAskKp(askPrompt)}
                style={styles.ctaInline}
              >
                <AppText variant="caption">Ask KP Predicta</AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={styles.pathGrid}>
          {kp.eventJudgement.questionToProofPath.map((step, index) => (
            <PathStep
              key={step}
              label={
                index === 0
                  ? 'Question'
                  : index === 1
                    ? 'Cusp'
                    : index === 2
                      ? 'Carriers'
                      : 'Timing'
              }
              value={kp.eventJudgement.proofPath[index] ?? step}
            />
          ))}
        </View>
        <View style={styles.explainBox}>
          <AppText variant="caption">ASK EXACT QUESTION WIZARD</AppText>
          <AppText className="mt-2" tone="secondary">
            {kp.eventJudgement.nextQuestion}
          </AppText>
        </View>
      </GlowCard>

      <GlowCard delay={180}>
        <AppText tone="secondary" variant="caption">
          PROOF DRAWER
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          12 cusps with star and sub lords
        </AppText>
        <View className="mt-4 gap-2">
          {kp.cusps.slice(0, 12).map((cusp, index) => (
            <FadeInView delay={80 + index * 26} duration={300} key={cusp.house}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedCusp(cusp.house)}
                style={[
                  styles.row,
                  selectedCusp === cusp.house ||
                  selectedFocus.houses.includes(cusp.house)
                    ? styles.relevantRow
                    : undefined,
                ]}
              >
                <AppText variant="caption">Cusp {cusp.house}</AppText>
                <AppText tone="secondary" variant="caption">
                  {cusp.sign} {cusp.degree.toFixed(2)}° · Star{' '}
                  {cusp.lordChain.starLord} · Sub {cusp.lordChain.subLord}
                </AppText>
              </Pressable>
            </FadeInView>
          ))}
          {!kp.cusps.length ? (
            <AppText tone="secondary">
              {getKpCalculationMessage(schoolCalculationStatus)}
            </AppText>
          ) : null}
        </View>
      </GlowCard>

      <GlowCard delay={220}>
        <AppText tone="secondary" variant="caption">
          KP SIGNIFICATOR MAP
        </AppText>
        <View className="mt-4 gap-2">
          {eventSignificators.map((item, index) => (
            <FadeInView delay={80 + index * 40} duration={320} key={item.planet}>
              <View style={styles.significatorNode}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <AppText variant="caption">
                      {item.planet} · {item.strength}
                    </AppText>
                    <AppText className="mt-1" tone="secondary" variant="caption">
                      {item.simpleMeaning}
                    </AppText>
                  </View>
                  <View style={styles.housePillRow}>
                    {item.signifiesHouses
                      .filter(house => selectedFocus.houses.includes(house))
                      .map(house => (
                        <View key={`${item.planet}-${house}`} style={styles.housePill}>
                          <AppText variant="caption">H{house}</AppText>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>
      </GlowCard>

      <GlowCard delay={260}>
        <AppText tone="secondary" variant="caption">
          KP SIGNIFICATORS
        </AppText>
        <View className="mt-4 gap-2">
          {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
            <View key={item.planet} style={styles.row}>
              <AppText variant="caption">
                {item.planet} · {item.strength}
              </AppText>
              <AppText tone="secondary" variant="caption">
                Houses {item.signifiesHouses.join(', ') || 'Not clear yet'}
              </AppText>
            </View>
          ))}
        </View>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {onAskKp ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onAskKp(askPrompt)}
              style={styles.cta}
            >
              <AppText variant="caption">Ask KP Predicta</AppText>
            </Pressable>
          ) : null}
          {onPremium ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPremium}
              style={styles.cta}
            >
              <AppText variant="caption">KP Premium Depth</AppText>
            </Pressable>
          ) : null}
        </View>
      </GlowCard>
    </View>
  );
}

type KpQuestionDraft = {
  guidance: string;
  label: string;
  prompt: string;
  refinedQuestion: string;
};

function buildKpQuestionDraft({
  customQuestion,
  focus,
  mode,
  presetQuestion,
}: {
  customQuestion: string;
  focus: (typeof KP_EVENT_FOCUS)[number];
  mode: KpQuestionMode;
  presetQuestion?: string;
}): KpQuestionDraft {
  if (mode === 'guide') {
    return {
      guidance:
        'Predicta will start with practical readiness: where to be patient, where to prepare, and which decisions need more real-world clarity.',
      label: 'Guide mode',
      prompt:
        `I do not have a specific KP question. Using KP only, guide me through ${focus.title} decision readiness in plain language. Do not overclaim certainty; give practical timing caution, preparation, and next steps.`,
      refinedQuestion:
        `I do not have a specific question. What should I understand about ${focus.title} decisions right now?`,
    };
  }

  if (mode === 'custom') {
    const raw = customQuestion.trim();
    const refined = refineKpCustomQuestion(raw, focus.title);

    return {
      guidance:
        raw.length < 18
          ? 'Your question is still broad, so Predicta will first refine it and then answer carefully.'
          : 'Predicta will keep your intent, make the question clearer, and answer without forcing false certainty.',
      label: raw.length < 18 ? 'Refined from broad question' : 'Refined question',
      prompt:
        `The user wrote: "${raw || 'I am not sure what to ask.'}" Refine this into a clear KP decision question first, then answer using KP only in plain language. Refined question: ${refined}`,
      refinedQuestion: refined,
    };
  }

  const question = presetQuestion ?? `What should I understand about ${focus.title} decisions right now?`;

  return {
    guidance:
      'This ready question is already written in normal language. Predicta will answer it as decision support, not as a scary prediction.',
    label: 'Ready question',
    prompt: `Using KP only, answer this practical user question in plain language: ${question}`,
    refinedQuestion: question,
  };
}

function refineKpCustomQuestion(rawQuestion: string, focusTitle: string): string {
  const question = rawQuestion.trim().replace(/\s+/g, ' ');

  if (!question) {
    return `What should I understand about ${focusTitle} decisions right now?`;
  }

  const lower = question.toLowerCase();
  const hasTiming = /\b(today|tomorrow|week|month|year|days|months|years|soon|next|by|before|after|when|202\d|203\d)\b/.test(lower);
  const hasDecisionWord = /\b(should|will|can|whether|if|move|change|buy|sell|marry|job|offer|exam|travel|relocation|property|money)\b/.test(lower);
  const suffix = hasTiming ? '' : ' over the next 3 to 6 months';
  const decisionPrefix = hasDecisionWord ? '' : 'Should I move forward, wait, or prepare around ';

  return `${decisionPrefix}${question}${suffix}?`.replace(/\?+$/, '?');
}

function PathStep({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.pathStep}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function getKpCalculationMessage(
  status: 'idle' | 'calculating' | 'error',
): string {
  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
}

function Metric({
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

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.34)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cta: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ctaInline: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,195,77,0.16)',
    borderColor: 'rgba(255,195,77,0.38)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  explainBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  activeEventCard: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.38)',
  },
  eventCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    minWidth: 142,
    padding: 12,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  modeButton: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 104,
    padding: 10,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 150,
    padding: 10,
    width: '48%',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  questionComposer: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  questionInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.primaryText,
    marginTop: 12,
    minHeight: 96,
    padding: 12,
    textAlignVertical: 'top',
  },
  refinedCard: {
    backgroundColor: 'rgba(77,175,255,0.08)',
    borderColor: 'rgba(77,175,255,0.24)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  handoffBox: {
    backgroundColor: 'rgba(116,125,255,0.12)',
    borderColor: 'rgba(116,125,255,0.34)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  housePill: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.32)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  housePillRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 132,
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  pathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  pathStep: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 132,
    padding: 12,
  },
  relevantRow: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.28)',
  },
  row: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  significatorNode: {
    backgroundColor: 'rgba(255,195,77,0.07)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
});

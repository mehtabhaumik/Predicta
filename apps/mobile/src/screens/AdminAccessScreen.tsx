import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AnimatedHeader, AppText, GlowButton, GlowCard, Screen } from '../components';
import { env } from '../config/env';
import type { AccessLevel, GuestPassCode, PassCodeType } from '../types/access';
import type { ReleaseReadinessReport, SafetyAuditEvent } from '../types/astrology';
import {
  loadReleaseReadiness,
  loadSafetyReports,
  reviewSafetyReport,
} from '../services/ai/safetyAuditService';
import { colors } from '../theme/colors';

const passTypes: PassCodeType[] = [
  'GUEST_TRIAL',
  'VIP_REVIEW',
  'INVESTOR_PASS',
  'FAMILY_PASS',
  'INTERNAL_TEST',
];

const accessLevels: Array<Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>> = [
  'GUEST',
  'VIP_GUEST',
  'FULL_ACCESS',
];

export function AdminAccessScreen(): React.JSX.Element {
  const [token, setToken] = useState('');
  const [passes, setPasses] = useState<GuestPassCode[]>([]);
  const [releaseReadiness, setReleaseReadiness] =
    useState<ReleaseReadinessReport>();
  const [safetyReports, setSafetyReports] = useState<SafetyAuditEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    'Enter the owner key to list or create guest passes.',
  );
  const [draft, setDraft] = useState({
    accessLevel: 'GUEST' as Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>,
    allowedEmails: '',
    code: '',
    codeId: '',
    label: '',
    maxRedemptions: '5',
    type: 'GUEST_TRIAL' as PassCodeType,
  });

  async function loadPasses() {
    await adminRequest('/access/admin/guest-passes', {
      onSuccess: payload => {
        const nextPasses = payload as GuestPassCode[];
        setPasses(nextPasses);
        setMessage(`${nextPasses.length} private passes loaded.`);
      },
    });
  }

  async function createPass() {
    const allowedEmails = parseAllowedEmails(draft.allowedEmails);

    if (!allowedEmails.length) {
      setMessage('Add the email address allowed to redeem this pass before creating it.');
      return;
    }

    await adminRequest('/access/admin/guest-passes', {
      body: {
        ...draft,
        allowedEmails,
        maxRedemptions: Number(draft.maxRedemptions) || 1,
      },
      method: 'POST',
      onSuccess: payload => {
        const created = payload as GuestPassCode;
        setPasses(current => [
          created,
          ...current.filter(item => item.codeId !== created.codeId),
        ]);
        setDraft(current => ({
          ...current,
          allowedEmails: '',
          code: '',
          codeId: '',
          label: '',
        }));
        setMessage(`${created.label} is ready to share.`);
      },
    });
  }

  async function revokePass(codeId: string) {
    await adminRequest(
      `/access/admin/guest-passes/${encodeURIComponent(codeId)}/revoke`,
      {
        body: { reason: 'Revoked from mobile admin console.' },
        method: 'POST',
        onSuccess: payload => {
          const revoked = payload as GuestPassCode;
          setPasses(current =>
            current.map(item =>
              item.codeId === revoked.codeId ? revoked : item,
            ),
          );
          setMessage(`${revoked.codeId} revoked.`);
        },
      },
    );
  }

  async function loadReports() {
    if (!token.trim()) {
      setMessage('Enter the owner key first.');
      return;
    }

    try {
      setBusy(true);
      const reports = await loadSafetyReports(token.trim());
      setSafetyReports(reports);
      setMessage(`${reports.length} safety reports loaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Safety reports could not be loaded.');
    } finally {
      setBusy(false);
    }
  }

  async function checkReadiness() {
    if (!token.trim()) {
      setMessage('Enter the owner key first.');
      return;
    }

    try {
      setBusy(true);
      const report = await loadReleaseReadiness(token.trim());
      setReleaseReadiness(report);
      setMessage(
        report.releaseStatus === 'READY'
          ? 'Predicta is clear to share.'
          : 'Predicta should not be shared yet.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Public sharing check could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateSafetyReport(
    eventId: string,
    reviewStatus: SafetyAuditEvent['reviewStatus'],
  ) {
    try {
      setBusy(true);
      const updated = await reviewSafetyReport(token.trim(), eventId, {
        reviewNote:
          reviewStatus === 'RESOLVED'
            ? 'Reviewed and resolved from owner console.'
            : 'Reviewed and dismissed from owner console.',
        reviewStatus,
        reviewedBy: 'owner-console',
      });
      setSafetyReports(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      setMessage(`${updated.id} marked ${updated.reviewStatus.toLowerCase()}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Safety report could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  async function adminRequest(
    path: string,
    options: {
      body?: unknown;
      method?: 'GET' | 'POST';
      onSuccess: (payload: unknown) => void;
    },
  ) {
    if (!token.trim()) {
      setMessage('Enter the owner key first.');
      return;
    }

    try {
      setBusy(true);
      const response = await fetch(`${env.astrologyApiUrl.replace(/\/$/, '')}${path}`, {
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          'x-pridicta-admin-token': token.trim(),
        },
        method: options.method ?? 'GET',
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'The pass request could not be completed.');
        return;
      }

      options.onSuccess(payload);
    } catch {
      setMessage('Passes could not be opened right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="OWNER TOOLS" title="Owner access" />

      <View className="mt-8 gap-4">
        <GlowCard delay={100}>
          <AppText variant="subtitle">Private guest-pass control</AppText>
          <AppText className="mt-2" tone="secondary">
            Create, revoke, list, and review guest pass codes from one owner
            space.
          </AppText>
          <AdminField
            label="Owner key"
            onChangeText={setToken}
            placeholder="Enter owner key"
            secureTextEntry
            value={token}
          />
          <AppText className="mt-4" tone="secondary" variant="caption">
            {message}
          </AppText>
          <View className="mt-5">
            <GlowButton
              disabled={busy || !token.trim()}
              label={busy ? 'Working...' : 'Load Passes'}
              loading={busy}
              onPress={loadPasses}
            />
          </View>
        </GlowCard>

        <GlowCard delay={180}>
          <AppText variant="subtitle">Issue a private invite</AppText>
          <AdminField
            label="Pass name"
            onChangeText={value =>
              setDraft(current => ({ ...current, codeId: value }))
            }
            placeholder="private-invite-name"
            value={draft.codeId}
          />
          <AdminField
            label="Private invite code"
            onChangeText={value =>
              setDraft(current => ({ ...current, code: value }))
            }
            placeholder="PREDICTA-VIP-XXXX"
            value={draft.code}
          />
          <AdminField
            label="Label"
            onChangeText={value =>
              setDraft(current => ({ ...current, label: value }))
            }
            placeholder="VIP beta pass"
            value={draft.label}
          />
          <AdminField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Allowed email"
            onChangeText={value =>
              setDraft(current => ({ ...current, allowedEmails: value }))
            }
            placeholder="friend@example.com"
            value={draft.allowedEmails}
          />
          <AdminField
            keyboardType="number-pad"
            label="Max redemptions"
            onChangeText={value =>
              setDraft(current => ({ ...current, maxRedemptions: value }))
            }
            placeholder="5"
            value={draft.maxRedemptions}
          />
          <OptionRow
            label="Pass type"
            options={passTypes}
            selected={draft.type}
            onSelect={type => setDraft(current => ({ ...current, type }))}
          />
          <OptionRow
            label="Access level"
            options={accessLevels}
            selected={draft.accessLevel}
            onSelect={accessLevel =>
              setDraft(current => ({ ...current, accessLevel }))
            }
          />
          <View className="mt-5">
            <GlowButton
              disabled={
                busy ||
                !token.trim() ||
                !draft.code.trim() ||
                !draft.codeId.trim() ||
                !draft.label.trim() ||
                !draft.allowedEmails.trim()
              }
              label="Create Secure Pass"
              onPress={createPass}
            />
          </View>
        </GlowCard>

        {passes.map(pass => (
          <GlowCard key={pass.codeId}>
            <AppText tone="secondary" variant="caption">
              {pass.type}
            </AppText>
            <AppText className="mt-2" variant="subtitle">
              {pass.label}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {pass.codeId} · {pass.accessLevel} ·{' '}
              {pass.redeemedByUserIds.length}/{pass.maxRedemptions} used ·{' '}
              {pass.isActive ? 'Active' : 'Revoked'}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              Allowed email: {pass.allowedEmails.join(', ')}
            </AppText>
            <View className="mt-5">
              <GlowButton
                disabled={busy || !pass.isActive}
                label={pass.isActive ? 'Revoke Pass' : 'Already Revoked'}
                onPress={() => revokePass(pass.codeId)}
              />
            </View>
          </GlowCard>
        ))}

        <GlowCard>
          <AppText variant="subtitle">Public sharing check</AppText>
          <AppText className="mt-2" tone="secondary">
            Confirm Predicta is calm, responsible, and ready before it is
            shared more widely.
          </AppText>
          <View className="mt-5">
            <GlowButton
              disabled={busy || !token.trim()}
              label="Check Readiness"
              onPress={checkReadiness}
            />
          </View>
          {releaseReadiness ? (
            <View className="mt-5 gap-2">
              <AppText variant="subtitle">
                {releaseReadiness.releaseStatus === 'READY'
                  ? 'Clear to share'
                  : 'Needs attention'}
              </AppText>
              {releaseReadiness.checks.map(check => (
                <AppText key={check.name} tone="secondary" variant="caption">
                  {check.status === 'PASS' ? 'Passed' : 'Needs attention'}:{' '}
                  {friendlyReadinessName(check.name)}
                </AppText>
              ))}
            </View>
          ) : null}
        </GlowCard>

        <GlowCard>
          <AppText variant="subtitle">Safety review queue</AppText>
          <AppText className="mt-2" tone="secondary">
            Review user reports and safety-triggered answers without storing
            private birth details or full chat text.
          </AppText>
          <View className="mt-5">
            <GlowButton
              disabled={busy || !token.trim()}
              label="Load Safety Reports"
              onPress={loadReports}
            />
          </View>
        </GlowCard>

        {safetyReports.map(report => (
          <GlowCard key={report.id}>
            <AppText tone="secondary" variant="caption">
              {report.reportKind}
            </AppText>
            <AppText className="mt-2" variant="subtitle">
              {report.reviewStatus}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {report.createdAt}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {report.safetyCategories.join(', ') || 'No category label'}
            </AppText>
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <GlowButton
                  disabled={busy || report.reviewStatus === 'RESOLVED'}
                  label="Resolve"
                  onPress={() => updateSafetyReport(report.id, 'RESOLVED')}
                />
              </View>
              <View className="flex-1">
                <GlowButton
                  disabled={busy || report.reviewStatus === 'DISMISSED'}
                  label="Dismiss"
                  onPress={() => updateSafetyReport(report.id, 'DISMISSED')}
                />
              </View>
            </View>
          </GlowCard>
        ))}
      </View>
    </Screen>
  );
}

function parseAllowedEmails(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map(email => email.trim().toLowerCase())
        .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  );
}

function friendlyReadinessName(name: string): string {
  const copy: Record<string, string> = {
    'Model and prompt pins': 'Answer style is set',
    'Prompt safety contract': 'Safety promise is present',
    'Red-team evals': 'Difficult-question practice passed',
  };

  return copy[name] ?? name;
}

function AdminField({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
}): React.JSX.Element {
  return (
    <View className="mt-4">
      <AppText className="mb-2" tone="secondary" variant="caption">
        {label}
      </AppText>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        className="rounded-2xl border border-[#252533] bg-app-card p-4 text-base text-text-primary"
        placeholderTextColor={colors.secondaryText}
        {...props}
      />
    </View>
  );
}

function OptionRow<T extends string>({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (option: T) => void;
  options: readonly T[];
  selected: T;
}): React.JSX.Element {
  return (
    <View className="mt-4">
      <AppText className="mb-2" tone="secondary" variant="caption">
        {label}
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {options.map(option => (
          <Pressable
            accessibilityRole="button"
            className={`rounded-full border px-3 py-2 ${
              option === selected
                ? 'border-[#4DAFFF] bg-[#172233]'
                : 'border-[#252533] bg-[#191923]'
            }`}
            key={option}
            onPress={() => onSelect(option)}
          >
            <AppText variant="caption">{option}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

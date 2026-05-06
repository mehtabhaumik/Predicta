import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AnimatedHeader, AppText, GlowButton, GlowCard, Screen } from '../components';
import { env } from '../config/env';
import type { AccessLevel, GuestPassCode, PassCodeType } from '../types/access';
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    'Enter the backend admin token to list or create guest passes.',
  );
  const [draft, setDraft] = useState({
    accessLevel: 'GUEST' as Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>,
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
        setMessage(`${nextPasses.length} backend-managed passes loaded.`);
      },
    });
  }

  async function createPass() {
    await adminRequest('/access/admin/guest-passes', {
      body: {
        ...draft,
        maxRedemptions: Number(draft.maxRedemptions) || 1,
      },
      method: 'POST',
      onSuccess: payload => {
        const created = payload as GuestPassCode;
        setPasses(current => [
          created,
          ...current.filter(item => item.codeId !== created.codeId),
        ]);
        setDraft(current => ({ ...current, code: '', codeId: '', label: '' }));
        setMessage(`${created.label} created by backend authority.`);
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

  async function adminRequest(
    path: string,
    options: {
      body?: unknown;
      method?: 'GET' | 'POST';
      onSuccess: (payload: unknown) => void;
    },
  ) {
    if (!token.trim()) {
      setMessage('Enter the backend admin token first.');
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
        setMessage(payload.detail ?? 'Admin backend rejected the request.');
        return;
      }

      options.onSuccess(payload);
    } catch {
      setMessage('Backend admin authority is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="OWNER TOOLS" title="Admin access" />

      <View className="mt-8 gap-4">
        <GlowCard delay={100}>
          <AppText variant="subtitle">Backend guest-pass console</AppText>
          <AppText className="mt-2" tone="secondary">
            Create, revoke, list, and inspect guest pass codes through the same
            backend authority used by web.
          </AppText>
          <AdminField
            label="Admin token"
            onChangeText={setToken}
            placeholder="PRIDICTA_ADMIN_API_TOKEN"
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
            label="Code ID"
            onChangeText={value =>
              setDraft(current => ({ ...current, codeId: value }))
            }
            placeholder="vip-beta-2026"
            value={draft.codeId}
          />
          <AdminField
            label="Private raw code"
            onChangeText={value =>
              setDraft(current => ({ ...current, code: value }))
            }
            placeholder="PRIDICTA-VIP-XXXX"
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
                !draft.label.trim()
              }
              label="Create Backend Pass"
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
            <View className="mt-5">
              <GlowButton
                disabled={busy || !pass.isActive}
                label={pass.isActive ? 'Revoke Pass' : 'Already Revoked'}
                onPress={() => revokePass(pass.codeId)}
              />
            </View>
          </GlowCard>
        ))}
      </View>
    </Screen>
  );
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

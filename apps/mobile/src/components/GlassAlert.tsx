import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type GlassAlertAction = {
  label: string;
  onPress?: () => void;
};

type GlassAlertState = {
  actions?: GlassAlertAction[];
  message: string;
  title: string;
};

export function useGlassAlert(): {
  showGlassAlert: (state: GlassAlertState) => void;
  glassAlert: React.JSX.Element;
} {
  const [state, setState] = useState<GlassAlertState | null>(null);

  function close(action?: GlassAlertAction) {
    setState(null);
    action?.onPress?.();
  }

  return {
    glassAlert: (
      <Modal
        animationType="fade"
        onRequestClose={() => setState(null)}
        transparent
        visible={Boolean(state)}
      >
        <Pressable style={styles.backdrop} onPress={() => setState(null)}>
          <Pressable style={styles.dialog} onPress={() => undefined}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.045)']}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
            <AppText variant="subtitle">{state?.title}</AppText>
            <AppText style={styles.message} tone="secondary">
              {state?.message}
            </AppText>
            <View style={styles.actions}>
              {(state?.actions?.length
                ? state.actions
                : [{ label: 'Done' }]
              ).map(action => (
                <GlowButton
                  key={action.label}
                  label={action.label}
                  onPress={() => close(action)}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setState(null)}
              style={styles.closeButton}
            >
              <AppText tone="secondary" variant="caption">
                Close
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    ),
    showGlassAlert: setState,
  };
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 24,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(4,4,8,0.78)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  dialog: {
    backgroundColor: colors.glassStrong,
    borderColor: colors.borderSoft,
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 420,
    overflow: 'hidden',
    padding: 26,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 34,
    width: '100%',
  },
  message: {
    marginTop: 12,
  },
});

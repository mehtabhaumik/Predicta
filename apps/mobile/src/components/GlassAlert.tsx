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
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
            <AppText variant="subtitle">{state?.title}</AppText>
            <AppText className="mt-3" tone="secondary">
              {state?.message}
            </AppText>
            <View className="mt-6 gap-3">
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
              className="mt-4 items-center"
              onPress={() => setState(null)}
            >
              <AppText tone="secondary" variant="caption">
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    ),
    showGlassAlert: setState,
  };
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(4,4,8,0.74)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: 'rgba(18,18,26,0.9)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 420,
    overflow: 'hidden',
    padding: 24,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    width: '100%',
  },
});

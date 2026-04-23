import { Platform } from 'react-native';
import Sound from 'react-native-sound';

const replyChime = require('../../assets/audio/pridicta-reply-chime.wav');

type SoundInstance = {
  play: (callback?: () => void) => void;
  release: () => void;
  setVolume: (volume: number) => void;
};

type SoundConstructor = {
  new (
    filename: number | string,
    callback?: (error?: unknown) => void,
  ): SoundInstance;
  setCategory?: (category: string) => void;
};

const SoundPlayer = Sound as unknown as SoundConstructor | undefined;

function configureSoundCategory() {
  try {
    SoundPlayer?.setCategory?.(Platform.OS === 'ios' ? 'Ambient' : 'Playback');
  } catch {
    // Sound is optional polish. It must never affect chat reliability.
  }
}

export function playReplyChime(enabled: boolean): void {
  if (!enabled || typeof SoundPlayer !== 'function') {
    return;
  }

  try {
    configureSoundCategory();

    const sound = new SoundPlayer(replyChime, error => {
      if (error) {
        return;
      }

      try {
        sound.setVolume(0.22);
        sound.play(() => {
          sound.release();
        });
      } catch {
        sound.release();
      }
    });
  } catch {
    // Ignore audio setup/playback failures so the answer can still render.
  }
}

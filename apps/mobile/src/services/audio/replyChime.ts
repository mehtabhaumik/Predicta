import { Platform } from 'react-native';
import Sound from 'react-native-sound';

const replyChime = require('../../assets/audio/pridicta-reply-chime.wav');

Sound.setCategory(Platform.OS === 'ios' ? 'Ambient' : 'Playback');

export function playReplyChime(enabled: boolean): void {
  if (!enabled) {
    return;
  }

  const sound = new Sound(replyChime, error => {
    if (error) {
      return;
    }

    sound.setVolume(0.22);
    sound.play(() => {
      sound.release();
    });
  });
}

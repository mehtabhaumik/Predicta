import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';
import { getJaiminiLocalizationCopy } from '@pridicta/config';

export default function JaiminiPredictaChatPage(): React.JSX.Element {
  const copy = getJaiminiLocalizationCopy('en');

  return (
    <WebPredictaRoomChatPage
      room={{
        body: copy.chatBody,
        prompt: copy.chatPrompt,
        school: 'JAIMINI',
        sourceScreen: copy.heroEyebrow,
        title: copy.chatTitle,
      }}
    />
  );
}

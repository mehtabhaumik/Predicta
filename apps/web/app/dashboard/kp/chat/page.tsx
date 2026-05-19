import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function KpPredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'KP Predicta keeps the reading inside cusps, star lords, sub lords, ruling planets, significators, and event timing.',
        prompt:
          'Use KP Predicta for my question. Keep the answer grounded in cusps, star lords, sub lords, significators, ruling planets, and KP timing.',
        school: 'KP',
        sourceScreen: 'KP Predicta',
        title: 'Chat with KP Predicta.',
      }}
    />
  );
}

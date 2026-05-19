import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function NadiPredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'Nadi Predicta reads planet-to-planet story links, karmic themes, and validation questions from the calculated chart.',
        prompt:
          'Use Nadi Predicta for my question. Read planet-to-planet story links, karmic themes, and validation questions from my calculated chart.',
        school: 'NADI',
        sourceScreen: 'Nadi Predicta',
        title: 'Chat with Nadi Predicta.',
      }}
    />
  );
}

import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function NumerologyPredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'Numerology Predicta uses name number, birth number, destiny number, personal timing, and name rhythm before synthesis.',
        prompt:
          'Read my numerology profile from name number, birth number, destiny number, personal timing, and name rhythm.',
        school: 'NUMEROLOGY',
        sourceScreen: 'Numerology Predicta',
        title: 'Chat with Numerology Predicta.',
      }}
    />
  );
}

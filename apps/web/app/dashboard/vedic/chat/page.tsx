import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function VedicPredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'Default Vedic Predicta uses D1, varga support, dasha, gochar, remedies, and holistic context without mixing KP or Nadi methods.',
        prompt:
          'Read my Vedic chart using D1, varga support, dasha, gochar, remedies, and current life timing.',
        school: 'PARASHARI',
        sourceScreen: 'Vedic Predicta',
        title: 'Chat with Vedic Predicta.',
      }}
    />
  );
}

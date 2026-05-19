import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function SignaturePredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'Signature Predicta uses confirmed visible traits for reflective guidance, improvement suggestions, and optional Numerology synthesis.',
        prompt:
          'Open Signature Predicta. Explain what signature shape, pressure, spacing, baseline, size, and rhythm can suggest. Keep it private, safe, and reflective.',
        school: 'SIGNATURE',
        sourceScreen: 'Signature Predicta',
        title: 'Chat with Signature Predicta.',
      }}
    />
  );
}

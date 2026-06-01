import { WebPredictaRoomChatPage } from '../../../../components/WebPredictaRoomChatPage';

export default function JaiminiPredictaChatPage(): React.JSX.Element {
  return (
    <WebPredictaRoomChatPage
      room={{
        body:
          'Jaimini Predicta keeps the reading inside soul role, visible identity, career dharma, relationship mirror, and destiny chapters.',
        prompt:
          'Use Jaimini Predicta for my question. Focus on Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Arudha, Upapada, and Chara Dasha only when calculated evidence is available.',
        school: 'JAIMINI',
        sourceScreen: 'Jaimini Predicta',
        title: 'Chat with Jaimini Predicta.',
      }}
    />
  );
}

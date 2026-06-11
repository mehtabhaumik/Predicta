import { Suspense } from 'react';
import {
  WebPridictaChat,
  type WebPredictaChatRoom,
} from './WebPridictaChat';
import { AskPredictaLoadingCard } from './AskPredictaLightShell';

export function WebPredictaRoomChatPage({
  room,
}: {
  room: WebPredictaChatRoom;
}): React.JSX.Element {
  return (
    <section
      aria-label={`${room.sourceScreen}: ${room.title}`}
      className="dashboard-page predicta-chat-page"
      data-room-school={room.school.toLowerCase()}
    >
      <div className="sr-only">
        <span>{room.sourceScreen}</span>
        <span>{room.title}</span>
        <span>{room.body}</span>
      </div>
      <Suspense fallback={<AskPredictaLoadingCard />}>
        <WebPridictaChat room={room} />
      </Suspense>
    </section>
  );
}

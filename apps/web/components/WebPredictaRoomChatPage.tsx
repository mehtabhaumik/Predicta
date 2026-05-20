import { Suspense } from 'react';
import {
  WebPridictaChat,
  type WebPredictaChatRoom,
} from './WebPridictaChat';

export function WebPredictaRoomChatPage({
  room,
}: {
  room: WebPredictaChatRoom;
}): React.JSX.Element {
  return (
    <section
      aria-label={`${room.sourceScreen}: ${room.title}`}
      className="dashboard-page predicta-chat-page"
    >
      <div className="sr-only">
        <span>{room.sourceScreen}</span>
        <span>{room.title}</span>
        <span>{room.body}</span>
      </div>
      <Suspense fallback={<div className="card chat-panel predicta-chat-loading" />}>
        <WebPridictaChat room={room} />
      </Suspense>
    </section>
  );
}

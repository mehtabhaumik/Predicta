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
    <section className="dashboard-page">
      <div className="page-heading compact predicta-room-chat-heading">
        <p className="section-title">{room.sourceScreen}</p>
        <h1 className="gradient-text">{room.title}</h1>
        <p>{room.body}</p>
      </div>

      <Suspense fallback={<div className="card chat-panel" />}>
        <WebPridictaChat room={room} />
      </Suspense>
    </section>
  );
}

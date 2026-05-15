'use client';

const WEB_CHAT_MEMORY_KEY = 'predicta.webChatMemory.v4';

export type WebChatTranscriptMessage = {
  role: 'user' | 'pridicta';
  text: string;
};

type StoredWebChatMessage = {
  role?: string;
  text?: string;
};

type StoredWebChatMemory = {
  messages?: StoredWebChatMessage[];
};

export function loadWebChatTranscript(): WebChatTranscriptMessage[] {
  try {
    const raw = window.localStorage.getItem(WEB_CHAT_MEMORY_KEY);
    const memory = raw ? (JSON.parse(raw) as StoredWebChatMemory) : undefined;

    return Array.isArray(memory?.messages)
      ? memory.messages
          .filter(
            (message): message is WebChatTranscriptMessage =>
              (message.role === 'user' || message.role === 'pridicta') &&
              typeof message.text === 'string' &&
              message.text.trim().length > 0,
          )
          .map(message => ({
            role: message.role,
            text: sanitizeTranscriptCopy(message.text),
          }))
      : [];
  } catch {
    return [];
  }
}

export function formatWebChatTranscript(
  messages: WebChatTranscriptMessage[],
): string {
  if (!messages.length) {
    return 'No Predicta chat has been saved in this browser yet.';
  }

  return messages
    .map(message => {
      const speaker = message.role === 'user' ? 'You' : 'Predicta';

      return `${speaker}\n${message.text.trim()}`;
    })
    .join('\n\n---\n\n');
}

export function openPrintableWebChatTranscript(): void {
  const messages = loadWebChatTranscript();
  const printable = buildPrintableChatHtml(messages);
  const popup = window.open('', '_blank');

  if (!popup) {
    const blob = new Blob([printable], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `predicta-chat-${new Date().toISOString().slice(0, 10)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  popup.document.open();
  popup.document.write(printable);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => {
    popup.print();
  }, 350);
}

export function sanitizeTranscriptCopy(text: string): string {
  return text
    .replace(/Dashboard Header context loaded hai\./g, 'I picked this up from your dashboard.')
    .replace(/Dashboard Header context loaded\./g, 'I picked this up from your dashboard.')
    .replace(/Focus: Help me from my active Kundli\./g, 'We are looking at: Help me from my selected Kundli.')
    .replace(/\bactive Kundli\b/g, 'selected Kundli')
    .replace(/\bactive chart\b/g, 'selected chart')
    .replace(/\bcontext loaded\b/gi, 'ready');
}

function buildPrintableChatHtml(messages: WebChatTranscriptMessage[]): string {
  const generatedAt = new Date().toLocaleString();
  const body = messages.length
    ? messages
        .map(message => {
          const speaker = message.role === 'user' ? 'You' : 'Predicta';
          return `
            <article class="turn ${message.role}">
              <span>${escapeHtml(speaker)}</span>
              ${sanitizeTranscriptCopy(message.text)
                .split(/\n{2,}/)
                .map(part => `<p>${escapeHtml(part.trim())}</p>`)
                .join('')}
            </article>
          `;
        })
        .join('')
    : '<article class="turn"><p>No Predicta chat has been saved in this browser yet.</p></article>';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Predicta Chat</title>
        <style>
          * { box-sizing: border-box; }
          body {
            background: #0a0a10;
            color: #ffffff;
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 42px;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .cover {
            background:
              radial-gradient(circle at 18% 12%, rgba(123,97,255,0.38), transparent 34%),
              radial-gradient(circle at 88% 18%, rgba(77,175,255,0.22), transparent 34%),
              linear-gradient(145deg, #151522, #09090f 72%);
            border: 1px solid rgba(123,97,255,0.45);
            border-radius: 24px;
            margin-bottom: 22px;
            min-height: 42vh;
            padding: 36px;
          }
          .brand-row {
            align-items: center;
            display: flex;
            gap: 18px;
            justify-content: space-between;
            margin-bottom: 48px;
          }
          .brand {
            background: linear-gradient(100deg, #ffffff, #4dafff 54%, #ff4da6);
            -webkit-background-clip: text;
            color: transparent;
            font-size: 28px;
            font-weight: 950;
            letter-spacing: 0.14em;
          }
          .tagline {
            color: rgba(255,255,255,0.7);
            font-size: 13px;
            font-weight: 750;
            text-align: right;
          }
          .eyebrow {
            color: rgba(255,255,255,0.64);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          h1 {
            color: #ffffff;
            font-size: 46px;
            line-height: 1.02;
            margin: 10px 0 12px;
            max-width: 760px;
          }
          .cover p {
            color: rgba(255,255,255,0.74);
            max-width: 760px;
          }
          .turn {
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 16px;
            break-inside: avoid;
            margin: 14px 0;
            padding: 20px;
          }
          .turn.pridicta {
            background: linear-gradient(145deg, rgba(37,32,70,0.92), rgba(19,26,42,0.92));
          }
          .turn.user {
            background: rgba(255,255,255,0.07);
            margin-left: 42px;
          }
          .turn span {
            color: rgba(255,255,255,0.62);
            display: block;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.1em;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          p {
            color: rgba(255,255,255,0.78);
            font-size: 15px;
            line-height: 1.65;
            margin: 0 0 10px;
            white-space: pre-wrap;
          }
          p:last-child { margin-bottom: 0; }
          .safety-footer {
            border-top: 1px solid rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.66);
            font-size: 12px;
            line-height: 1.55;
            margin-top: 28px;
            padding-top: 16px;
          }
          @page { margin: 22mm; }
          @media print {
            body { padding: 0; }
            .turn.user { margin-left: 28px; }
          }
        </style>
      </head>
      <body>
        <section class="cover">
          <div class="brand-row">
            <div class="brand">PREDICTA</div>
            <div class="tagline">Create your Kundli. Understand your life. Ask with proof.</div>
          </div>
          <div class="eyebrow">Predicta chat export</div>
          <h1>Conversation with Predicta</h1>
          <p>Prepared ${escapeHtml(generatedAt)}. A polished copy of the conversation, preserving the question, answer, and guidance flow.</p>
        </section>
        ${body}
        <section class="safety-footer">
          Predicta is for reflection and planning. It does not replace medical, legal, financial, emergency, or mental-health professionals. No prediction is guaranteed; use real-world judgment for important decisions.
        </section>
      </body>
    </html>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

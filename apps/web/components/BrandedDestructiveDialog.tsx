'use client';

import { useEffect } from 'react';

type BrandedDestructiveDialogProps = {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  consequence?: string;
  eyebrow: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function BrandedDestructiveDialog({
  body,
  cancelLabel,
  confirmLabel,
  consequence,
  eyebrow,
  onCancel,
  onConfirm,
  open,
  title,
}: BrandedDestructiveDialogProps): React.JSX.Element | null {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="destructive-dialog-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      role="dialog"
    >
      <section
        aria-describedby="destructive-dialog-body"
        aria-labelledby="destructive-dialog-title"
        className="destructive-dialog glass-panel"
      >
        <div className="destructive-dialog-mark" aria-hidden>
          !
        </div>
        <div className="section-title">{eyebrow}</div>
        <h2 id="destructive-dialog-title">{title}</h2>
        <p id="destructive-dialog-body">{body}</p>
        {consequence ? (
          <div className="destructive-dialog-note">{consequence}</div>
        ) : null}
        <div className="destructive-dialog-actions">
          <button className="button secondary" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className="button danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

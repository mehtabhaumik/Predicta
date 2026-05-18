'use client';

import { useRef } from 'react';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';

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
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap(dialogRef, {
    active: open,
    initialFocusRef: cancelButtonRef,
    onClose: onCancel,
  });

  if (!open) {
    return null;
  }

  return (
    <div
      className="destructive-dialog-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        aria-describedby="destructive-dialog-body"
        aria-labelledby="destructive-dialog-title"
        aria-modal="true"
        className="destructive-dialog glass-panel"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
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
          <button
            className="button secondary"
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
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

'use client';

import { useEffect, useRef, useState } from 'react';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';

type BrandedDestructiveDialogProps = {
  body: string;
  cancelLabel: string;
  confirmationHint?: string;
  confirmationLabel?: string;
  confirmationPhrase?: string;
  confirmationPlaceholder?: string;
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
  confirmationHint,
  confirmationLabel,
  confirmationPhrase,
  confirmationPlaceholder,
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
  const [confirmationValue, setConfirmationValue] = useState('');

  useDialogFocusTrap(dialogRef, {
    active: open,
    initialFocusRef: cancelButtonRef,
    onClose: onCancel,
  });

  useEffect(() => {
    if (!open) {
      setConfirmationValue('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const requiresConfirmation = Boolean(confirmationPhrase);
  const confirmationMatched =
    !requiresConfirmation ||
    confirmationValue.trim() === confirmationPhrase?.trim();

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
        {requiresConfirmation ? (
          <label className="destructive-dialog-confirmation">
            <span>{confirmationLabel}</span>
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={event => setConfirmationValue(event.target.value)}
              placeholder={confirmationPlaceholder}
              spellCheck={false}
              type="text"
              value={confirmationValue}
            />
            {confirmationHint ? (
              <small>{confirmationHint}</small>
            ) : null}
          </label>
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
          <button
            className="button danger"
            disabled={!confirmationMatched}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

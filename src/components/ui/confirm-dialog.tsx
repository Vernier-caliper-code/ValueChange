'use client';

import { Modal } from './modal';
import { buttonStyles } from './button';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认删除',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title" describedBy="confirm-description">
      <h2 id="confirm-title" className="text-[18px] font-bold">
        {title}
      </h2>
      <p id="confirm-description" className="mt-3 text-[14px] leading-[1.9] text-muted">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" data-modal-close onClick={onCancel} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className={buttonStyles({ variant: 'danger', size: 'sm' })}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

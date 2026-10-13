import Modal from './Modal';
import Spinner from './Spinner';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  confirmClass = 'btn-danger',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-ghost" disabled={loading}>
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className={confirmClass}
        disabled={loading}
        aria-busy={loading}
      >
        {loading && <Spinner size="sm" />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;

'use client'

export default function ConfirmModal({
  message,
  confirmLabel = 'Smazat',
  onConfirm,
  onCancel,
}: {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-6"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm mb-5" style={{ color: 'var(--text)' }}>{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary flex-1"
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

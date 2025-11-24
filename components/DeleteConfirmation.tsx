interface DeleteConfirmationProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmation({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-instant"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 animate-scale-in"
        style={{
          backdropFilter: 'blur(30px)',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Alert Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}
          >
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Delete this {itemName.toLowerCase()}?
        </h2>

        <p className="text-white/70 text-sm text-center mb-6">
          This cannot be undone
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl font-medium text-white transition-all active:scale-95"
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-2xl font-bold text-white transition-all active:scale-95"
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

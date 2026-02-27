import { useState } from 'react';
import { useSeasonFeesAdmin } from '@/hooks/useSeasonFeesAdmin';
import FeeFormModal from '@/components/admin/FeeFormModal';
import { Loader2, Plus, Pencil, Trash2, Power } from 'lucide-react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function FeeToggle({ isOn, color, saving, onToggle, label }) {
  const colorMap = {
    green: {
      active: 'bg-green-500 shadow-green-500/30',
      dot: 'text-green-500',
    },
    blue: {
      active: 'bg-blue-500 shadow-blue-500/30',
      dot: 'text-blue-500',
    },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <button
      onClick={onToggle}
      disabled={saving}
      title={label}
      className={`relative w-8 h-4.5 rounded-full transition-all duration-300 ${
        isOn ? `${c.active} shadow-sm` : 'bg-stone-300'
      } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      <div
        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center ${
          isOn ? 'left-4' : 'left-0.5'
        }`}
      >
        <Power className={`w-2 h-2 ${isOn ? c.dot : 'text-stone-400'}`} />
      </div>
    </button>
  );
}

export default function SeasonFeesList({ seasonId }) {
  const { fees, loading, createFee, updateFee, deleteFee } = useSeasonFeesAdmin(seasonId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savingToggles, setSavingToggles] = useState({});

  const handleAdd = () => {
    setEditingFee(null);
    setModalOpen(true);
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingFee) {
      await updateFee(editingFee.id, formData);
    } else {
      await createFee(formData);
    }
    setModalOpen(false);
    setEditingFee(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteFee(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleToggle = async (fee, field) => {
    const key = `${fee.id}-${field}`;
    setSavingToggles((prev) => ({ ...prev, [key]: true }));
    try {
      await updateFee(fee.id, { [field]: !fee[field] });
    } finally {
      setSavingToggles((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fees.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-4">
          No fees configured for this season
        </p>
      ) : (
        <div className="space-y-2">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-stone-900 truncate">{fee.name}</p>
                  <span className="text-sm font-mono text-stone-600 shrink-0">
                    {formatCurrency(fee.amount)}
                  </span>
                </div>
                {fee.description && (
                  <p className="text-[11px] text-stone-500 truncate">{fee.description}</p>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-500">Active</span>
                  <FeeToggle
                    isOn={fee.is_active}
                    color="green"
                    saving={!!savingToggles[`${fee.id}-isActive`]}
                    onToggle={() => handleToggle(fee, 'isActive')}
                    label="Toggle active"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-500">Public</span>
                  <FeeToggle
                    isOn={fee.is_public}
                    color="blue"
                    saving={!!savingToggles[`${fee.id}-isPublic`]}
                    onToggle={() => handleToggle(fee, 'isPublic')}
                    label="Toggle public"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(fee)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                  title="Edit fee"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(fee)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete fee"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Fee Button */}
      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-tne-red transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Fee
      </button>

      {/* Fee Form Modal */}
      <FeeFormModal
        isOpen={modalOpen}
        fee={editingFee}
        seasonId={seasonId}
        onClose={() => {
          setModalOpen(false);
          setEditingFee(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Delete Fee?
            </h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete Fee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

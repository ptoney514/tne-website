import { useState } from 'react';
import { useSeasons } from '@/hooks/useSeasons';
import { useSeason } from '@/contexts/SeasonContext';
import SeasonFormModal from '@/components/admin/SeasonFormModal';
import {
  Plus,
  Loader2,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

function StatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-stone-100 text-stone-500'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function formatDateRange(startDate, endDate) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', opts);
  const end = new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', opts);
  return `${start} – ${end}`;
}

export default function AdminSeasonsSettingsPage() {
  const {
    seasons,
    loading,
    error,
    createSeason,
    updateSeason,
    deleteSeason,
    toggleActive,
  } = useSeasons();
  const { refetch: refetchSeasonContext } = useSeason();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingSeason(null);
    setModalOpen(true);
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingSeason) {
      await updateSeason(editingSeason.id, formData);
    } else {
      await createSeason(formData);
    }
    await refetchSeasonContext();
    setModalOpen(false);
    setEditingSeason(null);
  };

  const handleDelete = (season) => {
    setDeleteConfirm(season);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteSeason(deleteConfirm.id);
      await refetchSeasonContext();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting season:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (season) => {
    try {
      await toggleActive(season.id, !season.is_active);
      await refetchSeasonContext();
    } catch (err) {
      console.error('Error toggling season:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Seasons</h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage seasons and control which appear in the public teams dropdown
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Season
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        {error && (
          <div className="m-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Failed to load seasons: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        ) : seasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-12 h-12 text-stone-300 mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No seasons yet</h3>
            <p className="text-stone-500 mb-6">Create your first season to get started</p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Season
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr
                  key={season.id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{season.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600">
                    {formatDateRange(season.start_date, season.end_date)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={season.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(season)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        title={season.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {season.is_active ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(season)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(season)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {seasons.length > 0 && (
        <div className="bg-white border-t border-stone-200 px-4 py-2">
          <p className="text-sm text-stone-500">
            {seasons.length} season{seasons.length !== 1 ? 's' : ''}
            {' • '}
            {seasons.filter((s) => s.is_active).length} active
          </p>
        </div>
      )}

      {/* Form Modal */}
      <SeasonFormModal
        isOpen={modalOpen}
        season={editingSeason}
        onClose={() => {
          setModalOpen(false);
          setEditingSeason(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Delete Season?
            </h3>
            <p className="text-stone-600 mb-2">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will also delete all teams associated with this season. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete Season
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

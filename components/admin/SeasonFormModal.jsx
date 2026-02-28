import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function SeasonFormModal({ isOpen, season, onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const isEditing = !!season;

  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name || '',
        start_date: season.start_date || '',
        end_date: season.end_date || '',
        is_active: season.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setError(null);
  }, [season, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Season name is required');
      }
      if (!formData.start_date) {
        throw new Error('Start date is required');
      }
      if (!formData.end_date) {
        throw new Error('End date is required');
      }
      if (formData.end_date <= formData.start_date) {
        throw new Error('End date must be after start date');
      }

      await onSave(formData);
    } catch (err) {
      console.error('Error saving season:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[14px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <h2 className="text-base font-bold text-admin-text">
            {isEditing ? 'Edit Season' : 'Create Season'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Season Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Winter 2025"
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text placeholder-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text">Active</p>
              <p className="text-xs text-admin-text-secondary">Active seasons appear in the public teams dropdown</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_active}
              onClick={() => handleChange('is_active', !formData.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_active ? 'bg-admin-red' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-admin-red hover:opacity-85 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Season'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

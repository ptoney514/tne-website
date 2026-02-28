import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function FeeFormModal({ isOpen, fee, seasonId, onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    displayOrder: 0,
    isActive: true,
    isPublic: true,
    paymentEnabled: false,
  });

  const isEditing = !!fee;

  useEffect(() => {
    if (fee) {
      setFormData({
        name: fee.name || '',
        description: fee.description || '',
        amount: fee.amount ?? '',
        displayOrder: fee.display_order ?? 0,
        isActive: fee.is_active ?? true,
        isPublic: fee.is_public ?? true,
        paymentEnabled: fee.payment_enabled ?? false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        amount: '',
        displayOrder: 0,
        isActive: true,
        isPublic: true,
        paymentEnabled: false,
      });
    }
    setError(null);
  }, [fee, isOpen]);

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
        throw new Error('Fee name is required');
      }
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        amount,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        paymentEnabled: formData.paymentEnabled,
      });
    } catch (err) {
      console.error('Error saving fee:', err);
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
            {isEditing ? 'Edit Fee' : 'Add Fee'}
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
              Fee Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Boys Fall (3rd-8th)"
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text placeholder-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g. Fall season registration"
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text placeholder-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-admin-card-border text-admin-text placeholder-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            />
            <p className="text-xs text-admin-text-secondary mt-1">Lower numbers appear first</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text">Active</p>
              <p className="text-xs text-admin-text-secondary">Inactive fees are hidden from all views</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() => handleChange('isActive', !formData.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-admin-red' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text">Public</p>
              <p className="text-xs text-admin-text-secondary">Public fees are visible on the payments page</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isPublic}
              onClick={() => handleChange('isPublic', !formData.isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublic ? 'bg-admin-red' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Payment Enabled Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text">Payment Enabled</p>
              <p className="text-xs text-admin-text-secondary">Allow online payment for this fee</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.paymentEnabled}
              onClick={() => handleChange('paymentEnabled', !formData.paymentEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.paymentEnabled ? 'bg-admin-red' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.paymentEnabled ? 'translate-x-6' : 'translate-x-1'
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
              {isEditing ? 'Save Changes' : 'Add Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useVenues } from '../hooks/useVenues';
import AdminNavbar from '../components/AdminNavbar';
import {
  Building2,
  Plus,
  X,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  Globe,
  ParkingCircle,
  Plane,
} from 'lucide-react';

// Venue Modal for Create/Edit
function VenueModal({ isOpen, onClose, venue, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    venue || {
      name: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      website_url: '',
      image_url: '',
      parking_info: '',
      court_count: '',
      latitude: '',
      longitude: '',
      airport_name: '',
      airport_distance_miles: '',
    }
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...formData,
      court_count: formData.court_count ? parseInt(formData.court_count) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      airport_distance_miles: formData.airport_distance_miles ? parseFloat(formData.airport_distance_miles) : null,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            {venue ? 'Edit Venue' : 'Add Venue'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Venue Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Gateway Sports Complex"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street_address || ''}
                onChange={(e) => handleChange('street_address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                  placeholder="NE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Website</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => handleChange('website_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Number of Courts</label>
              <input
                type="number"
                min="1"
                value={formData.court_count || ''}
                onChange={(e) => handleChange('court_count', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Parking Info</label>
              <input
                type="text"
                value={formData.parking_info || ''}
                onChange={(e) => handleChange('parking_info', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Free parking available"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nearest Airport</label>
              <input
                type="text"
                value={formData.airport_name || ''}
                onChange={(e) => handleChange('airport_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., Omaha Eppley Airfield (OMA)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Distance from Airport (miles)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.airport_distance_miles || ''}
                onChange={(e) => handleChange('airport_distance_miles', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., 41.2524"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="e.g., -95.9980"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {venue ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Venue Card Component
function VenueCard({ venue, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {venue.image_url && (
        <div className="h-32 bg-stone-100">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg text-stone-900">{venue.name}</h3>

        <div className="mt-2 space-y-1.5 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-stone-400" />
            <span>{venue.city}, {venue.state}</span>
          </div>

          {venue.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>{venue.phone}</span>
            </div>
          )}

          {venue.court_count && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-400" />
              <span>{venue.court_count} courts</span>
            </div>
          )}

          {venue.parking_info && (
            <div className="flex items-center gap-2">
              <ParkingCircle className="w-4 h-4 text-stone-400" />
              <span>{venue.parking_info}</span>
            </div>
          )}

          {venue.airport_distance_miles && (
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-stone-400" />
              <span>{venue.airport_distance_miles} mi from {venue.airport_name || 'airport'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
        {venue.website_url ? (
          <a
            href={venue.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-tne-red hover:text-tne-red-dark font-medium flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(venue)}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(venue)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVenuesPage() {
  const { venues, loading, error, createVenue, updateVenue, deleteVenue } = useVenues();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingVenue(null);
    setModalOpen(true);
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, formData);
      } else {
        await createVenue(formData);
      }
      setModalOpen(false);
      setEditingVenue(null);
    } catch (err) {
      console.error('Error saving venue:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (venue) => {
    setDeleteConfirm(venue);
  };

  const confirmDelete = async () => {
    try {
      await deleteVenue(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <AdminNavbar />

      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
                <Building2 className="w-7 h-7" />
                Venues
              </h1>
              <p className="text-stone-500 mt-1">
                Manage tournament venues library
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Venue
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load venues: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone-200 h-52 animate-pulse" />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">No venues yet</h3>
            <p className="text-stone-500 mb-6">Add venues to use across tournaments</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Venue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <VenueModal
          key={editingVenue?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingVenue(null);
          }}
          venue={editingVenue}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Venue?</h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

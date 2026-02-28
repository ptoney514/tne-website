import { useState } from 'react';
import { useHotels } from '@/hooks/useHotels';
import {
  Hotel,
  Plus,
  X,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Star,
  Wifi,
  Waves,
  Dumbbell,
  Coffee,
} from 'lucide-react';

const AMENITY_OPTIONS = [
  { value: 'WiFi', label: 'Free WiFi', icon: Wifi },
  { value: 'Pool', label: 'Pool', icon: Waves },
  { value: 'Fitness Center', label: 'Fitness Center', icon: Dumbbell },
  { value: 'Breakfast Included', label: 'Breakfast Included', icon: Coffee },
  { value: 'Restaurant', label: 'Restaurant', icon: null },
  { value: 'Business Center', label: 'Business Center', icon: null },
  { value: 'Pet Friendly', label: 'Pet Friendly', icon: null },
  { value: 'Free Parking', label: 'Free Parking', icon: null },
];

// Hotel Modal for Create/Edit
function HotelModal({ isOpen, onClose, hotel, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    hotel || {
      name: '',
      brand: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      website_url: '',
      booking_url: '',
      latitude: '',
      longitude: '',
      amenities: [],
      star_rating: '',
    }
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...formData,
      star_rating: formData.star_rating ? parseInt(formData.star_rating) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[14px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <h2 className="text-base font-bold text-admin-text">
            {hotel ? 'Edit Hotel' : 'Add Hotel'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-admin-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Hotel Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="e.g., Hampton Inn Omaha Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="e.g., Hampton Inn, Marriott"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Star Rating</label>
              <select
                value={formData.star_rating || ''}
                onChange={(e) => handleChange('star_rating', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              >
                <option value="">Select rating...</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street_address || ''}
                onChange={(e) => handleChange('street_address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-admin-text mb-1">State *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                  placeholder="NE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-text mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Website</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => handleChange('website_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Direct Booking URL</label>
              <input
                type="url"
                value={formData.booking_url || ''}
                onChange={(e) => handleChange('booking_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
                placeholder="https://..."
              />
              <p className="text-xs text-admin-text-secondary mt-1">Link to book directly with hotel</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity.value}
                    type="button"
                    onClick={() => toggleAmenity(amenity.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1.5 ${
                      formData.amenities.includes(amenity.value)
                        ? 'bg-admin-red text-white'
                        : 'bg-admin-content-bg text-admin-text-secondary hover:bg-stone-200'
                    }`}
                  >
                    {amenity.icon && <amenity.icon className="w-3.5 h-3.5" />}
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => handleChange('latitude', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => handleChange('longitude', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-admin-card-border">
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
              {hotel ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Hotel Card Component
function HotelCard({ hotel, onEdit, onDelete }) {
  return (
    <div className="rounded-[14px] bg-white border-[1.5px] border-admin-card-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-admin-text">{hotel.name}</h3>
            {hotel.brand && (
              <p className="text-sm text-admin-text-secondary">{hotel.brand}</p>
            )}
          </div>
          {hotel.star_rating && (
            <div className="flex items-center gap-0.5">
              {[...Array(hotel.star_rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-admin-text-secondary">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-admin-text-muted" />
            <span>
              {hotel.street_address && `${hotel.street_address}, `}
              {hotel.city}, {hotel.state}
            </span>
          </div>

          {hotel.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-admin-text-muted" />
              <span>{hotel.phone}</span>
            </div>
          )}
        </div>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 rounded-full bg-admin-content-bg text-admin-text-secondary text-xs"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-admin-content-bg text-admin-text-secondary text-xs">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#F2F2F0] flex items-center justify-between">
        {hotel.website_url ? (
          <a
            href={hotel.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-admin-red hover:opacity-85 font-medium flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(hotel)}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-admin-text-muted hover:text-admin-text-secondary"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(hotel)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-admin-text-muted hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHotelsPage() {
  const { hotels, loading, error, createHotel, updateHotel, deleteHotel } = useHotels();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    setEditingHotel(null);
    setModalOpen(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingHotel) {
        await updateHotel(editingHotel.id, formData);
      } else {
        await createHotel(formData);
      }
      setModalOpen(false);
      setEditingHotel(null);
    } catch (err) {
      console.error('Error saving hotel:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (hotel) => {
    setDeleteConfirm(hotel);
  };

  const confirmDelete = async () => {
    try {
      await deleteHotel(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting hotel:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-admin-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em] flex items-center gap-3">
                <Hotel className="w-7 h-7" />
                Hotels
              </h1>
              <p className="text-admin-text-secondary mt-1">
                Manage hotel library for tournament travel
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Failed to load hotels: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[14px] bg-white border-[1.5px] border-admin-card-border h-44 animate-pulse" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-admin-content-bg flex items-center justify-center">
              <Hotel className="w-8 h-8 text-admin-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">No hotels yet</h3>
            <p className="text-admin-text-secondary mb-6">Add hotels to link to tournaments</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-admin-red hover:opacity-85 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Hotel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <HotelModal
          key={editingHotel?.id || 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingHotel(null);
          }}
          hotel={editingHotel}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[14px] w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-bold text-admin-text mb-2">Delete Hotel?</h3>
            <p className="text-admin-text-secondary mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-admin-card-border text-admin-text hover:bg-stone-50 transition-colors"
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
    </>
  );
}

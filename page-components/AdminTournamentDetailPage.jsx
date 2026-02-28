import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTournamentDetailAdmin, useTournamentDetailForEdit } from '@/hooks/useTournamentDetailAdmin';
import { useVenues } from '@/hooks/useVenues';
import { useHotels } from '@/hooks/useHotels';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import {
  ArrowLeft,
  Building2,
  Hotel,
  MapPin,
  UtensilsCrossed,
  Save,
  Plus,
  X,
  Check,
  Loader2,
  ExternalLink,
  Star,
  Trash2,
} from 'lucide-react';

// Tab button component
function TabButton({ active, onClick, icon, label }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-admin-red text-admin-red'
          : 'border-transparent text-admin-text-secondary hover:text-admin-text hover:border-admin-card-border'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Details Tab Content
function DetailsTab({ details, onChange, onSave, saving }) {
  const handleChange = (field, value) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-admin-text mb-1">
            Tournament Description
          </label>
          <textarea
            value={details.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            placeholder="Describe the tournament for families..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Number of Divisions
          </label>
          <input
            type="number"
            min="1"
            value={details.division_count || ''}
            onChange={(e) => handleChange('division_count', parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Total Teams Expected
          </label>
          <input
            type="number"
            min="1"
            value={details.total_teams || ''}
            onChange={(e) => handleChange('total_teams', parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Entry Fee ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={details.entry_fee || ''}
            onChange={(e) => handleChange('entry_fee', parseFloat(e.target.value) || null)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Registration Deadline
          </label>
          <input
            type="date"
            value={details.registration_deadline || ''}
            onChange={(e) => handleChange('registration_deadline', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-admin-text mb-1">
            Registration URL
          </label>
          <input
            type="url"
            value={details.registration_url || ''}
            onChange={(e) => handleChange('registration_url', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Schedule PDF URL
          </label>
          <input
            type="url"
            value={details.schedule_pdf_url || ''}
            onChange={(e) => handleChange('schedule_pdf_url', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Rules PDF URL
          </label>
          <input
            type="url"
            value={details.rules_pdf_url || ''}
            onChange={(e) => handleChange('rules_pdf_url', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1">
            Bracket URL
          </label>
          <input
            type="url"
            value={details.bracket_url || ''}
            onChange={(e) => handleChange('bracket_url', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20 focus:border-admin-red/40"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="border-t border-admin-card-border pt-6">
        <h4 className="font-medium text-admin-text mb-4">Display Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={details.show_hotels !== false}
              onChange={(e) => handleChange('show_hotels', e.target.checked)}
              className="rounded border-admin-card-border"
            />
            <span className="text-sm text-admin-text">Show hotels section on public page</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={details.show_attractions !== false}
              onChange={(e) => handleChange('show_attractions', e.target.checked)}
              className="rounded border-admin-card-border"
            />
            <span className="text-sm text-admin-text">Show attractions section on public page</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={details.show_restaurants !== false}
              onChange={(e) => handleChange('show_restaurants', e.target.checked)}
              className="rounded border-admin-card-border"
            />
            <span className="text-sm text-admin-text">Show restaurants section on public page</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-admin-red text-white rounded-lg hover:opacity-85 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Details
        </button>
      </div>
    </div>
  );
}

// Venue Tab Content
function VenueTab({ currentVenue, venues, onSave, saving }) {
  // Initialize with currentVenue.id - parent component should pass a key prop to reset
  const [selectedVenueId, setSelectedVenueId] = useState(currentVenue?.id || null);

  const handleSave = () => {
    onSave(selectedVenueId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-admin-text">Select Venue</h4>
          <p className="text-sm text-admin-text-secondary">Choose a venue from the library or create a new one</p>
        </div>
        <Link
          href="/admin/venues"
          className="text-sm text-admin-red hover:opacity-85 font-medium"
        >
          Manage Venues
        </Link>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-admin-card-border rounded-[12px]">
          <Building2 className="w-8 h-8 text-admin-text-muted mx-auto mb-2" />
          <p className="text-admin-text-secondary">No venues in library</p>
          <Link
            href="/admin/venues"
            className="text-sm text-admin-red hover:opacity-85 font-medium mt-2 inline-block"
          >
            Create a venue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map((venue) => (
            <button
              key={venue.id}
              type="button"
              onClick={() => setSelectedVenueId(venue.id)}
              className={`p-4 rounded-[12px] border text-left transition-colors ${
                selectedVenueId === venue.id
                  ? 'border-admin-red bg-red-50'
                  : 'border-admin-card-border hover:border-admin-card-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-medium text-admin-text">{venue.name}</h5>
                  <p className="text-sm text-admin-text-secondary mt-1">
                    {venue.city}, {venue.state}
                  </p>
                  {venue.court_count && (
                    <p className="text-xs text-admin-text-muted mt-1">{venue.court_count} courts</p>
                  )}
                </div>
                {selectedVenueId === venue.id && (
                  <Check className="w-5 h-5 text-admin-red" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-admin-card-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selectedVenueId}
          className="flex items-center gap-2 px-4 py-2 bg-admin-red text-white rounded-lg hover:opacity-85 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Venue
        </button>
      </div>
    </div>
  );
}

// Hotels Tab Content
function HotelsTab({ linkedHotels, allHotels, onLinkHotel, onUnlinkHotel, saving }) {
  const [addingHotel, setAddingHotel] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [hotelRate, setHotelRate] = useState({ nightly_rate: '', is_team_rate: false, team_rate_code: '' });

  const availableHotels = allHotels.filter(
    (h) => !linkedHotels.some((lh) => lh.hotel_id === h.id)
  );

  const handleAddHotel = async () => {
    if (!selectedHotelId) return;
    await onLinkHotel(selectedHotelId, hotelRate);
    setAddingHotel(false);
    setSelectedHotelId('');
    setHotelRate({ nightly_rate: '', is_team_rate: false, team_rate_code: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-admin-text">Linked Hotels</h4>
          <p className="text-sm text-admin-text-secondary">Hotels with team rates for this tournament</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/hotels"
            className="text-sm text-admin-text-secondary hover:text-admin-text font-medium"
          >
            Manage Hotels
          </Link>
          {!addingHotel && (
            <button
              type="button"
              onClick={() => setAddingHotel(true)}
              className="flex items-center gap-1 text-sm text-admin-red hover:opacity-85 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Hotel
            </button>
          )}
        </div>
      </div>

      {/* Add Hotel Form */}
      {addingHotel && (
        <div className="p-4 border border-admin-red/30 bg-red-50/30 rounded-[12px] space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-admin-text">Add Hotel</h5>
            <button type="button" onClick={() => setAddingHotel(false)} className="text-admin-text-muted hover:text-admin-text-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-1">Select Hotel</label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20"
              >
                <option value="">Choose a hotel...</option>
                {availableHotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} - {h.city}, {h.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Nightly Rate ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={hotelRate.nightly_rate}
                onChange={(e) => setHotelRate({ ...hotelRate, nightly_rate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Team Rate Code</label>
              <input
                type="text"
                value={hotelRate.team_rate_code}
                onChange={(e) => setHotelRate({ ...hotelRate, team_rate_code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border focus:outline-none focus:ring-2 focus:ring-admin-red/20"
                placeholder="e.g., TNEHOOPS25"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_team_rate"
                checked={hotelRate.is_team_rate}
                onChange={(e) => setHotelRate({ ...hotelRate, is_team_rate: e.target.checked })}
                className="rounded border-admin-card-border"
              />
              <label htmlFor="is_team_rate" className="text-sm text-admin-text">This is a special team rate</label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddingHotel(false)}
              className="px-3 py-1.5 text-sm text-admin-text-secondary hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddHotel}
              disabled={!selectedHotelId || saving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-admin-red text-white rounded-lg hover:opacity-85 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Add Hotel
            </button>
          </div>
        </div>
      )}

      {/* Linked Hotels List */}
      {linkedHotels.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-admin-card-border rounded-[12px]">
          <Hotel className="w-8 h-8 text-admin-text-muted mx-auto mb-2" />
          <p className="text-admin-text-secondary">No hotels linked</p>
          <p className="text-sm text-admin-text-secondary">Add hotels with team rates for families</p>
        </div>
      ) : (
        <div className="space-y-3">
          {linkedHotels.map((lh) => (
            <div
              key={lh.id}
              className="p-4 border-[1.5px] border-admin-card-border rounded-[12px] flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-admin-text">{lh.hotel?.name}</h5>
                  {lh.is_team_rate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">
                      <Star className="w-3 h-3" />
                      Team Rate
                    </span>
                  )}
                </div>
                <p className="text-sm text-admin-text-secondary">
                  {lh.hotel?.city}, {lh.hotel?.state}
                  {lh.nightly_rate && ` - $${lh.nightly_rate}/night`}
                </p>
                {lh.team_rate_code && (
                  <p className="text-xs text-admin-red mt-1">Code: {lh.team_rate_code}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onUnlinkHotel(lh.hotel_id)}
                className="p-2 text-admin-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Places Tab Content
function PlacesTab({ linkedPlaces, allPlaces, onLinkPlace, onUnlinkPlace, saving }) {
  const [addingPlace, setAddingPlace] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [placeType, setPlaceType] = useState('all');

  const attractions = linkedPlaces.filter((lp) => lp.nearby_place?.place_type !== 'restaurant');
  const restaurants = linkedPlaces.filter((lp) => lp.nearby_place?.place_type === 'restaurant');

  const availablePlaces = allPlaces.filter(
    (p) => !linkedPlaces.some((lp) => lp.nearby_place_id === p.id) &&
      (placeType === 'all' || (placeType === 'restaurant' ? p.place_type === 'restaurant' : p.place_type !== 'restaurant'))
  );

  const handleAddPlace = async () => {
    if (!selectedPlaceId) return;
    await onLinkPlace(selectedPlaceId, {});
    setAddingPlace(false);
    setSelectedPlaceId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-admin-text">Nearby Places</h4>
          <p className="text-sm text-admin-text-secondary">Attractions and restaurants for families</p>
        </div>
        {!addingPlace && (
          <button
            type="button"
            onClick={() => setAddingPlace(true)}
            className="flex items-center gap-1 text-sm text-admin-red hover:opacity-85 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Place
          </button>
        )}
      </div>

      {/* Add Place Form */}
      {addingPlace && (
        <div className="p-4 border border-admin-red/30 bg-red-50/30 rounded-[12px] space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-admin-text">Add Place</h5>
            <button type="button" onClick={() => setAddingPlace(false)} className="text-admin-text-muted hover:text-admin-text-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Filter by Type</label>
              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border"
              >
                <option value="all">All Places</option>
                <option value="attraction">Attractions</option>
                <option value="restaurant">Restaurants</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Select Place</label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-admin-card-border"
              >
                <option value="">Choose a place...</option>
                {availablePlaces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.place_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddingPlace(false)}
              className="px-3 py-1.5 text-sm text-admin-text-secondary hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPlace}
              disabled={!selectedPlaceId || saving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-admin-red text-white rounded-lg hover:opacity-85 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Add Place
            </button>
          </div>
        </div>
      )}

      {/* Attractions */}
      <div>
        <h5 className="text-sm font-medium text-admin-text mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Attractions ({attractions.length})
        </h5>
        {attractions.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-admin-card-border rounded-lg">
            <p className="text-sm text-admin-text-secondary">No attractions linked</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attractions.map((lp) => (
              <div
                key={lp.id}
                className="p-3 border-[1.5px] border-admin-card-border rounded-lg flex items-center justify-between"
              >
                <div>
                  <h6 className="font-medium text-admin-text">{lp.nearby_place?.name}</h6>
                  <p className="text-xs text-admin-text-secondary">{lp.nearby_place?.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnlinkPlace(lp.nearby_place_id)}
                  className="p-1.5 text-admin-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurants */}
      <div>
        <h5 className="text-sm font-medium text-admin-text mb-3 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4" />
          Restaurants ({restaurants.length})
        </h5>
        {restaurants.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-admin-card-border rounded-lg">
            <p className="text-sm text-admin-text-secondary">No restaurants linked</p>
          </div>
        ) : (
          <div className="space-y-2">
            {restaurants.map((lp) => (
              <div
                key={lp.id}
                className="p-3 border-[1.5px] border-admin-card-border rounded-lg flex items-center justify-between"
              >
                <div>
                  <h6 className="font-medium text-admin-text">{lp.nearby_place?.name}</h6>
                  <p className="text-xs text-admin-text-secondary">
                    {lp.nearby_place?.cuisine_type} {lp.nearby_place?.price_range && `- ${'$'.repeat(lp.nearby_place.price_range)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnlinkPlace(lp.nearby_place_id)}
                  className="p-1.5 text-admin-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTournamentDetailPage() {
  const { tournamentId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch tournament data
  const { data, loading, error, refetch } = useTournamentDetailForEdit(tournamentId);

  // Admin operations
  const {
    saving,
    saveTournamentDetails,
    getOrCreateDetails,
    addHotelToTournament,
    removeHotelFromTournament,
    addPlaceToTournament,
    removePlaceFromTournament,
  } = useTournamentDetailAdmin();

  // Library data
  const { venues } = useVenues();
  const { hotels: allHotels } = useHotels();
  const { places: allPlaces } = useNearbyPlaces();

  // Derive tournament detail ID from data
  const tournamentDetailId = useMemo(() => data?.details?.id || null, [data?.details?.id]);

  // Local state for edits
  const [editedDetails, setEditedDetails] = useState({});
  const prevDataIdRef = useRef(null);

  // Sync editedDetails when data changes - using ref comparison to avoid effect warning
  useEffect(() => {
    const dataId = data?.details?.id;
    if (dataId && dataId !== prevDataIdRef.current) {
      prevDataIdRef.current = dataId;
      setEditedDetails(data.details);
    }
  }, [data]);

  // Track if we've already attempted to create details (prevents infinite loop on DB errors)
  const createAttemptedRef = useRef(false);

  // Ensure tournament_details record exists
  useEffect(() => {
    async function ensureDetails() {
      // Only attempt once per tournamentId to prevent infinite loops on DB errors
      if (tournamentId && !data?.details && !loading && !createAttemptedRef.current) {
        createAttemptedRef.current = true;
        try {
          await getOrCreateDetails(tournamentId);
          // refetch will update data, which will update tournamentDetailId via useMemo
          refetch();
        } catch (err) {
          console.error('Error creating tournament details:', err);
          // Don't retry - database table may not exist
        }
      }
    }
    ensureDetails();
  }, [tournamentId, data, loading, getOrCreateDetails, refetch]);

  // Reset createAttemptedRef when tournamentId changes
  useEffect(() => {
    createAttemptedRef.current = false;
  }, [tournamentId]);

  const handleSaveDetails = async () => {
    try {
      await saveTournamentDetails(tournamentId, editedDetails);
      refetch();
    } catch (err) {
      alert(`Error saving: ${err.message}`);
    }
  };

  const handleSaveVenue = async (venueId) => {
    try {
      await saveTournamentDetails(tournamentId, { ...editedDetails, venue_id: venueId });
      refetch();
    } catch (err) {
      alert(`Error saving venue: ${err.message}`);
    }
  };

  const handleLinkHotel = async (hotelId, rateInfo) => {
    if (!tournamentDetailId) return;
    try {
      await addHotelToTournament(tournamentDetailId, hotelId, {
        nightly_rate: rateInfo.nightly_rate ? parseFloat(rateInfo.nightly_rate) : null,
        is_team_rate: rateInfo.is_team_rate || false,
        team_rate_code: rateInfo.team_rate_code || null,
      });
      refetch();
    } catch (err) {
      alert(`Error linking hotel: ${err.message}`);
    }
  };

  const handleUnlinkHotel = async (hotelId) => {
    if (!tournamentDetailId) return;
    try {
      await removeHotelFromTournament(tournamentDetailId, hotelId);
      refetch();
    } catch (err) {
      alert(`Error unlinking hotel: ${err.message}`);
    }
  };

  const handleLinkPlace = async (placeId, linkInfo) => {
    if (!tournamentDetailId) return;
    try {
      await addPlaceToTournament(tournamentDetailId, placeId, linkInfo);
      refetch();
    } catch (err) {
      alert(`Error linking place: ${err.message}`);
    }
  };

  const handleUnlinkPlace = async (placeId) => {
    if (!tournamentDetailId) return;
    try {
      await removePlaceFromTournament(tournamentDetailId, placeId);
      refetch();
    } catch (err) {
      alert(`Error unlinking place: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-admin-red animate-spin" />
      </div>
    );
  }

  if (error || !data?.game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-base font-bold text-admin-text mb-2">Tournament Not Found</h2>
        <p className="text-admin-text-secondary mb-6">{error || 'This tournament does not exist.'}</p>
        <button
          onClick={() => router.push('/admin/games')}
          className="text-admin-red hover:opacity-85 font-medium"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  const { game } = data;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-admin-card-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/admin/games"
            className="inline-flex items-center gap-2 text-admin-text-secondary hover:text-admin-text text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">{game.name}</h1>
              <p className="text-admin-text-secondary mt-1">
                {new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {game.location && ` - ${game.location}`}
              </p>
            </div>
            {game.external_url && (
              <a
                href={game.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-admin-text-secondary hover:text-admin-text"
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-admin-card-border -mb-px">
            <TabButton
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
              icon={Building2}
              label="Details"
            />
            <TabButton
              active={activeTab === 'venue'}
              onClick={() => setActiveTab('venue')}
              icon={MapPin}
              label="Venue"
            />
            <TabButton
              active={activeTab === 'hotels'}
              onClick={() => setActiveTab('hotels')}
              icon={Hotel}
              label="Hotels"
            />
            <TabButton
              active={activeTab === 'places'}
              onClick={() => setActiveTab('places')}
              icon={UtensilsCrossed}
              label="Places"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-[14px] border-[1.5px] border-admin-card-border p-6">
          {activeTab === 'details' && (
            <DetailsTab
              details={editedDetails}
              onChange={setEditedDetails}
              onSave={handleSaveDetails}
              saving={saving}
            />
          )}
          {activeTab === 'venue' && (
            <VenueTab
              key={data.venue?.id}
              currentVenue={data.venue}
              venues={venues}
              onSave={handleSaveVenue}
              saving={saving}
            />
          )}
          {activeTab === 'hotels' && (
            <HotelsTab
              linkedHotels={data.hotels || []}
              allHotels={allHotels}
              onLinkHotel={handleLinkHotel}
              onUnlinkHotel={handleUnlinkHotel}
              saving={saving}
            />
          )}
          {activeTab === 'places' && (
            <PlacesTab
              linkedPlaces={data.places || []}
              allPlaces={allPlaces}
              onLinkPlace={handleLinkPlace}
              onUnlinkPlace={handleUnlinkPlace}
              saving={saving}
            />
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Phone,
  Car,
  Plane,
  ParkingCircle,
  Star,
  Wifi,
  Waves,
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  ExternalLink,
  Shield,
  Hotel as HotelIcon,
  ChevronRight,
} from 'lucide-react';
import TournamentHubDetailHero from './TournamentHubDetailHero';
import { useTournamentDetail } from '@/hooks/useTournamentDetail';

// ---------------------------------------------------------------------------
// Amenity helpers
// ---------------------------------------------------------------------------
const amenityIcons = {
  'WiFi': Wifi,
  'Free WiFi': Wifi,
  'Pool': Waves,
  'Fitness': Dumbbell,
  'Fitness Center': Dumbbell,
  'Breakfast': Coffee,
  'Breakfast Included': Coffee,
  'Restaurant': UtensilsCrossed,
};

function AmenityChip({ amenity }) {
  const Icon = amenityIcons[amenity] || Star;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs">
      <Icon className="w-3 h-3" />
      {amenity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VenueSection
// ---------------------------------------------------------------------------
function VenueSection({ venue }) {
  const fullAddress = [
    venue.street_address,
    `${venue.city}, ${venue.state} ${venue.zip_code || ''}`,
  ]
    .filter(Boolean)
    .join(', ');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Image / placeholder */}
      <div className="rounded-2xl overflow-hidden min-h-[280px] relative">
        {venue.image_url ? (
          <>
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 rounded-full bg-tne-red text-white text-xs font-medium">
                Tournament Venue
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#3D3428] to-[#5C4F3E] flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🏀</span>
            <span className="text-white/60 text-xs font-medium px-3 py-1 rounded-full border border-white/20">
              Venue Photo
            </span>
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 rounded-full bg-tne-red text-white text-xs font-medium">
                Tournament Venue
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center">
        <h3 className="text-xl font-bold text-neutral-900">{venue.name}</h3>
        <p className="text-neutral-600 mt-1">{fullAddress}</p>

        <div className="flex flex-col gap-2 mt-4 text-sm text-neutral-600">
          {venue.parking_info && (
            <span className="flex items-center gap-2">
              <ParkingCircle className="w-4 h-4 text-neutral-400" />
              {venue.parking_info}
            </span>
          )}
          {venue.airport_distance_miles && (
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-neutral-400" />
              {venue.airport_distance_miles} miles from {venue.airport_name || 'airport'}
            </span>
          )}
        </div>

        {venue.description && (
          <p className="text-neutral-600 mt-3">{venue.description}</p>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 mt-5 py-2.5 px-5 bg-tne-red text-white text-sm font-medium rounded-xl hover:bg-tne-red-dark transition-colors w-fit"
        >
          <MapPin className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TravelContent
// ---------------------------------------------------------------------------
function TravelContent({ hotels, attractions, restaurants, details }) {
  const hasTeamRateHotel = hotels.some((h) => h.isTeamRate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 mb-8">
      {/* Sidebar */}
      <div className="order-2 lg:order-1 space-y-6">
        {/* Attractions */}
        {attractions.length > 0 && details?.showAttractions !== false && (
          <div className="rounded-2xl bg-white border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Things to do nearby</h4>
            <div className="space-y-4">
              {attractions.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-[#3A4A2B] to-[#5C7842] rounded-xl flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{a.name}</p>
                    {a.category && (
                      <p className="text-xs text-neutral-500 mt-0.5">{a.category}</p>
                    )}
                    {a.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-neutral-700">{a.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurants */}
        {restaurants.length > 0 && details?.showRestaurants !== false && (
          <div className="rounded-2xl bg-white border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Quick bites &amp; team dining</h4>
            <div className="space-y-3">
              {restaurants.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-[#4A2B2B] to-[#784242] rounded-lg flex items-center justify-center text-xl">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {[r.cuisine_type, r.price_range && '$'.repeat(r.price_range)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-4 text-sm text-emerald-700">
              💡 Pro tip: Call ahead for groups of 10+ to ensure seating.
            </div>
          </div>
        )}
      </div>

      {/* Main column — Hotels */}
      {details?.showHotels !== false && hotels.length > 0 && (
      <div className="order-1 lg:order-2">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-100 rounded-lg p-2">
            <HotelIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">Nearby Hotels</h3>
        </div>

        {/* Team rate banner */}
        {hasTeamRateHotel && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Special Team Rate Available</p>
                {details?.teamRateCode && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Use code: <span className="font-mono font-medium">{details.teamRateCode}</span>
                  </p>
                )}
                {details?.teamRateDeadline && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Book by{' '}
                    {new Date(details.teamRateDeadline + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hotel cards */}
        <div className="space-y-4">
          {hotels.map((hotel, index) => {
            const hasTeamRate = hotel.isTeamRate && hotel.teamRateCode;
            const bookingUrl = hotel.specialBookingUrl || hotel.booking_url;

            return (
              <div
                key={hotel.id}
                className={`rounded-2xl border overflow-hidden ${
                  hasTeamRate ? 'border-emerald-200 bg-emerald-50/30' : 'border-neutral-200 bg-white'
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Team rate strip */}
                {hasTeamRate && (
                  <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Team Rate — Use code: <span className="font-mono">{hotel.teamRateCode}</span>
                  </div>
                )}

                {/* Card body */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900">{hotel.name}</h4>
                      <p className="text-sm text-neutral-500">
                        {hotel.street_address}
                        {hotel.city && `, ${hotel.city}, ${hotel.state} ${hotel.zip_code || ''}`}
                      </p>
                    </div>

                    {/* Pricing */}
                    {hasTeamRate && hotel.nightlyRate && (
                      <div className="text-right flex-shrink-0 ml-4">
                        {hotel.originalRate && hotel.originalRate > hotel.nightlyRate && (
                          <p className="text-sm text-neutral-400 line-through">
                            ${hotel.originalRate}/night
                          </p>
                        )}
                        <p className="text-lg font-bold text-emerald-600">
                          ${hotel.nightlyRate}
                          <span className="text-sm font-normal">/night</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mt-3">
                    {hotel.distanceMiles && (
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-neutral-400" />
                        {hotel.distanceMiles} mi
                        {hotel.driveTimeMinutes && ` (${hotel.driveTimeMinutes} min)`}
                      </span>
                    )}
                    {hotel.phone && (
                      <a
                        href={`tel:${hotel.phone}`}
                        className="flex items-center gap-1 hover:text-tne-red transition-colors"
                      >
                        <Phone className="w-4 h-4 text-neutral-400" />
                        {hotel.phone}
                      </a>
                    )}
                  </div>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hotel.amenities.slice(0, 5).map((amenity, i) => (
                        <AmenityChip key={i} amenity={amenity} />
                      ))}
                    </div>
                  )}

                  {/* CTA row */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-4">
                    {hotel.phone && (
                      <a
                        href={`tel:${hotel.phone}`}
                        className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    {!hotel.phone && <span />}

                    {bookingUrl ? (
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasTeamRate
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {hasTeamRate && hotel.discountPercentage
                          ? `Book Now — Save ${hotel.discountPercentage}%`
                          : hasTeamRate
                            ? 'Book Now'
                            : 'View Details'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-sm text-neutral-400">View Details</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LocalNotice
// ---------------------------------------------------------------------------
function LocalNotice() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <span className="text-4xl">🏠</span>
      <h3 className="text-xl font-semibold text-neutral-900 mt-4">Local Tournament</h3>
      <p className="text-neutral-500 mt-2">
        This is a local tournament — no travel or hotel arrangements needed. Just show up and play!
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UpcomingNotice
// ---------------------------------------------------------------------------
function UpcomingNotice() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <span className="text-4xl">📋</span>
      <h3 className="text-xl font-semibold text-neutral-900 mt-4">Travel Details Coming Soon</h3>
      <p className="text-neutral-500 mt-2">
        Hotel and travel information for this tournament will be available closer to the event date.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DivisionsCard
// ---------------------------------------------------------------------------
function DivisionsCard({ ageDivisions }) {
  let divisions = [];
  try {
    const parsed = JSON.parse(ageDivisions);
    divisions = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    divisions = [ageDivisions];
  }

  return (
    <div className="rounded-2xl bg-white border border-neutral-200 p-5 mb-8">
      <p className="font-mono uppercase tracking-wider text-xs text-neutral-400 mb-3">Divisions</p>
      <div className="flex flex-wrap gap-2">
        {divisions.map((d, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-full bg-tne-red/10 text-tne-red text-sm font-medium"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TeamsCard
// ---------------------------------------------------------------------------
function TeamsCard({ teams }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 p-5 mb-8">
      <h3 className="font-semibold text-neutral-900 mb-4">TNE Teams Participating</h3>
      <div className="flex flex-wrap gap-2">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm text-neutral-700 transition-colors"
          >
            {team.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main: TournamentHubDetail
// ---------------------------------------------------------------------------
export default function TournamentHubDetail({ id, onBack }) {
  const { data, loading, error } = useTournamentDetail(id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
          <p className="text-neutral-500">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Tournament Not Found</h2>
          <p className="text-neutral-500 mb-6">
            This tournament doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tne-red text-white rounded-lg hover:bg-tne-red-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const { tournament, teams, venue, details, hotels, attractions, restaurants } = data;

  const isTravelTournament =
    (hotels.length > 0 && details?.showHotels !== false) ||
    (attractions.length > 0 && details?.showAttractions !== false) ||
    (restaurants.length > 0 && details?.showRestaurants !== false);
  const isLocalTournament =
    !isTravelTournament &&
    details?.driveTime?.toLowerCase().includes('local');
  const isFutureTournament = !isTravelTournament && !isLocalTournament;

  return (
    <>
      <TournamentHubDetailHero
        tournament={tournament}
        details={details}
        venue={venue}
        teams={teams}
        onBack={onBack}
      />

      <main className="flex-1 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Venue */}
          {venue && <VenueSection venue={venue} />}

          {/* Content state */}
          {isTravelTournament && (
            <TravelContent
              hotels={hotels}
              attractions={attractions}
              restaurants={restaurants}
              details={details}
            />
          )}
          {isLocalTournament && <LocalNotice />}
          {isFutureTournament && <UpcomingNotice />}

          {/* Divisions */}
          {details?.ageDivisions && <DivisionsCard ageDivisions={details.ageDivisions} />}

          {/* Participating teams */}
          {teams.length > 0 && <TeamsCard teams={teams} />}
        </div>
      </main>
    </>
  );
}

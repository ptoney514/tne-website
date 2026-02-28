import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ExternalLink,
  Phone,
  Globe,
  Car,
  Plane,
  ParkingCircle,
  Star,
  Wifi,
  Waves,
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  Building2,
  Ticket,
  FileText,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import { useTournamentDetail } from '@/hooks/useTournamentDetail';

// Helper to format date range
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;

  const options = { month: 'long', day: 'numeric', year: 'numeric' };

  if (!end || startDate === endDate) {
    return start.toLocaleDateString('en-US', options);
  }

  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', options)}`;
}

// Price range display
function PriceRange({ level }) {
  return (
    <span className="text-neutral-500">
      {'$'.repeat(level || 1)}
      <span className="text-neutral-300">{'$'.repeat(4 - (level || 1))}</span>
    </span>
  );
}

// Amenity icon mapping
const amenityIcons = {
  'WiFi': Wifi,
  'Free WiFi': Wifi,
  'Pool': Waves,
  'Fitness': Dumbbell,
  'Fitness Center': Dumbbell,
  'Breakfast': Coffee,
  'Breakfast Included': Coffee,
  'Restaurant': UtensilsCrossed,
  'Business Center': Building2,
};

function AmenityBadge({ amenity }) {
  const Icon = amenityIcons[amenity] || Star;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs">
      <Icon className="w-3 h-3" />
      {amenity}
    </span>
  );
}

// Hotel Card Component
function HotelCard({ hotel, teamRateCode, teamRateDeadline }) {
  const hasTeamRate = hotel.isTeamRate && hotel.teamRateCode;
  const displayRateCode = hotel.teamRateCode || teamRateCode;
  const displayDeadline = hotel.bookingDeadline || teamRateDeadline;

  return (
    <div className={`rounded-2xl border ${hasTeamRate ? 'border-tne-red/30 bg-red-50/30' : 'border-neutral-200 bg-white'} p-4 space-y-3`}>
      {hasTeamRate && (
        <div className="flex items-center gap-2 text-tne-red text-xs font-medium">
          <Star className="w-3.5 h-3.5 fill-current" />
          Special Team Rate Available
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-neutral-900">{hotel.name}</h4>
          <p className="text-sm text-neutral-500">{hotel.street_address}</p>
          <p className="text-sm text-neutral-500">{hotel.city}, {hotel.state} {hotel.zip_code}</p>
        </div>
        <div className="text-right">
          {hotel.nightlyRate && (
            <>
              <div className="text-lg font-bold text-neutral-900">${hotel.nightlyRate}<span className="text-sm font-normal">/night</span></div>
              {hotel.originalRate && hotel.originalRate > hotel.nightlyRate && (
                <div className="text-sm text-neutral-400 line-through">${hotel.originalRate}/night</div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
        {hotel.distanceMiles && (
          <span className="flex items-center gap-1">
            <Car className="w-4 h-4 text-neutral-400" />
            {hotel.distanceMiles} miles
            {hotel.driveTimeMinutes && ` (${hotel.driveTimeMinutes} min)`}
          </span>
        )}
        {hotel.phone && (
          <a href={`tel:${hotel.phone}`} className="flex items-center gap-1 hover:text-tne-red">
            <Phone className="w-4 h-4 text-neutral-400" />
            {hotel.phone}
          </a>
        )}
      </div>

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 5).map((amenity, i) => (
            <AmenityBadge key={i} amenity={amenity} />
          ))}
        </div>
      )}

      {hasTeamRate && displayRateCode && (
        <div className="bg-tne-red/10 rounded-lg p-3 text-sm">
          <p className="font-medium text-tne-red">
            Book with code: <span className="font-mono">{displayRateCode}</span>
          </p>
          {displayDeadline && (
            <p className="text-neutral-600 text-xs mt-1">
              Book by {new Date(displayDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      <div className="pt-2 flex gap-2">
        {hotel.specialBookingUrl || hotel.booking_url ? (
          <a
            href={hotel.specialBookingUrl || hotel.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              hasTeamRate
                ? 'bg-tne-red text-white hover:bg-tne-red-dark'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {hasTeamRate && hotel.discountPercentage ? `Book Now - Save ${hotel.discountPercentage}%` : 'Book Now'}
          </a>
        ) : (
          <span className="flex-1 text-center py-2 px-4 text-sm text-neutral-400">
            View Details
          </span>
        )}
      </div>
    </div>
  );
}

// Place Card Component (for attractions and restaurants)
function PlaceCard({ place }) {
  const isRestaurant = place.place_type === 'restaurant';

  return (
    <div className="flex gap-4 py-3 border-b border-neutral-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-neutral-900">{place.name}</h4>
          {place.is_family_friendly && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Family Friendly</span>
          )}
          {place.isRecommended && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Recommended</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
          {place.distanceMiles && <span>{place.distanceMiles} miles</span>}
          {place.category && <span>{place.category}</span>}
          {isRestaurant && place.cuisine_type && <span>{place.cuisine_type}</span>}
          {place.price_range && <PriceRange level={place.price_range} />}
        </div>

        {place.description && (
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{place.description}</p>
        )}

        {place.hasTeamDiscount && place.teamDiscountInfo && (
          <p className="text-xs text-tne-red mt-1 font-medium">{place.teamDiscountInfo}</p>
        )}
      </div>

      {place.rating && (
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{place.rating}</span>
        </div>
      )}
    </div>
  );
}

// Venue Card Component
function VenueCard({ venue }) {
  if (!venue) return null;

  const fullAddress = [
    venue.street_address,
    `${venue.city}, ${venue.state} ${venue.zip_code || ''}`
  ].filter(Boolean).join(', ');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="rounded-3xl bg-white border border-neutral-200 overflow-hidden">
      {venue.image_url && (
        <div className="relative h-48">
          <Image
            src={venue.image_url}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full bg-tne-red text-white text-xs font-medium">
              Tournament Venue
            </span>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{venue.name}</h3>
          <p className="text-neutral-600 mt-1">{fullAddress}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
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

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-neutral-900 text-white text-center rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}

// Main Page Component
export default function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentDetail(tournamentId);

  if (loading) {
    return (
      <InteriorLayout>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
            <p className="text-neutral-500">Loading tournament details...</p>
          </div>
        </div>
      </InteriorLayout>
    );
  }

  if (error || !data) {
    return (
      <InteriorLayout>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Tournament Not Found</h2>
            <p className="text-neutral-500 mb-6">This tournament doesn't exist or has been removed.</p>
            <Link
              href="/schedule#tournaments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tne-red text-white rounded-lg hover:bg-tne-red-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </Link>
          </div>
        </div>
      </InteriorLayout>
    );
  }

  const { tournament, teams, venue, details, hotels, attractions, restaurants } = data;

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 relative">
          {/* Back Link */}
          <Link
            href="/schedule#tournaments"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-tne-red text-white text-xs font-medium uppercase tracking-wide">
              {formatDateRange(tournament.date, tournament.endDate)}
            </span>
            {tournament.isFeatured && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium uppercase tracking-wide border border-amber-500/20">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
            {tournament.name}
          </h1>

          {/* Description */}
          {details?.description && (
            <p className="text-white/70 text-lg max-w-2xl mb-6">
              {details.description}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white/50" />
              <span>{venue?.city || tournament.location}, {venue?.state || ''}</span>
            </div>
            {(details?.totalTeams || teams.length > 0) && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/50" />
                <span>{details?.totalTeams || teams.length} Teams</span>
              </div>
            )}
            {details?.divisionCount && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-white/50" />
                <span>{details.divisionCount} Divisions</span>
              </div>
            )}
            {details?.entryFee && (
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-white/50" />
                <span>${details.entryFee} Entry Fee</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column - Venue & Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Venue Card */}
              <VenueCard venue={venue} />

              {/* Quick Links */}
              {(tournament.externalUrl || details?.schedulePdfUrl || details?.rulesPdfUrl || details?.registrationUrl) && (
                <div className="rounded-3xl bg-white border border-neutral-200 p-5">
                  <h3 className="font-semibold text-neutral-900 mb-4">Tournament Resources</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tournament.externalUrl && (
                      <a
                        href={tournament.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-tne-red" />
                        <span className="text-sm font-medium">Tournament Site</span>
                      </a>
                    )}
                    {details?.schedulePdfUrl && (
                      <a
                        href={details.schedulePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-tne-red" />
                        <span className="text-sm font-medium">Schedule</span>
                      </a>
                    )}
                    {details?.rulesPdfUrl && (
                      <a
                        href={details.rulesPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-tne-red" />
                        <span className="text-sm font-medium">Rules</span>
                      </a>
                    )}
                    {details?.registrationUrl && (
                      <a
                        href={details.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <Ticket className="w-5 h-5 text-tne-red" />
                        <span className="text-sm font-medium">Register</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Things to Do Nearby */}
              {attractions.length > 0 && details?.showAttractions !== false && (
                <div className="rounded-3xl bg-white border border-neutral-200 p-5">
                  <h3 className="font-semibold text-neutral-900 mb-1">Things to Do Nearby</h3>
                  <p className="text-sm text-neutral-500 mb-4">Family-friendly activities within 15 minutes of the venue</p>
                  <div>
                    {attractions.map(place => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                  </div>
                </div>
              )}

              {/* Team Dining */}
              {restaurants.length > 0 && details?.showRestaurants !== false && (
                <div className="rounded-3xl bg-white border border-neutral-200 p-5">
                  <h3 className="font-semibold text-neutral-900 mb-1">Quick Bites & Team Dining</h3>
                  <p className="text-sm text-neutral-500 mb-4">Popular spots that handle big groups</p>
                  <div>
                    {restaurants.map(place => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Hotels */}
            <div className="lg:col-span-5 space-y-6">
              {/* Hotels Section */}
              {hotels.length > 0 && details?.showHotels !== false && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">Nearby Hotels</h3>
                    {details?.teamRateCode && (
                      <div className="mt-3 p-4 rounded-xl bg-tne-red/5 border border-tne-red/20">
                        <div className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-tne-red flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-neutral-900">Special Team Rate Available</p>
                            {details.teamRateDescription && (
                              <p className="text-sm text-neutral-600 mt-1">{details.teamRateDescription}</p>
                            )}
                            <p className="text-sm text-tne-red font-medium mt-2">
                              Use code: <span className="font-mono">{details.teamRateCode}</span>
                            </p>
                            {details.teamRateDeadline && (
                              <p className="text-xs text-neutral-500 mt-1">
                                Book by {new Date(details.teamRateDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {hotels.map(hotel => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        teamRateCode={details?.teamRateCode}
                        teamRateDeadline={details?.teamRateDeadline}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Participating Teams */}
              {teams.length > 0 && (
                <div className="rounded-3xl bg-white border border-neutral-200 p-5">
                  <h3 className="font-semibold text-neutral-900 mb-4">TNE Teams Participating</h3>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(team => (
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
              )}
            </div>

          </div>
        </div>
      </main>
    </InteriorLayout>
  );
}

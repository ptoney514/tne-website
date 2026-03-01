'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Users,
  Shield,
  ChevronRight,
  ExternalLink,
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
  Calendar,
  FileText,
  Ticket,
  Clock,
  Hotel as HotelIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionCard({ children }) {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden">
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-neutral-400" />
        <h2 className="font-semibold text-neutral-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-neutral-300" />
      </div>
      <p className="text-sm text-neutral-400 text-center max-w-[240px] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value, muted }) {
  return (
    <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 flex flex-col items-center text-center gap-1.5">
      <Icon className="w-5 h-5 text-neutral-400" />
      <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">{label}</p>
      {muted ? (
        <p className="text-sm italic text-neutral-300">TBD</p>
      ) : (
        <p className="text-sm font-semibold text-neutral-900">{value}</p>
      )}
    </div>
  );
}

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
// 1. Teams Section
// ---------------------------------------------------------------------------
function TeamsSection({ teams }) {
  return (
    <SectionCard>
      <SectionHeader
        icon={Shield}
        title="TNE Teams Participating"
        action={
          teams.length > 0 && (
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              {teams.length} {teams.length === 1 ? 'team' : 'teams'}
            </span>
          )
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          message="Team assignments will be announced soon"
        />
      ) : (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-100 p-3 hover:border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-tne-red/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-tne-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 text-sm truncate group-hover:text-tne-red transition-colors">
                  {team.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {[
                    team.gender === 'male' ? 'Boys' : team.gender === 'female' ? 'Girls' : null,
                    team.gradeLevel ? `${team.gradeLevel}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// 2. Tournament Details Section
// ---------------------------------------------------------------------------
function VenueBlock({ venue, tournament }) {
  const hasVenue = venue && venue.name;

  const venueName = hasVenue ? venue.name : null;
  const fullAddress = hasVenue
    ? [venue.street_address, `${venue.city}, ${venue.state} ${venue.zip_code || ''}`]
        .filter(Boolean)
        .join(', ')
    : tournament.location || null;

  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Image / placeholder */}
      <div className="rounded-2xl overflow-hidden min-h-[260px] relative">
        {hasVenue && venue.image_url ? (
          <>
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
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex flex-col items-center justify-center gap-2">
            <MapPin className="w-10 h-10 text-neutral-400" />
            <span className="text-neutral-500 text-xs font-medium px-3 py-1 rounded-full border border-neutral-400/30">
              Venue Photo Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center">
        {venueName && (
          <h3 className="text-xl font-bold text-neutral-900">{venueName}</h3>
        )}
        {fullAddress && (
          <p className="text-neutral-600 mt-1">{fullAddress}</p>
        )}

        {hasVenue && (
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
        )}

        {hasVenue && venue.description && (
          <p className="text-neutral-600 mt-3">{venue.description}</p>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-5 py-2.5 px-5 bg-tne-red text-white text-sm font-medium rounded-xl hover:bg-tne-red-dark transition-colors w-fit"
          >
            <MapPin className="w-4 h-4" />
            Get Directions
          </a>
        )}
      </div>
    </div>
  );
}

function ResourceLinks({ tournament, details }) {
  const links = [
    tournament.externalUrl && { href: tournament.externalUrl, icon: ExternalLink, label: 'Tournament Site' },
    details?.schedulePdfUrl && { href: details.schedulePdfUrl, icon: Calendar, label: 'Schedule' },
    details?.rulesPdfUrl && { href: details.rulesPdfUrl, icon: FileText, label: 'Rules' },
    details?.registrationUrl && { href: details.registrationUrl, icon: Ticket, label: 'Register' },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
        >
          <Icon className="w-5 h-5 text-tne-red" />
          <span className="text-sm font-medium">{label}</span>
        </a>
      ))}
    </div>
  );
}

function TournamentDetailsSection({ tournament, venue, details }) {
  const hasDetails = !!details;

  const parkingValue = details?.parkingInfo || venue?.parking_info;
  const entryFeeValue = details?.entryFee ? `$${details.entryFee}` : null;
  const driveTimeValue = details?.driveTime;

  const showTiles = parkingValue || entryFeeValue || driveTimeValue || !hasDetails;

  return (
    <SectionCard>
      <SectionHeader icon={MapPin} title="Tournament Details" />

      <div className="p-5 space-y-6">
        <VenueBlock venue={venue} tournament={tournament} />

        {/* Detail tiles */}
        {showTiles && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DetailTile
              icon={ParkingCircle}
              label="Parking"
              value={parkingValue}
              muted={!parkingValue}
            />
            <DetailTile
              icon={Ticket}
              label="Entry Fee"
              value={entryFeeValue}
              muted={!entryFeeValue}
            />
            <DetailTile
              icon={Clock}
              label="Drive Time"
              value={driveTimeValue}
              muted={!driveTimeValue}
            />
          </div>
        )}

        {/* Resource links */}
        <ResourceLinks tournament={tournament} details={details} />
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// 3. Divisions Section
// ---------------------------------------------------------------------------
function DivisionsSection({ ageDivisions }) {
  let divisions = [];
  try {
    const parsed = JSON.parse(ageDivisions);
    divisions = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    divisions = [ageDivisions];
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={Users}
        title="Divisions"
        action={
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            {divisions.length} {divisions.length === 1 ? 'division' : 'divisions'}
          </span>
        }
      />
      <div className="p-5 flex flex-wrap gap-2">
        {divisions.map((d, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-full bg-tne-red/10 text-tne-red text-sm font-medium"
          >
            {d}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// 4. Hotels Section
// ---------------------------------------------------------------------------
function HotelCard({ hotel }) {
  const hasTeamRate = hotel.isTeamRate && hotel.teamRateCode;
  const bookingUrl = hotel.specialBookingUrl || hotel.booking_url;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        hasTeamRate ? 'border-emerald-200 bg-emerald-50/30' : 'border-neutral-200 bg-white'
      }`}
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
          {hotel.phone ? (
            <a
              href={`tel:${hotel.phone}`}
              className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          ) : (
            <span />
          )}

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
}

function HotelsSection({ hotels, details }) {
  const hasTeamRateHotel = hotels.some((h) => h.isTeamRate);

  return (
    <SectionCard>
      <SectionHeader icon={HotelIcon} title="Nearby Hotels" />

      <div className="p-5 space-y-4">
        {/* Team rate banner */}
        {hasTeamRateHotel && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
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
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// 5. Nearby Attractions & Dining Section
// ---------------------------------------------------------------------------
function PlaceCard({ place }) {
  const isRestaurant = place.place_type === 'restaurant';

  return (
    <div className="flex gap-3 py-3 border-b border-neutral-100 last:border-0">
      <div
        className={`w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center text-xl ${
          isRestaurant
            ? 'bg-gradient-to-br from-[#4A2B2B] to-[#784242]'
            : 'bg-gradient-to-br from-[#3A4A2B] to-[#5C7842]'
        }`}
      >
        {isRestaurant ? '🍽️' : '🎯'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-neutral-900 text-sm truncate">{place.name}</p>
          {place.is_family_friendly && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex-shrink-0">Family Friendly</span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          {[
            place.category || (isRestaurant ? place.cuisine_type : null),
            place.distanceMiles && `${place.distanceMiles} mi`,
            isRestaurant && place.price_range && '$'.repeat(place.price_range),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {place.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-neutral-700">{place.rating}</span>
          </div>
        )}
        {place.hasTeamDiscount && place.teamDiscountInfo && (
          <p className="text-xs text-tne-red mt-1 font-medium">{place.teamDiscountInfo}</p>
        )}
      </div>
    </div>
  );
}

function NearbySection({ attractions, restaurants, details }) {
  const showAttractions = attractions.length > 0 && details?.showAttractions !== false;
  const showRestaurants = restaurants.length > 0 && details?.showRestaurants !== false;

  return (
    <SectionCard>
      <SectionHeader icon={MapPin} title="Nearby Attractions & Dining" />

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attractions */}
          {showAttractions && (
            <div>
              <p className="font-mono uppercase tracking-wider text-xs text-neutral-400 mb-3">
                Things to Do
              </p>
              <div>
                {attractions.map((a) => (
                  <PlaceCard key={a.id} place={a} />
                ))}
              </div>
            </div>
          )}

          {/* Restaurants */}
          {showRestaurants && (
            <div>
              <p className="font-mono uppercase tracking-wider text-xs text-neutral-400 mb-3">
                Quick Bites & Team Dining
              </p>
              <div>
                {restaurants.map((r) => (
                  <PlaceCard key={r.id} place={r} />
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-4 text-sm text-emerald-700">
                Pro tip: Call ahead for groups of 10+ to ensure seating.
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function TournamentDetailContent({
  tournament,
  teams,
  venue,
  details,
  hotels,
  attractions,
  restaurants,
}) {
  const showHotels =
    hotels.length > 0 && details?.showHotels !== false;
  const showNearby =
    (attractions.length > 0 && details?.showAttractions !== false) ||
    (restaurants.length > 0 && details?.showRestaurants !== false);

  return (
    <div className="space-y-6">
      {/* 1. TNE Teams Participating — always shown */}
      <TeamsSection teams={teams} />

      {/* 2. Tournament Details — always shown */}
      <TournamentDetailsSection
        tournament={tournament}
        venue={venue}
        details={details}
      />

      {/* 3. Divisions — only if data exists */}
      {details?.ageDivisions && (
        <DivisionsSection ageDivisions={details.ageDivisions} />
      )}

      {/* 4. Hotels — travel tournaments only */}
      {showHotels && (
        <HotelsSection hotels={hotels} details={details} />
      )}

      {/* 5. Nearby Attractions & Dining — travel tournaments only */}
      {showNearby && (
        <NearbySection
          attractions={attractions}
          restaurants={restaurants}
          details={details}
        />
      )}
    </div>
  );
}

# Tournament Research Agent

A Claude Code skill that automatically researches and populates tournament details including nearby hotels, restaurants, and attractions.

## Usage

```
/research-tournament "I Have A Dream Classic"
/research-tournament [tournament-id]
```

## What It Does

1. Looks up the tournament in the database
2. Geocodes the venue address
3. Searches Google Places API for:
   - Hotels within 5 miles
   - Restaurants within 3 miles
   - Attractions within 6 miles
4. Researches tournament website via Perplexity
5. Deduplicates against existing database records
6. Inserts new places and links them to the tournament
7. Updates tournament description and metadata

## Requirements

- `GOOGLE_PLACES_API_KEY` environment variable
- Supabase database with tournament tables (venues, hotels, nearby_places, etc.)

## Setup

1. Get a Google Places API key from Google Cloud Console
2. Add to your environment:
   ```bash
   export GOOGLE_PLACES_API_KEY=your_key_here
   ```
   Or add to `.env.local` in the project root.

## Database Tables Used

- `games` - Tournament records
- `tournament_details` - Extended tournament info
- `hotels` - Master hotel library
- `nearby_places` - Master places library
- `tournament_hotels` - Links tournaments to hotels
- `tournament_nearby_places` - Links tournaments to places

## Example Output

```
Found: I Have A Dream Classic (Jan 2-4, 2026)
Location: Council Bluffs, IA

Searching Google Places within 5 miles...
- Found 15 hotels
- Found 42 restaurants
- Found 12 attractions

Populating database...
✓ Created 12 new hotels, linked 15 total
✓ Created 34 new restaurants, linked 42 total
✓ Created 10 new attractions, linked 12 total
✓ Updated tournament description

Done! View at /admin/games/[tournament-id]
```

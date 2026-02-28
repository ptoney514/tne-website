CREATE TYPE "public"."event_type" AS ENUM('practice', 'game', 'tournament', 'tryout', 'other');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'partial', 'waived');--> statement-breakpoint
CREATE TYPE "public"."registration_source" AS ENUM('tryout_offer', 'direct');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tryout_signup_status" AS ENUM('registered', 'attended', 'offered', 'declined', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'coach', 'parent');--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('game', 'tournament');--> statement-breakpoint
CREATE TYPE "public"."place_type" AS ENUM('restaurant', 'attraction', 'entertainment', 'shopping', 'other');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"role" "user_role" DEFAULT 'parent' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neon_auth"."users_sync" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean,
	"image" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"tryouts_open" boolean DEFAULT false,
	"tryouts_label" text,
	"registration_open" boolean DEFAULT false,
	"registration_label" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "season_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"payment_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"name" text NOT NULL,
	"grade_level" text NOT NULL,
	"gender" "gender" NOT NULL,
	"head_coach_id" uuid,
	"assistant_coach_id" uuid,
	"practice_location" text,
	"practice_days" text,
	"practice_time" text,
	"team_fee" numeric(10, 2),
	"uniform_fee" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address_street" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"relationship" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"graduating_year" integer NOT NULL,
	"current_grade" text NOT NULL,
	"gender" "gender" NOT NULL,
	"primary_parent_id" uuid,
	"secondary_parent_id" uuid,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relationship" text,
	"medical_notes" text,
	"jersey_number" text,
	"jersey_size" text,
	"position" text,
	"years_experience" integer,
	"prior_tne_player" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_roster" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"jersey_number" text,
	"position" text,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(10, 2),
	"payment_date" date,
	"payment_notes" text,
	"joined_date" date DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_player_unique" UNIQUE("team_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "tryout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"location" text NOT NULL,
	"grade_levels" text[],
	"gender" "gender",
	"max_capacity" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"player_first_name" text NOT NULL,
	"player_last_name" text NOT NULL,
	"player_date_of_birth" date NOT NULL,
	"player_graduating_year" integer NOT NULL,
	"player_current_grade" text NOT NULL,
	"player_gender" "gender" NOT NULL,
	"years_experience" integer,
	"prior_tne_player" boolean DEFAULT false,
	"parent_first_name" text NOT NULL,
	"parent_last_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"parent_phone" text NOT NULL,
	"emergency_contact_name" text NOT NULL,
	"emergency_contact_phone" text NOT NULL,
	"emergency_contact_relationship" text,
	"status" "tryout_signup_status" DEFAULT 'registered' NOT NULL,
	"offered_team_id" uuid,
	"offer_sent_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "registration_source" NOT NULL,
	"tryout_signup_id" uuid,
	"team_id" uuid,
	"player_first_name" text NOT NULL,
	"player_last_name" text NOT NULL,
	"player_date_of_birth" date NOT NULL,
	"player_graduating_year" integer NOT NULL,
	"player_current_grade" text NOT NULL,
	"player_gender" "gender" NOT NULL,
	"jersey_size" text,
	"position" text,
	"medical_notes" text,
	"desired_jersey_number" text,
	"last_team_played_for" text,
	"parent_first_name" text NOT NULL,
	"parent_last_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"parent_phone" text NOT NULL,
	"parent_address_street" text,
	"parent_address_city" text,
	"parent_address_state" text,
	"parent_address_zip" text,
	"parent_relationship" text,
	"parent_home_phone" text,
	"parent2_name" text,
	"parent2_phone" text,
	"parent2_email" text,
	"emergency_contact_name" text NOT NULL,
	"emergency_contact_phone" text NOT NULL,
	"emergency_contact_relationship" text,
	"ip_address" text,
	"waiver_liability_accepted" boolean DEFAULT false,
	"waiver_liability_accepted_at" timestamp,
	"waiver_medical_accepted" boolean DEFAULT false,
	"waiver_medical_accepted_at" timestamp,
	"waiver_media_accepted" boolean DEFAULT false,
	"waiver_media_accepted_at" timestamp,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(10, 2),
	"payment_date" date,
	"payment_transaction_id" text,
	"payment_plan_type" text,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_player_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"season_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"location" text,
	"address" text,
	"opponent" text,
	"is_home_game" boolean,
	"tournament_name" text,
	"notes" text,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"expires_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"game_type" "game_type" DEFAULT 'game' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"location" text,
	"address" text,
	"external_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"notes" text,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"opponent" text,
	"is_home_game" boolean,
	"result" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unq_game_team" UNIQUE("game_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"phone" text,
	"website" text,
	"latitude" double precision,
	"longitude" double precision,
	"description" text,
	"amenities" text,
	"parking_info" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"phone" text,
	"website" text,
	"booking_url" text,
	"latitude" double precision,
	"longitude" double precision,
	"star_rating" integer,
	"amenities" text,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nearby_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"place_type" "place_type" NOT NULL,
	"category" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"phone" text,
	"website" text,
	"latitude" double precision,
	"longitude" double precision,
	"price_range" text,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"venue_id" uuid,
	"description" text,
	"division_count" integer,
	"total_teams" integer,
	"age_divisions" text,
	"registration_url" text,
	"registration_deadline" date,
	"entry_fee" numeric(10, 2),
	"schedule_pdf_url" text,
	"rules_pdf_url" text,
	"bracket_url" text,
	"team_rate_code" text,
	"team_rate_deadline" date,
	"team_rate_description" text,
	"map_center_lat" double precision,
	"map_center_lng" double precision,
	"map_zoom_level" integer DEFAULT 13,
	"show_hotels" boolean DEFAULT true NOT NULL,
	"show_attractions" boolean DEFAULT true NOT NULL,
	"show_restaurants" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_detail_id" uuid NOT NULL,
	"hotel_id" uuid NOT NULL,
	"is_team_rate" boolean DEFAULT false NOT NULL,
	"nightly_rate" numeric(10, 2),
	"original_rate" numeric(10, 2),
	"discount_percentage" integer,
	"team_rate_code" text,
	"booking_deadline" date,
	"special_booking_url" text,
	"distance_miles" double precision,
	"drive_time_minutes" integer,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_nearby_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_detail_id" uuid NOT NULL,
	"nearby_place_id" uuid NOT NULL,
	"distance_miles" double precision,
	"has_team_discount" boolean DEFAULT false NOT NULL,
	"team_discount_info" text,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"recommendation_note" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_session_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_session_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unq_practice_session_team" UNIQUE("practice_session_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'parent' NOT NULL,
	"invite_code" text NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"invited_by_id" text,
	"accepted_by_id" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "season_fees" ADD CONSTRAINT "season_fees_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_head_coach_id_coaches_id_fk" FOREIGN KEY ("head_coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_assistant_coach_id_coaches_id_fk" FOREIGN KEY ("assistant_coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_primary_parent_id_parents_id_fk" FOREIGN KEY ("primary_parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_secondary_parent_id_parents_id_fk" FOREIGN KEY ("secondary_parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_roster" ADD CONSTRAINT "team_roster_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_roster" ADD CONSTRAINT "team_roster_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sessions" ADD CONSTRAINT "tryout_sessions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_signups" ADD CONSTRAINT "tryout_signups_session_id_tryout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tryout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_signups" ADD CONSTRAINT "tryout_signups_offered_team_id_teams_id_fk" FOREIGN KEY ("offered_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_tryout_signup_id_tryout_signups_id_fk" FOREIGN KEY ("tryout_signup_id") REFERENCES "public"."tryout_signups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_reviewed_by_user_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_created_player_id_players_id_fk" FOREIGN KEY ("created_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_teams" ADD CONSTRAINT "game_teams_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_teams" ADD CONSTRAINT "game_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_details" ADD CONSTRAINT "tournament_details_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_details" ADD CONSTRAINT "tournament_details_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_hotels" ADD CONSTRAINT "tournament_hotels_tournament_detail_id_tournament_details_id_fk" FOREIGN KEY ("tournament_detail_id") REFERENCES "public"."tournament_details"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_hotels" ADD CONSTRAINT "tournament_hotels_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_nearby_places" ADD CONSTRAINT "tournament_nearby_places_tournament_detail_id_tournament_details_id_fk" FOREIGN KEY ("tournament_detail_id") REFERENCES "public"."tournament_details"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_nearby_places" ADD CONSTRAINT "tournament_nearby_places_nearby_place_id_nearby_places_id_fk" FOREIGN KEY ("nearby_place_id") REFERENCES "public"."nearby_places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_session_teams" ADD CONSTRAINT "practice_session_teams_practice_session_id_practice_sessions_id_fk" FOREIGN KEY ("practice_session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_session_teams" ADD CONSTRAINT "practice_session_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invited_by_id_user_profiles_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_accepted_by_id_user_profiles_id_fk" FOREIGN KEY ("accepted_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_seasons_active" ON "seasons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_season_fees_season_id" ON "season_fees" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_season_fees_active" ON "season_fees" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_coaches_active" ON "coaches" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_teams_season" ON "teams" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_teams_grade" ON "teams" USING btree ("grade_level");--> statement-breakpoint
CREATE INDEX "idx_teams_active" ON "teams" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_parents_email" ON "parents" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_parents_profile" ON "parents" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_players_grade" ON "players" USING btree ("current_grade");--> statement-breakpoint
CREATE INDEX "idx_players_graduating" ON "players" USING btree ("graduating_year");--> statement-breakpoint
CREATE INDEX "idx_players_parent" ON "players" USING btree ("primary_parent_id");--> statement-breakpoint
CREATE INDEX "idx_roster_team" ON "team_roster" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_roster_player" ON "team_roster" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_roster_payment" ON "team_roster" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_tryouts_season" ON "tryout_sessions" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_tryouts_date" ON "tryout_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_signups_session" ON "tryout_signups" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_signups_status" ON "tryout_signups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_signups_email" ON "tryout_signups" USING btree ("parent_email");--> statement-breakpoint
CREATE INDEX "idx_registrations_status" ON "registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_registrations_source" ON "registrations" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_registrations_team" ON "registrations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_registrations_payment" ON "registrations" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_events_team" ON "events" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_events_date" ON "events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_events_type" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_events_season" ON "events" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_team" ON "announcements" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_public" ON "announcements" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_games_season" ON "games" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_games_date" ON "games" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_games_type" ON "games" USING btree ("game_type");--> statement-breakpoint
CREATE INDEX "idx_games_featured" ON "games" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_game_teams_game" ON "game_teams" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_game_teams_team" ON "game_teams" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_venues_name" ON "venues" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_venues_city" ON "venues" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_venues_active" ON "venues" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_hotels_name" ON "hotels" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_hotels_city" ON "hotels" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_hotels_brand" ON "hotels" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "idx_hotels_active" ON "hotels" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_nearby_places_name" ON "nearby_places" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_nearby_places_type" ON "nearby_places" USING btree ("place_type");--> statement-breakpoint
CREATE INDEX "idx_nearby_places_city" ON "nearby_places" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_nearby_places_active" ON "nearby_places" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_tournament_details_game" ON "tournament_details" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_tournament_details_venue" ON "tournament_details" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "idx_tournament_hotels_detail" ON "tournament_hotels" USING btree ("tournament_detail_id");--> statement-breakpoint
CREATE INDEX "idx_tournament_hotels_hotel" ON "tournament_hotels" USING btree ("hotel_id");--> statement-breakpoint
CREATE INDEX "idx_tournament_nearby_places_detail" ON "tournament_nearby_places" USING btree ("tournament_detail_id");--> statement-breakpoint
CREATE INDEX "idx_tournament_nearby_places_place" ON "tournament_nearby_places" USING btree ("nearby_place_id");--> statement-breakpoint
CREATE INDEX "idx_practice_session_teams_session" ON "practice_session_teams" USING btree ("practice_session_id");--> statement-breakpoint
CREATE INDEX "idx_practice_session_teams_team" ON "practice_session_teams" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_practice_sessions_season" ON "practice_sessions" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "idx_practice_sessions_day" ON "practice_sessions" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "idx_practice_sessions_active" ON "practice_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_invites_email" ON "user_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_invites_code" ON "user_invites" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "idx_user_invites_status" ON "user_invites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_invites_invited_by" ON "user_invites" USING btree ("invited_by_id");
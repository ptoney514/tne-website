// Export all enums
export * from './enums';

// Export all tables
export * from './userProfiles';
export * from './neonAuth';
export * from './seasons';
export * from './coaches';
export * from './teams';
export * from './parents';
export * from './players';
export * from './roster';
export * from './tryouts';
export * from './registrations';
export * from './events';
export * from './announcements';
export * from './contact';

// New tables for games, tournaments, practice sessions
export * from './games';
export * from './gameTeams';
export * from './venues';
export * from './hotels';
export * from './nearbyPlaces';
export * from './tournamentDetails';
export * from './practiceSessions';
export * from './userInvites';

// Re-export commonly used types
export type {
  UserProfile,
  NewUserProfile,
} from './userProfiles';

export type {
  NeonAuthUser,
} from './neonAuth';

export type {
  Season,
  NewSeason,
} from './seasons';

export type {
  Coach,
  NewCoach,
} from './coaches';

export type {
  Team,
  NewTeam,
} from './teams';

export type {
  Parent,
  NewParent,
} from './parents';

export type {
  Player,
  NewPlayer,
} from './players';

export type {
  TeamRoster,
  NewTeamRoster,
} from './roster';

export type {
  TryoutSession,
  NewTryoutSession,
  TryoutSignup,
  NewTryoutSignup,
} from './tryouts';

export type {
  Registration,
  NewRegistration,
} from './registrations';

export type {
  Event,
  NewEvent,
} from './events';

export type {
  Announcement,
  NewAnnouncement,
} from './announcements';

export type {
  ContactSubmission,
  NewContactSubmission,
} from './contact';

// New types
export type {
  Game,
  NewGame,
} from './games';

export type {
  GameTeam,
  NewGameTeam,
} from './gameTeams';

export type {
  Venue,
  NewVenue,
} from './venues';

export type {
  Hotel,
  NewHotel,
} from './hotels';

export type {
  NearbyPlace,
  NewNearbyPlace,
} from './nearbyPlaces';

export type {
  TournamentDetail,
  NewTournamentDetail,
  TournamentHotel,
  NewTournamentHotel,
  TournamentNearbyPlace,
  NewTournamentNearbyPlace,
} from './tournamentDetails';

export type {
  PracticeSession,
  NewPracticeSession,
  PracticeSessionTeam,
  NewPracticeSessionTeam,
} from './practiceSessions';

export type {
  UserInvite,
  NewUserInvite,
} from './userInvites';

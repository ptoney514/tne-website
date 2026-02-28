import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Loader2, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, compareWithExisting, generateTemplateFile, exportToExcel } from '@/lib/excelParser';
import { api } from '@/lib/api-client';
import ExcelDropZone from './ExcelDropZone';
import ExcelPreviewTable from './ExcelPreviewTable';
import ExcelValidationSummary from './ExcelValidationSummary';

const STEPS = {
  UPLOAD: 'upload',
  PREVIEW: 'preview',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function ExcelUploadModal({ isOpen, onClose, onSuccess, seasonId }) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [parsedData, setParsedData] = useState(null);
  const [diff, setDiff] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadWarnings, setUploadWarnings] = useState([]);

  // Fetch existing data from API for comparison
  const fetchExistingData = useCallback(async () => {
    try {
      const [teamsData, coachesData, playersData] = await Promise.all([
        api.get('/admin/teams'),
        api.get('/admin/coaches'),
        api.get('/admin/players'),
      ]);

      // Group players by team name for rosters
      const rostersMap = new Map();
      (playersData || []).forEach(player => {
        const teamName = player.team?.name || player.teamName;
        if (!teamName) return;

        const teamKey = teamName.toLowerCase();
        if (!rostersMap.has(teamKey)) {
          rostersMap.set(teamKey, { team_name: teamName, players: [] });
        }
        rostersMap.get(teamKey).players.push({
          id: player.id,
          first_name: player.firstName || player.first_name,
          last_name: player.lastName || player.last_name,
          date_of_birth: player.dateOfBirth || player.date_of_birth,
          current_grade: player.currentGrade || player.current_grade,
          graduating_year: player.graduatingYear || player.graduating_year,
          gender: player.gender,
          jersey_number: player.jerseyNumber || player.jersey_number,
          position: player.position,
        });
      });

      return {
        teams: teamsData || [],
        coaches: coachesData || [],
        rosters: Array.from(rostersMap.values()),
      };
    } catch (err) {
      console.error('Failed to fetch existing data:', err);
      return { teams: [], coaches: [], rosters: [] };
    }
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(STEPS.UPLOAD);
      setParsedData(null);
      setDiff(null);
      setError(null);
      setUploadProgress('');
      setUploadWarnings([]);
      fetchExistingData().then(setExistingData);
    }
  }, [isOpen, fetchExistingData]);

  // Handle file selection
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      setParsedData(null);
      setDiff(null);
      return;
    }

    setError(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const data = await parseExcelFile(buffer);
      setParsedData(data);

      // Compare with existing data
      if (existingData) {
        const comparison = compareWithExisting(data, existingData);
        setDiff(comparison);
      }

      setStep(STEPS.PREVIEW);
    } catch (err) {
      setError(`Failed to parse file: ${err.message}`);
      setParsedData(null);
    }
  };

  // Handle upload to Supabase
  const handleUpload = async () => {
    if (!parsedData) return;

    setStep(STEPS.UPLOADING);
    setError(null);

    // Maps to track resolved UUIDs
    const coachIdMap = new Map(); // coach name (lowercase) -> UUID
    const teamIdMap = new Map(); // team name (lowercase) -> UUID

    try {
      // Fetch existing coaches for lookup
      const existingCoaches = await api.get('/admin/coaches');
      const coachLookup = new Map();
      (existingCoaches || []).forEach(c => {
        const key = `${c.firstName || c.first_name} ${c.lastName || c.last_name}`.toLowerCase();
        coachLookup.set(key, c.id);
        if (c.email) coachLookup.set(c.email.toLowerCase(), c.id);
      });

      // 1. Upload coaches FIRST (teams reference them via FK)
      if (parsedData.coaches?.length > 0) {
        setUploadProgress('Uploading coaches...');
        for (const coach of parsedData.coaches) {
          const { _rowIndex, certifications, ...coachBaseData } = coach;

          // Lookup existing coach by email (preferred) or name
          const emailKey = coach.email?.toLowerCase();
          const nameKey = `${coach.first_name} ${coach.last_name}`.toLowerCase();
          const existingId = (emailKey && coachLookup.get(emailKey)) || coachLookup.get(nameKey);

          let coachId;
          if (existingId) {
            // UPDATE existing coach
            await api.patch(`/admin/coaches?id=${existingId}`, coachBaseData);
            coachId = existingId;
          } else {
            // INSERT new coach
            const inserted = await api.post('/admin/coaches', coachBaseData);
            coachId = inserted.id;
          }

          // Store UUID for later reference by teams
          coachIdMap.set(nameKey, coachId);
        }
      }

      // 2. Upload teams with season_id and resolved coach UUIDs
      const uploadWarnings = [];

      if (parsedData.teams?.length > 0) {
        setUploadProgress('Uploading teams...');

        if (!seasonId) {
          throw new Error('No season selected. Please select a season before uploading.');
        }

        // Fetch existing teams for lookup
        const existingTeams = await api.get(`/admin/teams?seasonId=${seasonId}`);
        const teamLookup = new Map();
        (existingTeams || []).forEach(t => {
          teamLookup.set(t.name.toLowerCase(), t.id);
        });

        for (const team of parsedData.teams) {
          const {
            _rowIndex,
            player_count,
            head_coach_name,
            assistant_coach_name,
            ...teamBaseData
          } = team;

          // Resolve coach names to UUIDs
          const headCoachId = head_coach_name
            ? coachIdMap.get(head_coach_name.toLowerCase()) || null
            : null;
          const assistantCoachId = assistant_coach_name
            ? coachIdMap.get(assistant_coach_name.toLowerCase()) || null
            : null;

          // Warn if coach names were provided but didn't resolve
          if (head_coach_name && !headCoachId) {
            uploadWarnings.push(`Coach "${head_coach_name}" not found for team "${team.name}". Head coach will be unassigned.`);
          }
          if (assistant_coach_name && !assistantCoachId) {
            uploadWarnings.push(`Coach "${assistant_coach_name}" not found for team "${team.name}". Assistant coach will be unassigned.`);
          }

          const existingId = teamLookup.get(team.name.toLowerCase());

          const teamData = {
            ...teamBaseData,
            seasonId: seasonId,
            headCoachId: headCoachId,
            assistantCoachId: assistantCoachId,
          };

          let teamId;
          if (existingId) {
            // UPDATE existing team
            await api.patch(`/admin/teams?id=${existingId}`, teamData);
            teamId = existingId;
          } else {
            // INSERT new team
            const inserted = await api.post('/admin/teams', teamData);
            teamId = inserted.id;
          }

          // Store UUID for later reference by rosters
          teamIdMap.set(team.name.toLowerCase(), teamId);
        }
      }

      // 3. Upload players and create team_roster entries
      if (parsedData.rosters?.length > 0) {
        setUploadProgress('Uploading rosters...');

        // Fetch existing players for lookup
        const existingPlayers = await api.get('/admin/players');
        const playerLookup = new Map();
        (existingPlayers || []).forEach(p => {
          const key = `${p.firstName || p.first_name}|${p.lastName || p.last_name}|${p.dateOfBirth || p.date_of_birth}`.toLowerCase();
          playerLookup.set(key, p.id);
        });

        for (const roster of parsedData.rosters) {
          const teamId = teamIdMap.get(roster.team_name?.toLowerCase());
          if (!teamId) {
            console.warn(`Skipping roster for unknown team: ${roster.team_name}`);
            continue;
          }

          for (const player of roster.players) {
            const {
              _rowIndex,
              jersey_number,
              position,
              ...playerBaseData
            } = player;

            // Lookup existing player by name + DOB (natural key)
            const playerKey = `${player.first_name}|${player.last_name}|${player.date_of_birth}`.toLowerCase();
            const existingPlayerId = playerLookup.get(playerKey);

            let playerId;
            if (existingPlayerId) {
              // UPDATE existing player
              await api.patch(`/admin/players?id=${existingPlayerId}`, playerBaseData);
              playerId = existingPlayerId;
            } else {
              // INSERT new player
              const inserted = await api.post('/admin/players', playerBaseData);
              playerId = inserted.id;
            }

            // Add to roster (the API handles upsert logic)
            await api.post('/admin/roster', {
              teamId: teamId,
              playerId: playerId,
              jerseyNumber: jersey_number,
              position: position,
            });
          }
        }
      }

      // Log warnings to console and store for UI display
      if (uploadWarnings.length > 0) {
        console.warn('Upload completed with warnings:', uploadWarnings);
        setUploadWarnings(uploadWarnings);
      }

      setUploadProgress('');
      setStep(STEPS.SUCCESS);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      setStep(STEPS.ERROR);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const blob = generateTemplateFile();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-data-template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export current data
  const handleExportCurrent = async () => {
    try {
      const data = existingData || await fetchExistingData();
      const blob = exportToExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tne-team-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to export data: ${err.message}`);
    }
  };

  // Handle back button
  const handleBack = () => {
    setStep(STEPS.UPLOAD);
    setParsedData(null);
    setDiff(null);
    setError(null);
  };

  if (!isOpen) return null;

  const hasErrors = (parsedData?.errors?.length || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-[14px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-card-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-admin-red/10">
              <Upload className="w-5 h-5 text-admin-red" />
            </div>
            <div>
              <h2 className="text-base font-bold text-admin-text">Upload Team Data</h2>
              <p className="text-sm text-admin-text-secondary">Import teams, coaches, and rosters from Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5 text-admin-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === STEPS.UPLOAD && (
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-admin-text bg-admin-content-bg hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Template
                </button>
                <button
                  onClick={handleExportCurrent}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-admin-text bg-admin-content-bg hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Current Data
                </button>
              </div>

              <ExcelDropZone onFileSelect={handleFileSelect} />

              <div className="bg-admin-content-bg rounded-[12px] p-4 text-sm text-admin-text-secondary">
                <h4 className="font-medium text-admin-text mb-2">Expected sheets:</h4>
                <ul className="space-y-1">
                  <li><strong>Teams</strong> - Team name, grade level, gender, tier, coaches, fees</li>
                  <li><strong>Coaches</strong> (optional) - Coach details with email and certifications</li>
                  <li><strong>Rosters</strong> (optional) - Player assignments to teams</li>
                </ul>
              </div>
            </div>
          )}

          {step === STEPS.PREVIEW && parsedData && (
            <div className="space-y-6">
              <ExcelValidationSummary
                parsedData={parsedData}
                diff={diff}
                errors={parsedData.errors}
                warnings={parsedData.warnings}
              />

              <ExcelPreviewTable parsedData={parsedData} diff={diff} />
            </div>
          )}

          {step === STEPS.UPLOADING && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-admin-red animate-spin mb-4" />
              <p className="text-lg font-medium text-admin-text">Uploading data...</p>
              {uploadProgress && (
                <p className="text-sm text-admin-text-secondary mt-2">{uploadProgress}</p>
              )}
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-medium text-admin-text">Upload Complete!</p>
              <p className="text-sm text-admin-text-secondary mt-2">
                Your team data has been synced to the database.
              </p>
              {uploadWarnings.length > 0 && (
                <div className="mt-4 w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">Warnings:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {uploadWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === STEPS.ERROR && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-red-100 mb-4">
                <X className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-lg font-medium text-admin-text">Upload Failed</p>
              <p className="text-sm text-red-600 mt-2 text-center max-w-md">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-admin-card-border bg-admin-content-bg">
          <div>
            {step === STEPS.PREVIEW && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-admin-text-secondary hover:text-admin-text transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {step === STEPS.UPLOAD && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-admin-text-secondary hover:text-admin-text transition-colors"
              >
                Cancel
              </button>
            )}

            {step === STEPS.PREVIEW && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-admin-text-secondary hover:text-admin-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={hasErrors}
                  className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    hasErrors
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-admin-red hover:opacity-85'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Confirm Upload
                </button>
              </>
            )}

            {(step === STEPS.SUCCESS || step === STEPS.ERROR) && (
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-admin-red hover:opacity-85 rounded-lg transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

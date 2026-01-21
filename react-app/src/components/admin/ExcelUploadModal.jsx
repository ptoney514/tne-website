import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Loader2, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, compareWithExisting, generateTemplateFile, exportToExcel } from '../../lib/excelParser';
import { supabase } from '../../lib/supabase';
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

  // Fetch existing data from Supabase for comparison
  const fetchExistingData = useCallback(async () => {
    try {
      const [teamsRes, coachesRes, rosterRes] = await Promise.all([
        // Include coach joins for change detection
        supabase.from('teams').select(`
          *,
          head_coach:coaches!head_coach_id(first_name, last_name),
          assistant_coach:coaches!assistant_coach_id(first_name, last_name)
        `),
        supabase.from('coaches').select('*'),
        // Query team_roster with player and team info
        supabase.from('team_roster').select(`
          team_id,
          jersey_number,
          position,
          teams!inner(id, name),
          players!inner(id, first_name, last_name, date_of_birth, current_grade, graduating_year, gender)
        `).eq('is_active', true),
      ]);

      // Group roster entries by team name
      const rostersMap = new Map();
      rosterRes.data?.forEach(entry => {
        const teamName = entry.teams?.name;
        if (!teamName) return;

        const teamKey = teamName.toLowerCase();
        if (!rostersMap.has(teamKey)) {
          rostersMap.set(teamKey, { team_name: teamName, players: [] });
        }
        rostersMap.get(teamKey).players.push({
          ...entry.players,
          jersey_number: entry.jersey_number,
          position: entry.position,
        });
      });

      return {
        teams: teamsRes.data || [],
        coaches: coachesRes.data || [],
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
      // 1. Upload coaches FIRST (teams reference them via FK)
      if (parsedData.coaches?.length > 0) {
        setUploadProgress('Uploading coaches...');
        for (const coach of parsedData.coaches) {
          const { _rowIndex, certifications, ...coachBaseData } = coach;

          // Lookup existing coach by email (preferred) or name
          let existingQuery = supabase.from('coaches').select('id');
          if (coach.email) {
            existingQuery = existingQuery.eq('email', coach.email);
          } else {
            existingQuery = existingQuery
              .eq('first_name', coach.first_name)
              .eq('last_name', coach.last_name);
          }

          const { data: existing } = await existingQuery.maybeSingle();

          let coachId;
          if (existing) {
            // UPDATE existing coach
            const { error: updateError } = await supabase
              .from('coaches')
              .update(coachBaseData)
              .eq('id', existing.id);

            if (updateError) {
              throw new Error(`Failed to update coach "${coach.first_name} ${coach.last_name}": ${updateError.message}`);
            }
            coachId = existing.id;
          } else {
            // INSERT new coach
            const { data: inserted, error: insertError } = await supabase
              .from('coaches')
              .insert(coachBaseData)
              .select('id')
              .single();

            if (insertError) {
              throw new Error(`Failed to create coach "${coach.first_name} ${coach.last_name}": ${insertError.message}`);
            }
            coachId = inserted.id;
          }

          // Store UUID for later reference by teams
          const coachKey = `${coach.first_name} ${coach.last_name}`.toLowerCase();
          coachIdMap.set(coachKey, coachId);
        }
      }

      // 2. Upload teams with season_id and resolved coach UUIDs
      const uploadWarnings = [];

      if (parsedData.teams?.length > 0) {
        setUploadProgress('Uploading teams...');

        if (!seasonId) {
          throw new Error('No season selected. Please select a season before uploading.');
        }

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

          // Lookup existing team by name + season
          const { data: existing } = await supabase
            .from('teams')
            .select('id')
            .eq('name', team.name)
            .eq('season_id', seasonId)
            .maybeSingle();

          const teamData = {
            ...teamBaseData,
            season_id: seasonId,
            head_coach_id: headCoachId,
            assistant_coach_id: assistantCoachId,
          };

          let teamId;
          if (existing) {
            // UPDATE existing team
            const { error: updateError } = await supabase
              .from('teams')
              .update(teamData)
              .eq('id', existing.id);

            if (updateError) {
              throw new Error(`Failed to update team "${team.name}": ${updateError.message}`);
            }
            teamId = existing.id;
          } else {
            // INSERT new team
            const { data: inserted, error: insertError } = await supabase
              .from('teams')
              .insert(teamData)
              .select('id')
              .single();

            if (insertError) {
              throw new Error(`Failed to create team "${team.name}": ${insertError.message}`);
            }
            teamId = inserted.id;
          }

          // Store UUID for later reference by rosters
          teamIdMap.set(team.name.toLowerCase(), teamId);
        }
      }

      // 3. Upload players and create team_roster entries
      if (parsedData.rosters?.length > 0) {
        setUploadProgress('Uploading rosters...');
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
            const { data: existing } = await supabase
              .from('players')
              .select('id')
              .eq('first_name', player.first_name)
              .eq('last_name', player.last_name)
              .eq('date_of_birth', player.date_of_birth)
              .maybeSingle();

            let playerId;
            if (existing) {
              // UPDATE existing player
              const { error: updateError } = await supabase
                .from('players')
                .update(playerBaseData)
                .eq('id', existing.id);

              if (updateError) {
                throw new Error(`Failed to update player "${player.first_name} ${player.last_name}": ${updateError.message}`);
              }
              playerId = existing.id;
            } else {
              // INSERT new player
              const { data: inserted, error: insertError } = await supabase
                .from('players')
                .insert(playerBaseData)
                .select('id')
                .single();

              if (insertError) {
                throw new Error(`Failed to create player "${player.first_name} ${player.last_name}": ${insertError.message}`);
              }
              playerId = inserted.id;
            }

            // Check if roster entry exists to preserve payment_status and is_active
            const { data: existingRoster } = await supabase
              .from('team_roster')
              .select('id, payment_status, is_active')
              .eq('team_id', teamId)
              .eq('player_id', playerId)
              .maybeSingle();

            const rosterData = {
              team_id: teamId,
              player_id: playerId,
              jersey_number: jersey_number,
              position: position,
            };

            let rosterError;
            if (existingRoster) {
              // UPDATE: preserve payment_status and is_active
              const { error } = await supabase
                .from('team_roster')
                .update(rosterData)
                .eq('id', existingRoster.id);
              rosterError = error;
            } else {
              // INSERT: set defaults for new roster entry
              const { error } = await supabase
                .from('team_roster')
                .insert({
                  ...rosterData,
                  payment_status: 'pending',
                  is_active: true,
                });
              rosterError = error;
            }

            if (rosterError) {
              throw new Error(`Failed to add "${player.first_name} ${player.last_name}" to roster: ${rosterError.message}`);
            }
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
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tne-red/10">
              <Upload className="w-5 h-5 text-tne-red" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Upload Team Data</h2>
              <p className="text-sm text-stone-500">Import teams, coaches, and rosters from Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Template
                </button>
                <button
                  onClick={handleExportCurrent}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Current Data
                </button>
              </div>

              <ExcelDropZone onFileSelect={handleFileSelect} />

              <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
                <h4 className="font-medium text-stone-900 mb-2">Expected sheets:</h4>
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
              <Loader2 className="w-12 h-12 text-tne-red animate-spin mb-4" />
              <p className="text-lg font-medium text-stone-900">Uploading data...</p>
              {uploadProgress && (
                <p className="text-sm text-stone-500 mt-2">{uploadProgress}</p>
              )}
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-medium text-stone-900">Upload Complete!</p>
              <p className="text-sm text-stone-500 mt-2">
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
              <p className="text-lg font-medium text-stone-900">Upload Failed</p>
              <p className="text-sm text-red-600 mt-2 text-center max-w-md">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
          <div>
            {step === STEPS.PREVIEW && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {step === STEPS.UPLOAD && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
            )}

            {step === STEPS.PREVIEW && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={hasErrors}
                  className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    hasErrors
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-tne-red hover:bg-tne-red-dark'
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
                className="px-6 py-2 text-sm font-medium text-white bg-tne-red hover:bg-tne-red-dark rounded-lg transition-colors"
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

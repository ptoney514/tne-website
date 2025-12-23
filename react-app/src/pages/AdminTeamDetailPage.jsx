/**
 * AdminTeamDetailPage - Enhanced team detail view with Quick Add Players
 *
 * Replaces AdminRosterPage with a polished, tabbed interface
 * featuring Quick Add, enhanced roster table, and parent contact info
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTeamRoster } from '../hooks/usePlayers';
import { supabase } from '../lib/supabase';
import { parsePlayerInput, validateParsedPlayers } from '../utils/playerParser';

// Components
import TeamDetailHeader from '../components/admin/TeamDetailHeader';
import TeamDetailTabs from '../components/admin/TeamDetailTabs';
import QuickAddPlayersCard from '../components/admin/QuickAddPlayersCard';
import ParsePreviewModal from '../components/admin/ParsePreviewModal';
import EnhancedRosterTable from '../components/admin/EnhancedRosterTable';
import EditPlayerModal from '../components/admin/EditPlayerModal';
import TeamsNavbar from '../components/TeamsNavbar';

// Add Player Modal (for existing players)
function AddPlayerModal({ isOpen, onClose, availablePlayers, onAdd, isAdding }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(selectedPlayer, {
      jersey_number: jerseyNumber || null,
      position: position || null,
    });
    setSelectedPlayer('');
    setJerseyNumber('');
    setPosition('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Add Existing Player</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Select Player *
            </label>
            <select
              required
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
            >
              <option value="">Choose a player...</option>
              {availablePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name} ({player.current_grade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Jersey #
              </label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="23"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              >
                <option value="">Select</option>
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedPlayer}
              className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAdding && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Add to Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Modal
function PaymentModal({ rosterEntry, onClose, onSave, isSaving }) {
  const [paymentStatus, setPaymentStatus] = useState(rosterEntry?.payment_status || 'pending');
  const [paymentAmount, setPaymentAmount] = useState(rosterEntry?.payment_amount || '');
  const [paymentDate, setPaymentDate] = useState(rosterEntry?.payment_date || '');
  const [paymentNotes, setPaymentNotes] = useState(rosterEntry?.payment_notes || '');

  if (!rosterEntry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      payment_status: paymentStatus,
      payment_amount: paymentAmount || null,
      payment_date: paymentDate || null,
      payment_notes: paymentNotes || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Update Payment</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
                placeholder="600.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Notes
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red resize-none"
              placeholder="Any payment notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Remove Confirmation Modal
function RemoveConfirmModal({ entry, onClose, onConfirm }) {
  if (!entry) return null;

  const player = entry.player || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Remove Player?</h3>
        <p className="text-stone-600 mb-6">
          Are you sure you want to remove{' '}
          <strong>
            {player.first_name} {player.last_name}
          </strong>{' '}
          from this team?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder tabs
function PracticeScheduleTab({ team }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-stone-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">Practice Schedule</h3>
      <p className="text-stone-500 mb-4">
        {team?.practice_days && team?.practice_time ? (
          <>
            {team.practice_days} at {team.practice_time}
            <br />
            {team.practice_location || 'Location TBD'}
          </>
        ) : (
          'No practice schedule set'
        )}
      </p>
      <p className="text-sm text-stone-400">Full schedule management coming soon</p>
    </div>
  );
}

function TournamentsTab() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-stone-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">Tournaments</h3>
      <p className="text-stone-500 mb-4">View and register for tournaments</p>
      <p className="text-sm text-stone-400">Tournament management coming soon</p>
    </div>
  );
}

function CoachSettingsTab({ team }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-stone-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">Coach & Settings</h3>
      <p className="text-stone-500 mb-4">
        {team?.head_coach
          ? `Head Coach: ${team.head_coach.first_name} ${team.head_coach.last_name}`
          : 'No head coach assigned'}
      </p>
      <p className="text-sm text-stone-400">Team settings management coming soon</p>
    </div>
  );
}

// Main Page Component
export default function AdminTeamDetailPage() {
  const { teamId } = useParams();
  const {
    roster,
    availablePlayers,
    loading,
    error,
    refetch: refetchRoster,
    addToRoster,
    removeFromRoster,
    updateRosterEntry,
    bulkAddToRoster,
  } = useTeamRoster(teamId);

  // State
  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('roster');
  const [quickAddText, setQuickAddText] = useState('');
  const [parsedPlayers, setParsedPlayers] = useState([]);
  const [showParsePreview, setShowParsePreview] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // Fetch team details with coach info
  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select(
          `
          *,
          season:seasons(name),
          head_coach:coaches!teams_head_coach_id_fkey(id, first_name, last_name),
          assistant_coach:coaches!teams_assistant_coach_id_fkey(id, first_name, last_name)
        `
        )
        .eq('id', teamId)
        .single();

      if (!fetchError && data) {
        setTeam(data);
      }
    };

    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  // Calculate stats
  const practicesPerWeek = team?.practice_days
    ? team.practice_days.split(',').length
    : 0;

  // Handle Quick Add parse
  const handleParse = () => {
    const parsed = parsePlayerInput(quickAddText);
    const validated = validateParsedPlayers(parsed);
    setParsedPlayers(validated);
    setShowParsePreview(true);
  };

  // Handle bulk add confirmation
  const handleBulkAddConfirm = async () => {
    setIsBulkAdding(true);
    try {
      const validPlayers = parsedPlayers.filter((p) => p.isValid !== false);
      const results = await bulkAddToRoster(validPlayers, {
        grade_level: team?.grade_level,
        gender: team?.gender,
      });

      if (results.errors.length > 0) {
        alert(
          `Added ${results.added} players. ${results.errors.length} failed:\n${results.errors.map((e) => `${e.player}: ${e.error}`).join('\n')}`
        );
      }

      setShowParsePreview(false);
      setQuickAddText('');
      setParsedPlayers([]);
    } catch (err) {
      console.error('Error in bulk add:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsBulkAdding(false);
    }
  };

  // Handle add existing player
  const handleAddPlayer = async (playerId, rosterData) => {
    setIsAdding(true);
    try {
      await addToRoster(playerId, rosterData);
      setAddModalOpen(false);
    } catch (err) {
      console.error('Error adding player:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle remove player
  const handleRemove = async () => {
    try {
      await removeFromRoster(removeConfirm.id);
      setRemoveConfirm(null);
    } catch (err) {
      console.error('Error removing player:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle update payment
  const handleUpdatePayment = async (paymentData) => {
    setIsSaving(true);
    try {
      await updateRosterEntry(paymentModal.id, paymentData);
      setPaymentModal(null);
    } catch (err) {
      console.error('Error updating payment:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit player (roster data + parent data)
  const handleEditPlayer = async ({ rosterId, playerId, parentId, rosterData, parentData }) => {
    setIsEditing(true);
    try {
      // Update roster entry (jersey number, position)
      await updateRosterEntry(rosterId, rosterData);

      // Handle parent data if any fields are filled
      const hasParentData =
        parentData.first_name ||
        parentData.last_name ||
        parentData.phone ||
        parentData.email;

      if (hasParentData) {
        if (parentId) {
          // Update existing parent
          const { error: parentError } = await supabase
            .from('parents')
            .update(parentData)
            .eq('id', parentId);

          if (parentError) throw parentError;
        } else {
          // Create new parent and link to player
          const { data: newParent, error: createError } = await supabase
            .from('parents')
            .insert([parentData])
            .select()
            .single();

          if (createError) throw createError;

          // Link parent to player
          const { error: linkError } = await supabase
            .from('players')
            .update({ primary_parent_id: newParent.id })
            .eq('id', playerId);

          if (linkError) throw linkError;
        }
      }

      setEditModal(null);
      // Refresh roster to show updated data
      await refetchRoster();
    } catch (err) {
      console.error('Error editing player:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsEditing(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'roster':
        return (
          <>
            {/* Quick Add Card */}
            <QuickAddPlayersCard
              value={quickAddText}
              onChange={setQuickAddText}
              onParse={handleParse}
              disabled={loading}
            />

            {/* Error State */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                Failed to load roster: {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="space-y-3 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-stone-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EnhancedRosterTable
                roster={roster}
                gradeLevel={team?.grade_level}
                onEdit={setEditModal}
                onUpdatePayment={setPaymentModal}
                onRemove={setRemoveConfirm}
                onAddManually={() => setAddModalOpen(true)}
              />
            )}
          </>
        );
      case 'practice':
        return <PracticeScheduleTab team={team} />;
      case 'tournaments':
        return <TournamentsTab />;
      case 'settings':
        return <CoachSettingsTab team={team} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen">
      <TeamsNavbar />

      {/* Header */}
      <TeamDetailHeader
        team={team}
        playerCount={roster.length}
        practicesPerWeek={practicesPerWeek}
        tournamentsCount={0}
      />

      {/* Tabs */}
      <TeamDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderTabContent()}
      </main>

      {/* Modals */}
      <ParsePreviewModal
        isOpen={showParsePreview}
        onClose={() => setShowParsePreview(false)}
        players={parsedPlayers}
        teamName={team?.name}
        gradeLevel={team?.grade_level}
        onConfirm={handleBulkAddConfirm}
        isLoading={isBulkAdding}
      />

      <AddPlayerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availablePlayers={availablePlayers}
        onAdd={handleAddPlayer}
        isAdding={isAdding}
      />

      {editModal && (
        <EditPlayerModal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          entry={editModal}
          gradeLevel={team?.grade_level}
          onSave={handleEditPlayer}
          isSaving={isEditing}
        />
      )}

      {paymentModal && (
        <PaymentModal
          key={paymentModal.id}
          rosterEntry={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSave={handleUpdatePayment}
          isSaving={isSaving}
        />
      )}

      <RemoveConfirmModal
        entry={removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}

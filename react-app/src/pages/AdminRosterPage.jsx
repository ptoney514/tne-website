import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTeamRoster } from '../hooks/usePlayers';
import { supabase } from '../lib/supabase';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';
import { ChevronLeft, UserPlus, UserMinus, Loader2, X } from 'lucide-react';

function AddPlayerModal({ isOpen, onClose, availablePlayers, onAdd, isAdding }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(selectedPlayer, { jersey_number: jerseyNumber || null, position: position || null });
    setSelectedPlayer('');
    setJerseyNumber('');
    setPosition('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bebas">Add Player to Team</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Select Player *</label>
            <select
              required
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              <label className="block text-sm font-medium text-white/60 mb-1">Jersey #</label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                placeholder="23"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
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
              className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedPlayer}
              className="px-4 py-2 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
              Add to Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Using key prop to reset modal state when rosterEntry changes
function PaymentModalContent({ rosterEntry, onClose, onSave, isSaving }) {
  const [paymentStatus, setPaymentStatus] = useState(rosterEntry?.payment_status || 'pending');
  const [paymentAmount, setPaymentAmount] = useState(rosterEntry?.payment_amount || '');
  const [paymentDate, setPaymentDate] = useState(rosterEntry?.payment_date || '');
  const [paymentNotes, setPaymentNotes] = useState(rosterEntry?.payment_notes || '');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bebas">Update Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
                placeholder="600.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Notes</label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tne-red/50 resize-none"
              placeholder="Any payment notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RosterRow({ entry, onRemove, onUpdatePayment }) {
  const player = entry.player;
  const paymentColors = {
    pending: 'bg-amber-500/20 text-amber-400',
    partial: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-green-500/20 text-green-400',
    waived: 'bg-white/10 text-white/60',
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
            {entry.jersey_number || '-'}
          </div>
          <div>
            <p className="font-medium">{player.first_name} {player.last_name}</p>
            <p className="text-xs text-white/50">{player.current_grade} • {player.gender === 'male' ? 'M' : 'F'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-white/70">
        {entry.position || player.position || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-white/70">
        {new Date(entry.joined_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onUpdatePayment(entry)}
          className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[entry.payment_status]} hover:opacity-80 transition-opacity`}
        >
          {entry.payment_status.charAt(0).toUpperCase() + entry.payment_status.slice(1)}
          {entry.payment_amount && ` ($${entry.payment_amount})`}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onRemove(entry)}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/60 hover:text-red-400"
          title="Remove from team"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

export default function AdminRosterPage() {
  const { teamId } = useParams();
  const { roster, availablePlayers, loading, error, addToRoster, removeFromRoster, updateRosterEntry } = useTeamRoster(teamId);
  const [team, setTeam] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  // Fetch team details
  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*, season:seasons(name)')
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

  const handleRemove = async () => {
    try {
      await removeFromRoster(removeConfirm.id);
      setRemoveConfirm(null);
    } catch (err) {
      console.error('Error removing player:', err);
      alert(`Error: ${err.message}`);
    }
  };

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

  // Stats
  const totalPaid = roster.filter((r) => r.payment_status === 'paid').length;
  const totalPending = roster.filter((r) => r.payment_status === 'pending').length;

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin/teams"
              className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Teams
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bebas tracking-tight">
                  {team?.name || 'Team'} Roster
                </h1>
                <p className="text-white/60 mt-1">
                  {team?.season?.name} • {roster.length} player{roster.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(true)}
                disabled={availablePlayers.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Add Player
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/60">Total Players</p>
              <p className="text-2xl font-bebas">{roster.length}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/60">Payments Received</p>
              <p className="text-2xl font-bebas text-green-400">{totalPaid}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/60">Payments Pending</p>
              <p className="text-2xl font-bebas text-amber-400">{totalPending}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/60">Available to Add</p>
              <p className="text-2xl font-bebas">{availablePlayers.length}</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              Failed to load roster: {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : roster.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/10">
              <UserPlus className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No players on this team</h3>
              <p className="text-white/60 mb-6">Add players to start building your roster</p>
              <button
                onClick={() => setAddModalOpen(true)}
                disabled={availablePlayers.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                Add Player
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((entry) => (
                    <RosterRow
                      key={entry.id}
                      entry={entry}
                      onRemove={setRemoveConfirm}
                      onUpdatePayment={setPaymentModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <TeamsFooter />

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availablePlayers={availablePlayers}
        onAdd={handleAddPlayer}
        isAdding={isAdding}
      />

      {/* Payment Modal - using key to reset state when entry changes */}
      {paymentModal && (
        <PaymentModalContent
          key={paymentModal.id}
          rosterEntry={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSave={handleUpdatePayment}
          isSaving={isSaving}
        />
      )}

      {/* Remove Confirmation */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">Remove Player?</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to remove <strong>{removeConfirm.player.first_name} {removeConfirm.player.last_name}</strong> from this team?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

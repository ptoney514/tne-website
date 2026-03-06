import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Hook for team registration.
 * - Fetches active teams from the public API (same source as Teams page)
 * - Falls back to static JSON if API fails
 * - Submits registration to serverless API endpoint
 */
export function useTeamRegistration() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch active teams from API (filters by isActive = true)
      const freshTeams = await api.get('/public/teams');
      setTeams(freshTeams || []);
    } catch (apiErr) {
      console.warn('[useTeamRegistration] API failed, falling back to JSON:', apiErr.message);

      try {
        // Fallback to static JSON
        const [teamsResponse, configResponse] = await Promise.all([
          fetch('/data/json/teams.json'),
          fetch('/data/json/config.json'),
        ]);

        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
        }

        const teamsData = await teamsResponse.json();
        const configData = configResponse.ok ? await configResponse.json() : { season: {} };

        const transformedTeams = (teamsData.teams || []).map(team => ({
          id: team.id,
          name: team.name,
          grade_level: team.grade_level,
          gender: team.gender,
          team_fee: team.team_fee,
          uniform_fee: team.uniform_fee,
          season: {
            id: teamsData.season?.id || configData.season?.id,
            name: teamsData.season?.name || configData.season?.name,
          },
        }));

        setTeams(transformedTeams);
      } catch (jsonErr) {
        console.error('Error fetching teams:', jsonErr);
        setError(jsonErr.message || 'Failed to fetch teams');
        setTeams([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const submitRegistration = useCallback(
    async (registrationData, turnstileToken = null) => {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const isOther = registrationData.teamId === 'other';

        // Combined waiver acceptance check (all three must be true)
        const allWaiversAccepted =
          registrationData.waiverLiability &&
          registrationData.waiverMedical &&
          registrationData.waiverMedia;

        // Determine payment status
        let paymentStatus = 'pending';
        if (isOther) {
          paymentStatus = 'pending_team_placement';
        } else if (registrationData.paymentPlanType === 'full' && registrationData.paymentConfirmed) {
          paymentStatus = 'pending_verification';
        } else if (registrationData.paymentPlanType === 'installment') {
          paymentStatus = 'payment_plan_active';
        } else if (registrationData.paymentPlanType === 'special_request') {
          paymentStatus = 'awaiting_approval';
        }

        const payload = {
          registration: {
            source: 'direct',
            registration_type: 'team',
            team_id: isOther ? null : registrationData.teamId,
            team_other: isOther || false,
            player_first_name: registrationData.playerFirstName,
            player_last_name: registrationData.playerLastName,
            player_date_of_birth: registrationData.playerDob,
            player_graduating_year: registrationData.playerGraduatingYear,
            player_current_grade: registrationData.playerGrade,
            player_gender: registrationData.playerGender,
            jersey_size: isOther ? null : registrationData.jerseySize,
            position: registrationData.position || null,
            medical_notes: registrationData.medicalNotes || null,
            desired_jersey_number: isOther ? null : registrationData.desiredJerseyNumber,
            last_team_played_for: registrationData.lastTeamPlayedFor,
            parent_first_name: registrationData.parentFirstName,
            parent_last_name: registrationData.parentLastName,
            parent_email: registrationData.parentEmail,
            parent_phone: registrationData.parentPhone,
            parent_address_street: registrationData.addressStreet,
            parent_address_city: registrationData.addressCity,
            parent_address_state: registrationData.addressState,
            parent_address_zip: registrationData.addressZip,
            parent_relationship: registrationData.relationship,
            parent_home_phone: registrationData.parentHomePhone,
            parent2_name: registrationData.parent2Name || null,
            parent2_phone: registrationData.parent2Phone || null,
            parent2_email: registrationData.parent2Email || null,
            emergency_contact_name: registrationData.emergencyName,
            emergency_contact_phone: registrationData.emergencyPhone,
            emergency_contact_relationship: registrationData.emergencyRelationship || null,
            waiver_accepted: allWaiversAccepted,
            waiver_accepted_at: allWaiversAccepted ? new Date().toISOString() : null,
            waiver_liability: registrationData.waiverLiability,
            waiver_medical: registrationData.waiverMedical,
            waiver_media: registrationData.waiverMedia,
            payment_terms_acknowledged: isOther ? false : (registrationData.paymentTermsAcknowledged || false),
            payment_plan_type: isOther ? null : registrationData.paymentPlanType,
            payment_plan_option: isOther ? null : (registrationData.paymentPlanOption || null),
            initial_amount_due: isOther ? 0 : registrationData.initialAmountDue,
            remaining_balance: isOther ? 0 : registrationData.remainingBalance,
            payment_reference_id: registrationData.paymentReferenceId,
            payment_confirmed: isOther ? false : (registrationData.paymentConfirmed || false),
            special_request_reason: registrationData.specialRequestReason || null,
            special_request_notes: registrationData.specialRequestNotes || null,
            payment_status: paymentStatus,
            status: registrationData.status || (isOther ? 'pending_team_placement' : 'pending_payment'),
          },
          turnstileToken,
        };

        // Submit to serverless API
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Registration failed');
        }

        setSubmitSuccess(true);
        return { success: true, referenceId: result.referenceId };
      } catch (err) {
        console.error('Error submitting registration:', err);
        setSubmitError(err.message || 'Failed to submit registration');
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const resetSubmitState = useCallback(() => {
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    submitRegistration,
    submitting,
    submitSuccess,
    submitError,
    resetSubmitState,
  };
}

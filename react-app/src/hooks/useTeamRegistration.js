import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for team registration.
 * - Fetches teams from static JSON files
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
      // Fetch teams and config in parallel
      const [teamsResponse, configResponse] = await Promise.all([
        fetch('/data/json/teams.json'),
        fetch('/data/json/config.json'),
      ]);

      if (!teamsResponse.ok) {
        throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
      }

      const teamsData = await teamsResponse.json();
      const configData = configResponse.ok ? await configResponse.json() : { season: {} };

      // Transform teams to match expected format
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
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');
      // Return sample data as fallback
      setTeams(getSampleTeams());
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
        // Determine payment status based on payment plan type
        let paymentStatus = 'pending';
        if (registrationData.paymentPlanType === 'full' && registrationData.paymentConfirmed) {
          paymentStatus = 'pending_verification';
        } else if (registrationData.paymentPlanType === 'installment') {
          paymentStatus = 'payment_plan_active';
        } else if (registrationData.paymentPlanType === 'special_request') {
          paymentStatus = 'awaiting_approval';
        }

        // Combined waiver acceptance check (all three must be true)
        const allWaiversAccepted =
          registrationData.waiverLiability &&
          registrationData.waiverMedical &&
          registrationData.waiverMedia;

        // Build registration payload
        const payload = {
          registration: {
            source: 'direct',
            team_id: registrationData.teamId,
            player_first_name: registrationData.playerFirstName,
            player_last_name: registrationData.playerLastName,
            player_date_of_birth: registrationData.playerDob,
            player_graduating_year: registrationData.playerGraduatingYear,
            player_current_grade: registrationData.playerGrade,
            player_gender: registrationData.playerGender,
            jersey_size: registrationData.jerseySize,
            position: registrationData.position || null,
            medical_notes: registrationData.medicalNotes || null,
            parent_first_name: registrationData.parentFirstName,
            parent_last_name: registrationData.parentLastName,
            parent_email: registrationData.parentEmail,
            parent_phone: registrationData.parentPhone,
            parent_address_street: registrationData.addressStreet,
            parent_address_city: registrationData.addressCity,
            parent_address_state: registrationData.addressState,
            parent_address_zip: registrationData.addressZip,
            parent_relationship: registrationData.relationship,
            emergency_contact_name: registrationData.emergencyName,
            emergency_contact_phone: registrationData.emergencyPhone,
            emergency_contact_relationship: registrationData.emergencyRelationship || null,

            // Waivers
            waiver_accepted: allWaiversAccepted,
            waiver_accepted_at: allWaiversAccepted ? new Date().toISOString() : null,
            waiver_liability: registrationData.waiverLiability,
            waiver_medical: registrationData.waiverMedical,
            waiver_media: registrationData.waiverMedia,
            payment_terms_acknowledged: registrationData.paymentTermsAcknowledged || false,

            // Payment commitment fields
            payment_plan_type: registrationData.paymentPlanType,
            payment_plan_option: registrationData.paymentPlanOption || null,
            initial_amount_due: registrationData.initialAmountDue,
            remaining_balance: registrationData.remainingBalance,
            payment_reference_id: registrationData.paymentReferenceId,
            payment_confirmed: registrationData.paymentConfirmed || false,

            // Special arrangement fields
            special_request_reason: registrationData.specialRequestReason || null,
            special_request_notes: registrationData.specialRequestNotes || null,

            // Status
            payment_status: paymentStatus,
            status: registrationData.status || 'pending_payment',
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

// Sample data for development/fallback
function getSampleTeams() {
  return [
    {
      id: '1',
      name: '4th Grade Boys - Elite',
      grade_level: '4th',
      gender: 'male',
      team_fee: 450.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
    {
      id: '2',
      name: '5th Grade Boys - Elite',
      grade_level: '5th',
      gender: 'male',
      team_fee: 450.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
    {
      id: '3',
      name: '5th Grade Girls - Elite',
      grade_level: '5th',
      gender: 'female',
      team_fee: 450.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
    {
      id: '4',
      name: '6th Grade Boys - Elite',
      grade_level: '6th',
      gender: 'male',
      team_fee: 475.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
    {
      id: '5',
      name: '7th Grade Boys - Elite',
      grade_level: '7th',
      gender: 'male',
      team_fee: 475.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
    {
      id: '6',
      name: '8th Grade Boys - Elite',
      grade_level: '8th',
      gender: 'male',
      team_fee: 500.00,
      uniform_fee: 75.00,
      season: { id: 'season-1', name: '2025-26 Winter' },
    },
  ];
}

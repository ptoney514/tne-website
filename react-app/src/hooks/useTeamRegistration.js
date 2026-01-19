import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Set to true to skip Supabase and use sample data (faster for development)
const USE_SAMPLE_DATA = false;

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

    // Use sample data for development (instant load)
    if (USE_SAMPLE_DATA) {
      setTeams(getSampleTeams());
      setLoading(false);
      return;
    }

    try {
      // Fetch active teams from the active season
      const { data: seasonData } = await supabase
        .from('seasons')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!seasonData) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          grade_level,
          gender,
          team_fee,
          uniform_fee,
          season:seasons(id, name)
        `)
        .eq('season_id', seasonData.id)
        .eq('is_active', true)
        .order('grade_level', { ascending: true });

      if (fetchError) throw fetchError;

      setTeams(data || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');
      // Return sample data for now if Supabase fetch fails
      setTeams(getSampleTeams());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const submitRegistration = useCallback(
    async (registrationData) => {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        // Determine payment status based on payment plan type
        let paymentStatus = 'pending';
        if (registrationData.paymentPlanType === 'full' && registrationData.paymentConfirmed) {
          paymentStatus = 'pending_verification'; // Awaiting admin verification
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

        const { error: insertError } = await supabase
          .from('registrations')
          .insert({
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
          });

        if (insertError) throw insertError;

        setSubmitSuccess(true);
        return { success: true };
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

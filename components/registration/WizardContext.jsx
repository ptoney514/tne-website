import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tne_registration_draft';

const initialFormData = {
  // Step 1: Player & Team Info
  teamId: '',
  playerFirstName: '',
  playerLastName: '',
  playerDob: '',
  playerGrade: '',
  playerGender: '',
  jerseySize: '',
  position: '',
  desiredJerseyNumber: '',
  lastTeamPlayedFor: '',

  // Step 2: Parent & Emergency Contact
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  relationship: '',
  addressStreet: '',
  addressCity: '',
  addressState: 'NE',
  addressZip: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelationship: '',
  parentHomePhone: '',
  parent2Name: '',
  parent2Phone: '',
  parent2Email: '',

  // Step 3: Payment Commitment
  paymentPlanType: '', // 'full', 'installment', 'special_request'
  paymentPlanOption: '', // 'plan_1', 'plan_2', etc.
  specialRequestReason: '',
  specialRequestNotes: '',
  paymentConfirmed: false,

  // Step 4: Waivers
  waiverLiability: false,
  waiverMedical: false,
  waiverMedia: false,
  parentPolicy: false,
  paymentTermsAcknowledged: false,

  // Legacy fields for compatibility
  medicalNotes: '',
};

const initialState = {
  currentStep: 1,
  totalSteps: 4,
  registrationType: null, // null = type selector, 'team' = team registration
  formData: initialFormData,
  validationErrors: {},
  selectedTeam: null,
  paymentReferenceId: null,
  isDraft: false,
};

// Generate a unique payment reference ID
function generateReferenceId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TNE-${year}-${random}`;
}

// Action types
const ACTIONS = {
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_FIELDS: 'UPDATE_FIELDS',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERROR: 'CLEAR_VALIDATION_ERROR',
  SET_SELECTED_TEAM: 'SET_SELECTED_TEAM',
  SET_PAYMENT_REFERENCE_ID: 'SET_PAYMENT_REFERENCE_ID',
  SET_REGISTRATION_TYPE: 'SET_REGISTRATION_TYPE',
  LOAD_DRAFT: 'LOAD_DRAFT',
  RESET: 'RESET',
};

function wizardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };

    case ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };

    case ACTIONS.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };

    case ACTIONS.UPDATE_FIELD: {
      const newFormData = {
        ...state.formData,
        [action.payload.name]: action.payload.value,
      };
      // Dynamically adjust totalSteps when teamId changes
      const newTotalSteps = newFormData.teamId === 'other' ? 3 : 4;
      return {
        ...state,
        formData: newFormData,
        totalSteps: newTotalSteps,
        isDraft: true,
      };
    }

    case ACTIONS.UPDATE_FIELDS:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
        isDraft: true,
      };

    case ACTIONS.SET_VALIDATION_ERRORS:
      return { ...state, validationErrors: action.payload };

    case ACTIONS.CLEAR_VALIDATION_ERROR: {
      const newErrors = { ...state.validationErrors };
      delete newErrors[action.payload];
      return { ...state, validationErrors: newErrors };
    }

    case ACTIONS.SET_SELECTED_TEAM:
      return { ...state, selectedTeam: action.payload };

    case ACTIONS.SET_PAYMENT_REFERENCE_ID:
      return { ...state, paymentReferenceId: action.payload };

    case ACTIONS.SET_REGISTRATION_TYPE: {
      const type = action.payload;
      return {
        ...state,
        registrationType: type,
        totalSteps: state.formData.teamId === 'other' ? 3 : 4,
        isDraft: true,
      };
    }

    case ACTIONS.LOAD_DRAFT: {
      const draftFormData = { ...initialFormData, ...action.payload.formData };
      return {
        ...state,
        formData: draftFormData,
        currentStep: action.payload.currentStep || 1,
        registrationType: action.payload.registrationType || null,
        totalSteps: draftFormData.teamId === 'other' ? 3 : 4,
        selectedTeam: action.payload.selectedTeam || null,
        paymentReferenceId: action.payload.paymentReferenceId || state.paymentReferenceId,
        isDraft: true,
      };
    }

    case ACTIONS.RESET:
      return { ...initialState, paymentReferenceId: generateReferenceId() };

    default:
      return state;
  }
}

const WizardContext = createContext(null);

export function WizardProvider({ children, teams = [] }) {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    paymentReferenceId: generateReferenceId(),
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load if data is less than 7 days old
        const savedDate = new Date(parsed.savedAt);
        const daysSinceSave = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceSave < 7) {
          dispatch({ type: ACTIONS.LOAD_DRAFT, payload: parsed });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load registration draft:', e);
    }
  }, []);

  // Save draft to localStorage when formData changes
  useEffect(() => {
    if (state.isDraft) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            formData: state.formData,
            currentStep: state.currentStep,
            registrationType: state.registrationType,
            selectedTeam: state.selectedTeam,
            paymentReferenceId: state.paymentReferenceId,
            savedAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.error('Failed to save registration draft:', e);
      }
    }
  }, [state.formData, state.currentStep, state.registrationType, state.selectedTeam, state.paymentReferenceId, state.isDraft]);

  // Update selected team when teamId changes
  useEffect(() => {
    if (state.formData.teamId && teams.length > 0) {
      const team = teams.find((t) => t.id === state.formData.teamId);
      if (team) {
        dispatch({ type: ACTIONS.SET_SELECTED_TEAM, payload: team });
      }
    }
  }, [state.formData.teamId, teams]);

  const setStep = useCallback((step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: ACTIONS.NEXT_STEP });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: ACTIONS.PREV_STEP });
  }, []);

  const updateField = useCallback((name, value) => {
    dispatch({ type: ACTIONS.UPDATE_FIELD, payload: { name, value } });
  }, []);

  const updateFields = useCallback((fields) => {
    dispatch({ type: ACTIONS.UPDATE_FIELDS, payload: fields });
  }, []);

  const setValidationErrors = useCallback((errors) => {
    dispatch({ type: ACTIONS.SET_VALIDATION_ERRORS, payload: errors });
  }, []);

  const clearValidationError = useCallback((fieldName) => {
    dispatch({ type: ACTIONS.CLEAR_VALIDATION_ERROR, payload: fieldName });
  }, []);

  const setRegistrationType = useCallback((type) => {
    dispatch({ type: ACTIONS.SET_REGISTRATION_TYPE, payload: type });
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const resetWizard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: ACTIONS.RESET });
  }, []);

  const value = {
    ...state,
    teams,
    setStep,
    nextStep,
    prevStep,
    updateField,
    updateFields,
    setRegistrationType,
    setValidationErrors,
    clearValidationError,
    clearDraft,
    resetWizard,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

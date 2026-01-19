// Validation helpers for registration wizard

export function validateStep1(formData) {
  const errors = {};

  if (!formData.teamId) errors.teamId = 'Please select a team';
  if (!formData.playerFirstName?.trim()) errors.playerFirstName = 'First name is required';
  if (!formData.playerLastName?.trim()) errors.playerLastName = 'Last name is required';
  if (!formData.playerDob) errors.playerDob = 'Date of birth is required';
  if (!formData.playerGrade) errors.playerGrade = 'Grade is required';
  if (!formData.playerGender) errors.playerGender = 'Gender is required';
  if (!formData.jerseySize) errors.jerseySize = 'Jersey size is required';

  return errors;
}

export function validateStep2(formData) {
  const errors = {};

  if (!formData.parentFirstName?.trim()) errors.parentFirstName = 'First name is required';
  if (!formData.parentLastName?.trim()) errors.parentLastName = 'Last name is required';
  if (!formData.parentEmail?.trim()) errors.parentEmail = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
    errors.parentEmail = 'Please enter a valid email address';
  }
  if (!formData.parentPhone?.trim()) errors.parentPhone = 'Phone number is required';
  if (!formData.relationship) errors.relationship = 'Relationship is required';
  if (!formData.addressStreet?.trim()) errors.addressStreet = 'Street address is required';
  if (!formData.addressCity?.trim()) errors.addressCity = 'City is required';
  if (!formData.addressState) errors.addressState = 'State is required';
  if (!formData.addressZip?.trim()) errors.addressZip = 'ZIP code is required';
  else if (!/^\d{5}$/.test(formData.addressZip)) {
    errors.addressZip = 'Please enter a valid 5-digit ZIP code';
  }
  if (!formData.emergencyName?.trim()) errors.emergencyName = 'Emergency contact name is required';
  if (!formData.emergencyPhone?.trim()) errors.emergencyPhone = 'Emergency contact phone is required';

  return errors;
}

export function validateStep3(formData) {
  const errors = {};

  if (!formData.paymentPlanType) {
    errors.paymentPlanType = 'Please select a payment option';
  }

  if (formData.paymentPlanType === 'installment' && !formData.paymentPlanOption) {
    errors.paymentPlanOption = 'Please select a payment plan';
  }

  if (formData.paymentPlanType === 'special_request') {
    if (!formData.specialRequestReason) {
      errors.specialRequestReason = 'Please select a reason';
    }
    if (!formData.specialRequestNotes?.trim()) {
      errors.specialRequestNotes = 'Please provide an explanation';
    }
  }

  return errors;
}

export function validateStep4(formData) {
  const errors = {};

  if (!formData.waiverLiability) {
    errors.waiverLiability = 'You must accept the liability waiver';
  }
  if (!formData.waiverMedical) {
    errors.waiverMedical = 'You must accept the medical authorization';
  }
  if (!formData.waiverMedia) {
    errors.waiverMedia = 'You must accept the media release';
  }
  if (!formData.paymentTermsAcknowledged) {
    errors.paymentTermsAcknowledged = 'You must acknowledge the payment terms';
  }

  return errors;
}

// Calculate graduating year from current grade
export function calculateGraduatingYear(grade) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const schoolYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const gradeNum = parseInt(grade, 10);
  return schoolYear + (12 - gradeNum);
}

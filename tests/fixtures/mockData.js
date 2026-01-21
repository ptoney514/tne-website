/**
 * Mock Data Generators for E2E Form Submission Tests
 *
 * Generates varied test data for Registration, Tryouts, and Contact forms.
 * All test emails use pattern: test.{type}{seed}@example.com for easy cleanup.
 */

// First and last name pools for variety
const firstNames = [
  'Michael', 'Jessica', 'James', 'Emily', 'David', 'Sarah',
  'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Daniel', 'Jennifer'
];

const lastNames = [
  'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas'
];

const schools = [
  'Lincoln Elementary', 'Washington Middle School', 'Jefferson Academy',
  'Roosevelt Elementary', 'Kennedy Middle School', 'Adams Elementary',
  'Madison School', 'Monroe Academy', 'Jackson Elementary', null, '', null
];

const streets = [
  '123 Oak Street', '456 Maple Avenue', '789 Pine Drive',
  '321 Elm Lane', '654 Cedar Court', '987 Birch Road',
  '147 Willow Way', '258 Spruce Circle', '369 Ash Boulevard',
  '741 Cherry Lane', '852 Walnut Drive', '963 Poplar Avenue'
];

const cities = [
  'Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Papillion', 'La Vista'
];

const relationships = ['mother', 'father', 'guardian', 'other'];

const contactSubjects = [
  'Sponsorship Inquiry',
  'Employment / Coaching',
  'Media / Press',
  'Partnership',
  'Other'
];

const messageTemplates = [
  'I am interested in learning more about your program and how my child can participate.',
  'We are looking for sponsorship opportunities for youth basketball programs in the Omaha area. Please contact us.',
  'I have experience coaching youth basketball and am interested in potential coaching positions with your organization.',
  'Our media outlet would like to feature your program. Please reach out to discuss coverage opportunities.',
  'We represent a local business and are interested in partnership opportunities to support youth athletics.',
  'I have a question about registration deadlines and the tryout process for the upcoming season.',
  'My child has previous travel basketball experience and we would like to inquire about skill assessment opportunities.',
  'We are new to the area and looking for competitive basketball programs for our 6th grader.',
  'I would like to discuss group training opportunities for a small team of players preparing for high school tryouts.',
  'Our organization is hosting a tournament and we would like to invite TNE teams to participate.',
  'I am writing to inquire about scholarship or financial assistance options for talented players.',
  'We are interested in booking your facility for a youth basketball event. Please provide availability.'
];

const specialRequestReasons = [
  'financial_hardship',
  'timing_issue',
  'sponsorship',
  'other'
];

const specialRequestNotes = [
  'Need financial assistance for registration.',
  'We have two children registering for the same season.',
  'Returning player from last season - requesting loyalty discount.',
  'Would like to discuss payment timeline options.',
  'Single parent household requesting assistance.',
  'Military family seeking available discounts.'
];

/**
 * Generate a unique test email
 */
function generateTestEmail(type, seed) {
  return `test.${type}${seed}@example.com`;
}

/**
 * Generate a random phone number
 */
function generatePhone() {
  const area = '402';
  const exchange = String(Math.floor(Math.random() * 900) + 100);
  const subscriber = String(Math.floor(Math.random() * 9000) + 1000);
  return `${area}${exchange}${subscriber}`;
}

/**
 * Generate a date of birth for a given grade
 * Grade 3 = ~9 years old, Grade 8 = ~14 years old
 */
function generateDobForGrade(grade) {
  const gradeNum = parseInt(grade);
  const age = gradeNum + 5; // Grade 3 = 8yo, Grade 8 = 13yo roughly
  const birthYear = new Date().getFullYear() - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
}

/**
 * Generate registration data with variations
 * @param {number} index - Index from 0-11 for generating 12 variations
 */
export function generateRegistrationData(index) {
  const grades = ['3', '4', '5', '6', '7', '8'];
  const genders = ['male', 'female'];
  const paymentTypes = ['full', 'installment', 'special_request'];
  const jerseySizes = ['YS', 'YM', 'YL', 'AS', 'AM'];
  // Position values must match the actual form options: guard, forward, center, none, or null (empty)
  const positions = ['guard', 'forward', 'center', 'none', null, null];
  const states = ['NE', 'IA', 'KS', 'MO'];

  const grade = grades[index % grades.length];
  const gender = genders[index % genders.length];
  const paymentType = paymentTypes[index % paymentTypes.length];

  return {
    // Player info
    playerFirstName: firstNames[index % firstNames.length],
    playerLastName: lastNames[index % lastNames.length],
    playerDob: generateDobForGrade(grade),
    playerGrade: grade,
    playerGender: gender,
    jerseySize: jerseySizes[index % jerseySizes.length],
    position: positions[index % positions.length],

    // Parent info
    parentFirstName: firstNames[(index + 3) % firstNames.length],
    parentLastName: lastNames[index % lastNames.length],
    parentEmail: generateTestEmail('reg', index),
    parentPhone: generatePhone(),
    relationship: relationships[index % relationships.length],

    // Address
    addressStreet: streets[index % streets.length],
    addressCity: cities[index % cities.length],
    addressState: states[index % states.length],
    addressZip: String(68100 + (index * 7)).slice(0, 5),

    // Emergency contact
    emergencyName: `${firstNames[(index + 6) % firstNames.length]} ${lastNames[(index + 2) % lastNames.length]}`,
    emergencyPhone: generatePhone(),

    // Payment
    paymentPlanType: paymentType,
    paymentPlanOption: paymentType === 'installment' ? (index % 2 === 0 ? 'planA' : 'planB') : null,
    specialRequestReason: paymentType === 'special_request' ? specialRequestReasons[index % specialRequestReasons.length] : null,
    specialRequestNotes: paymentType === 'special_request' ? specialRequestNotes[index % specialRequestNotes.length] : null,

    // Waivers
    waiverLiability: true,
    waiverMedical: true,
    waiverMedia: true,
    paymentTermsAcknowledged: true,
  };
}

/**
 * Generate tryout signup data with variations
 * @param {number} index - Index from 0-11 for generating 12 variations
 * @param {string} sessionId - Tryout session ID to register for
 */
export function generateTryoutData(index, sessionId = null) {
  const grades = ['4', '5', '6', '7', '8'];
  const genders = ['male', 'female'];

  const grade = grades[index % grades.length];
  const gender = genders[index % genders.length];
  const school = schools[index % schools.length];

  return {
    sessionId: sessionId || `session-${(index % 3) + 1}`,

    // Player info
    playerFirstName: firstNames[index % firstNames.length],
    playerLastName: lastNames[index % lastNames.length],
    playerDob: generateDobForGrade(grade),
    playerGrade: grade,
    playerGender: gender,
    playerSchool: school || '',

    // Parent info
    parentFirstName: firstNames[(index + 4) % firstNames.length],
    parentLastName: lastNames[index % lastNames.length],
    parentEmail: generateTestEmail('tryout', index),
    parentPhone: generatePhone(),
    relationship: relationships[index % relationships.length],
  };
}

/**
 * Generate contact form data with variations
 * @param {number} index - Index from 0-11 for generating 12 variations
 */
export function generateContactData(index) {
  const subject = contactSubjects[index % contactSubjects.length];
  const message = messageTemplates[index % messageTemplates.length];

  return {
    name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
    email: generateTestEmail('contact', index),
    subject: subject,
    message: message,
  };
}

/**
 * Generate all test data sets
 */
export function generateAllTestData() {
  const registrations = [];
  const tryouts = [];
  const contacts = [];

  for (let i = 0; i < 12; i++) {
    registrations.push(generateRegistrationData(i));
    tryouts.push(generateTryoutData(i));
    contacts.push(generateContactData(i));
  }

  return { registrations, tryouts, contacts };
}

/**
 * Generate a specific count of test data
 */
export function generateTestDataBatch(type, count) {
  const data = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'registration':
        data.push(generateRegistrationData(i));
        break;
      case 'tryout':
        data.push(generateTryoutData(i));
        break;
      case 'contact':
        data.push(generateContactData(i));
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
  return data;
}

export default {
  generateRegistrationData,
  generateTryoutData,
  generateContactData,
  generateAllTestData,
  generateTestDataBatch,
  generateTestEmail,
};

// Single source of truth for the scholarship application form: field
// definitions (zod schema, used for both client and server validation),
// shared by the web form (src/app/apply), the PDF export
// (src/app/api/applications/[id]/pdf), and the review UI.
//
// Digitized from the faculty's paper form ("แบบฟอร์มขอรับทุน") — every
// section below corresponds to a numbered section on that PDF.

import { z } from 'zod';

export const RESIDENCE_TYPES = [
  { value: 'OWN_HOUSE', label: 'บ้านส่วนตัว' },
  { value: 'RENTED_HOUSE', label: 'บ้านเช่า' },
  { value: 'UNIVERSITY_DORM', label: 'หอพักเครือข่ายมหาวิทยาลัยฯ' },
  { value: 'PRIVATE_DORM', label: 'หอพักเอกชน' },
  { value: 'WITH_OTHERS', label: 'อาศัยผู้อื่น' },
  { value: 'OTHER', label: 'อื่น ๆ' },
] as const;

export const PARENT_STATUSES = [
  { value: 'TOGETHER', label: 'อยู่ครบและไม่ได้แยกทางกัน' },
  { value: 'SEPARATED', label: 'แยกทางกันแต่มิได้หย่าขาด' },
  { value: 'DIVORCED', label: 'หย่าขาด' },
  { value: 'BOTH_DECEASED', label: 'บิดามารดาถึงแก่กรรม' },
  { value: 'FATHER_DECEASED', label: 'บิดาถึงแก่กรรม' },
  { value: 'MOTHER_DECEASED', label: 'มารดาถึงแก่กรรม' },
] as const;

export const LOAN_STATUSES = [
  { value: 'REQUESTING', label: 'ขอกู้' },
  { value: 'NEVER_REQUESTED', label: 'ไม่เคยขอกู้' },
  { value: 'REQUESTED_NOT_APPROVED', label: 'เคยขอกู้ แต่ไม่ได้' },
] as const;

export const SKILL_LEVELS = [
  { value: 'DEE_MAK', label: 'ดีมาก' },
  { value: 'DEE', label: 'ดี' },
  { value: 'POR_CHAI', label: 'พอใช้' },
] as const;

const addressSchema = z.object({
  houseNo: z.string().optional(),
  moo: z.string().optional(),
  road: z.string().optional(),
  tambon: z.string().optional(),
  amphoe: z.string().optional(),
  changwat: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
});

const parentSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  occupation: z.string().optional(),
  incomePerYear: z.string().optional(),
});

const workingSiblingSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  educationLevel: z.string().optional(),
  occupation: z.string().optional(),
  incomePerMonth: z.string().optional(),
  maritalStatus: z.string().optional(),
  childCount: z.string().optional(),
});

const studyingSiblingSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  studyingLevel: z.string().optional(),
  schoolName: z.string().optional(),
  supporter: z.string().optional(),
});

const priorScholarshipSchema = z.object({
  year: z.string().optional(),
  amount: z.string().optional(),
  from: z.string().optional(),
});

const languageSkillSchema = z.object({
  language: z.string().optional(),
  listening: z.string().optional(),
  speaking: z.string().optional(),
  reading: z.string().optional(),
  writing: z.string().optional(),
});

export const applicationFormSchema = z.object({
  // --- Student identity (required) ---
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-สกุล'),
  age: z.string().min(1, 'กรุณากรอกอายุ'),
  birthDate: z.string().min(1, 'กรุณากรอกวันเดือนปีเกิด'),
  studentId: z.string().min(1, 'กรุณากรอกรหัสประจำตัวนักศึกษา'),
  nationalId: z.string().min(1, 'กรุณากรอกเลขที่บัตรประชาชน'),
  year: z.string().min(1, 'กรุณากรอกชั้นปี'),
  section: z.string().optional(),
  gpa: z.string().min(1, 'กรุณากรอก GPAX'),
  department: z.string().min(1, 'กรุณากรอกภาควิชา'),
  advisorName: z.string().min(1, 'กรุณากรอกชื่ออาจารย์ที่ปรึกษา'),
  homeAddress: addressSchema,
  mobilePhone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  scholarshipContactPhone: z.string().optional(),
  residenceType: z.enum(['OWN_HOUSE', 'RENTED_HOUSE', 'UNIVERSITY_DORM', 'PRIVATE_DORM', 'WITH_OTHERS', 'OTHER']),
  residenceDetail: z.string().optional(),
  father: parentSchema,
  mother: parentSchema,

  // --- Section 1: family status ---
  parentStatus: z.enum(['TOGETHER', 'SEPARATED', 'DIVORCED', 'BOTH_DECEASED', 'FATHER_DECEASED', 'MOTHER_DECEASED']),
  parentAddress: addressSchema.optional(),
  parentResidenceType: z.string().optional(),
  siblingsTotal: z.string().optional(),
  siblingsMale: z.string().optional(),
  siblingsFemale: z.string().optional(),
  siblingsWorking: z.string().optional(),
  siblingsStudying: z.string().optional(),
  siblingsNeither: z.string().optional(),
  parentDebt: z.string().optional(),

  // --- Section 2: guardian (optional) ---
  hasGuardian: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianAge: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianOccupation: z.string().optional(),
  guardianIncome: z.string().optional(),
  guardianFamilyIncome: z.string().optional(),
  guardianWorkplace: z.string().optional(),
  guardianPhone: z.string().optional(),

  // --- Section 3: primary financial supporter ---
  supporterName: z.string().optional(),
  supporterOccupation: z.string().optional(),
  supporterIncome: z.string().optional(),
  supporterRelation: z.string().optional(),
  supporterMonthlyAllowance: z.string().optional(),

  // --- Section 4: siblings detail ---
  workingSiblings: z.array(workingSiblingSchema).max(5).default([]),
  studyingSiblings: z.array(studyingSiblingSchema).max(6).default([]),

  // --- Section 5: prior scholarships ---
  priorScholarships: z.array(priorScholarshipSchema).max(3).default([]),

  // --- Section 6: government student loan (กยศ.) ---
  loanStatus: z.enum(['REQUESTING', 'NEVER_REQUESTED', 'REQUESTED_NOT_APPROVED']).optional(),
  loanYear: z.string().optional(),
  loanAmount: z.string().optional(),

  // --- Section 7: non-tuition expenses ---
  monthlyNonTuitionExpense: z.string().optional(),
  expenseRent: z.string().optional(),
  expenseFood: z.string().optional(),
  expenseTransport: z.string().optional(),
  expenseSuppliesPerYear: z.string().optional(),
  expenseClothingPerYear: z.string().optional(),

  // --- Section 8: extra income ---
  extraIncomePosition: z.string().optional(),
  extraIncomeAmount: z.string().optional(),
  extraIncomeWorkplace: z.string().optional(),
  extraIncomePhone: z.string().optional(),

  // --- Section 9: close friend contact ---
  friendName: z.string().optional(),
  friendRoom: z.string().optional(),
  friendPhone: z.string().optional(),

  // --- Section 10: activity history ---
  activityHistory: z.string().optional(),

  // --- Section 11: special skills ---
  typingThaiWpm: z.string().optional(),
  typingEnglishWpm: z.string().optional(),
  computerPrograms: z.string().optional(),
  musicType: z.string().optional(),
  sportsType: z.string().optional(),
  craftsmanship: z.string().optional(),
  otherSkills: z.string().optional(),
  languageSkills: z.array(languageSkillSchema).max(4).default([]),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Partial schema for draft saves — drafts can be incomplete.
export const applicationDraftSchema = applicationFormSchema.partial();

export const emptyApplicationForm: ApplicationFormData = {
  fullName: '',
  age: '',
  birthDate: '',
  studentId: '',
  nationalId: '',
  year: '',
  section: '',
  gpa: '',
  department: '',
  advisorName: '',
  homeAddress: {},
  mobilePhone: '',
  email: '',
  scholarshipContactPhone: '',
  residenceType: 'OWN_HOUSE',
  residenceDetail: '',
  father: {},
  mother: {},
  parentStatus: 'TOGETHER',
  parentAddress: {},
  parentResidenceType: '',
  siblingsTotal: '',
  siblingsMale: '',
  siblingsFemale: '',
  siblingsWorking: '',
  siblingsStudying: '',
  siblingsNeither: '',
  parentDebt: '',
  hasGuardian: false,
  guardianName: '',
  guardianAge: '',
  guardianRelation: '',
  guardianOccupation: '',
  guardianIncome: '',
  guardianFamilyIncome: '',
  guardianWorkplace: '',
  guardianPhone: '',
  supporterName: '',
  supporterOccupation: '',
  supporterIncome: '',
  supporterRelation: '',
  supporterMonthlyAllowance: '',
  workingSiblings: [],
  studyingSiblings: [],
  priorScholarships: [],
  loanYear: '',
  loanAmount: '',
  monthlyNonTuitionExpense: '',
  expenseRent: '',
  expenseFood: '',
  expenseTransport: '',
  expenseSuppliesPerYear: '',
  expenseClothingPerYear: '',
  extraIncomePosition: '',
  extraIncomeAmount: '',
  extraIncomeWorkplace: '',
  extraIncomePhone: '',
  friendName: '',
  friendRoom: '',
  friendPhone: '',
  activityHistory: '',
  typingThaiWpm: '',
  typingEnglishWpm: '',
  computerPrograms: '',
  musicType: '',
  sportsType: '',
  craftsmanship: '',
  otherSkills: '',
  languageSkills: [],
};

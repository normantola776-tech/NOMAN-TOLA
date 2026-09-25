export type UserRole = 'student' | 'tutor' | 'creator';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  gradeLevel: string;
  schoolName: string;
  idCardVerified: boolean;
  idCardPhotoUrl?: string;
  bio?: string;
  avatar?: string;
}

export interface TutorReview {
  id: number;
  tutorId: number;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Tutor {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  subjects: string;
  academicExpertise: string;
  hourlyRate: number;
  rating: number; // 48 = 4.8
  reviewsCount: number;
  availableDays: string;
  isVerified: boolean;
  schoolName: string;
  bio?: string;
  avatar?: string;
  idCardVerified: boolean;
  reviews?: TutorReview[];
}

export interface TutoringSession {
  id: number;
  title: string;
  subject: string;
  tutorId: number;
  tutorName?: string;
  tutorAvatar?: string;
  tutorSchool?: string;
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  sessionType: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  meetingRoomId: string;
  hasVideo: boolean;
  hasAudio: boolean;
  classLevel?: string; // 'Senior One', 'Senior Two', 'Senior Three', 'Senior Four'
  syllabusOverview?: string;
}

export interface SessionBooking {
  id: number;
  sessionId: number;
  studentId: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef: string;
  amount: number;
  accessCode: string;
  paidAt: string;
}

export interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  authorName: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  contentSummary: string;
  isEncrypted: boolean;
  encryptionHash?: string;
  offlineAvailable: boolean;
  downloadsCount: number;
  isDownloadedLocally?: boolean;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  isEncrypted: boolean;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Assignment {
  id: number;
  studentId: number;
  tutorId?: number;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
  submissionNotes?: string;
}

export interface FinancialTransaction {
  id: number;
  bookingId?: number;
  studentName: string;
  tutorName: string;
  subject: string;
  grossAmount: number;
  tutorShare: number;
  creatorPlatformFee: number;
  taxWithheld: number;
  paymentGateway: string;
  targetBankAccount: string;
  payoutStatus: string;
  transactionRef: string;
  createdAt: string;
}

export interface CreatorFinancialSummary {
  designatedBankAccount: string;
  accountHolder: string;
  currency: string;
  totalGrossRevenue: number;
  totalTutorDisbursements: number;
  totalCreatorNetEarnings: number;
  totalTaxWithheld: number;
  taxFilingStatus: string;
  recentTransactions: FinancialTransaction[];
}

export interface SystemTicket {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  category: string;
  subject: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium';
  status: 'open' | 'in_progress' | 'resolved';
  creatorNotes?: string;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  type: 'session' | 'assignment' | 'grade' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Official Payment & Academic Pricing Standards
export const OFFICIAL_PAYMENT_CONFIG = {
  mtnNumber: '+256773489862',
  airtelNumber: '+256731074878',
  centenaryAccount: '3205303331',
  scienceHourlyRate: 10000, // UGX 10,000 / hr
  artsHourlyRate: 8000,    // UGX 8,000 / hr
} as const;

export const SECONDARY_CLASSES = [
  'Senior One',
  'Senior Two',
  'Senior Three',
  'Senior Four',
] as const;

export type SecondaryClass = typeof SECONDARY_CLASSES[number];

export const SCIENCE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Agriculture',
  'General Science',
];

export const ARTS_SUBJECTS = [
  'Literature',
  'Economics',
  'History',
  'Geography',
  'Fine Art',
  'Kiswahili',
  'Entrepreneurship',
  'French',
  'Swahili',
  'Divinity',
  'CRE',
  'Luganda',
];

export function isScienceSubject(subject: string): boolean {
  if (!subject) return true;
  const s = subject.toLowerCase();
  return SCIENCE_SUBJECTS.some((sci) => s.includes(sci.toLowerCase()));
}

export function getSubjectTrack(subject: string): 'Science' | 'Arts' {
  return isScienceSubject(subject) ? 'Science' : 'Arts';
}

export function getStandardHourlyRate(subject: string): number {
  return isScienceSubject(subject)
    ? OFFICIAL_PAYMENT_CONFIG.scienceHourlyRate
    : OFFICIAL_PAYMENT_CONFIG.artsHourlyRate;
}

export function calculateSessionPrice(subject: string, durationMinutes: number = 60): number {
  const hourly = getStandardHourlyRate(subject);
  // Calculate price based on exact hour or round to standard slot
  return Math.round((hourly * durationMinutes) / 60);
}

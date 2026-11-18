// Principios SOLID: Segregación de Interfaces (ISP) e Inversión de Dependencias (DIP)

export interface TutorSummary {
  user_id: string;
  name: string;
  headline: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  modality: "virtual" | "presencial" | "ambas";
  levels: string[];
  city: string | null;
  subjects: string[];
  rating: number | null;
  reviewCount: number;
  is_online?: boolean;
}

export interface TutorFilterCriteria {
  q?: string;
  subject?: string;
  modality?: "virtual" | "presencial";
  city?: string;
  maxRate?: number;
  onlyOnline?: boolean;
}

export interface ITutorRepository {
  findApprovedTutors(criteria?: TutorFilterCriteria): Promise<TutorSummary[]>;
}

export interface AiMatchRequest {
  prompt: string;
  maxBudget?: number;
  modality?: "virtual" | "presencial" | "ambas";
}

export interface AiRecommendedTutor {
  tutor: TutorSummary;
  matchScore: number;
  reason: string;
}

export interface AiMatchResponse {
  recommendations: AiRecommendedTutor[];
  studyPlan: string[];
  detectedSubject: string;
  provider: "gemini" | "tuteya-smart-engine";
}

export interface IAiTutorAdvisor {
  recommend(request: AiMatchRequest): Promise<AiMatchResponse>;
}

export interface NotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  subjectName: string;
  startsAtLabel: string;
  meetingUrl: string;
  channel: "email" | "whatsapp" | "both";
}

export interface NotificationResult {
  emailSent: boolean;
  whatsappUrl: string;
  providerMessage: string;
}

export interface INotificationDispatcher {
  dispatch(payload: NotificationPayload): Promise<NotificationResult>;
}

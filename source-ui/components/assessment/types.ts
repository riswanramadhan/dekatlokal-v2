export type QuestionType = "single" | "multiple" | "text";

export interface Option {
  id: string;
  label: string;
  score: number;
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => { valid: boolean; message: string };
}

export interface TextInputConfig {
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: "on" | "off";
  spellCheck?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: Option[];
  placeholder?: string;
  helper?: string;
  required?: boolean;
  validator?: ValidationRule;
  textInput?: TextInputConfig;
}

export interface QuestionGroup {
  id: string;
  sidebarTitle: string;
  title: string;
  description: string;
  icon?: string;
  questions: Question[];
}

export type Answer = string | string[] | undefined;

export interface Answers {
  [questionId: string]: Answer;
}

export interface DigitalScoreItem {
  id: string;
  label: string;
  platform: "instagram" | "tiktok" | "google";
  score: number;
  maxScore: number;
  detail: string;
}

export interface DigitalScoreResult {
  items: DigitalScoreItem[];
  totalScore: number;
  maxScore: number;
}

export interface InstagramProfile {
  username: string;
  fullName: string | null;
  biography: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
  profilePicUrl: string | null;
  externalUrl: string | null;
}

export interface TiktokProfile {
  username: string;
  nickname: string | null;
  biography: string | null;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videosCount: number;
  isVerified: boolean;
  profilePicUrl: string | null;
}

export interface GoogleBusinessProfile {
  placeId: string | null;
  name: string;
  address: string | null;
  phoneNumber: string | null;
  website: string | null;
  rating: number | null;
  totalReviews: number;
  category: string | null;
  businessStatus: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
}

export interface DigitalPresenceData {
  instagram: InstagramProfile | null;
  tiktok: TiktokProfile | null;
  google: GoogleBusinessProfile | null;
  scoring: DigitalScoreResult;
  status: "completed" | "partial" | "failed";
  maxScoreForResponse: number;
}

export interface AssessmentResponse {
  id: number;
  totalScore: number;
  maxScore: number;
  percentage: number | null;
  scoringVersion: string;
  digitalPresence: DigitalPresenceData | null;
}

export type AssessmentStep = "welcome" | "questions" | "calculating" | "results";

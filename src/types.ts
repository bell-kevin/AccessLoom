export const barrierCategories = [
  "Sensory load",
  "Communication",
  "Focus & interruption",
  "Time & pacing",
  "Physical access",
  "Energy & recovery",
  "Memory & processing",
  "Unclear expectations",
  "Other"
] as const;

export type BarrierCategory = (typeof barrierCategories)[number];

export const contexts = [
  "Focused work",
  "Meeting",
  "Communication",
  "Travel or commute",
  "Shared workspace",
  "Remote work",
  "Training",
  "Other"
] as const;

export type WorkContext = (typeof contexts)[number];

export const supportStatuses = [
  "Idea",
  "Trying",
  "Helpful",
  "Agreed",
  "Paused"
] as const;

export type SupportStatus = (typeof supportStatuses)[number];

export interface CheckIn {
  id: string;
  recordedAt: string;
  context: WorkContext;
  activity: string;
  barrier: BarrierCategory;
  friction: number;
  capacityBefore: number;
  capacityAfter: number;
  supportIds: string[];
  supportLabels: string[];
  note: string;
  win: string;
}

export interface Adjustment {
  id: string;
  title: string;
  barrier: BarrierCategory;
  status: SupportStatus;
  hypothesis: string;
  setup: string;
  successLooksLike: string;
  startedAt: string;
  reviewDate: string;
  effectiveness: number;
  effort: number;
  notes: string;
  includeInPassport: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Commitment {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "Open" | "Done";
  adjustmentId?: string;
  notes: string;
  createdAt: string;
}

export interface PassportProfile {
  preferredName: string;
  roleContext: string;
  introduction: string;
  strengths: string[];
  communication: string[];
  workingConditions: string[];
  difficultDayPlan: string;
  reviewTriggers: string;
}

export interface PassportSections {
  introduction: boolean;
  strengths: boolean;
  communication: boolean;
  workingConditions: boolean;
  adjustments: boolean;
  difficultDayPlan: boolean;
  reviewTriggers: boolean;
}

export interface WorkspaceRecord {
  key: "workspace";
  initialized: boolean;
  isDemo: boolean;
  createdAt: string;
  profile: PassportProfile;
  passportSections: PassportSections;
}

export interface DisplayPreferences {
  textScale: "default" | "large";
  contrast: "default" | "high";
  motion: "default" | "reduced";
}

export interface SupportSuggestion {
  title: string;
  barrier: BarrierCategory;
  setup: string;
  hypothesis: string;
}

export type ViewId = "today" | "patterns" | "supports" | "passport";

export const defaultPassportSections: PassportSections = {
  introduction: true,
  strengths: true,
  communication: true,
  workingConditions: true,
  adjustments: true,
  difficultDayPlan: true,
  reviewTriggers: true
};

export const emptyProfile: PassportProfile = {
  preferredName: "",
  roleContext: "",
  introduction: "",
  strengths: [],
  communication: [],
  workingConditions: [],
  difficultDayPlan: "",
  reviewTriggers: ""
};

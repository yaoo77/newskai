
export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export enum EventType {
  X_SHARE = 'X_SHARE',
  FINX_PROFILE_EDIT = 'FINX_PROFILE_EDIT',
  FINX_INTRO_POST = 'FINX_INTRO_POST',
  DAILY_DECLARATION = 'DAILY_DECLARATION',
  NOTE_SUBMIT = 'NOTE_SUBMIT',
  OFFSITE_PARTICIPATE = 'OFFSITE_PARTICIPATE',
  LT_WIN = 'LT_WIN',
  TESTIMONIAL_SUBMIT = 'TESTIMONIAL_SUBMIT',
  INVITE_SELF_REPORT = 'INVITE_SELF_REPORT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Profile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  xHandle?: string;
  finxUsername?: string;
  finxRefUrl?: string;
}

export interface UserEvent {
  id: string;
  userId: string;
  type: EventType;
  payload: {
    url?: string;
    title?: string;
    text?: string;
    date?: string;
    location?: string;
    verified?: boolean;
  };
  createdAt: string;
}

export interface Testimonial {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  notesCount: number;
  offsiteCount: number;
  ltWinCount: number;
  finxPostsCount: number;
  invitesCount: number;
  dailyDeclarationCount: number;
  dailyDeclarationStreak: number;
  xShareCount: number;
  finxProfileEditCount: number;
  finxIntroPostCount: number;
}

export interface DashboardCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  metric: keyof UserProgress;
  goal?: number;
  actionType: 'X_SHARE' | 'EXTERNAL_LINK' | 'SELF_REPORT' | 'MODAL_FORM' | 'VIEW_ONLY' | 'INVITE';
  actionText: string;
  externalLink?: string;
  payload?: any;
}

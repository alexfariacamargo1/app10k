
export interface MonthlyEntry {
  month: number;
  value: number;
  isSaved: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string; // Format "HH:mm"
  lastNotifiedAt?: number;
}

export interface SavingsPlan {
  id: string;
  title: string;
  target: number;
  entries: MonthlyEntry[];
  isCouple: boolean;
  isPremium?: boolean;
  createdAt?: number;
  notificationSettings?: NotificationSettings;
}

export interface AIPromptResponse {
  advice: string;
  suggestedPlan?: {
    title: string;
    target: number;
    values: number[];
  };
}

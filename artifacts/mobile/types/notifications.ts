export type BackendNotificationType = 'critical' | 'ai' | 'reminder' | 'system' | string;

export type BackendNotification = {
  id: number;
  user_id?: number;
  type: BackendNotificationType;
  title: string;
  message: string;
  read: boolean;
  action_required?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NotificationsResponse = {
  items: BackendNotification[];
};

export type MarkNotificationReadResponse = {
  message: string;
  notification: BackendNotification;
};

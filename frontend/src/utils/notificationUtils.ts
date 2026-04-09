import { isToday, isYesterday, subDays, isBefore, isAfter, startOfDay } from 'date-fns';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
  link?: string;
  [key: string]: any;
}

export type TimeGroup = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Earlier';

export const groupNotificationsByDate = (notifications: Notification[]): Record<TimeGroup, Notification[]> => {
  const groups: Record<TimeGroup, Notification[]> = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Earlier': [],
  };

  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 7));

  notifications.forEach((notif) => {
    const date = new Date(notif.createdAt);

    if (isToday(date)) {
      groups['Today'].push(notif);
    } else if (isYesterday(date)) {
      groups['Yesterday'].push(notif);
    } else if (isAfter(date, sevenDaysAgo)) {
      groups['Last 7 Days'].push(notif);
    } else {
      groups['Earlier'].push(notif);
    }
  });

  // Sort each group by createdAt descending
  Object.keys(groups).forEach((key) => {
    groups[key as TimeGroup].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  return groups;
};

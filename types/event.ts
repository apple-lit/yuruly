export type TimeSettingType = 'none' | 'rough' | 'detailed';

export interface TimeSlot {
  type: TimeSettingType;
  // rough: 'morning' | 'afternoon' | 'evening' | 'night'
  rough?: 'morning' | 'afternoon' | 'evening' | 'night';
  // detailed: HH:mm format
  startTime?: string;
  endTime?: string;
}

export interface DateSelection {
  date: Date;
  timeSlot: TimeSlot;
}

export interface EventData {
  title: string;
  description?: string;
  dates: DateSelection[];
}

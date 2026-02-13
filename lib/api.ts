import { supabase } from './supabase';
import type { DateSelection } from '@/types/event';

// 日付をローカルタイムゾーンでYYYY-MM-DD形式に変換
function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CreateEventData {
  title: string;
  description?: string;
  dates: DateSelection[];
}

export interface CreateEventResult {
  eventId: string;
  viewUrl: string;
  adminUrl: string;
}

function generateAdminToken(): string {
  return crypto.randomUUID();
}

export async function createEvent(data: CreateEventData): Promise<CreateEventResult> {
  try {
    const adminToken = generateAdminToken();

    // 1. イベントを作成
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: data.title,
        description: data.description || null,
        admin_token: adminToken,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // 2. 候補日を一括挿入
    const eventDates = data.dates.map((dateSelection) => ({
      event_id: event.id,
      date: dateToLocalString(dateSelection.date), // ローカルタイムゾーンでYYYY-MM-DD形式
      time_type: dateSelection.timeSlot.type,
      rough_time: dateSelection.timeSlot.rough || null,
      start_time: dateSelection.timeSlot.startTime || null,
      end_time: dateSelection.timeSlot.endTime || null,
    }));

    const { error: datesError } = await supabase
      .from('event_dates')
      .insert(eventDates);

    if (datesError) throw datesError;

    // 3. URLを生成して返す
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    return {
      eventId: event.id,
      viewUrl: `${baseUrl}/event/${event.id}`,
      adminUrl: `${baseUrl}/event/${event.id}/admin/${adminToken}`,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('イベントの作成に失敗しました');
  }
}

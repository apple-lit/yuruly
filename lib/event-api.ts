import { supabase } from './supabase';
import type { DateSelection } from '@/types/event';

export interface EventData {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  dates: EventDate[];
}

export interface EventDate {
  id: string;
  date: string;
  time_type: 'none' | 'rough' | 'detailed';
  rough_time: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  start_time: string | null;
  end_time: string | null;
}

export interface Response {
  id: string;
  name: string;
  comment: string | null;
  created_at: string;
  answers: ResponseAnswer[];
}

export interface ResponseAnswer {
  event_date_id: string;
  status: 'yes' | 'maybe' | 'no';
}

// イベント情報を取得
export async function getEvent(eventId: string): Promise<EventData | null> {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) return null;

    const { data: dates, error: datesError } = await supabase
      .from('event_dates')
      .select('*')
      .eq('event_id', eventId)
      .order('date', { ascending: true });

    if (datesError) throw datesError;

    return {
      ...event,
      dates: dates || [],
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

// 回答を取得
export async function getResponses(eventId: string): Promise<Response[]> {
  try {
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (responsesError) throw responsesError;
    if (!responses) return [];

    // 各回答の詳細を取得
    const responsesWithAnswers = await Promise.all(
      responses.map(async (response) => {
        const { data: answers, error: answersError } = await supabase
          .from('response_answers')
          .select('event_date_id, status')
          .eq('response_id', response.id);

        if (answersError) {
          console.error('Error fetching answers:', answersError);
          return { ...response, answers: [] };
        }

        return {
          ...response,
          answers: answers || [],
        };
      })
    );

    return responsesWithAnswers;
  } catch (error) {
    console.error('Error fetching responses:', error);
    return [];
  }
}

// 回答を送信
export async function submitResponse(
  eventId: string,
  name: string,
  comment: string | null,
  answers: Record<string, 'yes' | 'maybe' | 'no'>
): Promise<string | null> {
  try {
    // 1. 回答者情報を作成
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        event_id: eventId,
        name,
        comment,
      })
      .select()
      .single();

    if (responseError) throw responseError;

    // 2. 各日付への回答を保存
    const answerRecords = Object.entries(answers).map(([dateId, status]) => ({
      response_id: response.id,
      event_date_id: dateId,
      status,
    }));

    const { error: answersError } = await supabase
      .from('response_answers')
      .insert(answerRecords);

    if (answersError) throw answersError;

    return response.id; // responseIdを返す
  } catch (error) {
    console.error('Error submitting response:', error);
    return null;
  }
}

// 回答を更新（編集）
export async function updateResponse(
  responseId: string,
  name: string,
  answers: Record<string, 'yes' | 'maybe' | 'no'>,
  comment?: string
): Promise<boolean> {
  try {
    // 1. 回答者名とコメントを更新
    const { error: responseError } = await supabase
      .from('responses')
      .update({
        name,
        comment: comment || null,
      })
      .eq('id', responseId);

    if (responseError) throw responseError;

    // 2. 既存の回答を削除
    const { error: deleteError } = await supabase
      .from('response_answers')
      .delete()
      .eq('response_id', responseId);

    if (deleteError) throw deleteError;

    // 3. 新しい回答を挿入
    const answerRecords = Object.entries(answers).map(([dateId, status]) => ({
      response_id: responseId,
      event_date_id: dateId,
      status,
    }));

    const { error: answersError } = await supabase
      .from('response_answers')
      .insert(answerRecords);

    if (answersError) throw answersError;

    return true;
  } catch (error) {
    console.error('Error updating response:', error);
    return false;
  }
}

// 回答IDから回答データを取得
export async function getResponseById(responseId: string): Promise<Response | null> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        id,
        name,
        comment,
        answers:response_answers(event_date_id, status)
      `)
      .eq('id', responseId)
      .single();

    if (error) throw error;
    return data as Response;
  } catch (error) {
    console.error('Error fetching response:', error);
    return null;
  }
}

// 管理用トークンを検証
export async function verifyAdminToken(
  eventId: string,
  token: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('admin_token')
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return data?.admin_token === token;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
}

// イベントを削除（管理者のみ）
export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

// 候補日を追加（管理者のみ）
export async function addEventDate(
  eventId: string,
  date: string, // YYYY-MM-DD形式
  timeType: 'none' | 'rough' | 'detailed',
  roughTime?: 'morning' | 'afternoon' | 'evening' | 'night',
  startTime?: string,
  endTime?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_dates')
      .insert({
        event_id: eventId,
        date,
        time_type: timeType,
        rough_time: roughTime || null,
        start_time: startTime || null,
        end_time: endTime || null,
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error adding event date:', error);
    return false;
  }
}

// 候補日を削除（管理者のみ）
export async function deleteEventDate(dateId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_dates')
      .delete()
      .eq('id', dateId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting event date:', error);
    return false;
  }
}

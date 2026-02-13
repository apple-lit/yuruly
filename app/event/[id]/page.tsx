'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResponseForm } from '@/components/response-form';
import { getEvent } from '@/lib/event-api';
import type { EventData } from '@/lib/event-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEvent(params.id);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [params.id]);

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-lg font-medium text-muted-foreground">
              読み込み中...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー画面
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">イベントが見つかりません</h2>
            <p className="text-muted-foreground mb-6">
              URLが正しいか確認してください
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 回答フォーム表示
  return (
    <ResponseForm
      event={event}
      onSuccess={() => {
        router.push(`/event/${params.id}/results`);
      }}
    />
  );
}

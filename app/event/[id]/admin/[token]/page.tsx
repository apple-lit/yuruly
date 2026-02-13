'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { AdminView } from '@/components/admin-view';
import { getEvent, getResponses, verifyAdminToken } from '@/lib/event-api';
import type { EventData, Response } from '@/lib/event-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage({ 
  params 
}: { 
  params: { id: string; token: string } 
}) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'unauthorized' | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // トークンを検証
        const isValid = await verifyAdminToken(params.id, params.token);
        if (!isValid) {
          setError('unauthorized');
          setLoading(false);
          return;
        }

        // イベントと回答を取得
        const [eventData, responsesData] = await Promise.all([
          getEvent(params.id),
          getResponses(params.id)
        ]);

        if (eventData) {
          setEvent(eventData);
          setResponses(responsesData);
        } else {
          setError('not_found');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('not_found');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, params.token]);

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-lg font-medium text-muted-foreground">
              認証中...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 権限エラー
  if (error === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">アクセスが拒否されました</h2>
            <p className="text-muted-foreground mb-6">
              管理用URLが正しくないか、有効期限が切れています
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

  // イベント未発見エラー
  if (error === 'not_found' || !event) {
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

  // 管理画面表示
  return <AdminView event={event} responses={responses} adminToken={params.token} />;
}

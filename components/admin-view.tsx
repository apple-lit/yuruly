'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Users, 
  Sparkles,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Shield,
  BarChart3,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteEvent, addEventDate, deleteEventDate } from '@/lib/event-api';
import { AddDateDialog } from '@/components/add-date-dialog';
import { Footer } from '@/components/footer';
import type { EventData, Response } from '@/lib/event-api';

interface AdminViewProps {
  event: EventData;
  responses: Response[];
  adminToken: string;
}

export function AdminView({ event: initialEvent, responses, adminToken }: AdminViewProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDateDialog, setShowAddDateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewUrl = typeof window !== 'undefined' ? `${window.location.origin}/event/${event.id}` : '';
  const resultsUrl = `${viewUrl}/results`;

  // 時間表示
  const getTimeDisplay = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') return '終日';
    if (date.time_type === 'rough') {
      const labels = { morning: '朝', afternoon: '昼', evening: '夕方', night: '夜' };
      return labels[date.rough_time as keyof typeof labels] || '';
    }
    return `${date.start_time} 〜 ${date.end_time || ''}`;
  };

  // 候補日を追加
  const handleAddDate = async (
    date: string,
    timeType: 'none' | 'rough' | 'detailed',
    rough?: string,
    startTime?: string,
    endTime?: string
  ) => {
    const success = await addEventDate(
      event.id,
      date,
      timeType,
      rough as any,
      startTime,
      endTime
    );

    if (success) {
      // ページをリロードして最新のデータを取得
      router.refresh();
      window.location.reload();
    } else {
      throw new Error('Failed to add date');
    }
  };

  // 候補日を削除
  const handleDeleteDate = async (dateId: string) => {
    if (!confirm('この候補日を削除してもよろしいですか？既存の回答も削除されます。')) {
      return;
    }

    const success = await deleteEventDate(dateId);
    if (success) {
      // ページをリロードして最新のデータを取得
      router.refresh();
      window.location.reload();
    } else {
      alert('削除に失敗しました');
    }
  };

  // イベント削除
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteEvent(event.id);
      if (success) {
        router.push('/');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('エラーが発生しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-amber-500 animate-float" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              管理画面
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            このページは幹事専用です
          </p>
        </div>

        {/* 注意喚起 */}
        <Card className="mb-6 backdrop-blur-sm bg-amber-50 border-amber-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900 font-medium mb-1">
                  このURLは誰にも共有しないでください
                </p>
                <p className="text-xs text-amber-700">
                  管理用URLを知っている人は、イベントの編集や削除ができます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: イベント情報とアクション */}
          <div className="lg:col-span-1 space-y-6">
            {/* イベント情報 */}
            <Card className="backdrop-blur-sm bg-white/80 border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  イベント情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">タイトル</p>
                  <p className="font-semibold">{event.title}</p>
                </div>
                {event.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">説明</p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">作成日時</p>
                  <p className="text-sm">
                    {format(new Date(event.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 統計 */}
            <Card className="backdrop-blur-sm bg-white/80 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  統計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">回答者数</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-500">
                    {responses.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">候補日数</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-500">
                    {event.dates.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* アクション */}
            <Card className="backdrop-blur-sm bg-white/80 border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  アクション
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={viewUrl} target="_blank">
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    回答画面を開く
                  </Button>
                </Link>
                <Link href={resultsUrl}>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    結果を見る
                  </Button>
                </Link>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  イベントを削除
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右側: 候補日一覧 */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-purple-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      候補日一覧
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {event.dates.length}件の候補日
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddDateDialog(true)}
                    className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    候補日を追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.dates.map((date) => (
                    <div
                      key={date.id}
                      className="p-4 rounded-lg border-2 border-purple-100 bg-gradient-soft hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {format(new Date(date.date + 'T00:00:00'), 'M月d日(E)', { locale: ja })}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {getTimeDisplay(date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            ID: {date.id.slice(0, 8)}...
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDate(date.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 候補日追加ダイアログ */}
      <AddDateDialog
        open={showAddDateDialog}
        onOpenChange={setShowAddDateDialog}
        onAdd={handleAddDate}
        existingDates={event.dates.map(d => d.date)}
      />

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              イベントを削除しますか？
            </DialogTitle>
            <DialogDescription>
              この操作は取り消せません。イベントに関連するすべてのデータ（回答を含む）が削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>削除中...</>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除する
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}

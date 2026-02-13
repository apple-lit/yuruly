'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Clock, Sunrise, Sun, Sunset, Moon, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (date: string, timeType: 'none' | 'rough' | 'detailed', rough?: string, startTime?: string, endTime?: string) => Promise<void>;
  existingDates: string[]; // YYYY-MM-DD形式の既存日付リスト
}

export function AddDateDialog({ open, onOpenChange, onAdd, existingDates }: AddDateDialogProps) {
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [timeType, setTimeType] = useState<'none' | 'rough' | 'detailed'>('none');
  const [roughTime, setRoughTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeTypeOptions = [
    { type: 'none' as const, icon: <Sun className="w-4 h-4" />, label: '終日' },
    { type: 'rough' as const, icon: <Clock className="w-4 h-4" />, label: 'ざっくり' },
    { type: 'detailed' as const, icon: <Clock className="w-4 h-4" />, label: '詳細時間' },
  ];

  const roughTimeOptions = [
    { value: 'morning' as const, icon: <Sunrise className="w-4 h-4" />, label: '朝' },
    { value: 'afternoon' as const, icon: <Sun className="w-4 h-4" />, label: '昼' },
    { value: 'evening' as const, icon: <Sunset className="w-4 h-4" />, label: '夕方' },
    { value: 'night' as const, icon: <Moon className="w-4 h-4" />, label: '夜' },
  ];

  const handleAdd = async () => {
    // 重複チェック
    if (existingDates.includes(selectedDate)) {
      setError('この日付は既に追加されています');
      return;
    }

    setError(null);
    setIsAdding(true);
    try {
      if (timeType === 'rough') {
        await onAdd(selectedDate, timeType, roughTime);
      } else if (timeType === 'detailed') {
        await onAdd(selectedDate, timeType, undefined, startTime, endTime);
      } else {
        await onAdd(selectedDate, timeType);
      }
      onOpenChange(false);
      // リセット
      setSelectedDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setTimeType('none');
      setError(null);
    } catch (error) {
      console.error('Error adding date:', error);
      setError('候補日の追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            候補日を追加
          </DialogTitle>
          <DialogDescription>
            新しい候補日を追加します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* 日付選択 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              日付 <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* 時間タイプ選択 */}
          <div>
            <label className="text-sm font-medium mb-2 block">時間設定</label>
            <div className="grid grid-cols-3 gap-2">
              {timeTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setTimeType(option.type)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                    timeType === option.type
                      ? "border-purple-400 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-purple-200 bg-white"
                  )}
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ざっくり時間の選択 */}
          {timeType === 'rough' && (
            <div>
              <label className="text-sm font-medium mb-2 block">時間帯</label>
              <div className="grid grid-cols-2 gap-2">
                {roughTimeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRoughTime(option.value)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border-2 transition-all",
                      roughTime === option.value
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-200 bg-white"
                    )}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 詳細時間の入力 */}
          {timeType === 'detailed' && (
            <div>
              <label className="text-sm font-medium mb-2 block">時間</label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-sm"
                />
                <span className="text-sm text-muted-foreground">〜</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedDate || isAdding}
            className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400"
          >
            {isAdding ? '追加中...' : '追加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

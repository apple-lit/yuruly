'use client';

import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Clock, Sunrise, Sun, Sunset, Moon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Check, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createEvent } from '@/lib/api';
import { EventCreatedDialog } from '@/components/event-created-dialog';
import { Footer } from '@/components/footer';
import type { DateSelection, TimeSlot, TimeSettingType } from '@/types/event';

export function EventCreator() {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<DateSelection[]>([]);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdUrls, setCreatedUrls] = useState<{ viewUrl: string; adminUrl: string } | null>(null);
  
  // ドラッグ選択用の状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [draggedDates, setDraggedDates] = useState<Set<string>>(new Set());

  // カレンダーの日付を生成
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // 月初の曜日を取得して空白セルを追加
  const startDayOfWeek = monthStart.getDay();
  const prefixDays = Array(startDayOfWeek).fill(null);

  // 日付が選択されているか確認
  const isDateSelected = (date: Date) => {
    return selectedDates.some(item => isSameDay(item.date, date));
  };

  // 日付をキーに変換（ドラッグ選択用）
  const dateToKey = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // ドラッグ開始
  const handleDragStart = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setIsDragging(true);
    setDragStartDate(date);
    setDraggedDates(new Set([dateToKey(date)]));
  };

  // ドラッグ中
  const handleDragMove = (date: Date) => {
    if (!isDragging || !dragStartDate || !isSameMonth(date, currentMonth)) return;
    
    // 開始日から現在の日までの範囲を計算
    const start = dragStartDate < date ? dragStartDate : date;
    const end = dragStartDate < date ? date : dragStartDate;
    
    const range = eachDayOfInterval({ start, end });
    const newDraggedDates = new Set(range.map(d => dateToKey(d)));
    setDraggedDates(newDraggedDates);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    // ドラッグした日付をすべて選択に追加
    draggedDates.forEach(dateKey => {
      const date = new Date(dateKey + 'T00:00:00');
      if (!isDateSelected(date)) {
        const newSelection: DateSelection = {
          date,
          timeSlot: { type: 'none' }
        };
        setSelectedDates(prev => [...prev, newSelection]);
      }
    });
    
    // ドラッグ状態をリセット
    setIsDragging(false);
    setDragStartDate(null);
    setDraggedDates(new Set());
  };

  // 日付が現在ドラッグ中の範囲に含まれるか
  const isDateInDragRange = (date: Date) => {
    return draggedDates.has(dateToKey(date));
  };

  // 日付の選択/解除をトグル
  const toggleDateSelection = (date: Date) => {
    if (isDateSelected(date)) {
      setSelectedDates(prev => prev.filter(item => !isSameDay(item.date, date)));
      if (editingDate && isSameDay(editingDate, date)) {
        setEditingDate(null);
      }
    } else {
      const newSelection: DateSelection = {
        date,
        timeSlot: { type: 'none' }
      };
      setSelectedDates(prev => [...prev, newSelection]);
      setEditingDate(date);
    }
  };

  // 時間設定の更新
  const updateTimeSlot = (date: Date, timeSlot: TimeSlot) => {
    setSelectedDates(prev => 
      prev.map(item => 
        isSameDay(item.date, date) ? { ...item, timeSlot } : item
      )
    );
  };

  // 選択中の日付の時間設定を取得
  const getTimeSlotForDate = (date: Date): TimeSlot => {
    const selection = selectedDates.find(item => isSameDay(item.date, date));
    return selection?.timeSlot || { type: 'none' };
  };

  // 次の月へ
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // 前の月へ
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  // イベント作成処理
  const handleCreateEvent = async () => {
    if (!eventTitle || selectedDates.length === 0) return;

    setIsCreating(true);
    try {
      const result = await createEvent({
        title: eventTitle,
        description: eventDescription,
        dates: selectedDates,
      });

      setCreatedUrls({
        viewUrl: result.viewUrl,
        adminUrl: result.adminUrl,
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('イベントの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-float" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent italic">
              yuruly
            </h1>
          </div>
          <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            ログイン不要で、サクッと日程調整
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            イベント情報と候補日を入力するだけ。参加者に共有して回答を集めましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: イベント情報入力 */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/80 border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  イベント情報
                </CardTitle>
                <CardDescription>
                  まずは予定の名前を決めましょう
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    イベント名 <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="例: 新年会、プロジェクト会議"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    説明 <span className="text-muted-foreground text-xs">(任意)</span>
                  </label>
                  <Textarea
                    placeholder="例: 場所や持ち物など、参加者に伝えたいことを書きましょう"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* カレンダー */}
            <Card className="backdrop-blur-sm bg-white/80 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  候補日を選択
                </CardTitle>
                <CardDescription>
                  ドラッグして複数日を一度に選択できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 月の切り替え */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevMonth}
                    className="hover:bg-blue-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="font-semibold text-lg">
                    {format(currentMonth, 'yyyy年 M月', { locale: ja })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextMonth}
                    className="hover:bg-blue-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div
                      key={day}
                      className={cn(
                        "text-center text-xs font-medium py-2",
                        i === 0 && "text-red-400",
                        i === 6 && "text-blue-400"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダーグリッド */}
                <div 
                  className="grid grid-cols-7 gap-1 select-none touch-none"
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchEnd={handleDragEnd}
                >
                  {prefixDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {calendarDays.map((day) => {
                    const selected = isDateSelected(day);
                    const today = isToday(day);
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const dayOfWeek = day.getDay();
                    const inDragRange = isDateInDragRange(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPast && toggleDateSelection(day)}
                        onMouseDown={() => !isPast && handleDragStart(day)}
                        onMouseEnter={() => !isPast && handleDragMove(day)}
                        onTouchStart={(e) => {
                          if (!isPast) {
                            e.preventDefault();
                            handleDragStart(day);
                          }
                        }}
                        onTouchMove={(e) => {
                          if (!isPast && isDragging) {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const element = document.elementFromPoint(touch.clientX, touch.clientY);
                            if (element && element.getAttribute('data-date')) {
                              const dateStr = element.getAttribute('data-date');
                              if (dateStr) {
                                const date = new Date(dateStr + 'T00:00:00');
                                handleDragMove(date);
                              }
                            }
                          }
                        }}
                        data-date={format(day, 'yyyy-MM-dd')}
                        disabled={isPast}
                        className={cn(
                          "aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative",
                          !isPast && "hover:scale-105 hover:shadow-md cursor-pointer",
                          selected
                            ? "bg-gradient-to-br from-purple-400 to-blue-400 text-white shadow-lg scale-105"
                            : inDragRange && !selected
                            ? "bg-gradient-to-br from-purple-300 to-blue-300 text-white shadow-md scale-105"
                            : today
                            ? "bg-blue-50 border-2 border-blue-300"
                            : isPast
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-white border border-gray-200 hover:border-purple-300",
                          !isSameMonth(day, currentMonth) && "opacity-30",
                          dayOfWeek === 0 && !selected && !isPast && !inDragRange && "text-red-400",
                          dayOfWeek === 6 && !selected && !isPast && !inDragRange && "text-blue-400"
                        )}
                      >
                        {format(day, 'd')}
                        {selected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右側: 選択した日付と時間設定 */}
          <div>
            <Card className="backdrop-blur-sm bg-white/80 border-green-100 shadow-lg sticky top-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      選択中の候補日
                      {selectedDates.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedDates.length}件
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      各日付の時間帯を設定できます
                    </CardDescription>
                  </div>
                  
                  {/* 一括設定ボタン */}
                  {selectedDates.length > 1 && (
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            // 全ての候補日に同じ時間設定を適用
                            const [type, rough] = value.split(':');
                            setSelectedDates(prev => prev.map(item => ({
                              ...item,
                              timeSlot: type === 'rough' && rough 
                                ? { type: 'rough', rough: rough as any }
                                : { type: type as any }
                            })));
                            e.target.value = ''; // リセット
                          }
                        }}
                        className="text-xs px-2 py-1 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <option value="">一括設定</option>
                        <option value="none">終日</option>
                        <option value="rough:morning">朝</option>
                        <option value="rough:afternoon">昼</option>
                        <option value="rough:evening">夕方</option>
                        <option value="rough:night">夜</option>
                      </select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedDates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">まだ日付が選択されていません</p>
                    <p className="text-xs mt-1">カレンダーから候補日を選んでください</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {selectedDates
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((selection, idx) => (
                        <DateTimeSettingCard
                          key={selection.date.toISOString()}
                          selection={selection}
                          onUpdate={(timeSlot) => updateTimeSlot(selection.date, timeSlot)}
                          onRemove={() => toggleDateSelection(selection.date)}
                          isExpanded={editingDate ? isSameDay(editingDate, selection.date) : idx === 0}
                          onToggleExpand={() => 
                            setEditingDate(prev => 
                              prev && isSameDay(prev, selection.date) ? null : selection.date
                            )
                          }
                        />
                      ))}
                  </div>
                )}

                {selectedDates.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg text-lg"
                      size="lg"
                      disabled={!eventTitle || selectedDates.length === 0 || isCreating}
                      onClick={handleCreateEvent}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          作成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          イベントを作成
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      回答用URLと管理用URLが発行されます
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 成功ダイアログ */}
      {createdUrls && (
        <EventCreatedDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          viewUrl={createdUrls.viewUrl}
          adminUrl={createdUrls.adminUrl}
        />
      )}
      
      <Footer />
    </div>
  );
}

// 日付と時間設定のカードコンポーネント
function DateTimeSettingCard({
  selection,
  onUpdate,
  onRemove,
  isExpanded,
  onToggleExpand,
}: {
  selection: DateSelection;
  onUpdate: (timeSlot: TimeSlot) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { date, timeSlot } = selection;

  const timeTypeOptions: { type: TimeSettingType; icon: React.ReactNode; label: string }[] = [
    { type: 'none', icon: <Sun className="w-4 h-4" />, label: '終日' },
    { type: 'rough', icon: <Clock className="w-4 h-4" />, label: 'ざっくり' },
    { type: 'detailed', icon: <Clock className="w-4 h-4" />, label: '詳細時間' },
  ];

  const roughTimeOptions = [
    { value: 'morning', icon: <Sunrise className="w-4 h-4" />, label: '朝' },
    { value: 'afternoon', icon: <Sun className="w-4 h-4" />, label: '昼' },
    { value: 'evening', icon: <Sunset className="w-4 h-4" />, label: '夕方' },
    { value: 'night', icon: <Moon className="w-4 h-4" />, label: '夜' },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-gradient-soft hover:shadow-md transition-shadow">
      {/* カード全体をクリック可能に */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 text-left hover:bg-purple-50/50 transition-colors flex items-start justify-between"
      >
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {format(date, 'M月d日(E)', { locale: ja })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeSlot.type === 'none' && '終日'}
            {timeSlot.type === 'rough' && timeSlot.rough && (
              <>
                {roughTimeOptions.find(opt => opt.value === timeSlot.rough)?.label}
              </>
            )}
            {timeSlot.type === 'detailed' && timeSlot.startTime && (
              <>{timeSlot.startTime} 〜 {timeSlot.endTime || ''}</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in border-t pt-4">
          {/* 時間タイプ選択 */}
          <div className="grid grid-cols-3 gap-2">
            {timeTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onUpdate({ type: option.type })}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                  timeSlot.type === option.type
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-purple-200 bg-white"
                )}
              >
                {option.icon}
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {/* ざっくり時間の選択 */}
          {timeSlot.type === 'rough' && (
            <div className="grid grid-cols-2 gap-2">
              {roughTimeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ type: 'rough', rough: option.value as any })}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border-2 transition-all",
                    timeSlot.rough === option.value
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-200 bg-white"
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 詳細時間の入力 */}
          {timeSlot.type === 'detailed' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={timeSlot.startTime || ''}
                  onChange={(e) => 
                    onUpdate({ 
                      type: 'detailed', 
                      startTime: e.target.value,
                      endTime: timeSlot.endTime 
                    })
                  }
                  className="text-sm"
                />
                <span className="text-sm text-muted-foreground">〜</span>
                <Input
                  type="time"
                  value={timeSlot.endTime || ''}
                  onChange={(e) => 
                    onUpdate({ 
                      type: 'detailed', 
                      startTime: timeSlot.startTime,
                      endTime: e.target.value 
                    })
                  }
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

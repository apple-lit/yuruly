'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Lock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EventCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewUrl: string;
  adminUrl: string;
}

export function EventCreatedDialog({
  open,
  onOpenChange,
  viewUrl,
  adminUrl,
}: EventCreatedDialogProps) {
  const [copiedView, setCopiedView] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const copyToClipboard = async (text: string, type: 'view' | 'admin') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'view') {
        setCopiedView(true);
        setTimeout(() => setCopiedView(false), 2000);
      } else {
        setCopiedAdmin(true);
        setTimeout(() => setCopiedAdmin(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            🎉 イベントを作成しました！
          </DialogTitle>
          <DialogDescription>
            以下のURLを参加者に共有してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 回答用URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">回答用URL</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              このURLを参加者に共有してください（LINEやメールなど）
            </p>
            <div className="flex gap-2">
              <Input
                value={viewUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(viewUrl, 'view')}
                variant="outline"
                className="shrink-0"
              >
                {copiedView ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    コピー
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => window.open(viewUrl, '_blank')}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              回答画面を開く
            </Button>
          </div>

          {/* 管理用URL */}
          <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">管理用URL</h3>
            </div>
            <p className="text-sm text-amber-700">
              このURLは<strong>誰にも共有しないでください</strong>。イベントの編集・削除ができます。
            </p>
            <div className="flex gap-2">
              <Input
                value={adminUrl}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                onClick={() => copyToClipboard(adminUrl, 'admin')}
                variant="outline"
                className="shrink-0"
              >
                {copiedAdmin ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    コピー
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => window.open(adminUrl, '_blank')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              管理画面を開く
            </Button>
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            💡 <strong>重要：</strong>これらのURLはブックマークまたはメモしておくことをおすすめします。
            管理用URLを紛失すると、イベントの編集・削除ができなくなります。
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            閉じる
          </Button>
          <Button
            onClick={() => {
              window.location.href = viewUrl;
            }}
            className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400"
          >
            回答画面に移動
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

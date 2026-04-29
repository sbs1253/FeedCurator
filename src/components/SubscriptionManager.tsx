'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Settings, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { addSubscription, deleteSubscription, getSubscriptions } from '@/app/actions';
import { SUBSCRIPTION_CATEGORIES } from '@/types';
import type { Subscription } from '@/types';

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function loadSubscriptions() {
    try {
      const data = await getSubscriptions();
      setSubscriptions(data as Subscription[]);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (open) loadSubscriptions();
  }, [open]);

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addSubscription(formData);
      if (result?.error) {
        toast.error('추가 실패', { description: result.error });
      } else {
        toast.success('구독 추가 완료!');
        formRef.current?.reset();
        await loadSubscriptions();
      }
    });
  }

  async function handleDelete(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteSubscription(id);
      if (result?.error) {
        toast.error('삭제 실패', { description: result.error });
      } else {
        toast.success(`"${name}" 구독을 삭제했습니다.`);
        await loadSubscriptions();
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" title="구독 관리" />}>
        <Settings className="size-4" />
        <span className="sr-only">구독 관리</span>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>구독 채널 관리</SheetTitle>
        </SheetHeader>

        {/* 추가 폼 */}
        <form ref={formRef} action={handleAdd} className="px-6 py-4 border-b flex flex-col gap-3">
          <p className="text-sm font-medium">새 구독 추가</p>
          <Input name="source_name" placeholder="채널 이름 (예: 캐릿)" required />
          <Input name="sender_email" type="email" placeholder="발신자 이메일 (예: hi@careet.net)" required />
          {/* 카테고리 선택 */}
          <select
            name="category"
            defaultValue="기타"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SUBSCRIPTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isPending} className="gap-2 w-full">
            <Plus className="size-4" />
            {isPending ? '추가 중...' : '추가'}
          </Button>
        </form>

        <Separator />

        {/* 구독 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm font-medium mb-3">
            현재 구독 목록
            <span className="ml-1 text-muted-foreground font-normal">({subscriptions.length}개)</span>
          </p>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">구독 중인 채널이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {subscriptions.map((sub) => (
                <li key={sub.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{sub.source_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.sender_email}</p>
                    {sub.category && <p className="text-xs text-muted-foreground mt-0.5">{sub.category}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sub.id, sub.source_name)}
                    disabled={isPending}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

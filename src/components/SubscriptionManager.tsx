"use client";

import { useState, useEffect } from "react";
import { Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSubscriptions, addSubscription, deleteSubscription } from "@/app/actions";
import type { Subscription } from "@/types";

export function SubscriptionManager() {
  const [open, setOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSubscriptions();
    }
  }, [open]);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (err: unknown) {
      toast.error("목록을 불러오지 못했습니다.", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData: FormData) {
    const res = await addSubscription(formData);
    if (res?.error) {
      toast.error("등록 실패", { description: res.error });
      return;
    }
    toast.success("구독 명단에 추가되었습니다.");
    // Reset form
    const form = document.getElementById("add-sub-form") as HTMLFormElement;
    if (form) form.reset();
    
    // Reload
    loadSubscriptions();
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    const res = await deleteSubscription(id);
    if (res?.error) {
      toast.error("삭제 실패", { description: res.error });
      return;
    }
    toast.success("구독 명단에서 삭제되었습니다.");
    loadSubscriptions();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="default">
          <Users className="size-4 mr-2" />
          구독 관리
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>구독 명단 관리</SheetTitle>
          <SheetDescription>
            여기 등록된 이메일 주소만 n8n에서 수집하여 요약합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          <form id="add-sub-form" action={handleAdd} className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium">새 뉴스레터 추가</h4>
            <Input name="source_name" placeholder="발신자 이름 (예: 캐릿)" required />
            <Input name="sender_email" type="email" placeholder="이메일 주소 (예: hello@careet.net)" required />
            <Button type="submit" className="w-full mt-1">추가하기</Button>
          </form>

          <div>
            <h4 className="text-sm font-medium mb-3">등록된 명단 ({subscriptions.length})</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">불러오는 중...</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">등록된 명단이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {subscriptions.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-sm truncate">{sub.source_name}</span>
                      <span className="text-xs text-muted-foreground truncate">{sub.sender_email}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(sub.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

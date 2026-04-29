"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SyncButton() {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "동기화에 실패했습니다.");
      }
      
      toast.success("수동 동기화가 요청되었습니다.", {
        description: "n8n 파이프라인에서 요약을 시작합니다. 잠시 후 새로고침해주세요."
      });
    } catch (err: unknown) {
      toast.error("오류 발생", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger render={
        <Button 
          variant="outline" 
          onClick={handleSync} 
          disabled={loading}
        >
          <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "동기화 중..." : "안읽음 동기화"}
        </Button>
      } />
      <TooltipContent>
        <p>구독 중인 뉴스레터 중 안 읽은 메일만 가져옵니다.</p>
      </TooltipContent>
    </Tooltip>
  );
}

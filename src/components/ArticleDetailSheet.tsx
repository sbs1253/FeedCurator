'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ExternalLink, Lightbulb, Mail, Rss, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Article } from '@/types';

interface ArticleDetailSheetProps {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleDetailSheet({ article, open, onOpenChange }: ArticleDetailSheetProps) {
  const targetDateStr = article.email_date || article.created_at;
  const formattedDate = format(new Date(targetDateStr), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  const tags = article.tags ? article.tags.split(' ').filter((t) => t.trim().length > 0) : [];
  const isRss = article.source_type === 'rss';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
        {/* 헤더 */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {isRss ? (
                  <Rss className="size-3 text-orange-500 shrink-0" />
                ) : (
                  <Mail className="size-3 text-blue-500 shrink-0" />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {article.source_name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
          </div>
          <SheetTitle className="text-lg font-bold leading-snug text-left mt-2">
            {article.title}
          </SheetTitle>
        </SheetHeader>

        {/* 본문 */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-5">
          {/* 요약 */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              핵심 요약
            </h3>
            <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {article.summary}
            </p>
          </div>

          <Separator />

          {/* 인사이트 박스 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3 text-blue-700 dark:text-blue-400">
              <Lightbulb className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
                  마케팅 인사이트
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {article.insight}
                </p>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                태그
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 CTA */}
        <div className="border-t px-6 py-4">
          <Button
            className="w-full gap-2"
            render={
              <a href={article.original_url} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            원문 보기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

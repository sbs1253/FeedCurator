'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ExternalLink, Lightbulb, Mail, Rss } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/types';
import { ArticleDetailSheet } from '@/components/ArticleDetailSheet';
import { useState } from 'react';

export function ArticleCard({ article }: { article: Article }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const targetDateStr = article.email_date || article.created_at;
  const formattedDate = format(new Date(targetDateStr), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  const tags = article.tags ? article.tags.split(' ').filter((t) => t.trim().length > 0) : [];
  const isRss = article.source_type === 'rss';

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full cursor-pointer"
        onClick={() => setSheetOpen(true)}
      >
        <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {isRss ? (
                    <Rss className="size-3 text-orange-500 shrink-0" />
                  ) : (
                    <Mail className="size-3 text-blue-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-muted-foreground truncate">{article.source_name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              {/* 외부 링크 버튼 — 클릭 시 카드 클릭 이벤트 차단 */}
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                title="원문 보기"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
            <CardTitle className="mt-2 text-base font-bold leading-tight line-clamp-2">{article.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">{article.summary}</div>

            {/* 인사이트 박스 — 카드에서 가장 눈에 띄어야 함 */}
            <div className="mt-auto bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded-r-md">
              <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400">
                <Lightbulb className="size-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">{article.insight}</p>
              </div>
            </div>
          </CardContent>

          {tags.length > 0 && (
            <CardFooter className="pt-2 flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="font-normal text-xs">
                  {tag}
                </Badge>
              ))}
            </CardFooter>
          )}
        </Card>
      </motion.div>

      <ArticleDetailSheet article={article} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

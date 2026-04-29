import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ExternalLink, Lightbulb } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types";

export function ArticleCard({ article }: { article: Article }) {
  const targetDateStr = article.email_date || article.created_at;
  const formattedDate = format(new Date(targetDateStr), "yyyy년 MM월 dd일 HH:mm", { locale: ko });
  const tags = article.tags ? article.tags.split(" ").filter(t => t.trim().length > 0) : [];

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{article.source_name}</span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <a
            href={article.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="원문 보기"
          >
            <ExternalLink className="size-5" />
          </a>
        </div>
        <CardTitle className="mt-2 text-xl font-bold leading-tight line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* 요약: 줄바꿈 살려서 렌더링 */}
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {article.summary}
        </div>
        
        {/* 인사이트 박스 */}
        <div className="mt-auto bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded-r-md">
          <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400">
            <Lightbulb className="size-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">
              {article.insight}
            </p>
          </div>
        </div>
      </CardContent>
      {tags.length > 0 && (
        <CardFooter className="pt-0 flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

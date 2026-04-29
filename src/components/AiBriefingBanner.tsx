import { getServiceSupabase } from '@/lib/supabase';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function getTopTags(): Promise<string[]> {
  const { data } = await getServiceSupabase()
    .from('articles')
    .select('tags')
    .order('email_date', { ascending: false })
    .limit(30);

  if (!data) return [];

  // 태그 집계
  const tagCounts: Record<string, number> = {};
  for (const row of data) {
    if (!row.tags) continue;
    const tags = row.tags.split(' ').filter((t: string) => t.startsWith('#'));
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
}

async function getTodayCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await getServiceSupabase()
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .gte('email_date', today.toISOString());

  return count ?? 0;
}

export async function AiBriefingBanner() {
  const [topTags, todayCount] = await Promise.all([getTopTags(), getTodayCount()]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-500/10 via-background to-blue-500/10 p-6 mb-6">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5 pointer-events-none" />

      <div className="relative flex flex-col gap-3">
        {/* 타이틀 */}
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-violet-500" />
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            AI 트렌드 브리핑
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold leading-snug bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
            오늘의 마케터 인사이트 요약
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {todayCount > 0
              ? `오늘 ${todayCount}개의 인사이트를 수집했습니다. 아래에서 핵심 트렌드를 확인하세요.`
              : '수집된 인사이트를 바탕으로 AI가 트렌드를 분석합니다. 동기화 버튼으로 최신 데이터를 가져오세요.'}
          </p>
        </div>

        {/* 오늘의 키워드 */}
        {topTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">오늘의 키워드:</span>
            {topTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

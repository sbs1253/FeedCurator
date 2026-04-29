import { getServiceSupabase } from '@/lib/supabase';
import { ArticleCard } from '@/components/ArticleCard';
import { AiBriefingBanner } from '@/components/AiBriefingBanner';
import { StatsBar } from '@/components/StatsBar';
import type { Article } from '@/types';

async function getArticles(): Promise<Article[]> {
  const { data, error } = await getServiceSupabase()
    .from('articles')
    .select('*')
    .order('email_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Supabase] 아티클 조회 오류:', error);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="max-w-6xl mx-auto">
      {/* AI 브리핑 배너 */}
      <AiBriefingBanner />

      {/* 통계 바 */}
      <StatsBar />

      {/* 피드 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">
          최근 인사이트
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {articles.length}개
          </span>
        </h1>
      </div>

      {/* 아티클 그리드 */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">📭</span>
          <h2 className="text-lg font-semibold">아직 수집된 아티클이 없습니다</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            사이드바의 &ldquo;안읽음 동기화&rdquo; 버튼을 눌러 뉴스레터를 가져오세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

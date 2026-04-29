import { getServiceSupabase } from '@/lib/supabase';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article } from '@/types';

export const revalidate = 0; // 매 요청마다 동적으로 Fetch

export default async function Home() {
  const { data: articles, error } = await getServiceSupabase()
    .from('articles')
    .select('*')
    .order('email_date', { ascending: false });
  console.log(articles);
  if (error) {
    console.error('Error fetching articles:', error);
    return (
      <div className="p-8 text-center text-destructive">피드를 불러오는데 실패했습니다. (DB 연결을 확인해주세요)</div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center h-full">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-semibold mb-2">수집된 트렌드가 없습니다</h2>
        <p className="text-muted-foreground">우측 상단의 동기화 버튼을 눌러 새로고침하거나 명단을 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {articles.map((article: Article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

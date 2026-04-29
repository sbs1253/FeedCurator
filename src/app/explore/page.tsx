import { getRecommendations } from '@/app/actions';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBSCRIPTION_CATEGORIES } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '추천 탐색 — FeedCurator',
  description: '마케터를 위한 추천 뉴스레터와 정보 채널 목록',
};

export default async function ExplorePage() {
  const allRecs = await getRecommendations();

  const categories = ['전체', ...SUBSCRIPTION_CATEGORIES.filter((c) => c !== '기타')];

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🧭 추천 탐색</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          마케터에게 유용한 뉴스레터와 정보 채널을 카테고리별로 탐색해보세요.
        </p>
      </div>

      {/* 카테고리 탭 */}
      <Tabs defaultValue="전체">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 전체 탭 */}
        <TabsContent value="전체">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRecs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
          {allRecs.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-muted-foreground text-sm">추천 데이터가 없습니다.</p>
            </div>
          )}
        </TabsContent>

        {/* 카테고리별 탭 */}
        {SUBSCRIPTION_CATEGORIES.filter((c) => c !== '기타').map((cat) => {
          const filtered = allRecs.filter((r) => r.category === cat);
          return (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-20 text-center">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-muted-foreground text-sm">
                    해당 카테고리에 추천 채널이 없습니다.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

import { getServiceSupabase } from '@/lib/supabase';
import type { Article, Subscription } from '@/types';

export const dynamic = 'force-dynamic';

import { AiBriefingBanner } from '@/components/AiBriefingBanner';
import { StatsBar } from '@/components/StatsBar';
import { FeedCarousel } from '@/components/FeedCarousel';

interface HomePageProps {
  searchParams: Promise<{ email?: string; category?: string }>;
}

// 카테고리에 속한 구독의 sender_email 목록 조회
async function getEmailsByCategory(category: string): Promise<string[]> {
  const { data } = await getServiceSupabase()
    .from('subscriptions')
    .select('sender_email')
    .eq('category', category);
  return (data ?? []).map((s: Pick<Subscription, 'sender_email'>) => s.sender_email);
}

// 단일 이메일 필터
async function getArticlesByEmail(senderEmail: string): Promise<Article[]> {
  const { data, error } = await getServiceSupabase()
    .from('articles')
    .select('*')
    .ilike('source_name', `%${senderEmail}%`)
    .order('email_date', { ascending: false })
    .limit(60);

  if (error) console.error('[Supabase] 채널 필터 오류:', error);
  return data ?? [];
}

// 카테고리 필터 — 여러 이메일에 대해 OR ILIKE (PostgreSQL)
async function getArticlesByCategory(senderEmails: string[]): Promise<Article[]> {
  if (senderEmails.length === 0) return [];

  // ILIKE 조건을 OR로 연결
  const orConditions = senderEmails
    .map((e) => `source_name.ilike.%${e}%`)
    .join(',');

  const { data, error } = await getServiceSupabase()
    .from('articles')
    .select('*')
    .or(orConditions)
    .order('email_date', { ascending: false })
    .limit(60);

  if (error) console.error('[Supabase] 카테고리 필터 오류:', error);
  return data ?? [];
}

// 전체 아티클
async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await getServiceSupabase()
    .from('articles')
    .select('*')
    .order('email_date', { ascending: false })
    .limit(60);

  if (error) console.error('[Supabase] 아티클 조회 오류:', error);
  return data ?? [];
}

function getTrendingArticles(articles: Article[]): Article[] {
  const trendKeywords = ['#트렌드', '#마케팅', '#AI', '#브랜드', '#콘텐츠'];
  return articles.filter((a) =>
    trendKeywords.some((kw) => a.tags?.includes(kw)),
  );
}

function groupArticlesByChannel(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];
  for (const a of articles) {
    if (!seen.has(a.source_name)) {
      seen.add(a.source_name);
      result.push(a);
    }
  }
  return result;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { email, category } = await searchParams;

  // 필터 모드 결정
  let articles: Article[] = [];
  let filterLabel: string | null = null;

  if (email) {
    // 단일 채널 필터
    articles = await getArticlesByEmail(email);
    // source_name에서 이름만 추출 (예: "팁스터 (tipster@…)" → "팁스터")
    filterLabel = articles[0]?.source_name.split(' (')[0] ?? email;
  } else if (category) {
    // 카테고리 필터
    const emails = await getEmailsByCategory(category);
    articles = await getArticlesByCategory(emails);
    filterLabel = category;
  } else {
    articles = await getAllArticles();
  }

  const isFiltered = Boolean(email || category);

  return (
    <div className="max-w-6xl mx-auto">
      {/* AI 브리핑 배너 — 전체 보기일 때만 */}
      {!isFiltered && <AiBriefingBanner />}

      {/* 통계 바 — 필터 적용 */}
      <StatsBar senderEmail={email} category={category} />

      {/* 필터 표시 배너 */}
      {isFiltered && filterLabel && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <span className="text-sm font-semibold">
            {email ? '📬' : '🏷️'} {filterLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {email ? '채널' : '카테고리'} 필터 적용 중 — {articles.length}개
          </span>
          <a
            href="/"
            className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            전체 보기
          </a>
        </div>
      )}

      {/* 피드 섹션 */}
      <div className="mt-2">
        {isFiltered ? (
          <FeedCarousel
            title={email ? `${filterLabel}의 인사이트` : `${filterLabel} 카테고리`}
            articles={articles}
            emptyMessage="이 채널에서 수집된 아티클이 없습니다. 동기화를 먼저 실행해주세요."
          />
        ) : (
          <>
            <FeedCarousel
              title="🕐 최근 도착한 인사이트"
              articles={articles.slice(0, 12)}
              emptyMessage="동기화 버튼을 눌러 최신 뉴스레터를 가져오세요."
            />
            <FeedCarousel
              title="🔥 놓치기 아쉬운 트렌드"
              articles={getTrendingArticles(articles).slice(0, 12)}
              emptyMessage="트렌드 관련 태그(#트렌드, #마케팅 등)가 달린 아티클이 없습니다."
            />
            <FeedCarousel
              title="📬 채널별 대표 아티클"
              articles={groupArticlesByChannel(articles).slice(0, 12)}
              emptyMessage="구독 채널의 아티클을 동기화해주세요."
            />
          </>
        )}
      </div>
    </div>
  );
}

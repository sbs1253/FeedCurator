import { getServiceSupabase } from '@/lib/supabase';
import { FileText, Radio, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StatsBarProps {
  senderEmail?: string;
  category?: string;
}

async function getStats(senderEmail?: string, category?: string) {
  const supabase = getServiceSupabase();

  // 아티클 기준 필터 조건 빌더
  function buildArticleFilter(query: ReturnType<typeof supabase.from<'articles', any>>) {
    if (senderEmail) {
      return (query as any).ilike('source_name', `%${senderEmail}%`);
    }
    if (category) {
      // 카테고리에 속한 이메일들을 OR로 필터 (category는 이미 이름으로 전달됨)
      // 단순히 source_name 패턴 없이 전체 통계를 보여주고 이름만 표기
      return query;
    }
    return query;
  }

  const isFiltered = Boolean(senderEmail || category);

  const [articlesRes, subscriptionsRes, weekRes, latestRes] = await Promise.all([
    buildArticleFilter(
      supabase.from('articles').select('*', { count: 'exact', head: true }) as any
    ),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
    buildArticleFilter(
      supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .gte('email_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as any
    ),
    buildArticleFilter(
      supabase
        .from('articles')
        .select('email_date')
        .order('email_date', { ascending: false })
        .limit(1) as any
    ).then((res: any) => res.data?.[0] ?? null),
  ]);

  return {
    total: (articlesRes as any).count ?? 0,
    channels: subscriptionsRes.count ?? 0,
    thisWeek: (weekRes as any).count ?? 0,
    latestDate: (latestRes as any)?.email_date ?? null,
    isFiltered,
  };
}

export async function StatsBar({ senderEmail, category }: StatsBarProps = {}) {
  const stats = await getStats(senderEmail, category);

  const cards = [
    {
      label: stats.isFiltered ? '필터된 아티클' : '총 아티클',
      value: stats.total.toLocaleString(),
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: '구독 채널',
      value: stats.channels.toLocaleString(),
      icon: Radio,
      color: 'text-violet-500',
    },
    {
      label: '이번 주 신규',
      value: stats.thisWeek.toLocaleString(),
      icon: Calendar,
      color: 'text-emerald-500',
    },
    {
      label: '최신 메일',
      value: stats.latestDate
        ? format(new Date(stats.latestDate), 'MM/dd HH:mm', { locale: ko })
        : '-',
      icon: Calendar,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-lg border bg-card p-3"
        >
          <div className={`shrink-0 ${card.color}`}>
            <card.icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{card.label}</p>
            <p className="text-lg font-semibold leading-tight">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

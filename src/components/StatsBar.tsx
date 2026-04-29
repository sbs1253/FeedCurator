import { getServiceSupabase } from '@/lib/supabase';
import { FileText, Radio, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

async function getStats() {
  const supabase = getServiceSupabase();

  const [articlesRes, subscriptionsRes, weekRes, latestRes] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('email_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('articles')
      .select('email_date')
      .order('email_date', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    total: articlesRes.count ?? 0,
    channels: subscriptionsRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    latestDate: latestRes.data?.email_date ?? null,
  };
}

const statCards = (stats: Awaited<ReturnType<typeof getStats>>) => [
  {
    label: '총 아티클',
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

export async function StatsBar() {
  const stats = await getStats();
  const cards = statCards(stats);

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

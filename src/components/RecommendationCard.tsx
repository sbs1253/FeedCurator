'use client';

import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Recommendation } from '@/types';

const categoryColors: Record<string, string> = {
  '마케팅/트렌드': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'IT/서비스기획': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '브랜드/카피': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'AI·테크': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  '로컬': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '비즈니스': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const tags = rec.tags ? rec.tags.split(' ').filter((t) => t.startsWith('#')) : [];
  const colorClass = categoryColors[rec.category] ?? categoryColors['기타'];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col h-full rounded-xl border bg-card p-4 gap-3">
        {/* 카테고리 라벨 */}
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {rec.category}
        </span>

        {/* 이름 + 설명 */}
        <div className="flex-1">
          <h3 className="text-base font-bold">{rec.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 mt-auto"
          render={<a href={rec.site_url} target="_blank" rel="noopener noreferrer" />}
        >
          <ExternalLink className="size-3.5" />
          구독하러 가기
        </Button>
      </div>
    </motion.div>
  );
}

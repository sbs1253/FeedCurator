'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article } from '@/types';

interface FeedCarouselProps {
  title: string;
  articles: Article[];
  emptyMessage?: string;
}

export function FeedCarousel({ title, articles, emptyMessage = '해당 아티클이 없습니다.' }: FeedCarouselProps) {
  if (articles.length === 0) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold whitespace-nowrap">{title}</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* 섹션 헤더 — 버튼은 여기 우측에 나란히 */}
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          dragFree: true, // 👈 자유로운 드래그 활성화
          containScroll: 'trimSnaps', // 👈 마지막 아이템 뒤에 빈 공간이 생기지 않도록 방지
          slidesToScroll: 'auto',
        }}
        className="w-full select-none"
      >
        {/* 헤더 행: 타이틀 + 라인 + 화살표 버튼 */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold whitespace-nowrap shrink-0">{title}</h2>
          <span className="text-xs text-muted-foreground shrink-0">{articles.length}개</span>
          <div className="flex-1 h-px bg-border" />
          {/* 버튼: static 배치, 라인과 같은 행에 */}
          <div className="flex items-center gap-1 shrink-0">
            <CarouselPrevious className="static translate-x-0 translate-y-0 size-7 shrink-0" />
            <CarouselNext className="static translate-x-0 translate-y-0 size-7 shrink-0" />
          </div>
        </div>

        {/* 캐러셀 콘텐츠 */}
        <CarouselContent className="-ml-4  overflow-visible" style={{ cursor: 'grab' }}>
          {articles.map((article) => (
            <CarouselItem key={article.id} className="m-2  basis-[90%] sm:basis-[55%] lg:basis-[42%] xl:basis-[32%]">
              {/* pb/pt: framer-motion scale 클리핑 방지 */}
              <div className="h-full">
                <ArticleCard article={article} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

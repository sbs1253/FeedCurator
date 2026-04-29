'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Compass, Mail, Layers } from 'lucide-react';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SyncButton } from '@/components/SyncButton';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { getSubscriptions } from '@/app/actions';
import type { Subscription } from '@/types';
import { SUBSCRIPTION_CATEGORIES } from '@/types';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/explore', label: '추천 탐색', icon: Compass },
];

// ─── useSearchParams 사용 컴포넌트 → Suspense 내부에서만 호출 ───
function ChannelList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터: sender_email (정확한 ILIKE 매칭용) + category
  const activeEmail = searchParams.get('email');
  const activeCategory = searchParams.get('category');

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => getSubscriptions() as Promise<Subscription[]>,
    staleTime: 30 * 1000,
  });

  // 카테고리별 그룹화
  const grouped = subscriptions.reduce<Record<string, Subscription[]>>(
    (acc, sub) => {
      const cat = sub.category || '기타';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(sub);
      return acc;
    },
    {},
  );

  // 실제 구독 중인 카테고리만 추출
  const activeCategories = Object.keys(grouped);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams();
    // 다른 필터는 초기화하고 하나만 설정
    if (value !== null) params.set(key, value);
    router.push(`/?${params.toString()}`);
  }

  function handleEmailClick(email: string) {
    if (activeEmail === email) {
      router.push('/'); // 필터 해제
    } else {
      setParam('email', email);
    }
  }

  function handleCategoryClick(category: string) {
    if (activeCategory === category) {
      router.push('/');
    } else {
      setParam('category', category);
    }
  }

  return (
    <>
      {/* 카테고리 필터 섹션 */}
      {activeCategories.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1">
            <Layers className="size-3" />
            카테고리
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeCategories.map((cat) => (
                <SidebarMenuItem key={cat}>
                  <SidebarMenuButton
                    isActive={activeCategory === cat}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <span className="text-xs">{cat}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {grouped[cat].length}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {activeCategories.length > 0 && <SidebarSeparator />}

      {/* 채널 목록 */}
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between">
          <span>내 구독 채널</span>
          {subscriptions.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {subscriptions.length}개
            </span>
          )}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          {isLoading ? (
            <div className="flex flex-col gap-0.5">
              {[1, 2, 3].map((i) => <SidebarMenuSkeleton key={i} showIcon />)}
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              아래 ⚙️ 버튼으로 구독 채널을 추가하세요.
            </p>
          ) : (
            <>
              {/* 전체 보기 */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === '/' && !activeEmail && !activeCategory}
                    render={<Link href="/" />}
                  >
                    <LayoutDashboard className="size-4" />
                    <span>전체 보기</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* 카테고리별 채널 */}
              {Object.entries(grouped).map(([category, subs]) => (
                <div key={category} className="mt-2">
                  <p className="px-2 mb-0.5 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {category}
                  </p>
                  <SidebarMenu>
                    {subs.map((sub) => (
                      <SidebarMenuItem key={sub.id}>
                        <SidebarMenuButton
                          isActive={activeEmail === sub.sender_email}
                          onClick={() => handleEmailClick(sub.sender_email)}
                        >
                          <Mail className="size-4 text-blue-500 shrink-0" />
                          <span className="truncate">{sub.source_name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </div>
              ))}
            </>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

// ─── 메인 네비게이션 (Suspense 불필요) ───
function NavGroup() {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                render={<Link href={item.href} />}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-base">
          <span className="text-xl">💡</span>
          <span>FeedCurator</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup />
        <SidebarSeparator />
        <Suspense
          fallback={
            <SidebarGroup>
              <SidebarGroupLabel>내 구독 채널</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="flex flex-col gap-0.5">
                  {[1, 2, 3].map((i) => <SidebarMenuSkeleton key={i} showIcon />)}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          }
        >
          <ChannelList />
        </Suspense>
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter className="gap-1 p-2">
        <SyncButton variant="sidebar" />
        <div className="flex items-center justify-between px-2 py-1">
          <ThemeToggle />
          <SubscriptionManager />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

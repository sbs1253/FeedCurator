'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, RefreshCw, Settings } from 'lucide-react';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SyncButton } from '@/components/SyncButton';
import { SubscriptionManager } from '@/components/SubscriptionManager';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/explore', label: '추천 탐색', icon: Compass },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      {/* 로고 헤더 */}
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-base">
          <span className="text-xl">💡</span>
          <span>FeedCurator</span>
        </Link>
      </SidebarHeader>

      {/* 메인 네비게이션 */}
      <SidebarContent>
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

        <SidebarSeparator />

        {/* 내 구독 섹션 — Phase 4에서 채널 목록 추가 예정 */}
        <SidebarGroup>
          <SidebarGroupLabel>내 구독</SidebarGroupLabel>
          <SidebarGroupContent>
            <p className="px-2 py-1 text-xs text-muted-foreground">
              구독 채널을 관리하려면 아래 버튼을 클릭하세요.
            </p>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 하단 액션 */}
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

import { SyncButton } from "./SyncButton";
import { SubscriptionManager } from "./SubscriptionManager";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          💡 FeedCurator
        </div>
        <div className="flex items-center gap-2">
          <SyncButton />
          <SubscriptionManager />
        </div>
      </div>
    </header>
  );
}

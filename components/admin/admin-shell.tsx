"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

interface AdminShellProps {
  session: Session | null;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function AdminShell({
  session,
  signOutAction,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="border-border bg-primary text-primary-foreground border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="font-bold tracking-tight">ByteHaven Admin</span>
          <div className="flex items-center gap-4 text-sm">
            {session?.user?.email && (
              <span className="text-primary-foreground/80">
                {session.user.email}
              </span>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md bg-white/10 px-3 py-1.5 font-medium transition-colors hover:bg-white/20"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

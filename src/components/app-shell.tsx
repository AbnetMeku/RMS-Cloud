import Link from "next/link";
import type { ReactNode } from "react";
import { ChefHat, ClipboardList, CreditCard, LayoutDashboard, Shield, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/super-admin", label: "Super Admin", icon: Shield },
  { href: "/admin", label: "Admin", icon: Table2 },
  { href: "/waiter", label: "Waiter", icon: ClipboardList },
  { href: "/kds", label: "KDS", icon: ChefHat },
  { href: "/cashier", label: "Cashier", icon: CreditCard },
];

export function AppShell({
  title,
  eyebrow,
  children,
  active,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  active?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
            <ChefHat size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold">RMS Cloud</span>
            <span className="block text-xs text-slate-500">Restaurant operations</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-w-max items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700",
                      isActive && "border-slate-950 bg-slate-950 text-white",
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

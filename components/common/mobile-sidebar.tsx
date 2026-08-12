"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BarChart3,
  LayoutDashboard,
  ListOrdered,
  Package,
} from "lucide-react";
import { SidebarFooter } from "@/components/common/sidebar-footer";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fardos / Inventario", href: "/admin/inventory", icon: Package },
  { label: "Ventas", href: "/admin/orders", icon: ListOrdered },
  { label: "Clientes", href: "/admin/customers", icon: ListOrdered },
  { label: "Reportes & Ventas", href: "/admin/reports", icon: BarChart3 },
];

export function MobileSidebar({
  userName,
  userRole,
  onSignOut,
}: {
  userName?: string;
  userRole?: string;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 p-2 rounded-lg bg-card border shadow-sm"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-primary" />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`
          w-64 border-r bg-card flex flex-col justify-between border-l-2 border-primary-lighter
          fixed md:sticky top-0 h-screen z-50
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <span className="text-2xl font-black tracking-tight text-primary">
                Mío!
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary uppercase">
                Live
              </span>
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-primary/10"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-primary" />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-text hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <SidebarFooter
          userName={userName}
          userRole={userRole}
          onSignOut={onSignOut}
        />
      </aside>
    </>
  );
}

import { type ReactNode } from "react";
import OrdersAside from "./components/orders-aside";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <OrdersAside />

      <main className="flex flex-col h-full w-full flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

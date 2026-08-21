import { getOrders } from "@/lib/services/orders.service";
import { type ReactNode } from "react";
import OrdersAside from "./components/orders-aside";

export default async function OrdersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const orders = await getOrders();

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <OrdersAside initialOrders={orders} />

      <div className="flex flex-col h-full w-full flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

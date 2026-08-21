"use client";

import { ButtonComponent } from "@/components/ui/button-component";
import { Radio } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OrderListItem from "./orders-list-items";

interface OrderAsideProps {
  initialOrders: {
    _id: string;
    customer: {
      name: string;
      lastname: string;
      phone: string;
    };
    garment: {
      name: string;
      finalPrice: number;
    };
    createdAt: Date;
    isSelected: boolean;
  }[];
}

const OrdersAside = ({ initialOrders }: OrderAsideProps) => {
  const pathname = usePathname();

  const isBaseRoute = pathname === "/admin/orders";

  return (
    <aside
      className={`w-full md:w-80 border-r border-border flex-col shrink-0 h-full ${
        isBaseRoute ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="flex justify-between items-center p-4 shrink-0 gap-2">
        <h3 className="text-base sm:text-lg font-semibold truncate">
          Ventas
        </h3>
        <div className="flex gap-2 sm:mr-0 mr-10">
          <Link href="/admin/orders/create" className="sm:mr-0 mr-12">
            <ButtonComponent>+ Nuevo</ButtonComponent>
          </Link>
        </div>
      </div>
      <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Radio className="w-4 h-4 animate-pulse text-red-500" />
          Live ahora
        </p>
        <p className="font-mono text-xs text-text/70">
          {initialOrders.length} pedidos
        </p>
      </div>
      <ul className="p-4 space-y-2 overflow-y-auto flex-1">
        {initialOrders.map((card, index) => (
          <OrderListItem
            key={`bale-${card._id || index}`}
            _id={card._id}
            createdAt={card.createdAt}
            customer={card.customer}
            garment={card.garment}
            isSelected={pathname === `/admin/orders/${card._id}`}
          />
        ))}
      </ul>
    </aside>
  );
};

export default OrdersAside;

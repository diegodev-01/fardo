"use client";

import { ButtonComponent } from "@/components/ui/button-component";
import { ICustomer } from "@/lib/models/customer.model";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CustomerListItem from "./customer-list-items";

interface CustomerAsideProps {
  initialCustomers: ICustomer[];
}

const CustomerAside = ({ initialCustomers }: CustomerAsideProps) => {
  const pathname = usePathname();

  const isBaseRoute = pathname === "/admin/customers";

  return (
    <aside
      className={`w-full md:w-80 border-r border-border flex-col shrink-0 h-full ${
        isBaseRoute ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="flex justify-between items-center p-4 shrink-0 gap-2">
        <h3 className="text-base sm:text-lg font-semibold truncate">
          Clientes
        </h3>
        <Link href="/admin/customers/register" className="sm:mr-0 mr-12">
          <ButtonComponent>+ Nuevo</ButtonComponent>
        </Link>
      </div>

      <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <User className="w-4 h-4 text-green-500 font-bold" />
          Registrados
        </p>
        <p className="font-mono text-xs text-text/70">
          {initialCustomers.length}
        </p>
      </div>

      <ul className="p-4 space-y-2 overflow-y-auto flex-1">
        {initialCustomers.map((customer) => (
          <CustomerListItem
            key={customer._id}
            customer={customer}
            isSelected={pathname === `/admin/customers/${customer._id}`}
          />
        ))}
      </ul>
    </aside>
  );
};

export default CustomerAside;
